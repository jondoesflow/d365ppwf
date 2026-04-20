# Component Spec

The authoritative inventory of every Component Set produced by the
Power Platform Wireframe Library plugin. This document acts as the
contract for future changes: renaming a variant axis or removing a
variant without updating this file is a breaking change.

The source of truth is the call sites of `publishSet()` in the TypeScript
sources under `src/` — see `src/lib/componentKit.ts`. A generator
script that derives this markdown automatically is a planned follow-up
(`src/lib/spec.ts`).

---

## Primitives (`🧱 Primitives`)

| Name | Variants | Component properties |
|------|----------|----------------------|
| `Primitives/Icon` | `Name` × 70 (add, close, mail, …) | Vector fill |
| `Primitives/Avatar` | `Size` (XS / S / M / L / XL) × `Content` (Initials / Image) | Initials text, image swap |
| `Primitives/Badge` | `Type` (Dot / Counter / Status) × `Tone` (Neutral / Brand / Success / Warning / Danger) | Label text |
| `Primitives/Tag` | `Variant` (Filled / Outlined) × `Size` (Small / Medium) | Label text |
| `Primitives/Spinner` | `Size` (Tiny / Small / Medium / Large / Huge) | — |
| `Primitives/Persona` | `Size` (Small / Medium / Large) × `Show secondary` (true / false) | Name, secondary text, avatar swap |

## Canvas Apps (`🖼 Canvas Apps`)

### Structural
| Name | Variants |
|------|----------|
| `Canvas/Screen/Blank` | `Device` (Desktop / Phone) |
| `Canvas/Screen/Scrollable` | `Device` (Desktop / Phone) |
| `Canvas/Container/Horizontal` | `Gap` (8 / 16 / 24) |
| `Canvas/Container/Vertical` | `Gap` (8 / 16 / 24) |
| `Canvas/Container/Grid` | — (12-column reference) |

### Navigation
| Name | Variants |
|------|----------|
| `Canvas/Nav/App Header` | `Width` (1280 / 768) |
| `Canvas/Nav/Side Menu` | `State` (Expanded / Collapsed) |
| `Canvas/Nav/Breadcrumb` | — |
| `Canvas/Nav/Tabs` | `Selected` (0 / 1 / 2) |

### Input
| Name | Variants |
|------|----------|
| `Canvas/Input/Text Input` | `State` (Default / Hover / Focus / Error / Disabled / Readonly) |
| `Canvas/Input/Text Area` | `State` (Default / Focus / Error / Disabled) |
| `Canvas/Input/Dropdown` | `State` × `Open` (Closed / Open) |
| `Canvas/Input/Combo Box` | `State` (Default / Focus) |
| `Canvas/Input/Date Picker` | `State` (Closed / Open) |
| `Canvas/Input/Time Picker` | `State` (Default / Focus) |
| `Canvas/Input/Toggle` | `State` × `Value` (On / Off) |
| `Canvas/Input/Checkbox` | `State` × `Value` (Unchecked / Checked / Indeterminate) |
| `Canvas/Input/Radio Group` | `State` (Default / Disabled) |
| `Canvas/Input/Slider` | `State` (Default / Disabled) |
| `Canvas/Input/Rating` | `Value` (0–5) |
| `Canvas/Input/Number Input` | `State` (Default / Focus / Disabled) |

### Buttons
| Name | Variants |
|------|----------|
| `Canvas/Button/Primary` | `State` × `Size` |
| `Canvas/Button/Secondary` | `State` × `Size` |
| `Canvas/Button/Subtle` | `State` × `Size` |
| `Canvas/Button/Transparent` | `State` × `Size` |
| `Canvas/Button/Icon Only` | `State` × `Size` |
| `Canvas/Button/Split Button` | `State` (Default / Hover / Disabled) |

### Data Display
| Name | Variants |
|------|----------|
| `Canvas/Data/Gallery — Vertical` | `Variant` (Default / Selected / Hover) |
| `Canvas/Data/Gallery — Horizontal` | — |
| `Canvas/Data/Gallery — Flexible Height` | — |
| `Canvas/Data/Data Table` | `Selection` (Off / On) |
| `Canvas/Data/Card` | `Footer` (None / Actions) |
| `Canvas/Data/Form — Edit` | — |
| `Canvas/Data/Form — Display` | — |
| `Canvas/Data/Empty State` | — |

### Feedback
| Name | Variants |
|------|----------|
| `Canvas/Feedback/Spinner` | — |
| `Canvas/Feedback/Progress Bar` | `Kind` (Determinate × Value=0/40/80/100, Indeterminate) |
| `Canvas/Feedback/Message Bar` | `Intent` (Info / Success / Warning / Danger) |
| `Canvas/Feedback/Toast` | `Intent` (Info / Success / Warning / Danger) |
| `Canvas/Feedback/Dialog` | `Size` (Small / Medium / Large) |
| `Canvas/Feedback/Teaching Callout` | — |

### Charts
| Name | Variants |
|------|----------|
| `Canvas/Chart/Bar` | — |
| `Canvas/Chart/Column` | — |
| `Canvas/Chart/Line` | — |
| `Canvas/Chart/Pie` | — |
| `Canvas/Chart/Donut` | — |
| `Canvas/Chart/KPI` | `Trend` (Up / Flat / Down) |

## Model-Driven Apps (`🏛 Model-Driven Apps`)

### App Shell
| Name | Variants |
|------|----------|
| `MDA/Shell/App Header` | — |
| `MDA/Shell/Site Map` | `State` (Expanded / Collapsed) |
| `MDA/Shell/Nav Bar` | — |
| `MDA/Shell/Command Bar` | `Selection` (None / Single / Multi) |

### Views & Grids
| Name | Variants |
|------|----------|
| `MDA/View/Read-Only Grid` | — |
| `MDA/View/Editable Grid` | — |
| `MDA/View/Card View` | — |
| `MDA/View/Calendar View` | — |
| `MDA/View/Kanban` | — |
| `MDA/View/View Selector` | `State` (Closed / Open) |
| `MDA/View/Filter Pane` | — |
| `MDA/View/Charts Pane` | — |

### Forms
| Name | Variants |
|------|----------|
| `MDA/Form/Main Form` | — |
| `MDA/Form/Header` | — |
| `MDA/Form/Tab Strip` | `Selected` (0 / 1 / 2) |
| `MDA/Form/Section` | `Columns` (1 / 2 / 3) |
| `MDA/Form/Field — Single Line Text` | `State` (Default / Focus / Readonly / Disabled) |
| `MDA/Form/Field — Multi-Line Text` | `State` |
| `MDA/Form/Field — Option Set` | `State` |
| `MDA/Form/Field — Multi-Select Option Set` | `State` |
| `MDA/Form/Field — Yes/No` | `State` |
| `MDA/Form/Field — Date Only` | `State` |
| `MDA/Form/Field — Date and Time` | `State` |
| `MDA/Form/Field — Number` | `State` |
| `MDA/Form/Field — Currency` | `State` |
| `MDA/Form/Field — Lookup` | `State` |
| `MDA/Form/Field — Customer Lookup` | `State` |
| `MDA/Form/Field — Owner` | `State` |
| `MDA/Form/Field — File / Image` | `State` |
| `MDA/Form/Field — Rich Text` | `State` |
| `MDA/Form/Business Process Flow` | `Active` (0 / 1 / 2 / 3) |
| `MDA/Form/Quick View Form` | — |
| `MDA/Form/Sub-Grid` | — |
| `MDA/Form/Timeline` | — |
| `MDA/Form/Related Menu` | — |

### Dialogs & Overlays
| Name | Variants |
|------|----------|
| `MDA/Dialog/Quick Create` | — |
| `MDA/Dialog/Confirm` | — |
| `MDA/Dialog/Alert` | — |
| `MDA/Dialog/Custom` | `Size` (Small / Medium / Large / Full) |
| `MDA/Panel/Side Panel` | — |
| `MDA/Panel/Inspector` | — |

### Dashboards
| Name | Variants |
|------|----------|
| `MDA/Dashboard/Layout — 2x2` | — |
| `MDA/Dashboard/Layout — 3x2` | — |
| `MDA/Dashboard/Layout — Focused` | — |
| `MDA/Dashboard/Tile — KPI` | `Trend` (Up / Flat / Down) |
| `MDA/Dashboard/Tile — Chart` | — |
| `MDA/Dashboard/Tile — List` | — |

### Admin
| Name | Variants |
|------|----------|
| `MDA/Admin/Settings Page` | — |
| `MDA/Admin/Security Role Matrix` | — |

## Power Automate (`🔀 Power Automate`)

Every trigger / action / control / data-op card uses the same factory
(`src/libraries/flow/card.ts`) and ships with `State` (Default /
Selected / Error) unless otherwise noted.

### Canvas / Chrome
| Name | Variants |
|------|----------|
| `Flow/Chrome/Designer Canvas` | — |
| `Flow/Chrome/Action Inspector` | `Tab` (Parameters / Settings / Code View) |
| `Flow/Chrome/Left Rail` | — |
| `Flow/Chrome/Run History Row` | `Status` (Succeeded / Failed / Running) |

### Triggers — `State` (Default / Selected / Error)
- `Flow/Trigger/Manual`
- `Flow/Trigger/Scheduled`
- `Flow/Trigger/Dataverse Row Added Modified Deleted`
- `Flow/Trigger/SharePoint Item Created`
- `Flow/Trigger/Outlook Email Arrives`
- `Flow/Trigger/Teams Channel Message`
- `Flow/Trigger/HTTP Request`

### Actions — `State` (Default / Selected / Error)
- `Flow/Action/Dataverse — List rows`, `Get a row by ID`, `Add a new row`, `Update a row`, `Delete a row`
- `Flow/Action/SharePoint — Get items`, `Create item`, `Update item`, `Delete item`
- `Flow/Action/Outlook — Send email V2`, `Send email with options`
- `Flow/Action/Teams — Post message`, `Post adaptive card`
- `Flow/Action/HTTP — HTTP request`
- `Flow/Action/Approvals — Start and wait`
- `Flow/Action/Generic Action Card`

### Data operations — `State` (Default / Selected / Error)
- `Flow/Data/Compose`, `Parse JSON`, `Select`, `Filter array`, `Join`, `Create CSV table`, `Create HTML table`

### Variables — `State` (Default / Selected / Error)
- `Flow/Variable/Initialize variable`, `Set variable`, `Increment variable`, `Append to array variable`, `Append to string variable`

### Controls
| Name | Variants |
|------|----------|
| `Flow/Control/Condition` | — |
| `Flow/Control/Switch` | — |
| `Flow/Control/Apply to each` | — |
| `Flow/Control/Do until` | — |
| `Flow/Control/Scope` | — |
| `Flow/Control/Parallel branch` | — |
| `Flow/Control/Terminate` | `Status` (Succeeded / Failed / Cancelled) |

### Patterns & Annotations
| Name | Variants |
|------|----------|
| `Flow/Pattern/Try-Catch-Finally` | — |
| `Flow/Pattern/Retry policy annotation` | — |
| `Flow/Annotation/Comment` | — |
| `Flow/Annotation/Expression` | — |
| `Flow/Annotation/Dynamic Content Chip` | — |
| `Flow/Annotation/Run After Badge` | `Status` (is successful / has failed / is skipped / has timed out) |
