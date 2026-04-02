# AIME Lesson Studio 2.0.0 "Calabash" — From Reader to Studio

## A Name That Holds Everything

Baobab was our first name. A tree. Something that stands still and shelters.

Calabash is different. The calabash gourd (*Lagenaria siceraria*) doesn't stay where it grew. It's harvested, hollowed, carved, and shaped — then it becomes whatever the moment requires. A drinking cup. A drum. A milk vessel. A seed container. A resonator for music. A gift passed between families.

Across sub-Saharan Africa, from Nigeria to Tanzania, from Ghana to Mozambique, the calabash is everywhere. In Cameroon, where AIME was first shaped, it holds palm wine at community gatherings in the Northwest. Fulani herders in the north carve intricate patterns into calabashes to store milk — a craft tradition called *horde* that's been passed down for generations. In the south, the *mvet*, a stringed instrument of the Beti and Fang peoples, uses a calabash as its resonating chamber. The sound of a story being told.

We named this release Calabash because of what happened to the software between 1.0.0 and 2.0.0. It stopped being one thing and became many.

---

## What Changed

Version 1.0.0 "Baobab" was a **reader**. You could open a lesson, view slides, annotate with a whiteboard, and mark it complete. It did one job well.

Version 2.0.0 "Calabash" is a **studio**. The same app now lets teachers:

1. **Edit assessments** — open the assessment pack baked into any lesson, change question text, adjust marks, rewrite options, and save everything back into the `.aimepack` file
2. **View assessments** — a clean read-only view with markdown rendering, answer toggling, bloom level metadata, and homework display
3. **Print for students** — generate clean, student-facing assessment and homework sheets through the OS print dialog, with proper markdown formatting, page breaks, and no teacher-only data leaking through
4. **Edit slides** — modify slide content directly inside the presentation viewer, swap images from a cloud-hosted library, and save changes back to the pack
5. **Work in two languages** — every string in the interface is now available in English and French

The distance between "opening a lesson" and "preparing everything a teacher needs for class" collapsed into a single workflow inside a single window.

---

## Assessment Editor

The Assessment Editor is the centrepiece of this release. Every question in the assessment pack is displayed as a collapsible card. Expand it to edit:

- **Question text** — full markdown, rendered in the viewer and when printed
- **Question type** — MCQ, short answer, structured, or any custom type
- **Marks** — per-question allocation
- **Options** — for multiple-choice questions, each option is individually editable
- **Answer** — the expected response, visible only to teachers
- **Bloom level and rationale** — metadata from the AI that generated the assessment

Changes are saved directly into the `.aimepack` file. The assessment travels with the lesson.

---

## Assessment Viewer

A separate read-only view renders the full assessment with:

- Markdown-formatted question text
- MCQ options with optional answer highlighting (toggle on/off)
- Homework section with tasks, instructions, and submission notes
- Metadata strip: total marks, estimated time, assessment type

Teachers use this to review what students will see — without accidentally editing anything.

---

## Print to PDF — The Right Way

The previous release used `@react-pdf/renderer` to generate PDFs in memory. It was fragile. Markdown didn't render. Text overlapped. Teacher-only data leaked into student documents.

We replaced the entire approach. Assessments and homework are now converted to styled HTML using `marked`, then printed through the OS print dialog via a hidden iframe. The result:

- **Markdown renders correctly** — bold, italic, lists, code blocks, all formatted
- **Student-facing only** — no answers, no bloom levels, no rationale, no question types
- **Page breaks respected** — questions don't split across pages
- **Works in Tauri** — the iframe approach works inside the webview where `window.open()` is blocked

Teachers click "Print Assessment" or "Print Homework" and get a clean document they can hand to students or save as PDF.

---

## Slide Editing & AIME Image Library

Teachers can now edit slide content directly in the presentation viewer — powered by `EditView` from `@aime.ai/renderer-react`. When a slide needs a new image, the Image Picker dialog opens into **AIME Image Library** — a curated, cloud-hosted collection of educational images maintained by the AIME platform.

- **Browse & search** — paginate through thousands of images or filter by keyword
- **Curated for classrooms** — the library is purpose-built for African educational contexts, with images covering science, history, literature, culture, geography, and more
- **Local upload** — if the library doesn't have what you need, drag and drop or select a file from disk
- **Automatic embedding** — selected images are downloaded and copied into the `.aimepack` so the lesson remains fully portable and works offline

---

## Language Support

Every user-facing string in the application is now internationalised. English and French are fully supported. This includes:

- Greetings, button labels, status badges, error messages
- The Complete Lesson sheet
- Assessment editor and viewer labels
- Navigation, tooltips, and confirmation dialogs

More languages will follow based on where teachers are using the app.

---

## What Comes After Calabash?

The pattern continues. Every release carries a name from the region — alphabetically, rooted in meaning.

**D** is next.

If you're a teacher using AIME Lesson Studio, we want to hear from you. The calabash was shaped by the hands that use it. So is this software.

---

## Artifacts for Installation

### Linux/Debian

- AIME.Lesson.Studio-2.0.0-1.x86_64.rpm
- AIME.Lesson.Studio_2.0.0_amd64.deb
- AIME.Lesson.Studio_2.0.0_amd64.AppImage

### ChromeBooks/ARM based Debian Systems

- AIME.Lesson.Studio_2.0.0_arm64.deb

### Windows

- AIME.Lesson.Studio_2.0.0_x64-setup.exe
- AIME.Lesson.Studio_2.0.0_x64_en-US.msi

### macOS

- AIME.Lesson.Studio_2.0.0_aarch64.dmg

### Installer for Debian based OS

- aime-lesson-studio-installer_2.0.0_amd64.deb
