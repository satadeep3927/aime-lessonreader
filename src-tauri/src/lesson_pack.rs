use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

// Types matching TypeScript interfaces.
// `meta` is kept as a raw JSON Value so that every field present in the
// .meta.json file (including lesson_intent_id, id, status, etc.) is passed
// through to the frontend without any silent field-stripping.

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LessonPack {
    pub meta: serde_json::Value,
    pub extracted_path: String,
    pub original_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentLesson {
    pub path: String,
    pub name: String,
    pub last_opened: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenFileResult {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lesson_pack: Option<LessonPack>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyMetaResult {
    pub valid: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Vec<String>>,
}

/// Open and process .aimepack file
pub async fn open_lesson_pack(file_path: String, _app: AppHandle) -> Result<OpenFileResult> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Ok(OpenFileResult {
            success: false,
            lesson_pack: None,
            error: Some("File does not exist".to_string()),
        });
    }

    // Extract to temp directory
    let temp_dir = std::env::temp_dir();
    let extract_path = temp_dir.join(format!(
        "aime_lesson_{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    ));

    // Unzip the file
    match unzip_file(&file_path, &extract_path) {
        Ok(_) => {
            // Verify meta.json
            match verify_meta(&extract_path.to_string_lossy().to_string()) {
                Ok(verify_result) => {
                    if verify_result.valid {
                        Ok(OpenFileResult {
                            success: true,
                            lesson_pack: Some(LessonPack {
                                meta: verify_result.meta.unwrap(),
                                extracted_path: extract_path.to_string_lossy().to_string(),
                                original_path: file_path,
                            }),
                            error: None,
                        })
                    } else {
                        Ok(OpenFileResult {
                            success: false,
                            lesson_pack: None,
                            error: Some(format!(
                                "Invalid metadata: {}",
                                verify_result.errors.unwrap_or_default().join(", ")
                            )),
                        })
                    }
                }
                Err(e) => Ok(OpenFileResult {
                    success: false,
                    lesson_pack: None,
                    error: Some(format!("Failed to verify metadata: {}", e)),
                }),
            }
        }
        Err(e) => Ok(OpenFileResult {
            success: false,
            lesson_pack: None,
            error: Some(format!("Failed to extract archive: {}", e)),
        }),
    }
}

/// Unzip .aimepack file
fn unzip_file(zip_path: &str, extract_to: &Path) -> Result<()> {
    let file = File::open(zip_path)?;
    let mut archive = zip::ZipArchive::new(file)?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        let outpath = match file.enclosed_name() {
            Some(path) => extract_to.join(path),
            None => continue,
        };

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)?;
                }
            }
            let mut outfile = File::create(&outpath)?;
            std::io::copy(&mut file, &mut outfile)?;
        }
    }

    Ok(())
}

/// Verify .meta.json exists and is valid
pub fn verify_meta(extracted_path: &str) -> Result<VerifyMetaResult> {
    let meta_path = Path::new(extracted_path).join(".meta.json");

    if !meta_path.exists() {
        return Ok(VerifyMetaResult {
            valid: false,
            meta: None,
            errors: Some(vec![".meta.json file not found".to_string()]),
        });
    }

    let meta_content = fs::read_to_string(&meta_path).context("Failed to read .meta.json")?;

    match serde_json::from_str::<serde_json::Value>(&meta_content) {
        Ok(meta) => {
            // Validate required fields
            let mut errors = Vec::new();

            match meta.get("title").and_then(|v| v.as_str()) {
                None | Some("") => errors.push("Title is required".to_string()),
                _ => {}
            }
            match meta.get("subject").and_then(|v| v.as_str()) {
                None | Some("") => errors.push("Subject is required".to_string()),
                _ => {}
            }
            match meta.get("slides").and_then(|v| v.as_array()) {
                None => errors.push("At least one slide is required".to_string()),
                Some(slides) if slides.is_empty() => {
                    errors.push("At least one slide is required".to_string())
                }
                _ => {}
            }

            if errors.is_empty() {
                Ok(VerifyMetaResult {
                    valid: true,
                    meta: Some(meta),
                    errors: None,
                })
            } else {
                Ok(VerifyMetaResult {
                    valid: false,
                    meta: Some(meta),
                    errors: Some(errors),
                })
            }
        }
        Err(e) => Ok(VerifyMetaResult {
            valid: false,
            meta: None,
            errors: Some(vec![format!("Failed to parse .meta.json: {}", e)]),
        }),
    }
}

/// Get recent lessons from store
pub async fn get_recent_lessons(app: AppHandle) -> Result<Vec<RecentLesson>> {
    let store = app.store("recent.json")?;

    match store.get("recentLessons") {
        Some(value) => {
            let lessons: Vec<RecentLesson> =
                serde_json::from_value(value.clone()).unwrap_or_default();
            Ok(lessons)
        }
        None => Ok(Vec::new()),
    }
}

/// Add lesson to recent history
pub async fn add_to_recent(lesson: RecentLesson, app: AppHandle) -> Result<()> {
    let store = app.store("recent.json")?;

    let mut recent = match store.get("recentLessons") {
        Some(value) => {
            serde_json::from_value::<Vec<RecentLesson>>(value.clone()).unwrap_or_default()
        }
        None => Vec::new(),
    };

    // Remove if already exists
    recent.retain(|l| l.path != lesson.path);

    // Add to front
    recent.insert(0, lesson);

    // Keep only last 10
    recent.truncate(10);

    store.set("recentLessons".to_string(), serde_json::to_value(&recent)?);
    store.save()?;

    Ok(())
}

/// Remove lesson from recent history
pub async fn remove_from_recent(file_path: &str, app: AppHandle) -> Result<()> {
    let store = app.store("recent.json")?;

    let mut recent = match store.get("recentLessons") {
        Some(value) => {
            serde_json::from_value::<Vec<RecentLesson>>(value.clone()).unwrap_or_default()
        }
        None => return Ok(()),
    };

    recent.retain(|l| l.path != file_path);

    store.set("recentLessons".to_string(), serde_json::to_value(&recent)?);
    store.save()?;

    Ok(())
}

/// Clear all recent lessons
pub async fn clear_recent(app: AppHandle) -> Result<()> {
    let store = app.store("recent.json")?;
    let empty: Vec<RecentLesson> = Vec::new();
    store.set("recentLessons".to_string(), serde_json::to_value(&empty)?);
    store.save()?;
    Ok(())
}

/// Atomically write canvasData into the extracted .meta.json.
/// Uses write-to-temp-then-rename so concurrent instances never see a partial file.
pub fn save_canvas_data(extracted_path: &str, canvas_data: serde_json::Value) -> Result<()> {
    let meta_path = Path::new(extracted_path).join(".meta.json");
    let tmp_path  = Path::new(extracted_path).join(".meta.json.tmp");

    // Read current content as a generic JSON object so unknown fields are preserved
    let raw = fs::read_to_string(&meta_path)
        .context("Failed to read .meta.json")?;
    let mut obj: serde_json::Value = serde_json::from_str(&raw)
        .context("Failed to parse .meta.json")?;

    // Inject / overwrite canvasData
    if let Some(map) = obj.as_object_mut() {
        map.insert("canvasData".to_string(), canvas_data);
    } else {
        anyhow::bail!(".meta.json root is not a JSON object");
    }

    // Write to a sibling temp file first …
    let serialised = serde_json::to_string_pretty(&obj)
        .context("Failed to serialise .meta.json")?;
    fs::write(&tmp_path, &serialised)
        .context("Failed to write .meta.json.tmp")?;

    // … then atomically replace the real file (same filesystem → single syscall)
    fs::rename(&tmp_path, &meta_path)
        .context("Failed to rename .meta.json.tmp → .meta.json")?;

    Ok(())
}

/// Recursively zip the contents of `dir_path` into `zip_path` atomically.
/// Skips any `.tmp` files left over from previous atomic writes.
fn rezip_directory(dir_path: &Path, zip_path: &Path) -> Result<()> {
    // Build a sibling temp path: "lesson.aimepack" → "lesson.aimepack.tmp"
    let mut tmp_name = zip_path
        .file_name()
        .unwrap_or_default()
        .to_os_string();
    tmp_name.push(".tmp");
    let tmp_path = zip_path.with_file_name(tmp_name);

    {
        let file = File::create(&tmp_path).context("Failed to create temp zip")?;
        let mut zip = zip::ZipWriter::new(file);
        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Deflated);
        zip_add_dir(&mut zip, dir_path, dir_path, options)?;
        zip.finish().context("Failed to finalise zip")?;
    }

    fs::rename(&tmp_path, zip_path)
        .context("Failed to rename temp zip → original .aimepack")?;

    Ok(())
}

fn zip_add_dir<W: Write + std::io::Seek>(
    zip: &mut zip::ZipWriter<W>,
    base: &Path,
    dir: &Path,
    options: zip::write::SimpleFileOptions,
) -> Result<()> {
    for entry in fs::read_dir(dir).context("Failed to read dir for zipping")? {
        let entry = entry?;
        let path = entry.path();

        // Skip temp files from atomic writes
        if path
            .extension()
            .map_or(false, |e| e == "tmp")
        {
            continue;
        }

        // Normalise to forward slashes for cross-platform zip compatibility
        let rel = path
            .strip_prefix(base)?
            .to_string_lossy()
            .replace('\\', "/");

        if path.is_dir() {
            zip.add_directory(format!("{}/", rel), options)?;
            zip_add_dir(zip, base, &path, options)?;
        } else {
            zip.start_file(&rel, options)?;
            let mut f = File::open(&path)?;
            std::io::copy(&mut f, zip)?;
        }
    }
    Ok(())
}

/// Write canvasData to .meta.json then rezip the extracted dir back into the
/// original .aimepack file — both steps are atomic on the same filesystem.
pub fn save_lesson_pack(
    extracted_path: &str,
    original_path: &str,
    canvas_data: serde_json::Value,
) -> Result<()> {
    save_canvas_data(extracted_path, canvas_data)?;
    rezip_directory(Path::new(extracted_path), Path::new(original_path))
}

/// Cleanup extracted lesson pack
pub fn cleanup_lesson_pack(extracted_path: &str) -> Result<()> {
    let path = Path::new(extracted_path);
    if path.exists() {
        fs::remove_dir_all(path)?;
    }
    Ok(())
}

// ─── Downloaded Lessons ───────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DownloadedLesson {
    pub intent_id: String,
    pub title: String,
    pub local_path: String,
    pub downloaded_at: i64,
    pub cover_image_url: Option<String>,
    pub class_name: Option<String>,
    pub lesson_type: Option<String>,
    pub session_number: u32,
    pub week_number: Option<u32>,
    pub scheduled_date: Option<String>,
    pub status: String,
    pub description: Option<String>,
}

/// Download .aimepack from S3 URL and save to app data dir
pub async fn download_aimepack(url: String, intent_id: String, app: AppHandle) -> Result<String> {
    let response = reqwest::get(&url).await?;
    let bytes = response.bytes().await?;

    let app_dir = app.path().app_data_dir()?;
    let lessons_dir = app_dir.join("downloaded_lessons");
    fs::create_dir_all(&lessons_dir)?;

    let file_path = lessons_dir.join(format!("{}.aimepack", intent_id));
    fs::write(&file_path, &bytes)?;

    Ok(file_path.to_string_lossy().to_string())
}

/// Get all downloaded lessons from store
pub async fn get_downloaded_lessons(app: AppHandle) -> Result<Vec<DownloadedLesson>> {
    let store = app.store("downloaded.json")?;
    match store.get("downloadedLessons") {
        Some(value) => {
            let lessons: Vec<DownloadedLesson> =
                serde_json::from_value(value.clone()).unwrap_or_default();
            Ok(lessons)
        }
        None => Ok(Vec::new()),
    }
}

/// Add or update downloaded lesson record
pub async fn add_downloaded_lesson(lesson: DownloadedLesson, app: AppHandle) -> Result<()> {
    let store = app.store("downloaded.json")?;

    let mut lessons = match store.get("downloadedLessons") {
        Some(value) => {
            serde_json::from_value::<Vec<DownloadedLesson>>(value.clone()).unwrap_or_default()
        }
        None => Vec::new(),
    };

    // Replace if already exists, otherwise insert at front
    lessons.retain(|l| l.intent_id != lesson.intent_id);
    lessons.insert(0, lesson);

    store.set("downloadedLessons".to_string(), serde_json::to_value(&lessons)?);
    store.save()?;
    Ok(())
}

/// Remove downloaded lesson record (does not delete the file)
pub async fn remove_downloaded_lesson(intent_id: String, app: AppHandle) -> Result<()> {
    let store = app.store("downloaded.json")?;

    let mut lessons = match store.get("downloadedLessons") {
        Some(value) => {
            serde_json::from_value::<Vec<DownloadedLesson>>(value.clone()).unwrap_or_default()
        }
        None => return Ok(()),
    };

    lessons.retain(|l| l.intent_id != intent_id);
    store.set("downloadedLessons".to_string(), serde_json::to_value(&lessons)?);
    store.save()?;
    Ok(())
}
