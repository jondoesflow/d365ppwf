# Power Platform Wireframe Library

A reusable **Figma plugin** that generates a mid-fi component library for
Microsoft Power Platform makers and solution architects. Produces three
parallel libraries in one Figma file, authored as real Components with
variants, descriptions, and Figma Variables — ready to be consumed by
copy-paste or as a published team library.

- 🖼 **Canvas Apps** — Modern Controls (Fluent 2 visual language)
- 🏛 **Model-Driven Apps** — Unified Interface (Fluent UI 2)
- 🔀 **Power Automate** — Cloud Flows (card-based designer vocabulary)

Every component binds its colour, stroke, radius, spacing and text
style to Variables in the `Power Platform Tokens` collection, so
switching the collection mode from **Light** to **Dark** re-themes the
entire file.

## What it produces

A single Figma file containing eight pages:

| Page | Contents |
|------|----------|
| `📖 Readme` | Cover card, version, token quick-reference, changelog |
| `🎨 Tokens` | Colour swatches, typography specimens, spacing / radius / elevation |
| `🧱 Primitives` | Icon set (~70), Avatar, Badge, Tag, Spinner, Persona |
| `🖼 Canvas Apps` | Structural, Navigation, Input, Buttons, Data, Feedback, Charts (~40 sets) |
| `🏛 Model-Driven Apps` | Shell, Views, Forms, Dialogs, Dashboards, Admin (~40 sets) |
| `🔀 Power Automate` | Chrome, Triggers, Actions, Data ops, Variables, Controls, Patterns (~50 sets) |
| `📐 Wireframe Examples` | Composed screens demonstrating realistic combinations |
| `🧪 Playground` | Empty page, reserved for consumer compositions |

See [`COMPONENT_SPEC.md`](./COMPONENT_SPEC.md) for the full component
inventory with variants and properties.

## Install

You need **Figma Desktop** — development plugins can only be imported
from a local manifest in the desktop app.

```bash
git clone https://github.com/jondoesflow/d365ppwf.git
cd d365ppwf
npm install
npm run build       # produces code.js consumed by Figma
```

In Figma Desktop:

1. Open (or create) any design file.
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Select `manifest.json` from the cloned repo.
4. **Plugins → Development → Power Platform Wireframe Library**.

The built `code.js` is committed so casual users can skip `npm install`
if they are not modifying the plugin.

## Usage

The plugin UI offers:

- **Libraries** — check any combination of Canvas, MDA, Flow.
- **Include Wireframe Examples** — toggles the `📐 Wireframe Examples` page.
- **Include Dark-mode preview frames** — reserved for a future release.
- **Generate** — creates the library fresh (purges previous plugin-owned pages).
- **Update existing** — re-runs and patches components in place by stable node id. Safe to run repeatedly.

A progress bar reports each phase. On completion you see a summary with
components created / updated / tokens published / estimated file size.

## Token reference

All design tokens live in the `Power Platform Tokens` Variable
collection, with `Light` and `Dark` modes. Switching the mode re-themes
the whole file.

### Colour (Fluent 2 / Power Platform palette)

| Token | Light | Dark |
|---|---|---|
| `color/brand/primary` | `#0F6CBD` | `#2886DE` |
| `color/brand/primary-hover` | `#115EA3` | `#479EF5` |
| `color/brand/primary-pressed` | `#0F548C` | `#62ABF5` |
| `color/canvas/background` | `#FFFFFF` | `#1F1F1F` |
| `color/canvas/surface` | `#FAFAFA` | `#292929` |
| `color/canvas/surface-alt` | `#F5F5F5` | `#333333` |
| `color/stroke/default` | `#D1D1D1` | `#666666` |
| `color/stroke/subtle` | `#E0E0E0` | `#525252` |
| `color/text/primary` | `#242424` | `#FFFFFF` |
| `color/text/secondary` | `#616161` | `#D6D6D6` |
| `color/text/disabled` | `#BDBDBD` | `#5C5C5C` |
| `color/status/success` | `#107C10` | `#54B054` |
| `color/status/warning` | `#F7630C` | `#FAA06B` |
| `color/status/danger` | `#C50F1F` | `#E37D80` |
| `color/status/info` | `#0F6CBD` | `#479EF5` |
| `color/flow/trigger` | `#742774` | `#B4A0FF` |
| `color/flow/action` | `#0F6CBD` | `#479EF5` |
| `color/flow/control` | `#616161` | `#D6D6D6` |
| `color/flow/connector-o365` | `#0078D4` | `#2886DE` |
| `color/flow/connector-dataverse` | `#0B5A9D` | `#62ABF5` |
| `color/flow/connector-sharepoint` | `#0B6B3A` | `#54B054` |
| `color/flow/connector-teams` | `#4B53BC` | `#8A92E8` |

### Typography

Text styles load `Segoe UI Variable` where available, falling back
through `Segoe UI → Inter → Roboto`.

| Style | Size / LH / Weight |
|---|---|
| `type/caption` | 12 / 16 / Regular |
| `type/body` | 14 / 20 / Regular |
| `type/body-strong` | 14 / 20 / Semibold |
| `type/subtitle` | 16 / 22 / Semibold |
| `type/title-3` | 20 / 28 / Semibold |
| `type/title-2` | 24 / 32 / Semibold |
| `type/title-1` | 32 / 40 / Semibold |
| `type/display` | 40 / 52 / Bold |

### Spacing & radius

- `space/{0,2,4,6,8,12,16,20,24,32,40,48}` — 4 px base grid
- `radius/{none,small,medium,large,circular}` → `0, 2, 4, 8, 9999`
- `stroke/{thin,thick}` → `1, 2`
- `elevation/{2,4,8,16}` — drop-shadow effect styles

## Contributing a new component

The authoring pattern is deliberately small. To add `Canvas/Input/Colour Picker`:

```ts
// src/libraries/canvas/inputs.ts
import { publishSet, bindFill, bindStroke, bindText } from '../../lib/componentKit.js';
import { frame, autoLayout, rect, text } from '../../lib/layout.js';

async function buildColourPicker(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Focus', 'Disabled']) {
    const f = frame(`State=${state}`, undefined);
    autoLayout(f, 'h', 8, { l: 8, r: 8, t: 6, b: 6 });
    // …build your component nodes, binding fills/strokes/text to Variables…
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Input/Colour Picker', {
    purpose: 'Single colour selection with swatch preview.',
    pp: 'Colour picker (Modern Controls).',
    docs: 'https://learn.microsoft.com/…',
  }, 'canvas/input/colour-picker');
}
```

Then call `buildColourPicker` from the library's `buildCanvasInputs`
entry. `publishSet` handles variant combination, description, and the
stable-id registry — so re-runs patch the node instead of duplicating.

## Versioning policy

- **Patch** — bug fixes, token value tweaks, layout corrections.
- **Minor** — new components, new variants, new app surfaces. Re-running the plugin patches existing nodes in place.
- **Major** — breaking changes to component names or variant axes. Consumers must re-instantiate.

See [`CHANGELOG.md`](./CHANGELOG.md) for the release log.

## Troubleshooting

- **"set_layoutGrids failed validation"** — your Figma version requires
  `alignment: STRETCH` grids to have `count` and `offset` (no
  `sectionSize`). Already handled in `src/lib/tokens.ts`.
- **Font fallbacks look different on Linux** — Segoe UI Variable is not
  shipped. The plugin auto-falls back to Inter or Roboto.
- **Plugin rebuilds the same page twice** — you renamed a page we own.
  Use **Update existing** to re-bind by stable id.

## Project layout

```
manifest.json          Figma plugin manifest
package.json           npm scripts and dev-deps
tsconfig.json          TypeScript configuration
esbuild.config.mjs     Build script — emits code.js + copies ui.html
code.js                Build artefact (committed, so Figma can run as-is)
ui.html                Build artefact (committed)
src/
  main.ts              Plugin entry: message router + orchestrator
  ui.html              UI panel — library checkboxes, toggles, Generate
  lib/
    colors.ts          Palette constants
    componentKit.ts    publishSet / bindFill / bindStroke / bindText
    fonts.ts           Runtime family resolver & loader
    icons.ts           70 inlined Fluent SVG paths
    layout.ts          frame / autoLayout / rect / ellipse / text
    pluginData.ts      Stable-id registry for idempotent re-runs
    primitives.ts      Cross-library atoms (Icon/Avatar/Badge/Tag/…)
    tokens.ts          Variable + TextStyle + EffectStyle builder
    tokensPage.ts      🎨 Tokens page renderer
  libraries/
    canvas/            Canvas Apps Modern Controls library
    mda/               Model-Driven Apps (Unified Interface) library
    flow/              Power Automate (Cloud Flows) library
  pages/
    readme.ts          📖 Readme page renderer
    examples.ts        📐 Wireframe Examples page renderer
    playground.ts      🧪 Playground page renderer
```

## License

MIT — see [`LICENSE`](./LICENSE) if present. Fluent UI System Icons
paths are sourced from Microsoft's MIT-licensed
[fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons).
