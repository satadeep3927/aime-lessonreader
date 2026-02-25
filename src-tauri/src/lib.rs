// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::menu::{MenuBuilder, MenuItemKind, SubmenuBuilder};
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

fn set_menu_item_enabled(app: &tauri::AppHandle, item_id: &str, enabled: bool) {
    let Some(menu) = app.menu() else {
        return;
    };
    let Some(item) = menu.get(item_id) else {
        return;
    };

    match item {
        MenuItemKind::MenuItem(item) => {
            let _ = item.set_enabled(enabled);
        }
        MenuItemKind::Check(item) => {
            let _ = item.set_enabled(enabled);
        }
        MenuItemKind::Icon(item) => {
            let _ = item.set_enabled(enabled);
        }
        MenuItemKind::Submenu(item) => {
            let _ = item.set_enabled(enabled);
        }
        MenuItemKind::Predefined(_) => {}
    }
}

fn update_native_menu_state(
    app: &tauri::AppHandle,
    has_lesson: bool,
    is_viewer_page: bool,
) {
    let lesson_bound_items = ["file.close_lesson", "file.properties"];
    let viewer_bound_items = [
        "view.fit_to_window",
        "view.actual_size",
        "view.zoom_in",
        "view.zoom_out",
        "view.presentation_mode",
        "view.toggle_sidebar",
        "view.toggle_notes",
        "view.toggle_whiteboard",
        "navigate.next",
        "navigate.prev",
        "navigate.first",
        "navigate.last",
        "navigate.goto",
        "navigate.toc",
    ];

    for item_id in lesson_bound_items {
        set_menu_item_enabled(app, item_id, has_lesson);
    }

    for item_id in viewer_bound_items {
        set_menu_item_enabled(app, item_id, is_viewer_page);
    }
}

fn emit_menu_action(app: &tauri::AppHandle, action: &str) {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.emit("native-menu-action", action.to_string());
    }
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
async fn update_menu_state(
    app: tauri::AppHandle,
    has_lesson: bool,
    is_viewer_page: bool,
) -> Result<(), String> {
    update_native_menu_state(&app, has_lesson, is_viewer_page);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let home_menu = SubmenuBuilder::new(app, "Home")
                .text("home.go_home", "Go to Home")
                .text("home.settings", "Settings")
                .build()?;

            let file_menu = SubmenuBuilder::new(app, "File")
                .text("file.new_window", "New Window")
                .text("file.open_lesson", "Open Lesson...")
                .separator()
                .text("file.close_lesson", "Close Lesson")
                .text("file.properties", "Properties")
                .separator()
                .text("file.exit", "Exit")
                .build()?;

            let view_menu = SubmenuBuilder::new(app, "View")
                .text("view.fit_to_window", "Fit to Window")
                .text("view.actual_size", "Actual Size")
                .text("view.zoom_in", "Zoom In")
                .text("view.zoom_out", "Zoom Out")
                .separator()
                .text("view.full_screen", "Full Screen")
                .text("view.presentation_mode", "Presentation Mode")
                .separator()
                .text("view.toggle_sidebar", "Toggle Sidebar")
                .text("view.toggle_notes", "Toggle Notes Panel")
                .text("view.toggle_whiteboard", "Toggle Whiteboard Mode")
                .separator()
                .text("view.light_mode", "Light Mode")
                .text("view.dark_mode", "Dark Mode")
                .build()?;

            let navigate_menu = SubmenuBuilder::new(app, "Navigate")
                .text("navigate.next", "Next Slide")
                .text("navigate.prev", "Previous Slide")
                .text("navigate.first", "First Slide")
                .text("navigate.last", "Last Slide")
                .separator()
                .text("navigate.goto", "Go to Slide...")
                .text("navigate.toc", "Table of Contents")
                .build()?;

            let help_menu = SubmenuBuilder::new(app, "Help")
                .text("help.user_guide", "User Guide")
                .text("help.keyboard_shortcuts", "Keyboard Shortcuts")
                .separator()
                .text("help.about", "About Lesson Reader")
                .build()?;

            let menu = MenuBuilder::new(app)
                .items(&[&home_menu, &file_menu, &view_menu, &navigate_menu, &help_menu])
                .build()?;
            app.set_menu(menu)?;
            update_native_menu_state(app.handle(), false, false);

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
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .on_menu_event(|app, event| match event.id().as_ref() {
            "file.new_window" => {
                let _ = create_new_window_sync();
            }
            "file.exit" => {
                app.exit(0);
            }
            "view.full_screen" => {
                if let Some(main) = app.get_webview_window("main") {
                    if let Ok(is_fullscreen) = main.is_fullscreen() {
                        let _ = main.set_fullscreen(!is_fullscreen);
                    }
                }
            }
            "view.presentation_mode" => {
                if let Some(main) = app.get_webview_window("main") {
                    let _ = main.set_fullscreen(true);
                }
            }
            action => {
                emit_menu_action(app, action);
            }
        })
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
            update_menu_state
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
