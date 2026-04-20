# D365 & Power Platform Wireframe Kit

A reusable Figma plugin that generates a mid-fi wireframe template for
**Dynamics 365 Customer Engagement** (Sales, Customer Service, Marketing,
Field Service, Project Operations) and **Power Platform** (Power Apps
canvas/model-driven, Power Automate).

The plugin builds the whole kit on demand — design tokens, a full component
library, 13 desktop screen patterns, tablet + mobile variants, 7 app-themed
mini-shells, and a heavy annotation layer for teaching — and exposes runtime
toggles for annotations, font, density, and layout grids.

---

## Why a plugin?

Figma's REST API is read-only for design content. It cannot create files or
draw nodes. The only supported way to programmatically author a Figma file
is through the Figma Plugin API. So this repo ships a tiny plugin that does
all the authoring inside Figma, on your account, on demand.

## What it generates

One Figma file containing eight pages:

| Page | Contents |
|------|----------|
| `00 · Cover` | Title card, legend, how-to-use, visual swatch strip |
| `01 · Tokens` | Color scales, typography samples, spacing steps, icon stock |
| `02 · Components` | Buttons, inputs, dropdowns, pills, tabs, KPI tiles, charts, rows, avatars, icons, annotation style |
| `03 · Desktop Patterns` | 13 full-size desktop screens (1440×900) |
| `04 · Tablet Patterns` | 3 tablet variants (1024×768) |
| `05 · Mobile Patterns` | 3 mobile variants (390×844) |
| `06 · App Themes` | 7 app-themed mini-shells (Sales, Service, Marketing, Field, Project, Power Apps, Power Automate) |
| `07 · Annotations` | Numbered teaching notes you can drop next to any frame |

### Desktop patterns included

1. Sitemap / app navigation shell
2. List / grid view (records)
3. Record form — header, BPF, tabs, sections, timeline
4. Dashboard — KPI tiles, bar / line / donut charts, recent activity list
5. Business process flow bar — collapsed + expanded stage
6. Timeline / activity feed — split view with summary + feed
7. Calendar / schedule board — resource swim lanes, colored bookings
8. Kanban / board view — stage columns with cards
9. Quick create / side panel — scrim + form + footer actions
10. Command bar / ribbon — anatomy examples
11. Lookup / dialog modal — blocking overlay with results
12. Power Automate flow diagram — trigger, actions, condition, inspector
13. Power Apps canvas screen — studio chrome with tree, canvas, properties

## Runtime toggles

The plugin panel exposes four runtime controls that traverse the whole
template:

- **Annotations** — hide or show every annotation node in one click.
- **Font** — swap between Sans (`Inter`), Mono (`Roboto Mono`), Hand
  (`Caveat`). Falls back gracefully if a font is not installed.
- **Density** — toggle `compact` / `comfortable` on list rows and
  timelines.
- **Grid** — hide or show the 12-column layout grid on every screen.

## Install

This is a **development plugin**. It is not published to the Figma Community.

1. Clone the repo: `git clone https://github.com/jondoesflow/d365ppwf.git`
2. Open the Figma desktop app (required — the web app cannot run local
   plugins).
3. Open a new or existing Figma design file.
4. Menu → **Plugins → Development → Import plugin from manifest…**
5. Select `manifest.json` from the cloned repo.
6. Open **Plugins → Development → D365 & Power Platform Wireframe Template**.
7. Click **Build template**. A new set of eight pages is created in the
   current file (it is safe to re-run — the plugin reuses a marker in
   plugin data so it removes and rebuilds only its own pages).

No build step is required. The plugin is plain JavaScript against the
Figma Plugin API 1.0.0. If you want type-checked development, see
`@figma/plugin-typings` in their docs.

## Usage tips

- Treat the **Components** page as your library — copy any frame into your
  own composition and restyle via tokens.
- Each desktop screen is self-contained, built with auto-layout where it
  helps, so you can resize sections without breakage.
- The **annotation layer** is deliberately loud (dashed magenta pill + leader
  line). Hide it when you're presenting, show it when you're teaching.
- To re-skin a screen for a specific app, replace the accent color on the
  topbar / BPF / primary buttons. The `App Themes` page shows what that
  looks like for each D365 / Power Platform app.

## Project layout

```
manifest.json   Figma plugin manifest (entry point, permissions)
code.js         Plugin runtime — tokens, components, screens, toggles
ui.html         Control panel (build + toggles)
README.md       You are here
```

## License

MIT — do what you want, attribution appreciated but not required.
