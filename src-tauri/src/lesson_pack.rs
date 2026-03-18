use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::path::Path;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

// Types matching TypeScript interfaces

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LessonPackMeta {
    pub session_number: u32,
    pub lesson_type: String, // Enum in TS, String here
    pub title: String,
    pub subject: String,
    pub grade_level: String,
    pub total_duration_minutes: u32,
    pub slides: Vec<serde_json::Value>, // Generic JSON for discriminated union
    pub resources: Vec<String>,
    pub cover_image_url: Option<String>,
    pub ai_rationale: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LessonPack {
    pub meta: LessonPackMeta,
    pub extracted_path: String,
    pub original_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentLesson {
    pub path: String,
    pub name: String,
    pub last_opened: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<LessonPackMeta>,
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
    pub meta: Option<LessonPackMeta>,
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

    match serde_json::from_str::<LessonPackMeta>(&meta_content) {
        Ok(meta) => {
            // Validate required fields
            let mut errors = Vec::new();

            if meta.title.is_empty() {
                errors.push("Title is required".to_string());
            }
            if meta.subject.is_empty() {
                errors.push("Subject is required".to_string());
            }
            if meta.slides.is_empty() {
                errors.push("At least one slide is required".to_string());
            }
            // Add more specific validation logic here if needed

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
