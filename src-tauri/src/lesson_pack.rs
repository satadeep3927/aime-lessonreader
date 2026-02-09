use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::path::Path;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

// Types matching TypeScript interfaces

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LessonPackSlide {
    pub id: u32,
    pub file: String,
    pub title: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LessonPackResource {
    pub r#type: String,
    pub file: Option<String>,
    pub path: Option<String>,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LessonPackFeatures {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub math_jax: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub interactive_visuals: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub split_layout: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LessonPackMeta {
    pub name: String,
    pub version: String,
    pub creator: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subject: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub topic: Option<String>,
    pub creation_date: String,
    pub last_modified: String,
    pub total_slides: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub estimated_duration: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub grade_level: Option<String>,
    pub slides: Vec<LessonPackSlide>,
    pub resources: Vec<LessonPackResource>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub features: Option<LessonPackFeatures>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    pub pack_format: String,
    pub pack_format_version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LessonPack {
    pub meta: LessonPackMeta,
    pub extracted_path: String,
    pub original_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RecentLesson {
    pub path: String,
    pub name: String,
    pub last_opened: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<LessonPackMeta>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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

            if meta.name.is_empty() {
                errors.push("Name is required".to_string());
            }
            if meta.version.is_empty() {
                errors.push("Version is required".to_string());
            }
            if meta.slides.is_empty() {
                errors.push("At least one slide is required".to_string());
            }
            if meta.pack_format != "aimepack" {
                errors.push("Invalid pack format".to_string());
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

/// Cleanup extracted lesson pack
pub fn cleanup_lesson_pack(extracted_path: &str) -> Result<()> {
    let path = Path::new(extracted_path);
    if path.exists() {
        fs::remove_dir_all(path)?;
    }
    Ok(())
}
