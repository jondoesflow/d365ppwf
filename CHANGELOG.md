# Changelog

All notable changes to the Power Platform Wireframe Library Figma plugin.
Uses [Keep a Changelog](https://keepachangelog.com/) conventions and
[semver](https://semver.org/).

## [0.2.0] — Power Platform Wireframe Library

**Complete rewrite.** Replaces the single-file grayscale D365 wireframe
template with a TypeScript project that authors real Figma Components
against the Fluent 2 / Power Platform design system.

### Added

- TypeScript + esbuild build pipeline (`npm run build`, `npm run typecheck`).
- `Power Platform Tokens` Variable collection with **Light** and **Dark**
  modes covering brand, canvas, stroke, text, status, flow and
  connector colours, plus spacing, radius, stroke, typography, and
  elevation tokens.
- `🎨 Tokens` page — visual specimens for every Variable and style.
- `🧱 Primitives` page — ~70 Fluent System Icons, plus Avatar, Badge,
  Tag, Spinner, Persona Component Sets.
- `🖼 Canvas Apps` library — ~40 Component Sets covering Structural,
  Navigation, Input, Buttons, Data, Feedback, and Charts categories.
- `🏛 Model-Driven Apps` library — ~40 Component Sets covering Shell,
  Views, Forms, Dialogs, Dashboards, and Admin categories, including
  14 distinct form-field types and a Business Process Flow.
- `🔀 Power Automate` library — ~50 Component Sets covering designer
  chrome, triggers, Dataverse / SharePoint / Outlook / Teams /
  Approvals / HTTP actions, data operations, variables, control
  blocks, and patterns (try/catch/finally, retry, expression, dynamic
  content, run-after).
- `📐 Wireframe Examples` page — composed screens demonstrating
  realistic combinations per library.
- `📖 Readme` page and `🧪 Playground` page.
- Plugin UI with per-library checkboxes, Examples / Dark-mode toggles,
  **Generate** and **Update existing** actions, progress bar, and
  completion summary.
- Idempotent re-runs via a stable-id registry stored in `pluginData`.
- Structured descriptions on every Component Set — Purpose, Power
  Platform equivalent, and Microsoft Learn docs link.

### Changed

- Plugin renamed from "D365 & Power Platform Wireframe Template" to
  **Power Platform Wireframe Library**.
- Palette changes from custom greyscale + blue to the Fluent 2
  palette; existing hex constants no longer match.
- Page naming, structure, and command surface are all different. There
  is no in-place migration from `0.1.x` — consumers should re-generate
  into a fresh file.

### Removed

- Legacy single-file `code.js` runtime (now a build artefact).
- Legacy runtime toggles for annotations, font, density, and grid.
- Legacy pages: Cover, Desktop Patterns, Tablet Patterns, Mobile
  Patterns, App Themes, Annotations.

## [0.1.1] — Bug fixes for the original template

- Fix `set_layoutGrids` validation: drop `sectionSize` with
  `alignment: STRETCH` and add alpha to grid colour.
- Fix `set_layoutPositioning` error in command bar — parent must have
  auto-layout when setting `layoutPositioning: ABSOLUTE`.

## [0.1.0] — Initial D365 wireframe template

Single-file plugin that generated 8 outcome-oriented pages of grayscale
wireframes for Dynamics 365 Customer Engagement and Power Platform.
Plain JS, no build step. Shipped 13 desktop screen patterns, tablet /
mobile variants, app-themed mini-shells, and a numbered annotation
layer. Kept for historical reference; superseded by `0.2.0`.
