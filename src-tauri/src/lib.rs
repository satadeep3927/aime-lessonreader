// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Manager, State};
use std::sync::Mutex;

mod lesson_pack;
use lesson_pack::*;

struct LaunchFile(Mutex<Option<String>>);

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splash screen
    if let Some(splash) = window.get_webview_window("splash") {
        splash.close().unwrap();
    }
    // Show main window
    window.get_webview_window("main").unwrap().show().unwrap();
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
async fn check_launch_file(state: State<'_, LaunchFile>) -> Result<Option<String>, String> {
    let mut file = state.0.lock().map_err(|_| "Failed to lock mutex")?;
    Ok(file.take())
}

#[tauri::command]
async fn verify_meta(extracted_path: String) -> Result<VerifyMetaResult, String> {
    lesson_pack::verify_meta(&extracted_path).map_err(|e| e.to_string())
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
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    std::process::Command::new(exe)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            let mut launch_path = None;
            
            // In release, the first argument is typically the file path if opened via association
            if args.len() > 1 {
                // Try to find an efficient way to detect the pack file
                for arg in args.iter().skip(1) {
                    if arg.ends_with(".aimepack") {
                        launch_path = Some(arg.clone());
                        break;
                    }
                }
                
                // Fallback for double click if extension check fails but arg exists
                #[cfg(not(debug_assertions))]
                if launch_path.is_none() {
                     launch_path = Some(args[1].clone());
                }
            }

            app.manage(LaunchFile(Mutex::new(launch_path)));
            Ok(())
        })
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
            create_new_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
