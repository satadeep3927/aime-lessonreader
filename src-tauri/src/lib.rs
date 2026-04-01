// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Emitter, Manager, State};
use std::path::Path;

mod lesson_pack;
use lesson_pack::*;

// Module-level storage so RunEvent::Opened can store the path
// before the setup hook registers any managed state.
static PENDING_LAUNCH: std::sync::Mutex<Option<String>> = std::sync::Mutex::new(None);

// Kept for backwards compatibility with check_launch_file command signature
struct LaunchFile;

fn normalize_launch_arg(raw: &str) -> Option<String> {
    let trimmed = raw.trim().trim_matches('"').trim_matches('\'');

    if trimmed.is_empty() || trimmed.starts_with('-') {
        return None;
    }

    if let Ok(url) = url::Url::parse(trimmed) {
        if url.scheme() == "file" {
            if let Ok(path) = url.to_file_path() {
                return Some(path.to_string_lossy().to_string());
            }
        }
    }

    Some(trimmed.to_string())
}

#[cfg(target_os = "macos")]
fn pick_lesson_path_from_urls(urls: &[url::Url]) -> Option<String> {
    for url in urls {
        if url.scheme() != "file" {
            continue;
        }

        if let Ok(path) = url.to_file_path() {
            let path_str = path.to_string_lossy().to_string();
            if path_str.to_lowercase().ends_with(".aimepack") {
                return Some(path_str);
            }
        }
    }

    None
}

fn create_new_window_sync() -> Result<(), String> {
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    std::process::Command::new(exe)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn close_splashscreen(
    window: tauri::Window,
    _state: State<'_, LaunchFile>,
) -> Result<(), String> {
    // Close splash screen
    if let Some(splash) = window.get_webview_window("splash") {
        let _ = splash.close();
    }

    // Show main window
    let main = window
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;
    main.show().map_err(|e| e.to_string())?;

    // Once the main window is visible and React is running, emit any pending
    // launch-file path so HomeScreen can open it reliably.
    let pending = PENDING_LAUNCH.lock().ok().and_then(|mut g| g.take());

    if let Some(path) = pending {
        // Wait for the React tree (HomeScreen) to mount and register its
        // "launch-file-opened" listener.  The main window was hidden until
        // just now, so the WebView may need a moment to become event-ready.
        // 2 s is safe here — the splash already covers the visual wait.
        tokio::time::sleep(std::time::Duration::from_millis(2000)).await;
        let _ = main.emit("launch-file-opened", path);
    }

    Ok(())
}

#[tauri::command]
async fn open_lesson_pack(
    file_path: String,
    app: tauri::AppHandle,
) -> Result<OpenFileResult, String> {
    lesson_pack::open_lesson_pack(file_path, app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_launch_file(_state: State<'_, LaunchFile>) -> Result<Option<String>, String> {
    let path = PENDING_LAUNCH.lock().ok().and_then(|mut g| g.take());
    Ok(path)
}

#[tauri::command]
async fn verify_meta(extracted_path: String) -> Result<VerifyMetaResult, String> {
    lesson_pack::verify_meta(&extracted_path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_canvas_data(
    extracted_path: String,
    canvas_data: serde_json::Value,
) -> Result<(), String> {
    lesson_pack::save_canvas_data(&extracted_path, canvas_data).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_lesson_pack(
    extracted_path: String,
    original_path: String,
    canvas_data: serde_json::Value,
    slides: Option<serde_json::Value>,
) -> Result<(), String> {
    lesson_pack::save_lesson_pack(&extracted_path, &original_path, canvas_data, slides)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_recent_lessons(app: tauri::AppHandle) -> Result<Vec<RecentLesson>, String> {
    lesson_pack::get_recent_lessons(app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_to_recent(lesson: RecentLesson, app: tauri::AppHandle) -> Result<(), String> {
    lesson_pack::add_to_recent(lesson, app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn remove_from_recent(file_path: String, app: tauri::AppHandle) -> Result<(), String> {
    lesson_pack::remove_from_recent(&file_path, app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn clear_recent(app: tauri::AppHandle) -> Result<(), String> {
    lesson_pack::clear_recent(app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cleanup_lesson_pack(extracted_path: String) -> Result<(), String> {
    lesson_pack::cleanup_lesson_pack(&extracted_path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_new_window() -> Result<(), String> {
    create_new_window_sync()
}

#[tauri::command]
async fn download_aimepack(url: String, intent_id: String, app: tauri::AppHandle) -> Result<String, String> {
    lesson_pack::download_aimepack(url, intent_id, app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_downloaded_lessons(app: tauri::AppHandle) -> Result<Vec<lesson_pack::DownloadedLesson>, String> {
    lesson_pack::get_downloaded_lessons(app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_downloaded_lesson(lesson: lesson_pack::DownloadedLesson, app: tauri::AppHandle) -> Result<(), String> {
    lesson_pack::add_downloaded_lesson(lesson, app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn remove_downloaded_lesson(intent_id: String, app: tauri::AppHandle) -> Result<(), String> {
    lesson_pack::remove_downloaded_lesson(intent_id, app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn clear_downloads(app: tauri::AppHandle) -> Result<(), String> {
    lesson_pack::clear_downloads(app)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn patch_meta(extracted_path: String, patches: serde_json::Value) -> Result<(), String> {
    lesson_pack::patch_meta(&extracted_path, patches).map_err(|e| e.to_string())
}

#[tauri::command]
fn patch_and_rezip(
    extracted_path: String,
    zip_path: String,
    patches: serde_json::Value,
) -> Result<(), String> {
    lesson_pack::patch_and_rezip(&extracted_path, &zip_path, patches)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            let mut launch_path = None;

            // In release, the first argument is typically the file path if opened via association
            if args.len() > 1 {
                for arg in args.iter().skip(1) {
                    if let Some(candidate) = normalize_launch_arg(arg) {
                        let lower = candidate.to_lowercase();
                        if lower.ends_with(".aimepack")
                            && Path::new(&candidate).exists()
                        {
                            launch_path = Some(candidate);
                            break;
                        }
                    }
                }
            }

            // Seed the static only if args provided a path (cold launch via CLI/Finder pass-through)
            if let Some(ref p) = launch_path {
                if let Ok(mut g) = PENDING_LAUNCH.lock() {
                    *g = Some(p.clone());
                }
            }
            app.manage(LaunchFile);
            Ok(())
        })
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            close_splashscreen,
            open_lesson_pack,
            check_launch_file,
            verify_meta,
            get_recent_lessons,
            add_to_recent,
            remove_from_recent,
            clear_recent,
            cleanup_lesson_pack,
            create_new_window,
            download_aimepack,
            get_downloaded_lessons,
            add_downloaded_lesson,
            remove_downloaded_lesson,
            save_canvas_data,
            save_lesson_pack,
            patch_meta,
            patch_and_rezip,
            clear_downloads
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app, event| {
            #[cfg(target_os = "macos")]
            {
                let app = _app;
                if let tauri::RunEvent::Opened { urls } = event {
                    if let Some(path) = pick_lesson_path_from_urls(&urls) {
                        // If the main window is already visible, React is mounted — emit directly.
                        // Otherwise store in the static for close_splashscreen to pick up.
                        let main_visible = app
                            .get_webview_window("main")
                            .and_then(|w| w.is_visible().ok())
                            .unwrap_or(false);

                        if main_visible {
                            if let Some(main) = app.get_webview_window("main") {
                                let _ = main.emit("launch-file-opened", path);
                            }
                        } else {
                            if let Ok(mut g) = PENDING_LAUNCH.lock() {
                                *g = Some(path);
                            }
                        }
                    }
                }
            }
            #[cfg(not(target_os = "macos"))]
            let _ = event;
        });
}
