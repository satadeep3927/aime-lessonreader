# Changelog

All notable changes to AIME Lesson Reader will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-13

### Added

- Initial release of AIME Lesson Reader
- Lesson pack loading and management with recent files history
- Presentation viewer with slide navigation
- Multiple slide types: Cover, Generic, Assessment Question, Assessment Instructions, Concept Map, Discussion, Exit Ticket, Guided Practice
- Floating navigation controls during presentation
- Slide sidebar with thumbnails for quick navigation
- Notes panel for presenter view
- Whiteboard canvas overlay for annotations
- Markdown rendering with KaTeX math equation support
- Settings dialog for customization
- Custom titlebar with window controls
- Splash screen on app launch
- Native application menu (Home, File, View, Navigate, Help)
- File association for `.aimepack` files — double-click to open directly
- Open `.aimepack` files at launch via CLI argument or OS file association
- Cross-platform builds: Windows (NSIS, MSI), macOS (DMG, App — Apple Silicon), Linux (DEB, RPM, AppImage)

### Fixed (Linux / ChromeOS)

- Added `libgtk-4-dev` to CI build dependencies; resolves GTK4 installation error on ChromeOS Crostini
- Splash screen titlebar now hidden on Wayland by forcing X11 backend (`GDK_BACKEND=x11`) when running under Wayland
- Registered `application/x-aimepack` MIME type with shared-mime-info XML and post-install script so `.aimepack` file association works correctly on Linux
- Taskbar icon no longer shows WebKitGTK panda placeholder — hicolor icon cache is updated on install (`gtk-update-icon-cache`) and full icon set (32×32, 64×64, 128×128, 256×256) is now bundled
- Enabled `enableGTKAppId` so the GTK application ID matches the `.desktop` file, allowing the taskbar to show the correct icon
