# Changelog

All notable changes to AIME Lesson Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0 "Calabash"] - 2026-04-06 — Cloud Sync & Polish

### Added

- **Cloud sync for lesson changes** — after saving slide or canvas edits locally, teachers are prompted to sync changes back to the cloud via `PATCH /lesson-intents/{id}/pack`; supports "Sync to Cloud", "Always Sync", and "Skip" options with persistent preference
- **Grouped scheduled view** — Scheduled tab can toggle between flat grid and grouped-by-class view with section headers per class
- **Environment switcher** — hidden developer tool (`Ctrl+Alt+S`) to toggle between production and staging APIs with passphrase protection; staging mode changes the primary colour to amber/gold for visual differentiation

### Changed

- **API client** — base URL is now dynamic, driven by environment state; defaults to production (`api.aime52.ai`)
- **Tauri native fetch routing** — both production and staging API origins are routed through Tauri's native HTTP client to bypass CORS

### Fixed

- Lesson download silently failing when S3 returns an error — `download_aimepack` now checks HTTP status before saving
- Production API URL missing from Tauri HTTP permission scope — added `api.aime52.ai` to `http:allow-fetch` and `http:allow-fetch-send`
- Local image paths sent to cloud API — relative `image_url` paths are now prefixed with the S3 base URL before syncing

---

## [2.0.0 "Calabash"] - 2026-04-02 — From Reader to Studio

> *Named after the calabash gourd — a vessel carved, shaped, and passed between hands across every region of Africa. In Cameroon, it holds palm wine at gatherings, resonates inside the mvet, and stores milk among Fulani herders. It starts as something simple. It becomes whatever you need it to be.*

### Added

- **Assessment Editor** — full in-app editing of assessment packs: edit question text, options, answers, marks, and question types via collapsible panels with ShadCN UI; changes are saved back into the `.aimepack` file
- **Assessment Viewer** — read-only assessment viewer with answer toggle, markdown-rendered questions, MCQ option highlighting, homework display, and bloom level metadata
- **Homework support** — homework tasks, student instructions, marks, and submission notes are displayed in both editor and viewer; homework is fully integrated into the assessment pack lifecycle
- **Print to PDF** — replaced `@react-pdf/renderer` with an HTML-to-Print approach using `marked` for markdown rendering; assessment and homework print cleanly via the OS print dialog with proper formatting, page breaks, and student-facing content only
- **Slide editing** — teachers can now edit slide content directly inside the presentation viewer via `EditView` from `@aime.ai/renderer-react`; includes image replacement from a cloud-hosted image library
- **Image Picker with AIME Image Library** — browse, search, and paginate through AIME's curated cloud-hosted educational image library or upload local images; selected images are embedded into the `.aimepack` for offline portability
- **Language support** — English and French translations via `LanguageContext`; all UI strings are internationalised including greetings, buttons, status labels, error messages, and the Complete Lesson sheet
- **Assessment Pack API integration** — full service layer (`assessmentPackService`) for fetching active packs, listing versions, and syncing with the cloud
- **Downloaded lessons panel** — cards in the Downloaded tab now show Edit Assessment and View Assessment buttons; teachers can jump directly into assessment editing from the home screen

### Changed

- **Complete Lesson sheet** — print buttons replace PDF download links; assessment and homework are now printed via the OS dialog instead of generating in-memory PDFs
- **Canvas stability** — `BlockSuiteCanvas` from `@aime.ai/renderer-react` now handles save/restore more reliably; pending canvas data is tracked locally and flushed on explicit save

### Removed

- `@react-pdf/renderer` dependency and all associated PDF components (`AssessmentPDF`, `HomeworkPDF`, `MarkdownText`)

### Fixed

- Print dialog not opening in Tauri webview — switched from `window.open()` to hidden iframe approach
- Invalid HTML nesting — `<p>` wrappers around `<Markdown>` changed to `<div>` to prevent `p > ol` violations
- PDF text overlap — separated flex container styles from text styles in renderer components
- `LessonPack.meta` type extended to `LessonPackOutput & Record<string, unknown>` to support dynamic fields like `assessmentPack`
- ScrollArea overflow in both Assessment Editor and Viewer screens

---

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
