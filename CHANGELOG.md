# Changelog

All notable changes to AIME Lesson Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0 "Baobab"] - 2026-03-18 — First Major Release

> *Dedicated to Africa and Cameroon — named after the Baobab, the ancient Tree of Life that has sheltered communities across the continent for thousands of years.*

### Added

- **Whiteboard powered by `@aime.ai/renderer-react`** — whiteboard canvas is now driven by the dedicated renderer package, unlocking richer annotations and a consistent rendering pipeline across platforms
- **Canvas persistence** — whiteboard drawings are saved directly inside the `.aimepack` file so annotations survive between sessions and travel with the lesson
- **Cloud Integration** — teachers can log in, browse the catalogue, download lesson packs, and mark a lesson as complete entirely within AIME Lesson Studio; the full workflow from discovery to reflection never requires leaving the app
- **Complete Lesson sheet** — right-side sheet lets teachers review learning objectives (all pre-checked), choose a reflection depth (quick / standard / deep), answer open-ended prompts, and submit to the LMS in one action
- **`lesson_intent_id` persistence** — intent ID is permanently baked into the `.aimepack` file via `patch_and_rezip` so all subsequent open paths retain the correct cloud context
- **Clear Downloads** — one-click button in the Downloaded tab wipes all cached `.aimepack` files
- **Splash screen refresh** — launch screen updated with imagery dedicated to Africa

### Fixed

- Sheet scroll overflow on short screens
- All micro-objectives pre-checked by default when Complete Lesson sheet opens
- TypeScript strict-mode build errors (`SafeImage`, `collapsible`, `lessonIntentService`)

## [0.1.0] - 2026-03-13

### Added

- Initial release of AIME Lesson Studio
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
