// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::menu::{MenuBuilder, MenuItemKind, SubmenuBuilder};
use tauri::{Emitter, Manager, State};
use std::sync::Mutex;

mod lesson_pack;
use lesson_pack::*;

struct LaunchFile(Mutex<Option<String>>);

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
                // Try case-insensitive extension check first
                for arg in args.iter().skip(1) {
                    if arg.to_lowercase().ends_with(".aimepack") {
                        launch_path = Some(arg.clone());
                        break;
                    }
                }
                
                // Fallback: take the first non-flag argument
                if launch_path.is_none() {
                     if let Some(arg) = args.iter().skip(1).find(|a| !a.starts_with("-")) {
                         launch_path = Some(arg.clone());
                     }
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
