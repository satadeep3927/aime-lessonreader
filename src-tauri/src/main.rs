// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Force X11 on Linux so that decorations:false is respected.
    // ChromeOS Crostini uses Wayland (Sommelier) but does not set WAYLAND_DISPLAY,
    // so checking that var is unreliable. Always prefer X11 unless the user
    // has explicitly set GDK_BACKEND themselves.
    #[cfg(target_os = "linux")]
    if std::env::var("GDK_BACKEND").is_err() {
        unsafe { std::env::set_var("GDK_BACKEND", "x11"); }
    }

    aime_lessonreader_lib::run()
}
