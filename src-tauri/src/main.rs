// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Force X11 on Linux under Wayland so that decorations:false is respected
    // (Wayland ignores it; ChromeOS Crostini always has XWayland available)
    #[cfg(target_os = "linux")]
    if std::env::var("WAYLAND_DISPLAY").is_ok() && std::env::var("GDK_BACKEND").is_err() {
        unsafe { std::env::set_var("GDK_BACKEND", "x11"); }
    }

    aime_lessonreader_lib::run()
}
