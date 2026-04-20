// =============================================================================
//  D365 & Power Platform Wireframe Template
//  Figma plugin that builds a reusable mid-fi wireframe kit for Dynamics 365
//  (Sales, Customer Service, Marketing, Field Service, Project Operations)
//  and Power Platform (Power Apps canvas/model-driven, Power Automate).
// =============================================================================

figma.showUI(__html__, { width: 320, height: 560, themeColors: true });

// -----------------------------------------------------------------------------
//  1. Tokens
// -----------------------------------------------------------------------------

const C = {
  g50:  '#FAFAFA', g100: '#F3F4F6', g200: '#E5E7EB', g300: '#D1D5DB',
  g400: '#9CA3AF', g500: '#6B7280', g600: '#4B5563', g700: '#374151',
  g800: '#1F2937', g900: '#111827',
  accent: '#2563EB', accentSoft: '#EFF6FF', accentDark: '#1D4ED8',
  success: '#10B981', successSoft: '#ECFDF5',
  warn: '#F59E0B',   warnSoft: '#FFFBEB',
  danger: '#EF4444', dangerSoft: '#FEF2F2',
  annot: '#D946EF', annotSoft: '#FDF4FF', annotDark: '#86198F',
  white: '#FFFFFF'
};

// App theme accents (kept subtle — still grayscale-dominant).
const APP_THEMES = {
  sales:      { accent: '#2563EB', label: 'Sales',              hint: 'Leads · Opportunities · Accounts' },
  service:    { accent: '#0EA5E9', label: 'Customer Service',   hint: 'Cases · Queues · Knowledge' },
  marketing:  { accent: '#DB2777', label: 'Marketing',          hint: 'Journeys · Segments · Emails' },
  field:      { accent: '#16A34A', label: 'Field Service',      hint: 'Work Orders · Schedule · Assets' },
  project:    { accent: '#7C3AED', label: 'Project Operations', hint: 'Projects · Tasks · Time Entries' },
  powerapps:  { accent: '#7420A7', label: 'Power Apps',         hint: 'Canvas · Model-driven · Dataverse' },
  powerauto:  { accent: '#0066FF', label: 'Power Automate',     hint: 'Flows · Triggers · Actions' }
};

const DEVICE = {
  desktop: { w: 1440, h: 900,  name: 'Desktop',  cols: 12, gutter: 16, margin: 24 },
  tablet:  { w: 1024, h: 768,  name: 'Tablet',   cols: 8,  gutter: 16, margin: 20 },
  mobile:  { w: 390,  h: 844,  name: 'Mobile',   cols: 4,  gutter: 12, margin: 16 }
};

// Plugin data keys used for later toggling.
const K = {
  kind:     'd365ppwf:kind',       // 'annotation' | 'screen' | 'row' | 'component' | 'cover' | 'token'
  role:     'd365ppwf:role',       // 'row' | 'list-row' | 'field' | 'tile' | 'timeline'
  fontable: 'd365ppwf:fontable',   // 'true' on text nodes whose font should be swapped
  weight:   'd365ppwf:weight',     // 'regular' | 'medium' | 'semibold' | 'bold'
  gridHost: 'd365ppwf:gridHost'    // 'true' on frames that carry layout grids
};

// Runtime state resolved per-run (fonts vary per user account).
let F = {
  sans: 'Inter',
  mono: 'Roboto Mono',
  hand: 'Caveat',
  current: 'sans'
};

// -----------------------------------------------------------------------------
//  2. Color helpers
// -----------------------------------------------------------------------------

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
function solid(hex, opacity) {
  const p = { type: 'SOLID', color: hexToRgb(hex) };
  if (opacity != null) p.opacity = opacity;
  return p;
}

// -----------------------------------------------------------------------------
//  3. Font resolution & loading
// -----------------------------------------------------------------------------

async function resolveFonts() {
  const avail = await figma.listAvailableFontsAsync();
  const fams = new Set(avail.map(f => f.fontName.family));
  const pick = (chain) => {
    for (const f of chain) if (fams.has(f)) return f;
    return 'Roboto';
  };
  F.sans = pick(['Inter', 'Roboto', 'Helvetica Neue', 'Arial']);
  F.mono = pick(['Roboto Mono', 'JetBrains Mono', 'Courier New', 'Courier']);
  F.hand = pick(['Caveat', 'Kalam', 'Shadows Into Light', 'Gochi Hand', 'Comic Sans MS', F.sans]);
}

async function loadFamily(family) {
  const avail = await figma.listAvailableFontsAsync();
  const targets = avail.filter(f => f.fontName.family === family);
  for (const t of targets) {
    try { await figma.loadFontAsync(t.fontName); } catch (_) {}
  }
}

// Cache of styles available per family.
const _styleCache = {};
async function stylesFor(family) {
  if (_styleCache[family]) return _styleCache[family];
  const avail = await figma.listAvailableFontsAsync();
  const styles = avail.filter(f => f.fontName.family === family).map(f => f.fontName.style);
  _styleCache[family] = styles;
  return styles;
}

// Map a logical weight to the closest style available for a family.
async function fontFor(weight) {
  const family = F[F.current];
  const styles = await stylesFor(family);
  const want = {
    regular:  ['Regular', 'Book', 'Normal', 'Light'],
    medium:   ['Medium', 'Regular', 'Book'],
    semibold: ['Semi Bold', 'SemiBold', 'DemiBold', 'Medium', 'Bold'],
    bold:     ['Bold', 'Semi Bold', 'SemiBold', 'Medium']
  }[weight || 'regular'];
  let style = 'Regular';
  for (const s of want) { if (styles.indexOf(s) >= 0) { style = s; break; } }
  if (styles.indexOf(style) < 0 && styles.length) style = styles[0];
  const fn = { family, style };
  try { await figma.loadFontAsync(fn); } catch (_) {}
  return fn;
}

// -----------------------------------------------------------------------------
//  4. Node primitives
// -----------------------------------------------------------------------------

function tag(node, kind, extra) {
  if (kind) node.setPluginData(K.kind, kind);
  if (extra) for (const k in extra) node.setPluginData(k, extra[k]);
  return node;
}

function frame(name, w, h, parent) {
  const f = figma.createFrame();
  f.name = name;
  f.resizeWithoutConstraints(Math.max(1, w), Math.max(1, h));
  f.fills = [];
  f.clipsContent = false;
  if (parent) parent.appendChild(f);
  return f;
}

function rect(name, w, h, fillHex, parent, opts) {
  const r = figma.createRectangle();
  r.name = name;
  r.resizeWithoutConstraints(Math.max(1, w), Math.max(1, h));
  r.fills = fillHex ? [solid(fillHex)] : [];
  if (opts && opts.stroke) { r.strokes = [solid(opts.stroke)]; r.strokeWeight = opts.strokeWeight || 1; }
  if (opts && opts.radius != null) r.cornerRadius = opts.radius;
  if (parent) parent.appendChild(r);
  return r;
}

function ellipse(name, w, h, fillHex, parent, opts) {
  const e = figma.createEllipse();
  e.name = name;
  e.resizeWithoutConstraints(w, h);
  e.fills = fillHex ? [solid(fillHex)] : [];
  if (opts && opts.stroke) { e.strokes = [solid(opts.stroke)]; e.strokeWeight = opts.strokeWeight || 1; }
  if (parent) parent.appendChild(e);
  return e;
}

function line(name, x1, y1, x2, y2, hex, parent, weight) {
  const ln = figma.createLine();
  ln.name = name;
  ln.strokes = [solid(hex || C.g300)];
  ln.strokeWeight = weight || 1;
  ln.x = x1; ln.y = y1;
  ln.resize(Math.max(1, Math.hypot(x2 - x1, y2 - y1)), 0);
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  ln.rotation = -angle; // figma rotation is counter-clockwise
  if (parent) parent.appendChild(ln);
  return ln;
}

async function text(str, weight, size, hex, parent) {
  const t = figma.createText();
  t.fontName = await fontFor(weight);
  t.characters = str == null ? '' : String(str);
  t.fontSize = size || 12;
  t.fills = [solid(hex || C.g800)];
  t.setPluginData(K.fontable, 'true');
  t.setPluginData(K.weight, weight || 'regular');
  if (parent) parent.appendChild(t);
  return t;
}

function stack(name, dir, gap, pad, parent) {
  const f = figma.createFrame();
  f.name = name;
  f.fills = [];
  f.layoutMode = dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
  f.itemSpacing = gap || 0;
  const p = pad || 0;
  f.paddingLeft = typeof p === 'object' ? (p.l || 0) : p;
  f.paddingRight = typeof p === 'object' ? (p.r || 0) : p;
  f.paddingTop = typeof p === 'object' ? (p.t || 0) : p;
  f.paddingBottom = typeof p === 'object' ? (p.b || 0) : p;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  if (parent) parent.appendChild(f);
  return f;
}

function place(node, x, y) { node.x = x; node.y = y; return node; }

// -----------------------------------------------------------------------------
//  5. Mini icon shapes (abstract glyphs kept deliberately simple for mid-fi)
// -----------------------------------------------------------------------------

function iconBox(size, parent) {
  // A generic "icon" placeholder: 2-stroke square. Size ~ 16.
  const g = frame('icon', size, size, parent);
  rect('stroke', size, size, null, g, { stroke: C.g600, strokeWeight: 1.25, radius: 2 });
  return g;
}

function iconHamburger(size, hex, parent) {
  const g = frame('icon-menu', size, size, parent);
  const col = hex || C.g700;
  rect('l1', size - 4, 1.5, col, g, { radius: 1 }).x = 2; g.children[g.children.length - 1].y = size * 0.3;
  rect('l2', size - 4, 1.5, col, g, { radius: 1 }).x = 2; g.children[g.children.length - 1].y = size * 0.5;
  rect('l3', size - 4, 1.5, col, g, { radius: 1 }).x = 2; g.children[g.children.length - 1].y = size * 0.7;
  return g;
}

function iconChevron(size, dir, hex, parent) {
  const g = frame('icon-chev', size, size, parent);
  const col = hex || C.g600;
  const s = size * 0.4;
  const cx = size / 2, cy = size / 2;
  const a = line('a', cx - s / 2, cy - s / 4, cx, cy + s / 4, col, g, 1.25);
  const b = line('b', cx, cy + s / 4, cx + s / 2, cy - s / 4, col, g, 1.25);
  if (dir === 'up') { g.rotation = 180; }
  if (dir === 'right') { g.rotation = -90; }
  if (dir === 'left') { g.rotation = 90; }
  return g;
}

function iconSearch(size, hex, parent) {
  const g = frame('icon-search', size, size, parent);
  const col = hex || C.g600;
  const r = ellipse('circ', size * 0.6, size * 0.6, null, g, { stroke: col, strokeWeight: 1.25 });
  r.x = size * 0.08; r.y = size * 0.08;
  const tail = line('tail', size * 0.55, size * 0.55, size * 0.85, size * 0.85, col, g, 1.25);
  return g;
}

async function iconGlyph(letter, size, bg, fg, parent) {
  // Tiny square with a letter — used for app tile icons in the sitemap.
  const g = frame('glyph-' + letter, size, size, parent);
  rect('bg', size, size, bg || C.g700, g, { radius: 4 });
  const t = await text(letter, 'bold', Math.round(size * 0.55), fg || C.white, g);
  t.x = (size - t.width) / 2;
  t.y = (size - t.height) / 2;
  return g;
}

// -----------------------------------------------------------------------------
//  6. Annotation layer
// -----------------------------------------------------------------------------
//  Annotations are tagged with plugin data so they can be toggled on/off.
//  Visual style: dashed magenta underline / callout with handwritten label.

async function annotate(parent, x, y, label, opts) {
  opts = opts || {};
  const grp = frame('annotation', 0, 0, parent);
  grp.layoutMode = 'NONE';
  tag(grp, 'annotation');
  const maxW = opts.width || 180;

  // Small filled dot at anchor.
  const dot = ellipse('anchor', 6, 6, C.annot, grp);
  dot.x = x - 3; dot.y = y - 3;
  tag(dot, 'annotation');

  // Elbow leader line.
  const lx = x + (opts.dx || 16);
  const ly = y + (opts.dy || -28);
  const l1 = line('leader', x, y, lx, ly, C.annot, grp, 1);
  l1.dashPattern = [3, 3];
  tag(l1, 'annotation');

  // Label pill.
  const t = await text(label, 'medium', 11, C.annotDark, grp);
  t.x = lx + 6; t.y = ly - 8;
  t.setPluginData(K.fontable, 'true');
  t.setPluginData(K.weight, 'medium');
  tag(t, 'annotation');

  const bg = rect('bg', t.width + 12, t.height + 6, C.annotSoft, grp, { radius: 3, stroke: C.annot, strokeWeight: 0.75 });
  bg.x = lx; bg.y = ly - 11;
  bg.dashPattern = [2, 2];
  grp.insertChild(grp.children.indexOf(t), bg);
  tag(bg, 'annotation');

  return grp;
}

async function annotationBadge(parent, x, y, n, note) {
  // Numbered badge used for longer legend-style annotations.
  const g = frame('annotation-badge', 0, 0, parent);
  tag(g, 'annotation');
  const c = ellipse('n', 18, 18, C.annot, g);
  c.x = x; c.y = y;
  tag(c, 'annotation');
  const num = await text(String(n), 'bold', 11, C.white, g);
  num.x = x + (18 - num.width) / 2;
  num.y = y + (18 - num.height) / 2;
  tag(num, 'annotation');
  if (note) {
    const t = await text(note, 'regular', 11, C.annotDark, g);
    t.x = x + 24; t.y = y + 2;
    tag(t, 'annotation');
  }
  return g;
}

// -----------------------------------------------------------------------------
//  7. Component primitives (the building blocks users compose with)
// -----------------------------------------------------------------------------

async function button(label, variant, parent) {
  // variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  const h = 32;
  const g = frame('btn-' + variant, 0, h, parent);
  g.layoutMode = 'HORIZONTAL';
  g.primaryAxisSizingMode = 'AUTO';
  g.counterAxisSizingMode = 'FIXED';
  g.itemSpacing = 6;
  g.paddingLeft = 12; g.paddingRight = 12;
  g.paddingTop = 8;   g.paddingBottom = 8;
  g.cornerRadius = 4;
  g.counterAxisAlignItems = 'CENTER';
  tag(g, 'component', { 'd365ppwf:role': 'button' });

  const styles = {
    primary:   { bg: C.accent, fg: C.white, stroke: null },
    secondary: { bg: C.white,  fg: C.g800,  stroke: C.g300 },
    ghost:     { bg: null,     fg: C.g700,  stroke: null },
    danger:    { bg: C.danger, fg: C.white, stroke: null }
  }[variant || 'secondary'];

  g.fills = styles.bg ? [solid(styles.bg)] : [];
  if (styles.stroke) { g.strokes = [solid(styles.stroke)]; g.strokeWeight = 1; }
  const t = await text(label, 'medium', 12, styles.fg, g);
  return g;
}

async function textInput(labelText, value, parent, opts) {
  opts = opts || {};
  const w = opts.width || 260;
  const g = frame('input', w, 0, parent);
  g.layoutMode = 'VERTICAL';
  g.primaryAxisSizingMode = 'AUTO';
  g.counterAxisSizingMode = 'FIXED';
  g.itemSpacing = 4;
  tag(g, 'component', { 'd365ppwf:role': 'field' });

  if (labelText) {
    const l = await text(labelText, 'medium', 11, C.g600, g);
  }
  const box = frame('box', w, 32, g);
  rect('bg', w, 32, C.white, box, { radius: 3, stroke: opts.focus ? C.accent : C.g300, strokeWeight: opts.focus ? 1.5 : 1 });
  if (value) {
    const v = await text(value, 'regular', 12, C.g800, box);
    v.x = 10; v.y = 8;
  } else if (opts.placeholder) {
    const v = await text(opts.placeholder, 'regular', 12, C.g400, box);
    v.x = 10; v.y = 8;
  }
  if (opts.required) {
    // Required asterisk in label already rendered? Append.
  }
  return g;
}

async function dropdown(labelText, value, parent, opts) {
  opts = opts || {};
  const w = opts.width || 260;
  const g = frame('dropdown', w, 0, parent);
  g.layoutMode = 'VERTICAL';
  g.primaryAxisSizingMode = 'AUTO';
  g.counterAxisSizingMode = 'FIXED';
  g.itemSpacing = 4;
  tag(g, 'component', { 'd365ppwf:role': 'field' });
  if (labelText) await text(labelText, 'medium', 11, C.g600, g);
  const box = frame('box', w, 32, g);
  rect('bg', w, 32, C.white, box, { radius: 3, stroke: C.g300, strokeWeight: 1 });
  const v = await text(value || 'Select…', 'regular', 12, value ? C.g800 : C.g400, box);
  v.x = 10; v.y = 8;
  const chev = iconChevron(14, 'down', C.g500, box);
  chev.x = w - 22; chev.y = 9;
  return g;
}

async function pill(label, variant, parent) {
  const styles = {
    neutral: { bg: C.g100, fg: C.g700 },
    accent:  { bg: C.accentSoft, fg: C.accentDark },
    success: { bg: C.successSoft, fg: '#047857' },
    warn:    { bg: C.warnSoft, fg: '#B45309' },
    danger:  { bg: C.dangerSoft, fg: '#B91C1C' }
  }[variant || 'neutral'];
  const g = frame('pill-' + variant, 0, 20, parent);
  g.layoutMode = 'HORIZONTAL';
  g.primaryAxisSizingMode = 'AUTO';
  g.counterAxisSizingMode = 'FIXED';
  g.paddingLeft = 8; g.paddingRight = 8;
  g.paddingTop = 2; g.paddingBottom = 2;
  g.cornerRadius = 10;
  g.fills = [solid(styles.bg)];
  g.counterAxisAlignItems = 'CENTER';
  const t = await text(label, 'medium', 10, styles.fg, g);
  return g;
}

async function avatar(initials, parent, size, hex) {
  const s = size || 28;
  const g = frame('avatar', s, s, parent);
  ellipse('bg', s, s, hex || C.g400, g);
  const t = await text(initials || 'AB', 'semibold', Math.round(s * 0.4), C.white, g);
  t.x = (s - t.width) / 2;
  t.y = (s - t.height) / 2;
  return g;
}

async function tabs(labels, activeIdx, parent) {
  const h = 36;
  const g = frame('tabs', 0, h, parent);
  g.layoutMode = 'HORIZONTAL';
  g.primaryAxisSizingMode = 'AUTO';
  g.counterAxisSizingMode = 'FIXED';
  g.itemSpacing = 0;
  tag(g, 'component');
  for (let i = 0; i < labels.length; i++) {
    const active = i === activeIdx;
    const tab = frame('tab', 0, h, g);
    tab.layoutMode = 'HORIZONTAL';
    tab.primaryAxisSizingMode = 'AUTO';
    tab.counterAxisSizingMode = 'FIXED';
    tab.paddingLeft = 14; tab.paddingRight = 14;
    tab.paddingTop = 9;   tab.paddingBottom = 9;
    tab.counterAxisAlignItems = 'CENTER';
    tab.fills = [];
    const t = await text(labels[i], active ? 'semibold' : 'medium', 12, active ? C.accent : C.g600, tab);
    if (active) {
      // Underline
      const under = rect('u', 0, 2, C.accent, tab);
      under.layoutPositioning = 'ABSOLUTE';
      under.x = 0; under.y = h - 2;
      under.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
    }
  }
  return g;
}

async function card(title, subtitle, parent, w, h) {
  const g = frame('card', w || 240, h || 120, parent);
  rect('bg', w || 240, h || 120, C.white, g, { radius: 6, stroke: C.g200, strokeWeight: 1 });
  const pad = 14;
  if (title) {
    const t = await text(title, 'semibold', 13, C.g800, g);
    t.x = pad; t.y = pad;
  }
  if (subtitle) {
    const s = await text(subtitle, 'regular', 11, C.g500, g);
    s.x = pad; s.y = pad + 20;
  }
  return g;
}

async function kpiTile(label, value, delta, parent) {
  const w = 220, h = 96;
  const g = frame('kpi', w, h, parent);
  rect('bg', w, h, C.white, g, { radius: 6, stroke: C.g200, strokeWeight: 1 });
  const lab = await text(label, 'medium', 11, C.g500, g);
  lab.x = 14; lab.y = 12;
  const val = await text(value, 'bold', 24, C.g900, g);
  val.x = 14; val.y = 32;
  if (delta) {
    const hex = delta.startsWith('+') ? C.success : delta.startsWith('-') ? C.danger : C.g500;
    const d = await text(delta, 'medium', 11, hex, g);
    d.x = 14; d.y = 68;
  }
  return g;
}

function barChart(w, h, bars, parent, hex) {
  const g = frame('chart-bars', w, h, parent);
  rect('bg', w, h, C.white, g, { radius: 4, stroke: C.g200 });
  const pad = 16;
  const baseY = h - pad;
  const slot = (w - pad * 2) / bars.length;
  for (let i = 0; i < bars.length; i++) {
    const bh = Math.max(4, (h - pad * 2) * bars[i]);
    const b = rect('bar', slot * 0.55, bh, hex || C.accent, g, { radius: 2 });
    b.x = pad + i * slot + (slot * 0.22);
    b.y = baseY - bh;
  }
  // baseline
  const base = rect('baseline', w - pad * 2, 1, C.g200, g);
  base.x = pad; base.y = baseY;
  return g;
}

function lineChart(w, h, points, parent, hex) {
  const g = frame('chart-line', w, h, parent);
  rect('bg', w, h, C.white, g, { radius: 4, stroke: C.g200 });
  const pad = 16;
  const innerW = w - pad * 2, innerH = h - pad * 2;
  const step = innerW / (points.length - 1);
  for (let i = 1; i < points.length; i++) {
    const x1 = pad + (i - 1) * step;
    const y1 = pad + innerH - points[i - 1] * innerH;
    const x2 = pad + i * step;
    const y2 = pad + innerH - points[i] * innerH;
    line('seg', x1, y1, x2, y2, hex || C.accent, g, 1.5);
  }
  for (let i = 0; i < points.length; i++) {
    const x = pad + i * step;
    const y = pad + innerH - points[i] * innerH;
    const d = ellipse('p', 4, 4, hex || C.accent, g);
    d.x = x - 2; d.y = y - 2;
  }
  return g;
}

function donutChart(size, parts, parent) {
  // parts = [{value, hex}]
  const g = frame('chart-donut', size, size, parent);
  rect('bg', size, size, C.white, g, { radius: 4, stroke: C.g200 });
  const outer = ellipse('outer', size - 32, size - 32, C.g200, g);
  outer.x = 16; outer.y = 16;
  // Approximate slices with rotated rings — mid-fi, not math-perfect.
  let acc = 0;
  const total = parts.reduce((s, p) => s + p.value, 0);
  const segW = size - 32;
  for (let i = 0; i < parts.length; i++) {
    const pct = parts[i].value / total;
    const arc = ellipse('slice', segW, segW, parts[i].hex, g);
    arc.x = 16; arc.y = 16;
    arc.arcData = { startingAngle: acc * Math.PI * 2, endingAngle: (acc + pct) * Math.PI * 2, innerRadius: 0.6 };
    acc += pct;
  }
  const hole = ellipse('hole', size - 72, size - 72, C.white, g);
  hole.x = 36; hole.y = 36;
  return g;
}

// -----------------------------------------------------------------------------
//  8. Row primitives (list / timeline / kanban items)
// -----------------------------------------------------------------------------

async function listHeaderRow(cols, w, parent) {
  const h = 36;
  const g = frame('list-head', w, h, parent);
  rect('bg', w, h, C.g50, g, { stroke: C.g200, strokeWeight: 1 });
  let x = 14;
  for (const c of cols) {
    const t = await text(c.label, 'semibold', 11, C.g600, g);
    t.x = x; t.y = 12;
    const chev = iconChevron(10, 'down', C.g400, g);
    chev.x = x + t.width + 4; chev.y = 13;
    x += c.width;
  }
  return g;
}

async function listRow(cols, values, w, parent, opts) {
  opts = opts || {};
  const h = opts.compact ? 32 : 40;
  const g = frame('list-row', w, h, parent);
  tag(g, 'row', { 'd365ppwf:role': 'list-row' });
  rect('bg', w, h, opts.alt ? C.g50 : C.white, g);
  // Underline
  const ln = rect('sep', w, 1, C.g100, g);
  ln.x = 0; ln.y = h - 1;
  // Checkbox
  const cb = rect('cb', 14, 14, C.white, g, { radius: 2, stroke: C.g300 });
  cb.x = 14; cb.y = (h - 14) / 2;

  let x = 36;
  for (let i = 0; i < cols.length; i++) {
    const v = values[i];
    if (v == null) { x += cols[i].width; continue; }
    if (typeof v === 'object' && v.pill) {
      const p = await pill(v.label, v.tone || 'neutral', g);
      p.x = x; p.y = (h - 20) / 2;
    } else {
      const t = await text(String(v), i === 0 ? 'medium' : 'regular', 12, i === 0 ? C.accent : C.g700, g);
      t.x = x; t.y = (h - t.height) / 2;
    }
    x += cols[i].width;
  }
  return g;
}

async function timelineItem(when, who, kind, body, parent, w) {
  const g = frame('timeline-item', w, 0, parent);
  g.layoutMode = 'HORIZONTAL';
  g.primaryAxisSizingMode = 'FIXED';
  g.counterAxisSizingMode = 'AUTO';
  g.itemSpacing = 12;
  g.paddingTop = 10; g.paddingBottom = 10;
  g.paddingLeft = 14; g.paddingRight = 14;
  tag(g, 'row', { 'd365ppwf:role': 'timeline' });

  const av = await avatar(who.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase(), g, 28, C.g500);
  const content = stack('content', 'v', 4, 0, g);
  content.primaryAxisSizingMode = 'AUTO';
  content.counterAxisSizingMode = 'FIXED';
  content.resize(w - 68, 10);

  const head = stack('head', 'h', 8, 0, content);
  const name = await text(who, 'semibold', 12, C.g800, head);
  const k = await pill(kind, 'neutral', head);
  const t = await text(when, 'regular', 11, C.g500, head);

  const bodyT = await text(body, 'regular', 12, C.g700, content);
  bodyT.textAutoResize = 'HEIGHT';
  bodyT.resize(w - 68, bodyT.height);
  return g;
}

async function kanbanCard(title, meta, tone, parent, w) {
  const g = frame('kanban-card', w, 0, parent);
  g.layoutMode = 'VERTICAL';
  g.primaryAxisSizingMode = 'AUTO';
  g.counterAxisSizingMode = 'FIXED';
  g.paddingLeft = 12; g.paddingRight = 12;
  g.paddingTop = 10; g.paddingBottom = 12;
  g.itemSpacing = 6;
  g.fills = [solid(C.white)];
  g.strokes = [solid(C.g200)];
  g.strokeWeight = 1;
  g.cornerRadius = 4;
  tag(g, 'row', { 'd365ppwf:role': 'kanban' });

  const topBar = rect('tone', w, 3, tone || C.accent, g);
  topBar.layoutPositioning = 'ABSOLUTE';
  topBar.x = 0; topBar.y = 0;

  const h = await text(title, 'semibold', 12, C.g900, g);
  const m = await text(meta, 'regular', 11, C.g500, g);
  const row = stack('row', 'h', 6, 0, g);
  const p = await pill('High', 'warn', row);
  const av = await avatar('JD', row, 20, C.g500);
  return g;
}

// -----------------------------------------------------------------------------
//  9. Shell regions (top bar, sitemap, command bar, status bar)
// -----------------------------------------------------------------------------

async function topbar(w, parent, app) {
  const h = 48;
  const g = frame('topbar', w, h, parent);
  rect('bg', w, h, C.g900, g);
  const waffle = frame('waffle', 16, 16, g);
  place(waffle, 16, 16);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const d = rect('dot', 3, 3, C.white, waffle);
    d.x = c * 6; d.y = r * 6;
  }
  const product = await text('Dynamics 365', 'semibold', 13, C.white, g);
  product.x = 44; product.y = (h - product.height) / 2;
  const sep = rect('sep', 1, 20, C.g600, g);
  sep.x = 140; sep.y = (h - 20) / 2;
  const appName = await text(app || 'Sales Hub', 'regular', 13, C.white, g);
  appName.x = 152; appName.y = (h - appName.height) / 2;
  appName.opacity = 0.8;

  // Search
  const sW = 360;
  const search = frame('search', sW, 32, g);
  rect('bg', sW, 32, '#1F2A3F', search, { radius: 4 });
  const si = iconSearch(14, C.g400, search);
  si.x = 10; si.y = 9;
  const sp = await text('Search', 'regular', 12, C.g400, search);
  sp.x = 32; sp.y = 9;
  search.x = (w - sW) / 2; search.y = 8;

  // Right icons + avatar
  const ring = frame('icons', 0, 32, g);
  ring.layoutMode = 'HORIZONTAL';
  ring.primaryAxisSizingMode = 'AUTO';
  ring.counterAxisSizingMode = 'FIXED';
  ring.itemSpacing = 14;
  ring.counterAxisAlignItems = 'CENTER';
  for (let i = 0; i < 3; i++) iconBox(18, ring).children[0].strokes = [solid(C.g300)];
  const av = await avatar('AB', ring, 28, C.accent);
  ring.x = w - 160; ring.y = 10;
  return g;
}

async function sitemap(w, h, app, items, active, parent) {
  const g = frame('sitemap', w, h, parent);
  rect('bg', w, h, C.g50, g, { stroke: C.g200 });
  // Area switcher
  const areaH = 44;
  const area = frame('area', w, areaH, g);
  rect('areabg', w, areaH, C.white, area);
  const areaT = await text(app, 'semibold', 13, C.g800, area);
  areaT.x = 16; areaT.y = 14;
  const chev = iconChevron(12, 'down', C.g500, area);
  chev.x = w - 24; chev.y = 16;
  const areaLine = rect('al', w, 1, C.g200, area);
  areaLine.y = areaH - 1;

  // Group label
  const grp = await text('Workspace', 'medium', 10, C.g500, g);
  grp.x = 16; grp.y = areaH + 12;

  // Items
  let y = areaH + 32;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isActive = i === active;
    const row = frame('nav-item', w, 36, g);
    if (isActive) rect('hl', w - 8, 32, C.accentSoft, row, { radius: 4 }).x = 4;
    const ic = iconBox(16, row);
    ic.x = 18; ic.y = 10;
    const label = await text(item, isActive ? 'semibold' : 'regular', 12, isActive ? C.accentDark : C.g700, row);
    label.x = 44; label.y = 11;
    row.y = y;
    y += 36;
  }

  // Recent / pinned group
  const grp2 = await text('Recent', 'medium', 10, C.g500, g);
  grp2.x = 16; grp2.y = y + 12;
  return g;
}

async function commandBar(w, actions, parent) {
  const h = 40;
  const g = frame('command-bar', w, h, parent);
  rect('bg', w, h, C.white, g, { stroke: C.g200 });
  const row = stack('actions', 'h', 4, { l: 12, r: 12, t: 4, b: 4 }, g);
  row.counterAxisAlignItems = 'CENTER';
  row.counterAxisSizingMode = 'FIXED';
  row.resize(w - 24, h - 8);
  row.layoutPositioning = 'ABSOLUTE';
  row.x = 12; row.y = 4;

  for (const a of actions) {
    const ab = frame('act', 0, 28, row);
    ab.layoutMode = 'HORIZONTAL';
    ab.primaryAxisSizingMode = 'AUTO';
    ab.counterAxisSizingMode = 'FIXED';
    ab.paddingLeft = 10; ab.paddingRight = 10;
    ab.itemSpacing = 6;
    ab.counterAxisAlignItems = 'CENTER';
    iconBox(14, ab);
    const t = await text(a, 'medium', 12, C.g700, ab);
  }

  // Overflow
  const over = frame('overflow', 20, 28, g);
  over.x = w - 32; over.y = 6;
  for (let i = 0; i < 3; i++) {
    const d = ellipse('d', 3, 3, C.g500, over);
    d.x = 3 + i * 6; d.y = 12;
  }
  return g;
}

async function statusBar(w, parent, msg) {
  const h = 28;
  const g = frame('status', w, h, parent);
  rect('bg', w, h, C.g50, g, { stroke: C.g200 });
  const t = await text(msg || 'Saved · Last modified 2m ago by Avery Brooks', 'regular', 11, C.g500, g);
  t.x = 14; t.y = 8;
  return g;
}

// -----------------------------------------------------------------------------
//  10. Desktop screen builders — each returns a framed "screen" artboard.
// -----------------------------------------------------------------------------
//  Each screen: 1440 × 900 (DEVICE.desktop). The shell (topbar + sitemap) is
//  shared; the main pane varies. Every screen is tagged so toggles work.

function newScreen(name, device) {
  const d = DEVICE[device];
  const s = frame(name, d.w, d.h);
  s.fills = [solid(C.g100)];
  s.clipsContent = true;
  tag(s, 'screen', {});
  s.setPluginData(K.gridHost, 'true');
  s.layoutGrids = [
    {
      pattern: 'COLUMNS',
      alignment: 'STRETCH',
      gutterSize: d.gutter,
      offset: d.margin,
      count: d.cols,
      color: Object.assign({}, hexToRgb(C.accent), { a: 0.1 }),
      visible: true
    }
  ];
  return s;
}

const SITEMAP_WIDTH = 220;

async function mountShell(screen, app, items, active) {
  const d = { w: screen.width, h: screen.height };
  await topbar(d.w, screen, app.replace(' Hub', '') + ' Hub');
  const sm = await sitemap(SITEMAP_WIDTH, d.h - 48, app, items, active, screen);
  sm.y = 48;
  return { contentX: SITEMAP_WIDTH, contentY: 48, contentW: d.w - SITEMAP_WIDTH, contentH: d.h - 48 };
}

// --- Screen 1: Sitemap / App navigation shell (emphasizing the nav) ---------
async function screenSitemap() {
  const s = newScreen('01 · Sitemap / Nav Shell', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Activities', 'Accounts', 'Contacts', 'Leads', 'Opportunities', 'Quotes', 'Orders', 'Invoices'], 0);
  // Pane: highlight the sitemap by dimming the content.
  const hero = rect('empty', shell.contentW - 48, shell.contentH - 48, C.white, s, { radius: 6, stroke: C.g200 });
  hero.x = shell.contentX + 24; hero.y = shell.contentY + 24;
  const title = await text('Start from the sitemap →', 'semibold', 20, C.g500, s);
  title.x = shell.contentX + 48; title.y = shell.contentY + 64;
  const hint = await text('Left nav switches apps (Sales, Service, Marketing, Field Service, Project Ops) and navigates between entity areas.', 'regular', 12, C.g500, s);
  hint.x = shell.contentX + 48; hint.y = shell.contentY + 100;
  hint.textAutoResize = 'HEIGHT';
  hint.resize(520, hint.height);

  await annotate(s, 110, 72, 'App switcher — product + area', { dx: 20, dy: -40, width: 200 });
  await annotate(s, SITEMAP_WIDTH / 2, 120, 'Sitemap — entity groups & items', { dx: 40, dy: -60 });
  await annotate(s, 720, 40, 'Global top bar: search, help, settings, profile', { dx: -120, dy: -28 });
  return s;
}

// --- Screen 2: List / grid view --------------------------------------------
async function screenList() {
  const s = newScreen('02 · List / Grid View', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Accounts', 'Contacts', 'Leads', 'Opportunities', 'Quotes'], 3);

  const pad = 24;
  const innerW = shell.contentW - pad * 2;
  const innerX = shell.contentX + pad;
  let y = shell.contentY + pad;

  // Page title
  const title = await text('Leads', 'semibold', 20, C.g900, s);
  place(title, innerX, y); y += 32;

  // View selector
  const vs = stack('view', 'h', 8, 0, s);
  vs.x = innerX; vs.y = y;
  const vsel = await text('My Open Leads', 'semibold', 13, C.g800, vs);
  iconChevron(12, 'down', C.g500, vs);
  const filter = await text('· Filter by', 'regular', 12, C.g500, vs);
  y += 28;

  // Command bar
  const cb = await commandBar(innerW, ['+ New', 'Edit', 'Qualify', 'Disqualify', 'Assign', 'Share', 'Delete', 'Export to Excel', 'Flow'], s);
  cb.x = innerX; cb.y = y; y += 44;

  // Filters row
  const fr = frame('filters', innerW, 40, s);
  fr.x = innerX; fr.y = y;
  rect('bg', innerW, 40, C.white, fr, { stroke: C.g200 });
  const chips = ['All', 'Hot', 'Warm', 'Cold'];
  let cx = 12;
  for (let i = 0; i < chips.length; i++) {
    const p = await pill(chips[i], i === 1 ? 'accent' : 'neutral', fr);
    p.x = cx; p.y = 10;
    cx += p.width + 6;
  }
  const search = frame('search', 240, 28, fr);
  rect('bg', 240, 28, C.white, search, { stroke: C.g300, radius: 3 });
  const si = iconSearch(12, C.g500, search); si.x = 8; si.y = 8;
  const sp = await text('Search this view', 'regular', 11, C.g400, search); sp.x = 26; sp.y = 7;
  search.x = innerW - 252; search.y = 6;
  y += 48;

  // Grid
  const cols = [
    { label: 'Name',        width: 220 },
    { label: 'Topic',       width: 260 },
    { label: 'Company',     width: 180 },
    { label: 'Status',      width: 110 },
    { label: 'Est. Close',  width: 120 },
    { label: 'Owner',       width: 160 }
  ];
  await listHeaderRow(cols, innerW, s).then(r => { r.x = innerX; r.y = y; });
  y += 36;

  const rows = [
    ['Alicia Contoso',  'Needs cloud migration plan', 'Contoso Ltd',   { pill: true, label: 'New',         tone: 'neutral' }, 'Q2 2026', 'Avery Brooks'],
    ['Bruno Fabrikam',  'Upgrade CRM licenses',       'Fabrikam Inc',  { pill: true, label: 'Working',     tone: 'accent'  }, 'Q3 2026', 'Morgan Yu'],
    ['Ciara Litware',   'New regional rollout',       'Litware',       { pill: true, label: 'Qualified',   tone: 'success' }, 'Q2 2026', 'Jess Rivera'],
    ['Davit Proseware', 'Sales ops training',         'Proseware',     { pill: true, label: 'Stalled',     tone: 'warn'    }, 'Q4 2026', 'Avery Brooks'],
    ['Elena Adventure', 'Marketplace integration',    'Adventure Wks', { pill: true, label: 'Disqualified',tone: 'danger'  }, '—',       'Sam Ngo'],
    ['Farid Tailwind',  'MS Teams adoption',          'Tailwind',      { pill: true, label: 'New',         tone: 'neutral' }, 'Q3 2026', 'Morgan Yu'],
    ['Gita Northwind',  'Data migration from legacy', 'Northwind',     { pill: true, label: 'Working',     tone: 'accent'  }, 'Q2 2026', 'Jess Rivera']
  ];
  for (let i = 0; i < rows.length; i++) {
    await listRow(cols, rows[i], innerW, s, { alt: i % 2 === 1 }).then(r => { r.x = innerX; r.y = y; y += 40; });
  }

  // Footer
  const foot = await text('1–7 of 312', 'regular', 11, C.g500, s);
  foot.x = innerX; foot.y = y + 8;

  await annotate(s, innerX + 120, shell.contentY + pad + 80, 'View selector — saved queries', { dx: 20, dy: -32 });
  await annotate(s, innerX + 320, shell.contentY + pad + 120, 'Command bar — entity actions', { dx: 0, dy: -32 });
  await annotate(s, innerX + 180, shell.contentY + pad + 232, 'Sortable column header', { dx: 0, dy: -32 });
  await annotate(s, innerX + 760, shell.contentY + pad + 270, 'Status pill — reuse the tone set', { dx: 20, dy: -40 });
  return s;
}

// --- Screen 3: Record form --------------------------------------------------
async function screenRecordForm() {
  const s = newScreen('03 · Record Form', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Accounts', 'Contacts', 'Leads', 'Opportunities'], 4);

  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  let y = shell.contentY + pad;

  // Breadcrumb + title
  const bc = await text('Opportunities  ›  Cloud migration — Contoso Ltd', 'regular', 11, C.g500, s);
  bc.x = innerX; bc.y = y; y += 18;
  const title = await text('Cloud migration — Contoso Ltd', 'semibold', 22, C.g900, s);
  title.x = innerX; title.y = y;
  const summary = await text('Open · $ 250,000 · Est. close Q2 2026', 'regular', 12, C.g500, s);
  summary.x = innerX; summary.y = y + 30;
  y += 56;

  // Command bar
  const cb = await commandBar(innerW, ['Save', 'Save & Close', '+ New', 'Deactivate', 'Close as Won', 'Close as Lost', 'Assign', 'Share'], s);
  cb.x = innerX; cb.y = y; y += 44;

  // Business process flow bar
  const bpf = await bpfBar(innerW, s);
  bpf.x = innerX; bpf.y = y; y += 60;

  // Tabs
  const t = await tabs(['Summary', 'Product & Pricing', 'Stakeholders', 'Activities', 'Related'], 0, s);
  t.x = innerX; t.y = y; y += 40;

  // Form — two columns
  const colW = (innerW - 20) / 2;
  const leftX = innerX;
  const rightX = innerX + colW + 20;
  let ly = y, ry = y;

  // Left section: General
  const lh = await text('GENERAL', 'semibold', 10, C.g500, s);
  lh.x = leftX; lh.y = ly; ly += 18;
  const lCard = rect('lbg', colW, 300, C.white, s, { radius: 6, stroke: C.g200 });
  lCard.x = leftX; lCard.y = ly;
  const lFields = stack('lfields', 'v', 12, 16, s);
  lFields.x = leftX; lFields.y = ly;
  lFields.counterAxisSizingMode = 'FIXED';
  lFields.resize(colW, 300);
  await textInput('Topic *', 'Cloud migration — Contoso Ltd', lFields, { width: colW - 32 });
  await textInput('Account', 'Contoso Ltd', lFields, { width: colW - 32 });
  await dropdown('Currency', 'USD — US Dollar', lFields, { width: colW - 32 });
  await textInput('Estimated revenue', '$250,000', lFields, { width: colW - 32, focus: true });
  await dropdown('Purchase process', 'Committee', lFields, { width: colW - 32 });
  ly += 320;

  // Right section: Timeline
  const rh = await text('TIMELINE', 'semibold', 10, C.g500, s);
  rh.x = rightX; rh.y = ry; ry += 18;
  const rCard = rect('rbg', colW, 300, C.white, s, { radius: 6, stroke: C.g200 });
  rCard.x = rightX; rCard.y = ry;
  const rWrap = frame('rwrap', colW, 300, s);
  rWrap.x = rightX; rWrap.y = ry;
  let ty = 12;
  const tItems = [
    ['2h ago',  'Avery Brooks', 'Email',    'Sent proposal draft to Alicia for review.'],
    ['Today',   'Morgan Yu',    'Phone',    'Discovery call — moved DB to Q2. Follow up next week.'],
    ['Yesterday','Jess Rivera', 'Note',     'Stakeholder map updated; added CTO as approver.'],
    ['Mon',     'Avery Brooks', 'Task',     'Prep SoW with architecture team — due Fri.']
  ];
  for (const ti of tItems) {
    const it = await timelineItem(ti[0], ti[1], ti[2], ti[3], rWrap, colW);
    it.x = 0; it.y = ty;
    ty += it.height + 4;
  }

  await statusBar(DEVICE.desktop.w, s, 'Saved · 2m ago · Owner: Avery Brooks').then(b => { b.x = 0; b.y = DEVICE.desktop.h - 28; });
  await annotate(s, innerX + 180, shell.contentY + pad + 96, 'Header: primary identifier + key facts', { dx: 20, dy: -40 });
  await annotate(s, innerX + innerW / 2, shell.contentY + pad + 140, 'Business Process Flow — stage-based guided path', { dx: 0, dy: -50, width: 260 });
  await annotate(s, innerX + 60, shell.contentY + pad + 200, 'Tabs split the form into focused sections', { dx: 0, dy: -40 });
  await annotate(s, rightX + colW / 2, ly + 20, 'Timeline — activities tied to the record', { dx: 20, dy: -40 });
  return s;
}

// --- helper: Business Process Flow bar ---
async function bpfBar(w, parent) {
  const h = 48;
  const g = frame('bpf', w, h, parent);
  rect('bg', w, h, C.white, g, { radius: 6, stroke: C.g200 });
  const stages = ['Qualify', 'Develop', 'Propose', 'Close'];
  const stageW = w / stages.length;
  for (let i = 0; i < stages.length; i++) {
    const isDone = i < 2;
    const isActive = i === 2;
    const chev = frame('stage', stageW, h, g);
    chev.x = i * stageW;
    rect('sbg', stageW - 2, h - 8, isActive ? C.accentSoft : (isDone ? C.g100 : C.white), chev, { radius: 4, stroke: isActive ? C.accent : C.g200 }).y = 4;
    const dot = ellipse('dot', 14, 14, isDone ? C.success : (isActive ? C.accent : C.g300), chev);
    dot.x = 12; dot.y = (h - 14) / 2;
    const label = await text(stages[i], isActive ? 'semibold' : 'medium', 12, isActive ? C.accentDark : C.g700, chev);
    label.x = 32; label.y = (h - label.height) / 2;
    const step = await text('Stage ' + (i + 1), 'regular', 10, C.g500, chev);
    step.x = 32; step.y = (h - label.height) / 2 + 14;
  }
  return g;
}

// --- Screen 4: Dashboard ---------------------------------------------------
async function screenDashboard() {
  const s = newScreen('04 · Dashboard', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Accounts', 'Opportunities'], 0);

  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  let y = shell.contentY + pad;

  const title = await text('Sales Activity Dashboard', 'semibold', 20, C.g900, s);
  title.x = innerX; title.y = y;
  const sub = await text('All Activities · Last 30 days', 'regular', 12, C.g500, s);
  sub.x = innerX; sub.y = y + 28;
  y += 56;

  // KPI tiles row
  const kpiGap = 16;
  const kpiW = (innerW - kpiGap * 3) / 4;
  const kpis = [
    ['Open Revenue', '$ 1.2M', '+8.4%'],
    ['Pipeline',     '142',    '+12'],
    ['Won (MTD)',    '$ 328K', '+14.1%'],
    ['Avg Deal',     '$ 18.5K', '-2.1%']
  ];
  for (let i = 0; i < kpis.length; i++) {
    const k = await kpiTile(kpis[i][0], kpis[i][1], kpis[i][2], s);
    k.resize(kpiW, 96);
    k.x = innerX + i * (kpiW + kpiGap);
    k.y = y;
  }
  y += 112;

  // Charts row
  const bc = barChart(innerW * 0.58, 260, [0.3, 0.5, 0.4, 0.7, 0.9, 0.8, 0.6, 0.75, 0.55, 0.82, 0.7, 0.95], s, C.accent);
  bc.x = innerX; bc.y = y;
  const bcT = await text('Pipeline by month', 'semibold', 12, C.g800, s);
  bcT.x = innerX + 16; bcT.y = y + 14;

  const don = donutChart(260, [
    { value: 45, hex: C.accent },
    { value: 25, hex: C.success },
    { value: 20, hex: C.warn },
    { value: 10, hex: C.danger }
  ], s);
  don.x = innerX + innerW * 0.58 + 16; don.y = y;
  const dT = await text('Deals by stage', 'semibold', 12, C.g800, s);
  dT.x = don.x + 16; dT.y = y + 14;

  y += 280;

  // Recent activities tile (list)
  const raW = innerW;
  const raH = 220;
  const ra = rect('rabg', raW, raH, C.white, s, { radius: 6, stroke: C.g200 });
  ra.x = innerX; ra.y = y;
  const raT = await text('Recent activities', 'semibold', 12, C.g800, s);
  raT.x = innerX + 16; raT.y = y + 14;
  const miniCols = [
    { label: 'When',     width: 90 },
    { label: 'Type',     width: 100 },
    { label: 'Subject',  width: 360 },
    { label: 'Related',  width: 200 },
    { label: 'Owner',    width: 160 }
  ];
  const hdr = await listHeaderRow(miniCols, raW - 32, s);
  hdr.x = innerX + 16; hdr.y = y + 40;
  const rData = [
    ['Today 14:02',  'Email', 'Proposal draft v2',         'Cloud migration', 'Avery Brooks'],
    ['Today 11:30',  'Call',  'Discovery follow-up',       'Fabrikam renew',  'Morgan Yu'],
    ['Yest 16:45',   'Task',  'Prep SoW with architecture','Litware rollout', 'Jess Rivera'],
    ['Yest 09:10',   'Note',  'Stakeholder map update',    'Tailwind Teams',  'Sam Ngo']
  ];
  for (let i = 0; i < rData.length; i++) {
    const r = await listRow(miniCols, rData[i], raW - 32, s, { alt: i % 2 === 1, compact: true });
    r.x = innerX + 16; r.y = y + 76 + i * 32;
  }

  await annotate(s, innerX + 120, shell.contentY + pad + 60, 'Dashboard title + filter context', { dx: 20, dy: -32 });
  await annotate(s, innerX + 120, y - 180, 'KPI tile — label · value · delta', { dx: 0, dy: -32 });
  await annotate(s, innerX + 400, y - 100, 'Chart tile — recolor via accent token', { dx: 0, dy: -40 });
  return s;
}

// --- Screen 5: Business Process Flow bar (standalone) ----------------------
async function screenBPF() {
  const s = newScreen('05 · Business Process Flow', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Opportunities'], 1);

  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  let y = shell.contentY + pad;

  const title = await text('Business Process Flow', 'semibold', 20, C.g900, s);
  title.x = innerX; title.y = y; y += 40;

  // Collapsed bar
  const bar1 = await bpfBar(innerW, s);
  bar1.x = innerX; bar1.y = y; y += 72;

  // Expanded stage: show open stage with fields
  const exp = rect('expbg', innerW, 260, C.white, s, { radius: 6, stroke: C.g200 });
  exp.x = innerX; exp.y = y;
  const eh = await text('Propose — Stage 3 of 4', 'semibold', 13, C.g900, s);
  eh.x = innerX + 20; eh.y = y + 16;
  const es = await text('Complete the steps below to advance.', 'regular', 12, C.g500, s);
  es.x = innerX + 20; es.y = y + 38;

  const stepsY = y + 72;
  const steps = [
    { l: 'Identify Customer', v: 'Contoso Ltd',          d: true },
    { l: 'Identify Contact',  v: 'Alicia Garcia',        d: true },
    { l: 'Purchase Timeframe',v: 'This quarter',         d: true },
    { l: 'Estimated Budget',  v: '$250,000',             d: true },
    { l: 'Purchase Process',  v: 'Committee',            d: false },
    { l: 'Identify Decision', v: 'Select…',              d: false }
  ];
  const stepW = (innerW - 40 - 30) / 3;
  for (let i = 0; i < steps.length; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const sx = innerX + 20 + col * (stepW + 15);
    const sy = stepsY + row * 80;
    const f = frame('step', stepW, 68, s);
    f.x = sx; f.y = sy;
    const dot = ellipse('d', 10, 10, steps[i].d ? C.success : C.g300, f);
    dot.x = 0; dot.y = 4;
    const lbl = await text(steps[i].l, 'medium', 11, C.g500, f);
    lbl.x = 18; lbl.y = 0;
    const val = await text(steps[i].v, 'regular', 13, steps[i].d ? C.g800 : C.g400, f);
    val.x = 0; val.y = 22;
    const ln = rect('ln', stepW, 1, C.g200, f);
    ln.x = 0; ln.y = 56;
  }
  y += 280;

  const nextBtn = await button('Next Stage  →', 'primary', s);
  nextBtn.x = innerX; nextBtn.y = y;

  await annotate(s, innerX + 200, y - 260, 'Current stage expands to show step fields', { dx: 0, dy: -40, width: 220 });
  await annotate(s, innerX + 110, y - 430, 'Done stage — green indicator', { dx: 0, dy: -40 });
  await annotate(s, innerX + 470, y - 430, 'Active stage — accent outline', { dx: 0, dy: -40 });
  return s;
}

// --- Screen 6: Timeline / Activity feed ------------------------------------
async function screenTimeline() {
  const s = newScreen('06 · Timeline / Activity Feed', 'desktop');
  const shell = await mountShell(s, 'Customer Service Hub', ['Dashboards', 'Cases', 'Knowledge', 'Queues'], 1);

  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  let y = shell.contentY + pad;

  const title = await text('Case · CAS-01293 — Printer offline', 'semibold', 20, C.g900, s);
  title.x = innerX; title.y = y; y += 40;

  // Split: record summary left, timeline right
  const leftW = 340;
  const rightW = innerW - leftW - 16;
  const leftBg = rect('lb', leftW, 480, C.white, s, { radius: 6, stroke: C.g200 });
  leftBg.x = innerX; leftBg.y = y;
  const lSum = stack('sum', 'v', 10, 18, s);
  lSum.x = innerX; lSum.y = y;
  lSum.counterAxisSizingMode = 'FIXED';
  lSum.resize(leftW, 480);
  await text('SUMMARY', 'semibold', 10, C.g500, lSum);
  await textInput('Case title', 'Printer offline in Floor 3 lab', lSum, { width: leftW - 36 });
  await dropdown('Priority', 'High', lSum, { width: leftW - 36 });
  await dropdown('Case type', 'Incident', lSum, { width: leftW - 36 });
  await textInput('Customer', 'Contoso Ltd', lSum, { width: leftW - 36 });
  await textInput('Owner', 'Morgan Yu', lSum, { width: leftW - 36 });

  // Timeline
  const tBg = rect('tbg', rightW, 480, C.white, s, { radius: 6, stroke: C.g200 });
  tBg.x = innerX + leftW + 16; tBg.y = y;
  const tHead = stack('th', 'h', 8, { l: 16, r: 16, t: 12, b: 12 }, s);
  tHead.x = innerX + leftW + 16; tHead.y = y;
  tHead.counterAxisSizingMode = 'FIXED';
  tHead.resize(rightW, 44);
  tHead.counterAxisAlignItems = 'CENTER';
  const th = await text('Timeline', 'semibold', 13, C.g900, tHead);
  const fSep = rect('spacer', rightW - 180, 1, null, tHead);
  const fP = await pill('All types', 'neutral', tHead);
  const fS = await pill('Most recent', 'neutral', tHead);

  let ty = y + 52;
  const items = [
    ['09:42 Today', 'Morgan Yu',   'Email',  'Sent diagnostics checklist to customer.'],
    ['09:30 Today', 'System',      'Note',   'Case auto-assigned to Tier 2 — Morgan Yu.'],
    ['Yesterday',   'Alicia Garcia','Email', 'Customer responded with screenshot of error code.'],
    ['Yesterday',   'Avery Brooks','Phone',  '15 min call — confirmed printer offline, driver update planned.'],
    ['Mon 10:00',   'System',      'Log',    'Case created from web form.']
  ];
  for (const it of items) {
    const row = await timelineItem(it[0], it[1], it[2], it[3], s, rightW);
    row.x = innerX + leftW + 16; row.y = ty;
    ty += row.height + 4;
  }

  await annotate(s, innerX + leftW + 16 + 80, y + 24, 'Timeline header — filter controls', { dx: 0, dy: -40 });
  await annotate(s, innerX + leftW + 60, y + 90, 'One item per activity: avatar · author · kind · body', { dx: -40, dy: 60, width: 240 });
  return s;
}

// --- Screen 7: Calendar / Schedule ----------------------------------------
async function screenCalendar() {
  const s = newScreen('07 · Calendar / Schedule', 'desktop');
  const shell = await mountShell(s, 'Field Service', ['Dashboards', 'Schedule Board', 'Work Orders', 'Bookings'], 1);

  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  let y = shell.contentY + pad;

  const title = await text('Schedule Board — Week of Apr 20', 'semibold', 20, C.g900, s);
  title.x = innerX; title.y = y; y += 40;

  const bg = rect('bg', innerW, 540, C.white, s, { radius: 6, stroke: C.g200 });
  bg.x = innerX; bg.y = y;

  // Header row (days)
  const resW = 180;
  const dayW = (innerW - resW) / 7;
  const days = ['Mon 20','Tue 21','Wed 22','Thu 23','Fri 24','Sat 25','Sun 26'];
  const headY = y;
  place(rect('hdrbg', innerW, 32, C.g50, s), innerX, headY);
  for (let i = 0; i < 7; i++) {
    const t = await text(days[i], 'semibold', 11, C.g600, s);
    t.x = innerX + resW + i * dayW + 10; t.y = y + 10;
  }
  // Resources column
  const resources = ['Team A — North', 'Team B — East', 'Team C — South', 'Team D — West', 'Specialists'];
  for (let r = 0; r < resources.length; r++) {
    const ry = y + 32 + r * 100;
    const rt = await text(resources[r], 'medium', 12, C.g700, s);
    rt.x = innerX + 12; rt.y = ry + 12;
    const rs = await text('8 bookings', 'regular', 10, C.g500, s);
    rs.x = innerX + 12; rs.y = ry + 30;
    // row divider
    place(rect('div', innerW, 1, C.g200, s), innerX, ry + 100);
  }

  // Column dividers
  for (let i = 0; i <= 7; i++) {
    const ln = rect('col', 1, 532, C.g100, s);
    ln.x = innerX + resW + i * dayW; ln.y = y;
  }
  // vertical separator for resources col
  const vSep = rect('vs', 1, 540, C.g200, s);
  vSep.x = innerX + resW; vSep.y = y;

  // Bookings (colored blocks)
  const bookings = [
    { r: 0, d: 0, s: 0.1, w: 2.5, tone: C.accent,  label: 'WO-1203 · Contoso' },
    { r: 0, d: 2, s: 1.2, w: 1.8, tone: C.success, label: 'WO-1204 · Fabrikam' },
    { r: 1, d: 1, s: 0.4, w: 2.0, tone: C.warn,    label: 'WO-1211 · Litware' },
    { r: 2, d: 3, s: 0.0, w: 2.8, tone: C.accent,  label: 'WO-1218 · Tailwind' },
    { r: 3, d: 4, s: 0.8, w: 1.5, tone: C.danger,  label: 'WO-1221 · Proseware' },
    { r: 4, d: 5, s: 0.2, w: 2.1, tone: C.accent,  label: 'WO-1230 · Adventure' },
    { r: 1, d: 3, s: 2.0, w: 1.2, tone: C.success, label: 'WO-1233 · Fabrikam' }
  ];
  for (const b of bookings) {
    const bX = innerX + resW + b.d * dayW + 6 + b.s * (dayW / 3);
    const bY = y + 44 + b.r * 100;
    const bW = b.w * (dayW / 3);
    const bH = 40;
    const box = rect('bk', bW - 12, bH, b.tone, s, { radius: 4, stroke: b.tone });
    box.x = bX; box.y = bY;
    box.opacity = 0.85;
    const lbl = await text(b.label, 'medium', 10, C.white, s);
    lbl.x = bX + 8; lbl.y = bY + 14;
  }

  await annotate(s, innerX + resW / 2, y + 60, 'Resource swim lanes', { dx: 40, dy: 40 });
  await annotate(s, innerX + resW + 40, y + 10, 'Day columns · drag to reassign', { dx: 0, dy: -30 });
  await annotate(s, innerX + resW + dayW * 3, y + 100, 'Booking block — tone by status', { dx: 20, dy: -40 });
  return s;
}

// --- Screen 8: Kanban / Board ---------------------------------------------
async function screenKanban() {
  const s = newScreen('08 · Kanban / Board', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Opportunities', 'Quotes'], 1);

  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  let y = shell.contentY + pad;

  const title = await text('Opportunities — Pipeline board', 'semibold', 20, C.g900, s);
  title.x = innerX; title.y = y; y += 40;

  const cols = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
  const gap = 14;
  const colW = (innerW - gap * (cols.length - 1)) / cols.length;
  const colH = 540;
  const tones = [C.g400, C.accent, C.warn, C.warn, C.success];

  for (let i = 0; i < cols.length; i++) {
    const cX = innerX + i * (colW + gap);
    const cBg = rect('cbg', colW, colH, C.g50, s, { radius: 6, stroke: C.g200 });
    cBg.x = cX; cBg.y = y;
    const h = frame('head', colW, 44, s);
    h.x = cX; h.y = y;
    const ht = await text(cols[i], 'semibold', 12, C.g700, h);
    ht.x = 14; ht.y = 14;
    const count = await pill(String(2 + i), 'neutral', h);
    count.x = colW - count.width - 14; count.y = 12;
    const acc = rect('acc', colW, 2, tones[i], s);
    acc.x = cX; acc.y = y;

    const nCards = [3, 3, 2, 2, 2][i];
    let cy = y + 52;
    for (let j = 0; j < nCards; j++) {
      const title2 = ['Cloud migration', 'Licensing renew', 'Teams adoption', 'Data platform', 'SoW signoff'][((i + j) % 5)];
      const meta = '$' + (30 + j * 12 + i * 8) + 'K · Q' + (2 + (j % 2)) + ' 2026';
      const card = await kanbanCard(title2 + ' #' + (i * 10 + j + 1), meta, tones[i], s, colW - 20);
      card.x = cX + 10; card.y = cy;
      cy += card.height + 10;
    }
  }

  await annotate(s, innerX + colW / 2, y + 22, 'Column = stage, drag cards to advance', { dx: 20, dy: -36, width: 240 });
  await annotate(s, innerX + colW + gap + 40, y + 100, 'Card: title · meta · priority · owner', { dx: 20, dy: 200, width: 200 });
  return s;
}

// --- Screen 9: Quick create / side panel ----------------------------------
async function screenQuickCreate() {
  const s = newScreen('09 · Quick Create / Side Panel', 'desktop');
  // Background blurred list as context
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Leads'], 1);
  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  const listY = shell.contentY + pad;
  // Faded list snapshot
  const fade = rect('fade', innerW, 600, C.white, s, { radius: 6, stroke: C.g200 });
  fade.x = innerX; fade.y = listY; fade.opacity = 0.4;
  for (let i = 0; i < 10; i++) {
    const r = rect('row', innerW - 40, 32, i % 2 ? C.g50 : C.white, s);
    r.x = innerX + 20; r.y = listY + 60 + i * 36; r.opacity = 0.5;
  }

  // Scrim
  const scrim = rect('scrim', DEVICE.desktop.w, DEVICE.desktop.h, '#0B1220', s);
  scrim.opacity = 0.4;

  // Panel
  const panelW = 460;
  const panelX = DEVICE.desktop.w - panelW;
  const panel = rect('panel', panelW, DEVICE.desktop.h - 48, C.white, s, { stroke: C.g200 });
  panel.x = panelX; panel.y = 48;

  const head = frame('ph', panelW, 56, s);
  head.x = panelX; head.y = 48;
  rect('hb', panelW, 56, C.g50, head);
  const ht = await text('Quick Create · Lead', 'semibold', 14, C.g900, head);
  ht.x = 20; ht.y = 18;
  const close = await text('✕', 'medium', 14, C.g500, head);
  close.x = panelW - 30; close.y = 18;
  const hl = rect('hl', panelW, 1, C.g200, head); hl.y = 55;

  // Form body
  const body = stack('body', 'v', 12, 20, s);
  body.x = panelX; body.y = 48 + 56;
  body.counterAxisSizingMode = 'FIXED';
  body.resize(panelW, DEVICE.desktop.h - 48 - 56 - 64);

  await textInput('Topic *', 'New consulting opportunity', body, { width: panelW - 40, focus: true });
  const nameRow = stack('nm', 'h', 12, 0, body);
  nameRow.counterAxisSizingMode = 'FIXED';
  nameRow.resize(panelW - 40, 56);
  await textInput('First name *', 'Alicia', nameRow, { width: (panelW - 40 - 12) / 2 });
  await textInput('Last name *',  'Garcia', nameRow, { width: (panelW - 40 - 12) / 2 });
  await textInput('Company',      'Contoso Ltd', body, { width: panelW - 40 });
  await textInput('Job title',    'CIO',         body, { width: panelW - 40 });
  await dropdown('Source',        'Trade show',  body, { width: panelW - 40 });
  await dropdown('Rating',        'Hot',         body, { width: panelW - 40 });
  await textInput('Est. value',   '$250,000',    body, { width: panelW - 40 });

  // Footer
  const foot = frame('pf', panelW, 64, s);
  foot.x = panelX; foot.y = 48 + DEVICE.desktop.h - 48 - 64;
  rect('fb', panelW, 64, C.white, foot);
  rect('fl', panelW, 1, C.g200, foot);
  const btnRow = stack('br', 'h', 8, 16, s);
  btnRow.x = panelX + panelW - 260; btnRow.y = foot.y + 12;
  await button('Cancel', 'secondary', btnRow);
  await button('Save & Close', 'secondary', btnRow);
  await button('Save', 'primary', btnRow);

  await annotate(s, panelX + 20, 48 + 20, 'Side-panel header · entity', { dx: -180, dy: 0, width: 160 });
  await annotate(s, panelX - 8, 400, 'Scrim dims the underlying view', { dx: -180, dy: -10, width: 200 });
  await annotate(s, panelX + panelW - 80, foot.y + 20, 'Footer actions · primary = Save', { dx: -240, dy: 40, width: 220 });
  return s;
}

// --- Screen 10: Command bar / Ribbon (focused) ----------------------------
async function screenCommandBar() {
  const s = newScreen('10 · Command Bar / Ribbon', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Opportunities'], 1);

  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  let y = shell.contentY + pad;

  const title = await text('Command bar anatomy', 'semibold', 20, C.g900, s);
  title.x = innerX; title.y = y; y += 40;

  // Primary row with all actions
  const cb = await commandBar(innerW, ['+ New', 'Edit', 'Deactivate', 'Assign', 'Share', 'Email a Link', 'Delete', 'Refresh', 'Export to Excel', 'Import from Excel', 'Flow', 'Run Report', 'Templates'], s);
  cb.x = innerX; cb.y = y; y += 60;

  // Collapsed example
  const cb2 = await commandBar(innerW, ['+ New', 'Edit', 'Delete'], s);
  cb2.x = innerX; cb2.y = y; y += 60;

  // Page-context example: Record form command bar
  const cb3 = await commandBar(innerW, ['Save', 'Save & Close', '+ New', 'Deactivate', 'Assign', 'Share', 'Close Opportunity', 'Process ▾'], s);
  cb3.x = innerX; cb3.y = y; y += 80;

  // Anatomy breakdown
  const legend = rect('lg', innerW, 180, C.white, s, { radius: 6, stroke: C.g200 });
  legend.x = innerX; legend.y = y;
  const h = await text('Anatomy', 'semibold', 12, C.g800, s);
  h.x = innerX + 20; h.y = y + 16;
  const bullets = [
    '• Left-aligned action buttons (icon + label)',
    '• Contextual actions appear based on selection',
    '• Overflow (⋯) moves rarely used actions into a menu',
    '• Split buttons expose primary action + related variants',
    '• Keep high-frequency actions first'
  ];
  for (let i = 0; i < bullets.length; i++) {
    const t = await text(bullets[i], 'regular', 12, C.g600, s);
    t.x = innerX + 20; t.y = y + 42 + i * 22;
  }

  await annotate(s, innerX + 40, shell.contentY + pad + 60, 'Full list command bar — entity-level', { dx: 20, dy: -36 });
  await annotate(s, innerX + 40, shell.contentY + pad + 120, 'Selection is empty: fewer actions', { dx: 20, dy: -36 });
  await annotate(s, innerX + 40, shell.contentY + pad + 180, 'Record-level: Save/Close Process ▾', { dx: 20, dy: -36 });
  return s;
}

// --- Screen 11: Lookup / Dialog modal -------------------------------------
async function screenLookup() {
  const s = newScreen('11 · Lookup / Dialog Modal', 'desktop');
  const shell = await mountShell(s, 'Sales Hub', ['Dashboards', 'Opportunities'], 1);
  const pad = 24;
  const innerX = shell.contentX + pad;
  const innerW = shell.contentW - pad * 2;
  // Faded context
  const fade = rect('fade', innerW, 560, C.white, s, { radius: 6, stroke: C.g200 });
  fade.x = innerX; fade.y = shell.contentY + pad; fade.opacity = 0.5;

  // Scrim
  const scrim = rect('scrim', DEVICE.desktop.w, DEVICE.desktop.h, '#0B1220', s);
  scrim.opacity = 0.5;

  const dW = 520, dH = 520;
  const dX = (DEVICE.desktop.w - dW) / 2;
  const dY = (DEVICE.desktop.h - dH) / 2;
  const dlg = rect('dlg', dW, dH, C.white, s, { radius: 8, stroke: C.g200 });
  dlg.x = dX; dlg.y = dY;
  dlg.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.2 }, offset: { x: 0, y: 8 }, radius: 24, spread: 0, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }];

  // Header
  const ht = await text('Look up records — Account', 'semibold', 15, C.g900, s);
  ht.x = dX + 20; ht.y = dY + 18;
  const close = await text('✕', 'medium', 14, C.g500, s);
  close.x = dX + dW - 28; close.y = dY + 18;
  const hl = rect('hl', dW, 1, C.g200, s); hl.x = dX; hl.y = dY + 52;

  // Search
  const search = frame('search', dW - 40, 36, s);
  search.x = dX + 20; search.y = dY + 72;
  rect('bg', dW - 40, 36, C.white, search, { stroke: C.g300, radius: 4 });
  place(iconSearch(14, C.g500, search), 10, 11);
  const sp = await text('Search accounts…', 'regular', 12, C.g400, s);
  sp.x = dX + 48; sp.y = dY + 82;

  // Tabs
  const tt = await tabs(['Records', 'Advanced find', 'Create new'], 0, s);
  tt.x = dX + 16; tt.y = dY + 120;

  // List
  const names = ['Contoso Ltd', 'Fabrikam Inc', 'Litware', 'Tailwind Traders', 'Proseware', 'Northwind', 'Adventure Works', 'Alpine Ski House'];
  for (let i = 0; i < names.length; i++) {
    const rY = dY + 172 + i * 36;
    place(rect('rbg', dW - 40, 32, i === 2 ? C.accentSoft : C.white, s, { radius: 3 }), dX + 20, rY);
    const av = await avatar(names[i].split(' ').map(w => w[0]).join('').slice(0, 2), s, 22, C.g400);
    av.x = dX + 26; av.y = rY + 5;
    const n = await text(names[i], 'medium', 12, i === 2 ? C.accentDark : C.g800, s);
    n.x = dX + 56; n.y = rY + 8;
    const m = await text('USA · Enterprise · Active', 'regular', 11, C.g500, s);
    m.x = dX + 220; m.y = rY + 9;
  }

  // Footer buttons
  const fl = rect('fl', dW, 1, C.g200, s); fl.x = dX; fl.y = dY + dH - 62;
  const btnRow = stack('br', 'h', 8, 0, s);
  btnRow.x = dX + dW - 200; btnRow.y = dY + dH - 48;
  await button('Cancel', 'secondary', btnRow);
  await button('Add (1)', 'primary', btnRow);

  await annotate(s, dX + 160, dY - 16, 'Modal dialog — blocking overlay', { dx: 40, dy: -40 });
  await annotate(s, dX + 20, dY + 132, 'Multi-tab lookup: records, query, create', { dx: -260, dy: 0, width: 240 });
  await annotate(s, dX + 250, dY + 258, 'Selected row highlight (accent soft)', { dx: 40, dy: 40 });
  return s;
}

// --- Screen 12: Power Automate flow diagram --------------------------------
async function screenFlow() {
  const s = newScreen('12 · Power Automate Flow', 'desktop');
  const d = DEVICE.desktop;
  // Flow editor has its own chrome; use a simpler top bar.
  const top = frame('ftop', d.w, 48, s);
  rect('tbg', d.w, 48, C.white, top, { stroke: C.g200 });
  const back = await text('←', 'medium', 16, C.g700, top); back.x = 16; back.y = 14;
  const ft = await text('Power Automate  ·  Case intake flow', 'semibold', 13, C.g900, top); ft.x = 40; ft.y = 16;
  const save = await button('Save', 'primary', top); save.x = d.w - 90; save.y = 8;
  const test = await button('Test', 'secondary', top); test.x = d.w - 170; test.y = 8;

  // Canvas
  const cX = 0, cY = 48;
  const cW = d.w, cH = d.h - 48;
  place(rect('canvas', cW, cH, C.g100, s), cX, cY);
  // Grid dots
  for (let i = 0; i < cW; i += 24) for (let j = 0; j < cH; j += 24) {
    const dot = ellipse('d', 2, 2, C.g200, s);
    dot.x = cX + i; dot.y = cY + j;
  }

  // Nodes
  const nodeX = cX + cW / 2 - 180;
  const nodes = [
    { kind: 'Trigger',    title: 'When a new Case is created', sub: 'Dynamics 365',  hex: C.accent },
    { kind: 'Action',     title: 'Get related Account',         sub: 'Dynamics 365',  hex: C.g700 },
    { kind: 'Condition',  title: 'Priority is High?',           sub: 'Control',       hex: C.warn },
    { kind: 'Action',     title: 'Post to Teams channel',       sub: 'Microsoft Teams', hex: C.g700 },
    { kind: 'Action',     title: 'Update Case.Status',          sub: 'Dynamics 365',  hex: C.g700 }
  ];
  let ny = cY + 56;
  for (const n of nodes) {
    const nw = 360, nh = 76;
    const box = rect('nbg', nw, nh, C.white, s, { radius: 6, stroke: C.g300 });
    box.x = nodeX; box.y = ny;
    const acc = rect('acc', 4, nh, n.hex, s); acc.x = nodeX; acc.y = ny;
    const ic = rect('ic', 36, 36, n.hex, s, { radius: 4 }); ic.x = nodeX + 16; ic.y = ny + 20;
    ic.opacity = 0.15;
    const ic2 = rect('ic2', 20, 20, n.hex, s, { radius: 2 }); ic2.x = nodeX + 24; ic2.y = ny + 28;
    const k = await text(n.kind, 'medium', 10, C.g500, s); k.x = nodeX + 64; k.y = ny + 14;
    const t = await text(n.title, 'semibold', 13, C.g900, s); t.x = nodeX + 64; t.y = ny + 28;
    const sb = await text(n.sub, 'regular', 11, C.g500, s); sb.x = nodeX + 64; sb.y = ny + 50;
    // Connector to next
    if (n !== nodes[nodes.length - 1]) {
      const ln = rect('conn', 2, 32, C.g400, s);
      ln.x = nodeX + nw / 2 - 1; ln.y = ny + nh;
      const plus = ellipse('plus', 20, 20, C.white, s, { stroke: C.g400 });
      plus.x = nodeX + nw / 2 - 10; plus.y = ny + nh + 6;
    }
    ny += nh + 32;
  }

  // Side panel (selected node details)
  const spW = 320;
  const spX = d.w - spW;
  const sp = rect('spbg', spW, d.h - 48, C.white, s, { stroke: C.g200 });
  sp.x = spX; sp.y = 48;
  const spt = await text('Condition', 'semibold', 14, C.g900, s);
  spt.x = spX + 16; spt.y = 64;
  const spd = await text('Expression', 'medium', 11, C.g500, s);
  spd.x = spX + 16; spd.y = 90;
  const code = rect('code', spW - 32, 80, C.g50, s, { radius: 4, stroke: C.g200 });
  code.x = spX + 16; code.y = 108;
  const mono = await text('triggerBody()?[\'priority\'] == \'high\'', 'regular', 11, C.g700, s);
  mono.x = spX + 24; mono.y = 120;

  await annotate(s, nodeX + 40, cY + 36, 'Trigger — starts the run', { dx: -240, dy: 0, width: 200 });
  await annotate(s, nodeX + 360 + 20, cY + 260, 'Condition branches flow logic', { dx: 30, dy: -40 });
  await annotate(s, spX + 40, 80, 'Right panel: inspector for selected node', { dx: -240, dy: 20, width: 220 });
  return s;
}

// --- Screen 13: Power Apps canvas screen -----------------------------------
async function screenCanvas() {
  const s = newScreen('13 · Power Apps Canvas', 'desktop');
  const d = DEVICE.desktop;

  // Studio chrome
  const top = frame('ctop', d.w, 48, s);
  rect('tbg', d.w, 48, C.g900, top);
  const pn = await text('Power Apps Studio · Expense Submit', 'semibold', 13, C.white, top); pn.x = 16; pn.y = 16;
  const play = rect('play', 28, 28, null, top, { radius: 14, stroke: C.white }); play.x = d.w - 140; play.y = 10;
  const playT = await text('▶', 'medium', 12, C.white, top); playT.x = d.w - 132; playT.y = 14;
  const pub = await button('Publish', 'primary', top); pub.x = d.w - 100; pub.y = 8;

  // Left tree panel
  const treeW = 240;
  place(rect('tree', treeW, d.h - 48, C.white, s, { stroke: C.g200 }), 0, 48);
  const treeT = await text('Tree view', 'semibold', 12, C.g700, s); treeT.x = 16; treeT.y = 64;
  const items = ['▾ App', '    OnStart', '  ▾ Screen1 — Home', '        Header', '        BtnNew', '        Gallery_Expenses', '  ▾ Screen2 — New Expense', '        Form1', '        BtnSubmit'];
  for (let i = 0; i < items.length; i++) {
    const t = await text(items[i], 'regular', 12, i === 5 ? C.accentDark : C.g700, s);
    t.x = 24; t.y = 96 + i * 22;
    if (i === 5) {
      const hl = rect('hl', treeW - 20, 22, C.accentSoft, s); hl.x = 10; hl.y = 96 + i * 22 - 3;
      t.parent.appendChild(t); // ensure on top
    }
  }

  // Canvas area (device preview)
  const canvasX = treeW;
  const canvasW = d.w - treeW - 280;
  place(rect('cbg', canvasW, d.h - 48, C.g100, s), canvasX, 48);

  // Tablet-shaped canvas preview
  const previewW = 640, previewH = 440;
  const pX = canvasX + (canvasW - previewW) / 2;
  const pY = 48 + 64;
  const pBg = rect('pbg', previewW, previewH, C.white, s, { radius: 10, stroke: C.g300 });
  pBg.x = pX; pBg.y = pY;
  pBg.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.1 }, offset: { x: 0, y: 4 }, radius: 12, spread: 0, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false }];

  // Canvas content
  const hdr = rect('hdr', previewW, 56, C.accent, s); hdr.x = pX; hdr.y = pY; hdr.cornerRadius = 0;
  const hdrT = await text('Expense Submit', 'semibold', 18, C.white, s); hdrT.x = pX + 20; hdrT.y = pY + 18;
  // Form
  const formPad = 24;
  const fY = pY + 80;
  const fields = ['Employee', 'Project', 'Category', 'Amount', 'Date', 'Notes'];
  for (let i = 0; i < fields.length; i++) {
    const row = i < 4 ? i : i - 4;
    const colIdx = i < 4 ? 0 : 1;
    // simpler: stacked
    const lbl = await text(fields[i], 'medium', 11, C.g600, s);
    lbl.x = pX + formPad; lbl.y = fY + i * 52;
    const box = rect('fb', previewW - formPad * 2, 36, C.white, s, { radius: 4, stroke: C.g300 });
    box.x = pX + formPad; box.y = fY + i * 52 + 16;
  }
  const sub = await button('Submit', 'primary', s);
  sub.x = pX + previewW - 120; sub.y = pY + previewH - 44;

  // Right properties panel
  const propX = d.w - 280;
  place(rect('prop', 280, d.h - 48, C.white, s, { stroke: C.g200 }), propX, 48);
  const pt = await text('Properties — Gallery_Expenses', 'semibold', 12, C.g800, s); pt.x = propX + 16; pt.y = 64;
  const props = [['Items', 'Filter(Expenses, Status="Open")'], ['TemplateFill', 'RGBA(255,255,255,1)'], ['OnSelect', 'Navigate(Screen2)']];
  for (let i = 0; i < props.length; i++) {
    const lbl = await text(props[i][0], 'medium', 11, C.g500, s);
    lbl.x = propX + 16; lbl.y = 100 + i * 56;
    const val = rect('pv', 248, 36, C.g50, s, { radius: 4, stroke: C.g200 });
    val.x = propX + 16; val.y = 120 + i * 56;
    const vt = await text(props[i][1], 'regular', 11, C.g700, s);
    vt.x = propX + 24; vt.y = 130 + i * 56;
  }

  await annotate(s, 120, 80, 'Tree view · hierarchy of controls', { dx: 120, dy: 0 });
  await annotate(s, pX + previewW / 2, pY + 20, 'Canvas preview — drag to arrange controls', { dx: 0, dy: -38, width: 260 });
  await annotate(s, propX + 140, 78, 'Right panel: properties & formulas', { dx: -260, dy: 40, width: 240 });
  return s;
}

// -----------------------------------------------------------------------------
//  11. Tablet patterns
// -----------------------------------------------------------------------------

async function tabletTopbar(w, parent) {
  const h = 44;
  const g = frame('tb-top', w, h, parent);
  rect('bg', w, h, C.g900, g);
  place(iconHamburger(18, C.white, g), 14, 13);
  const t = await text('Dynamics 365 · Sales', 'semibold', 13, C.white, g);
  t.x = 48; t.y = 14;
  const av = await avatar('AB', g, 28, C.accent);
  av.x = w - 40; av.y = 8;
  return g;
}

async function tabletNavShell() {
  const s = newScreen('T1 · Nav Shell (Tablet)', 'tablet');
  const d = DEVICE.tablet;
  await tabletTopbar(d.w, s);

  // Slim sitemap
  const sm = await sitemap(200, d.h - 44, 'Sales Hub', ['Dashboards', 'Accounts', 'Contacts', 'Leads', 'Opportunities'], 3, s);
  sm.y = 44;

  // Page content
  const innerX = 220;
  const pad = 16;
  const title = await text('Leads', 'semibold', 20, C.g900, s);
  title.x = innerX; title.y = 44 + pad;

  const cb = await commandBar(d.w - innerX - pad, ['+ New', 'Edit', 'Qualify', 'Delete', 'Export'], s);
  cb.x = innerX; cb.y = 44 + pad + 32;

  // Compact list
  const cols = [
    { label: 'Name',     width: 180 },
    { label: 'Company',  width: 180 },
    { label: 'Status',   width: 110 },
    { label: 'Owner',    width: 140 }
  ];
  const hdrW = d.w - innerX - pad;
  await listHeaderRow(cols, hdrW, s).then(r => { r.x = innerX; r.y = 44 + pad + 80; });
  const rows = [
    ['Alicia Contoso',  'Contoso Ltd',   { pill: true, label: 'New', tone: 'neutral' },     'Avery Brooks'],
    ['Bruno Fabrikam',  'Fabrikam Inc',  { pill: true, label: 'Working', tone: 'accent' },  'Morgan Yu'],
    ['Ciara Litware',   'Litware',       { pill: true, label: 'Qualified', tone: 'success' }, 'Jess Rivera'],
    ['Davit Proseware', 'Proseware',     { pill: true, label: 'Stalled', tone: 'warn' },    'Avery Brooks'],
    ['Elena Adventure', 'Adventure Wks', { pill: true, label: 'Disqualified', tone: 'danger' }, 'Sam Ngo']
  ];
  for (let i = 0; i < rows.length; i++) {
    await listRow(cols, rows[i], hdrW, s, { alt: i % 2 === 1 }).then(r => { r.x = innerX; r.y = 44 + pad + 116 + i * 40; });
  }

  await annotate(s, 100, 60, 'Collapsed top bar (hamburger toggles sitemap)', { dx: 160, dy: -30, width: 240 });
  await annotate(s, 110, 240, 'Tablet sitemap narrower; same nav groups', { dx: 120, dy: 20, width: 220 });
  return s;
}

async function tabletRecordForm() {
  const s = newScreen('T2 · Record Form (Tablet)', 'tablet');
  const d = DEVICE.tablet;
  await tabletTopbar(d.w, s);

  const innerX = 16;
  const pad = 16;
  const innerW = d.w - innerX - pad;
  let y = 44 + pad;

  const title = await text('Cloud migration — Contoso Ltd', 'semibold', 18, C.g900, s);
  title.x = innerX; title.y = y; y += 30;

  const bpf = await bpfBar(innerW, s);
  bpf.x = innerX; bpf.y = y; y += 60;

  const cb = await commandBar(innerW, ['Save', 'Close', '+ New', 'Share', 'Assign'], s);
  cb.x = innerX; cb.y = y; y += 48;

  const t = await tabs(['Summary', 'Stakeholders', 'Activities', 'Related'], 0, s);
  t.x = innerX; t.y = y; y += 40;

  // Single-column form on tablet
  const cardH = 340;
  place(rect('bg', innerW, cardH, C.white, s, { radius: 6, stroke: C.g200 }), innerX, y);
  const fBody = stack('fb', 'v', 10, 16, s);
  fBody.x = innerX; fBody.y = y;
  fBody.counterAxisSizingMode = 'FIXED';
  fBody.resize(innerW, cardH);
  await textInput('Topic *', 'Cloud migration — Contoso Ltd', fBody, { width: innerW - 32 });
  await textInput('Account', 'Contoso Ltd', fBody, { width: innerW - 32 });
  await dropdown('Currency', 'USD', fBody, { width: innerW - 32 });
  await textInput('Est. revenue', '$250,000', fBody, { width: innerW - 32, focus: true });
  await dropdown('Purchase process', 'Committee', fBody, { width: innerW - 32 });

  await annotate(s, 100, 90, 'Form collapses to single column', { dx: 160, dy: -30, width: 200 });
  return s;
}

async function tabletList() {
  const s = newScreen('T3 · List (Tablet)', 'tablet');
  const d = DEVICE.tablet;
  await tabletTopbar(d.w, s);

  const innerX = 16;
  const pad = 16;
  const innerW = d.w - innerX - pad;
  let y = 44 + pad;

  const title = await text('Cases', 'semibold', 18, C.g900, s);
  title.x = innerX; title.y = y; y += 32;

  const cb = await commandBar(innerW, ['+ New case', 'Assign', 'Resolve', 'Cancel'], s);
  cb.x = innerX; cb.y = y; y += 48;

  const cols = [
    { label: 'Title',     width: 280 },
    { label: 'Customer',  width: 160 },
    { label: 'Priority',  width: 110 },
    { label: 'Status',    width: 110 },
    { label: 'Owner',     width: 180 }
  ];
  await listHeaderRow(cols, innerW, s).then(r => { r.x = innerX; r.y = y; });
  const rows = [
    ['Printer offline',         'Contoso',    { pill: true, label: 'High', tone: 'danger' },  { pill: true, label: 'Active', tone: 'accent' }, 'Morgan Yu'],
    ['Laptop won\'t charge',    'Fabrikam',   { pill: true, label: 'Normal', tone: 'neutral' }, { pill: true, label: 'Resolved', tone: 'success' }, 'Avery Brooks'],
    ['VPN intermittent',        'Litware',    { pill: true, label: 'High', tone: 'danger' },  { pill: true, label: 'Active', tone: 'accent' }, 'Jess Rivera'],
    ['Email disk full',         'Tailwind',   { pill: true, label: 'Low', tone: 'neutral' },  { pill: true, label: 'Waiting', tone: 'warn' },  'Sam Ngo'],
    ['Login error on SSO',      'Northwind',  { pill: true, label: 'High', tone: 'danger' },  { pill: true, label: 'Active', tone: 'accent' }, 'Morgan Yu']
  ];
  for (let i = 0; i < rows.length; i++) {
    await listRow(cols, rows[i], innerW, s, { alt: i % 2 === 1 }).then(r => { r.x = innerX; r.y = y + 36 + i * 40; });
  }
  return s;
}

// -----------------------------------------------------------------------------
//  12. Mobile patterns (Power Apps Mobile-style)
// -----------------------------------------------------------------------------

async function mobileTopbar(w, title, parent) {
  const h = 56;
  const g = frame('m-top', w, h, parent);
  rect('bg', w, h, C.accent, g);
  const back = await text('←', 'medium', 18, C.white, g);
  back.x = 16; back.y = 20;
  const t = await text(title, 'semibold', 15, C.white, g);
  t.x = 48; t.y = 20;
  const more = await text('⋯', 'medium', 18, C.white, g);
  more.x = w - 32; more.y = 18;
  return g;
}

async function mobileTabbar(w, parent, active) {
  const h = 60;
  const g = frame('m-tab', w, h, parent);
  rect('bg', w, h, C.white, g, { stroke: C.g200 });
  const items = ['Home', 'List', 'New', 'Notifs', 'More'];
  const iconW = w / items.length;
  for (let i = 0; i < items.length; i++) {
    const cx = i * iconW + iconW / 2;
    const isA = i === (active == null ? 1 : active);
    const ic = iconBox(18, g); ic.x = cx - 9; ic.y = 10;
    if (isA) ic.children[0].strokes = [solid(C.accent)];
    const t = await text(items[i], 'medium', 10, isA ? C.accent : C.g500, g);
    t.x = cx - t.width / 2; t.y = 34;
  }
  return g;
}

async function mobileNavShell() {
  const s = newScreen('M1 · Mobile Home', 'mobile');
  const d = DEVICE.mobile;
  await mobileTopbar(d.w, 'Sales', s);
  // Greeting
  const hi = await text('Good afternoon, Avery', 'semibold', 16, C.g900, s);
  hi.x = 16; hi.y = 72;
  const sub = await text('Here\'s what\'s up today', 'regular', 12, C.g500, s);
  sub.x = 16; sub.y = 94;

  // KPI row
  const kW = (d.w - 16 * 3) / 2;
  const k1 = await kpiTile('Open deals', '42', '+3', s); k1.resize(kW, 80); k1.x = 16; k1.y = 120;
  const k2 = await kpiTile('Won MTD', '$ 82K', '+12%', s); k2.resize(kW, 80); k2.x = 32 + kW; k2.y = 120;

  // Quick actions
  const qaY = 216;
  const qaT = await text('Quick actions', 'semibold', 12, C.g700, s); qaT.x = 16; qaT.y = qaY;
  const qas = ['+ Lead', '+ Account', '+ Task', '+ Appt'];
  for (let i = 0; i < qas.length; i++) {
    const b = await button(qas[i], 'secondary', s);
    b.x = 16 + (i % 2) * (kW + 16);
    b.y = qaY + 24 + Math.floor(i / 2) * 44;
  }

  // Recent activities
  const raY = 340;
  const raT = await text('Recent activity', 'semibold', 12, C.g700, s); raT.x = 16; raT.y = raY;
  const raItems = [
    ['Now',    'Morgan Yu', 'Email sent to Alicia — proposal v2'],
    ['09:30',  'You',       'Called Fabrikam discovery'],
    ['Yest',   'Jess',      'Assigned case CAS-01293 to you']
  ];
  for (let i = 0; i < raItems.length; i++) {
    const row = frame('ri', d.w - 32, 56, s);
    row.x = 16; row.y = raY + 20 + i * 64;
    rect('bg', d.w - 32, 56, C.white, row, { radius: 6, stroke: C.g200 });
    const av = await avatar(raItems[i][1].split(' ').map(w => w[0]).slice(0, 2).join(''), row, 28, C.g500);
    av.x = 10; av.y = 14;
    const h = await text(raItems[i][1], 'semibold', 12, C.g900, row); h.x = 48; h.y = 10;
    const tm = await text(raItems[i][0], 'regular', 10, C.g500, row); tm.x = d.w - 64; tm.y = 10;
    const b = await text(raItems[i][2], 'regular', 11, C.g600, row); b.x = 48; b.y = 28;
  }

  await mobileTabbar(d.w, s, 0).then(t => { t.y = d.h - 60; });

  await annotate(s, d.w / 2, 28, 'Mobile top bar (app accent)', { dx: 40, dy: -30 });
  await annotate(s, d.w / 2, d.h - 30, 'Bottom tab bar — 5 destinations', { dx: -80, dy: 40, width: 220 });
  return s;
}

async function mobileList() {
  const s = newScreen('M2 · Mobile List', 'mobile');
  const d = DEVICE.mobile;
  await mobileTopbar(d.w, 'Cases', s);

  // Search
  const sr = frame('sr', d.w - 32, 36, s);
  sr.x = 16; sr.y = 72;
  rect('bg', d.w - 32, 36, C.g100, sr, { radius: 18 });
  place(iconSearch(14, C.g500, sr), 12, 11);
  const sp = await text('Search cases', 'regular', 12, C.g500, sr); sp.x = 34; sp.y = 11;

  // Filter chips
  const chips = ['All', 'Open', 'High', 'Mine'];
  let cx = 16;
  for (let i = 0; i < chips.length; i++) {
    const p = await pill(chips[i], i === 1 ? 'accent' : 'neutral', s);
    p.x = cx; p.y = 120;
    cx += p.width + 8;
  }

  // Cards
  const cards = [
    { t: 'Printer offline on Floor 3', c: 'Contoso', p: 'High', tone: C.danger },
    { t: 'Laptop won\'t charge',        c: 'Fabrikam', p: 'Normal', tone: C.g400 },
    { t: 'VPN intermittent',            c: 'Litware', p: 'High', tone: C.danger },
    { t: 'Email disk full',             c: 'Tailwind', p: 'Low', tone: C.g400 },
    { t: 'SSO login error',             c: 'Northwind', p: 'High', tone: C.danger },
    { t: 'New device request',          c: 'Adventure', p: 'Normal', tone: C.g400 }
  ];
  for (let i = 0; i < cards.length; i++) {
    const y = 156 + i * 80;
    const card = rect('c', d.w - 32, 72, C.white, s, { radius: 8, stroke: C.g200 });
    card.x = 16; card.y = y;
    const stripe = rect('str', 4, 72, cards[i].tone, s);
    stripe.x = 16; stripe.y = y;
    const t = await text(cards[i].t, 'semibold', 13, C.g900, s); t.x = 30; t.y = y + 12;
    const m = await text(cards[i].c + ' · CAS-' + (1200 + i), 'regular', 11, C.g500, s); m.x = 30; m.y = y + 34;
    const p = await pill(cards[i].p, cards[i].p === 'High' ? 'danger' : 'neutral', s);
    p.x = d.w - p.width - 26; p.y = y + 14;
    const chev = iconChevron(12, 'right', C.g400, s); chev.x = d.w - 30; chev.y = y + 46;
  }

  // FAB
  const fab = ellipse('fab', 56, 56, C.accent, s);
  fab.x = d.w - 76; fab.y = d.h - 140;
  const fabPlus = await text('+', 'bold', 28, C.white, s);
  fabPlus.x = d.w - 60; fabPlus.y = d.h - 132;

  await mobileTabbar(d.w, s, 1).then(t => { t.y = d.h - 60; });

  await annotate(s, d.w / 2, 92, 'Filter chips — quick segmentation', { dx: -100, dy: -40, width: 200 });
  await annotate(s, d.w - 90, d.h - 130, 'FAB · primary create action', { dx: -180, dy: 0, width: 160 });
  return s;
}

async function mobileRecordForm() {
  const s = newScreen('M3 · Mobile Record Form', 'mobile');
  const d = DEVICE.mobile;
  await mobileTopbar(d.w, 'Case CAS-01293', s);

  // Summary strip
  const stY = 72;
  const h = await text('Printer offline', 'semibold', 16, C.g900, s); h.x = 16; h.y = stY;
  const m = await text('Contoso · High priority · Open', 'regular', 12, C.g500, s); m.x = 16; m.y = stY + 22;
  const bar = await bpfBar(d.w - 32, s);
  bar.x = 16; bar.y = stY + 52;

  // Tabs
  const t = await tabs(['Summary', 'Timeline', 'Related'], 0, s);
  t.x = 0; t.y = stY + 120;
  t.resize(d.w, 40);

  // Fields (stacked)
  const fY = stY + 172;
  const body = stack('mb', 'v', 10, 16, s);
  body.x = 0; body.y = fY;
  body.counterAxisSizingMode = 'FIXED';
  body.resize(d.w, 300);
  await textInput('Title', 'Printer offline', body, { width: d.w - 32 });
  await dropdown('Priority', 'High', body, { width: d.w - 32 });
  await textInput('Customer', 'Contoso Ltd', body, { width: d.w - 32 });
  await textInput('Owner', 'Morgan Yu', body, { width: d.w - 32, focus: true });

  // Sticky save
  const save = await button('Save', 'primary', s);
  save.x = 16; save.y = d.h - 130;
  save.resize(d.w - 32, save.height);

  await mobileTabbar(d.w, s, 1).then(t => { t.y = d.h - 60; });

  await annotate(s, d.w / 2, stY + 80, 'BPF collapses to compact pill chain', { dx: -40, dy: -40, width: 220 });
  await annotate(s, d.w / 2, d.h - 150, 'Sticky primary action', { dx: -120, dy: -40, width: 180 });
  return s;
}

// -----------------------------------------------------------------------------
//  13. App theme mini-screens
// -----------------------------------------------------------------------------
//  Small mini-shells (720×440) so all 7 apps fit on one page side-by-side.

async function appMini(key) {
  const theme = APP_THEMES[key];
  const w = 720, h = 440;
  const s = frame(theme.label, w, h);
  s.fills = [solid(C.g100)];
  s.clipsContent = true;
  tag(s, 'component', { 'd365ppwf:role': 'app-mini' });
  rect('b', w, h, null, s, { stroke: C.g300, radius: 6 });

  // Top bar with app accent
  const tb = rect('tb', w, 32, theme.accent, s);
  const label = await text(theme.label, 'semibold', 11, C.white, s);
  label.x = 12; label.y = 10;

  // Sitemap narrow
  const smW = 140;
  place(rect('sm', smW, h - 32, C.g50, s), 0, 32);
  place(rect('smDiv', 1, h - 32, C.g200, s), smW, 32);

  // App-specific nav entries
  const navByApp = {
    sales:     ['Dashboards','Leads','Opportunities','Accounts','Contacts','Quotes'],
    service:   ['Dashboards','Cases','Queues','Knowledge','Contracts','SLAs'],
    marketing: ['Dashboards','Journeys','Segments','Emails','Forms','Leads'],
    field:     ['Dashboards','Schedule Board','Work Orders','Bookings','Assets','Invoices'],
    project:   ['Dashboards','Projects','Tasks','Time Entries','Expenses','Invoicing'],
    powerapps: ['Apps','Dataverse','Tables','Flows','Solutions','Connections'],
    powerauto: ['My flows','Shared','Templates','Connectors','Approvals','Solutions']
  };
  const nav = navByApp[key];
  for (let i = 0; i < nav.length; i++) {
    const isA = i === 1;
    const y = 44 + i * 28;
    if (isA) place(rect('hl', smW - 8, 24, C.accentSoft, s, { radius: 3 }), 4, y - 2);
    const t = await text(nav[i], isA ? 'semibold' : 'regular', 10, isA ? C.accentDark : C.g700, s);
    t.x = 16; t.y = y;
  }

  // Content preview: header + list (sales/service/field/project/marketing)
  // or flow/canvas for Power Platform
  const cX = smW + 16;
  const cY = 48;
  const cW = w - smW - 32;
  const ct = await text(nav[1], 'semibold', 14, C.g900, s);
  ct.x = cX; ct.y = cY;

  const sub = await text(theme.hint, 'regular', 10, C.g500, s);
  sub.x = cX; sub.y = cY + 22;

  if (key === 'powerauto') {
    // tiny flow nodes
    let ny = cY + 56;
    const nodes = ['When a new Case is created', 'Get related Account', 'Condition: Priority = High', 'Post to Teams'];
    for (const n of nodes) {
      const nb = rect('n', cW - 40, 38, C.white, s, { radius: 4, stroke: C.g300 });
      nb.x = cX; nb.y = ny;
      const acc = rect('a', 3, 38, theme.accent, s); acc.x = cX; acc.y = ny;
      const t = await text(n, 'medium', 11, C.g800, s); t.x = cX + 14; t.y = ny + 13;
      ny += 48;
    }
  } else if (key === 'powerapps') {
    // tiny canvas preview
    const p = rect('p', 260, 240, C.white, s, { radius: 6, stroke: C.g300 });
    p.x = cX + 20; p.y = cY + 56;
    const ph = rect('ph', 260, 40, theme.accent, s); ph.x = cX + 20; ph.y = cY + 56;
    const pht = await text('Canvas App', 'semibold', 12, C.white, s); pht.x = cX + 32; pht.y = cY + 68;
    for (let i = 0; i < 4; i++) {
      place(rect('fld', 220, 28, C.g50, s, { stroke: C.g200, radius: 3 }), cX + 40, cY + 116 + i * 40);
    }
    const tree = rect('tree', 180, 240, C.white, s, { stroke: C.g200, radius: 4 });
    tree.x = cX + 300; tree.y = cY + 56;
    const tt = await text('Tree view', 'medium', 10, C.g500, s); tt.x = cX + 314; tt.y = cY + 68;
    for (let i = 0; i < 5; i++) {
      const tr = await text(['▾ App','    Screen1','        Header','        Gallery','        Footer'][i], 'regular', 10, C.g700, s);
      tr.x = cX + 314; tr.y = cY + 92 + i * 18;
    }
  } else {
    // list preview
    const cols = [{ label: 'Name', width: 200 }, { label: 'Status', width: 110 }, { label: 'Owner', width: 140 }];
    await listHeaderRow(cols, cW, s).then(r => { r.x = cX; r.y = cY + 52; });
    const names = {
      sales:     [['Cloud migration','Working','Avery'],['Team renewals','Won','Morgan'],['DB consolidation','Qualified','Jess'],['Power BI rollout','Working','Sam']],
      service:   [['Printer offline','Active','Morgan'],['VPN intermittent','Active','Jess'],['Laptop charge','Resolved','Avery'],['SSO error','Waiting','Sam']],
      marketing: [['Q2 Campaign','Live','Jess'],['Summer webinar','Draft','Sam'],['ABM Enterprise','Live','Avery'],['Re-engagement','Paused','Morgan']],
      field:     [['WO-1203','Scheduled','Crew A'],['WO-1211','In progress','Crew B'],['WO-1218','Scheduled','Crew C'],['WO-1221','Open','Crew D']],
      project:   [['Cloud rollout','Active','Avery'],['Finance data','Planning','Morgan'],['D365 uplift','Active','Jess'],['Training pilot','Closing','Sam']]
    }[key];
    for (let i = 0; i < 4; i++) {
      const v = names[i];
      await listRow(cols, [v[0], { pill: true, label: v[1], tone: 'accent' }, v[2]], cW, s, { alt: i % 2 === 1, compact: true }).then(r => { r.x = cX; r.y = cY + 88 + i * 32; });
    }
  }

  return s;
}

// -----------------------------------------------------------------------------
//  14. Components showcase page
// -----------------------------------------------------------------------------

async function buildComponentsShowcase(parent) {
  const W = 1440;
  let y = 40;
  const title = await text('Components', 'semibold', 28, C.g900, parent);
  title.x = 40; title.y = y;
  const sub = await text('Building blocks. Copy into your own frames; restyle via tokens.', 'regular', 13, C.g500, parent);
  sub.x = 40; sub.y = y + 36;
  y = 110;

  async function section(name) {
    const t = await text(name, 'semibold', 16, C.g800, parent);
    t.x = 40; t.y = y;
    const ln = rect('s', W - 80, 1, C.g200, parent);
    ln.x = 40; ln.y = y + 24;
    y += 40;
  }

  // Buttons
  await section('Buttons');
  const bRow = stack('br', 'h', 12, 0, parent);
  bRow.x = 40; bRow.y = y;
  await button('Primary', 'primary', bRow);
  await button('Secondary', 'secondary', bRow);
  await button('Ghost', 'ghost', bRow);
  await button('Danger', 'danger', bRow);
  y += 60;

  // Inputs
  await section('Inputs');
  const iRow = stack('ir', 'h', 16, 0, parent);
  iRow.x = 40; iRow.y = y;
  await textInput('Text input', 'Cloud migration', iRow);
  await textInput('Focused', 'Contoso Ltd', iRow, { focus: true });
  await dropdown('Dropdown', 'USD — US Dollar', iRow);
  await textInput('Placeholder', null, iRow, { placeholder: 'Enter a value…' });
  y += 100;

  // Pills
  await section('Status pills');
  const pRow = stack('pr', 'h', 10, 0, parent);
  pRow.x = 40; pRow.y = y;
  pRow.counterAxisAlignItems = 'CENTER';
  await pill('Neutral', 'neutral', pRow);
  await pill('Accent / Active', 'accent', pRow);
  await pill('Success / Won', 'success', pRow);
  await pill('Warn / Stalled', 'warn', pRow);
  await pill('Danger / Lost', 'danger', pRow);
  y += 50;

  // Tabs
  await section('Tabs');
  const t = await tabs(['Summary', 'Products', 'Stakeholders', 'Activities', 'Related'], 0, parent);
  t.x = 40; t.y = y;
  y += 60;

  // KPI tiles
  await section('KPI tiles');
  const kRow = stack('kr', 'h', 16, 0, parent);
  kRow.x = 40; kRow.y = y;
  const k1 = await kpiTile('Open deals', '142', '+12'); kRow.appendChild(k1);
  const k2 = await kpiTile('Revenue', '$ 1.2M', '+8.4%'); kRow.appendChild(k2);
  const k3 = await kpiTile('Avg deal', '$ 18.5K', '-2.1%'); kRow.appendChild(k3);
  const k4 = await kpiTile('Cases', '37', '0'); kRow.appendChild(k4);
  y += 120;

  // Charts
  await section('Charts');
  const cRow = stack('cr', 'h', 16, 0, parent);
  cRow.x = 40; cRow.y = y;
  const bc = barChart(260, 160, [0.3, 0.6, 0.4, 0.75, 0.9, 0.55, 0.8], cRow, C.accent);
  const lc = lineChart(260, 160, [0.2, 0.4, 0.3, 0.55, 0.65, 0.5, 0.8, 0.75, 0.9], cRow, C.accent);
  const dn = donutChart(180, [{ value: 45, hex: C.accent }, { value: 25, hex: C.success }, { value: 20, hex: C.warn }, { value: 10, hex: C.danger }], cRow);
  y += 200;

  // Row primitives
  await section('Row primitives');
  const cols = [{ label: 'Name', width: 220 }, { label: 'Status', width: 120 }, { label: 'Owner', width: 160 }];
  const hdr = await listHeaderRow(cols, 600, parent); hdr.x = 40; hdr.y = y;
  for (let i = 0; i < 3; i++) {
    await listRow(cols, [['Alicia','Bruno','Ciara'][i], { pill: true, label: ['New','Working','Qualified'][i], tone: ['neutral','accent','success'][i] }, 'Avery'], 600, parent, { alt: i % 2 === 1 }).then(r => { r.x = 40; r.y = y + 36 + i * 40; });
  }
  // Kanban card
  const kc = await kanbanCard('Cloud migration #12', '$250K · Q2 2026', C.accent, parent, 240);
  kc.x = 680; kc.y = y;
  // Timeline item
  const ti = await timelineItem('Today 10:02', 'Morgan Yu', 'Email', 'Sent proposal draft to Alicia for review.', parent, 520);
  ti.x = 940; ti.y = y;
  y += 200;

  // Avatars & icons
  await section('Avatars & icons');
  const aRow = stack('ar', 'h', 12, 0, parent);
  aRow.x = 40; aRow.y = y;
  aRow.counterAxisAlignItems = 'CENTER';
  await avatar('AB', aRow, 28, C.g500);
  await avatar('MY', aRow, 28, C.accent);
  await avatar('JR', aRow, 28, C.success);
  await avatar('SN', aRow, 28, C.warn);
  iconBox(18, aRow);
  iconSearch(18, C.g600, aRow);
  iconChevron(18, 'down', C.g600, aRow);
  iconHamburger(18, C.g600, aRow);
  await iconGlyph('D', 28, C.g800, C.white, aRow);
  await iconGlyph('P', 28, APP_THEMES.powerapps.accent, C.white, aRow);
  await iconGlyph('F', 28, APP_THEMES.powerauto.accent, C.white, aRow);
  y += 60;

  // Annotated example strip
  await section('Annotation style');
  const tgt = rect('ex', 260, 80, C.white, parent, { radius: 6, stroke: C.g200 });
  tgt.x = 40; tgt.y = y;
  const tt2 = await text('Example target', 'medium', 12, C.g700, parent);
  tt2.x = 60; tt2.y = y + 30;
  await annotate(parent, 40 + 220, y + 20, 'Annotations use dashed pill + leader', { dx: 30, dy: -28, width: 240 });
  y += 140;
  return y;
}

// -----------------------------------------------------------------------------
//  15. Tokens showcase page
// -----------------------------------------------------------------------------

async function buildTokensShowcase(parent) {
  const title = await text('Design Tokens', 'semibold', 28, C.g900, parent);
  title.x = 40; title.y = 40;
  const sub = await text('Grayscale base with a single accent. Swap the accent to re-skin for any D365 app.', 'regular', 13, C.g500, parent);
  sub.x = 40; sub.y = 76;

  // Color swatches
  const ch = await text('Color', 'semibold', 16, C.g800, parent);
  ch.x = 40; ch.y = 130;
  const scales = [
    ['Gray', [['g50', C.g50], ['g100', C.g100], ['g200', C.g200], ['g300', C.g300], ['g400', C.g400], ['g500', C.g500], ['g600', C.g600], ['g700', C.g700], ['g800', C.g800], ['g900', C.g900]]],
    ['Status', [['accent', C.accent], ['accentSoft', C.accentSoft], ['success', C.success], ['warn', C.warn], ['danger', C.danger], ['annot', C.annot]]]
  ];
  let y = 160;
  for (const [name, items] of scales) {
    const l = await text(name, 'medium', 12, C.g700, parent);
    l.x = 40; l.y = y;
    let x = 40;
    for (const [nm, hex] of items) {
      const sw = frame('sw', 110, 80, parent);
      sw.x = x; sw.y = y + 20;
      rect('bg', 110, 60, hex, sw, { radius: 4, stroke: C.g200 });
      const n = await text(nm, 'medium', 11, C.g700, sw); n.x = 0; n.y = 64;
      const v = await text(hex, 'regular', 10, C.g500, sw); v.x = 54; v.y = 64;
      x += 120;
    }
    y += 120;
  }

  // Typography
  const th = await text('Type', 'semibold', 16, C.g800, parent);
  th.x = 40; th.y = y + 20;
  y += 50;
  const samples = [
    ['Display / 28 bold',    'bold',     28],
    ['Heading / 20 semibold','semibold', 20],
    ['Body / 13 regular',    'regular',  13],
    ['Small / 11 regular',   'regular',  11],
    ['Label / 10 medium',    'medium',   10]
  ];
  for (const [label, w, sz] of samples) {
    const t = await text(label, w, sz, C.g800, parent);
    t.x = 40; t.y = y;
    y += sz + 16;
  }

  // Spacing
  const sh = await text('Spacing (8pt)', 'semibold', 16, C.g800, parent);
  sh.x = 40; sh.y = y + 12;
  y += 44;
  const steps = [4, 8, 12, 16, 24, 32, 48];
  let sx = 40;
  for (const s of steps) {
    const b = rect('sp', s, 24, C.accent, parent, { radius: 2 });
    b.x = sx; b.y = y;
    const l = await text(s + 'px', 'regular', 10, C.g500, parent);
    l.x = sx; l.y = y + 28;
    sx += s + 24;
  }

  // Icon stock
  y += 64;
  const ih = await text('Icons (stock placeholders)', 'semibold', 16, C.g800, parent);
  ih.x = 40; ih.y = y;
  y += 24;
  const iRow = stack('ir', 'h', 14, 0, parent);
  iRow.x = 40; iRow.y = y;
  iRow.counterAxisAlignItems = 'CENTER';
  iconBox(20, iRow);
  iconSearch(20, C.g700, iRow);
  iconChevron(20, 'down', C.g700, iRow);
  iconHamburger(20, C.g700, iRow);
  await iconGlyph('D', 28, C.g800, C.white, iRow);
  await iconGlyph('S', 28, APP_THEMES.sales.accent, C.white, iRow);
  await iconGlyph('C', 28, APP_THEMES.service.accent, C.white, iRow);
  await iconGlyph('M', 28, APP_THEMES.marketing.accent, C.white, iRow);
  await iconGlyph('F', 28, APP_THEMES.field.accent, C.white, iRow);
  await iconGlyph('P', 28, APP_THEMES.project.accent, C.white, iRow);
  await iconGlyph('A', 28, APP_THEMES.powerapps.accent, C.white, iRow);
  await iconGlyph('⚡', 28, APP_THEMES.powerauto.accent, C.white, iRow);
}

// -----------------------------------------------------------------------------
//  16. Cover page
// -----------------------------------------------------------------------------

async function buildCover(parent) {
  const W = 1440, H = 900;
  const bg = rect('bg', W, H, C.g900, parent);
  const hero = await text('D365 · Power Platform\nWireframe Kit', 'bold', 72, C.white, parent);
  hero.x = 80; hero.y = 140;
  hero.lineHeight = { unit: 'PERCENT', value: 100 };

  const tag = await text('Reusable mid-fi template for Dynamics 365 Customer Engagement\n(Sales · Service · Marketing · Field · Project Ops) and Power Platform.', 'regular', 18, C.g300, parent);
  tag.x = 80; tag.y = 320;
  tag.lineHeight = { unit: 'PERCENT', value: 140 };

  // Legend strip
  const legendY = 460;
  const items = [
    { k: 'Gray swatch', hex: C.g300 },
    { k: 'Accent',       hex: C.accent },
    { k: 'Success',      hex: C.success },
    { k: 'Warn',         hex: C.warn },
    { k: 'Danger',       hex: C.danger },
    { k: 'Annotation',   hex: C.annot }
  ];
  let x = 80;
  for (const it of items) {
    const sw = rect('s', 18, 18, it.hex, parent, { radius: 2 });
    sw.x = x; sw.y = legendY;
    const l = await text(it.k, 'medium', 12, C.white, parent);
    l.x = x + 26; l.y = legendY + 2;
    x += 150;
  }

  // How-to
  const ht = await text('How to use', 'semibold', 14, C.white, parent);
  ht.x = 80; ht.y = 540;
  const tips = [
    '1. Open the Components page — copy building blocks into your own frames.',
    '2. Desktop / Tablet / Mobile pattern pages show full screen templates.',
    '3. Use the plugin panel to toggle annotations, font, density, grid.',
    '4. Re-skin for any app by changing the accent color token.'
  ];
  for (let i = 0; i < tips.length; i++) {
    const t = await text(tips[i], 'regular', 13, C.g300, parent);
    t.x = 80; t.y = 572 + i * 24;
  }

  // Right-side decorative frame stack
  const decX = 860, decY = 160;
  for (let i = 0; i < 4; i++) {
    const f = rect('dec', 440, 140, C.g800, parent, { radius: 8, stroke: C.g700 });
    f.x = decX + i * 16; f.y = decY + i * 16;
    f.opacity = 1 - i * 0.2;
  }
}

// -----------------------------------------------------------------------------
//  17. Annotations companion page
// -----------------------------------------------------------------------------

async function buildAnnotationsPage(parent) {
  const title = await text('Annotations — Teaching notes', 'semibold', 28, C.g900, parent);
  title.x = 40; title.y = 40;
  const sub = await text('Numbered badges you can drop next to any frame. Toggle all annotations via the plugin panel.', 'regular', 13, C.g500, parent);
  sub.x = 40; sub.y = 76;

  const notes = [
    'Command bar actions appear / collapse by selection count.',
    'Business Process Flow stages are stored on the entity as Processes.',
    'List views are saved queries — offer "system" and "personal" variants.',
    'Quick Create uses the Main form subset configured per entity.',
    'Unified Interface: same form definition renders desktop, tablet, mobile.',
    'Subgrids on a form embed a related entity list — reuse the list primitive.',
    'Timeline is a native control — activity kinds: email, phone, task, note, appointment.',
    'Dashboards composed of tiles: chart, list, iframe, web resource.',
    'Kanban is a view render mode (Opportunities, Cases) in recent UI.',
    'Power Apps canvas: gallery → item template → form pattern.',
    'Power Automate: trigger + N actions; conditions branch the flow.',
    'Dialog modals block workflow — use for lookup and destructive confirms.'
  ];
  let y = 130;
  for (let i = 0; i < notes.length; i++) {
    const badge = ellipse('b', 24, 24, C.annot, parent);
    badge.x = 40; badge.y = y;
    const n = await text(String(i + 1), 'bold', 13, C.white, parent);
    n.x = 40 + (24 - n.width) / 2; n.y = y + (24 - n.height) / 2;
    const t = await text(notes[i], 'regular', 13, C.g800, parent);
    t.x = 80; t.y = y + 2;
    y += 36;
  }
}

// -----------------------------------------------------------------------------
//  18. Page layout helpers
// -----------------------------------------------------------------------------

async function layoutRow(page, items, opts) {
  opts = opts || {};
  const gap = opts.gap || 40;
  let x = opts.x || 40;
  const y = opts.y || 40;
  for (const it of items) {
    page.appendChild(it);
    it.x = x; it.y = y;
    x += it.width + gap;
  }
}

async function layoutGrid(page, items, opts) {
  opts = opts || {};
  const cols = opts.cols || 2;
  const gap = opts.gap || 40;
  const x0 = opts.x || 40;
  const y0 = opts.y || 40;
  for (let i = 0; i < items.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    page.appendChild(items[i]);
    items[i].x = x0 + c * (items[i].width + gap);
    items[i].y = y0 + r * (items[i].height + gap);
  }
}

// -----------------------------------------------------------------------------
//  19. Main build orchestrator
// -----------------------------------------------------------------------------

async function buildAll() {
  await resolveFonts();
  await loadFamily(F.sans);

  // Helper to make/reset a page
  const makePage = (name) => {
    const p = figma.createPage();
    p.name = name;
    p.setPluginData('d365ppwf:page', 'true');
    return p;
  };

  // 1. Cover (create first so there's a safe page to switch to before purging)
  const coverPage = makePage('00 · Cover');
  await figma.setCurrentPageAsync(coverPage);

  // Purge any previous ppwf-generated pages (except the fresh cover).
  const existing = figma.root.children.slice();
  for (const p of existing) {
    if (p === coverPage) continue;
    if (p.getPluginData('d365ppwf:page') === 'true') {
      await p.loadAsync();
      p.remove();
    }
  }

  await buildCover(coverPage);

  // 2. Tokens
  const tokenPage = makePage('01 · Tokens');
  await figma.setCurrentPageAsync(tokenPage);
  await buildTokensShowcase(tokenPage);

  // 3. Components
  const compPage = makePage('02 · Components');
  await figma.setCurrentPageAsync(compPage);
  await buildComponentsShowcase(compPage);

  // 4. Desktop patterns
  const deskPage = makePage('03 · Desktop Patterns');
  await figma.setCurrentPageAsync(deskPage);
  const deskScreens = [];
  deskScreens.push(await screenSitemap());
  deskScreens.push(await screenList());
  deskScreens.push(await screenRecordForm());
  deskScreens.push(await screenDashboard());
  deskScreens.push(await screenBPF());
  deskScreens.push(await screenTimeline());
  deskScreens.push(await screenCalendar());
  deskScreens.push(await screenKanban());
  deskScreens.push(await screenQuickCreate());
  deskScreens.push(await screenCommandBar());
  deskScreens.push(await screenLookup());
  deskScreens.push(await screenFlow());
  deskScreens.push(await screenCanvas());
  await layoutGrid(deskPage, deskScreens, { cols: 3, gap: 80, x: 80, y: 80 });

  // 5. Tablet patterns
  const tabPage = makePage('04 · Tablet Patterns');
  await figma.setCurrentPageAsync(tabPage);
  const tabScreens = [];
  tabScreens.push(await tabletNavShell());
  tabScreens.push(await tabletRecordForm());
  tabScreens.push(await tabletList());
  await layoutGrid(tabPage, tabScreens, { cols: 3, gap: 80, x: 80, y: 80 });

  // 6. Mobile patterns
  const mobPage = makePage('05 · Mobile Patterns');
  await figma.setCurrentPageAsync(mobPage);
  const mobScreens = [];
  mobScreens.push(await mobileNavShell());
  mobScreens.push(await mobileList());
  mobScreens.push(await mobileRecordForm());
  await layoutGrid(mobPage, mobScreens, { cols: 3, gap: 60, x: 80, y: 80 });

  // 7. App themes
  const appPage = makePage('06 · App Themes');
  await figma.setCurrentPageAsync(appPage);
  const appMinis = [];
  for (const key of ['sales', 'service', 'marketing', 'field', 'project', 'powerapps', 'powerauto']) {
    appMinis.push(await appMini(key));
  }
  await layoutGrid(appPage, appMinis, { cols: 2, gap: 60, x: 80, y: 80 });

  // 8. Annotations page
  const annPage = makePage('07 · Annotations');
  await figma.setCurrentPageAsync(annPage);
  await buildAnnotationsPage(annPage);

  // Back to cover
  await figma.setCurrentPageAsync(coverPage);
  figma.notify('Template built · ' + (deskScreens.length + tabScreens.length + mobScreens.length) + ' screens generated.');
}

// -----------------------------------------------------------------------------
//  20. Toggle handlers
// -----------------------------------------------------------------------------

async function forEachNode(visitor) {
  for (const page of figma.root.children) {
    if (page.getPluginData('d365ppwf:page') !== 'true') continue;
    await page.loadAsync();
    const nodes = page.findAll(() => true);
    for (const n of nodes) await visitor(n);
  }
}

async function toggleAnnotations(show) {
  await forEachNode(async (n) => {
    if (n.getPluginData(K.kind) === 'annotation') {
      n.visible = !!show;
    }
  });
  figma.notify('Annotations ' + (show ? 'shown' : 'hidden'));
}

async function toggleGrid(show) {
  await forEachNode(async (n) => {
    if (n.type === 'FRAME' && n.getPluginData(K.gridHost) === 'true' && n.layoutGrids && n.layoutGrids.length) {
      const next = n.layoutGrids.map(g => Object.assign({}, g, { visible: !!show }));
      n.layoutGrids = next;
    }
  });
  figma.notify('Grid ' + (show ? 'shown' : 'hidden'));
}

async function swapFont(family) {
  const map = { sans: 'sans', mono: 'mono', hand: 'hand' };
  const key = map[family] || 'sans';
  F.current = key;
  await loadFamily(F[key]);
  // Also load all styles for the family
  const avail = await figma.listAvailableFontsAsync();
  const styles = avail.filter(f => f.fontName.family === F[key]);
  for (const st of styles) try { await figma.loadFontAsync(st.fontName); } catch (_) {}
  const resolveStyle = (weight) => {
    const sNames = styles.map(s => s.fontName.style);
    const want = {
      regular:  ['Regular', 'Book', 'Normal', 'Light'],
      medium:   ['Medium', 'Regular', 'Book'],
      semibold: ['Semi Bold', 'SemiBold', 'DemiBold', 'Medium', 'Bold'],
      bold:     ['Bold', 'Semi Bold', 'SemiBold', 'Medium']
    }[weight || 'regular'];
    for (const w of want) if (sNames.indexOf(w) >= 0) return w;
    return sNames[0] || 'Regular';
  };
  let changed = 0;
  await forEachNode(async (n) => {
    if (n.type !== 'TEXT') return;
    if (n.getPluginData(K.fontable) !== 'true') return;
    const weight = n.getPluginData(K.weight) || 'regular';
    const style = resolveStyle(weight);
    try {
      n.fontName = { family: F[key], style };
      changed++;
    } catch (e) { /* ignore nodes with mixed fonts */ }
  });
  figma.notify('Font set to ' + F[key] + ' (' + changed + ' text nodes)');
}

async function setDensity(mode) {
  // 'compact' | 'comfortable'
  const isCompact = mode === 'compact';
  await forEachNode(async (n) => {
    const role = n.getPluginData('d365ppwf:role');
    if (role === 'list-row' && n.type === 'FRAME') {
      const w = n.width;
      const nh = isCompact ? 32 : 40;
      n.resize(w, nh);
      // re-center children vertically
      for (const c of n.children) {
        if (c.type === 'RECTANGLE' && c.name === 'bg') c.resize(w, nh);
        if (c.type === 'RECTANGLE' && c.name === 'sep') c.y = nh - 1;
        if (c.type === 'RECTANGLE' && c.name === 'cb') c.y = (nh - 14) / 2;
        if (c.type === 'TEXT') c.y = (nh - c.height) / 2;
        if (c.type === 'FRAME' && c.name && c.name.indexOf('pill') === 0) c.y = (nh - c.height) / 2;
      }
    }
    if (role === 'timeline' && n.type === 'FRAME' && 'layoutMode' in n && n.layoutMode !== 'NONE') {
      n.paddingTop = isCompact ? 6 : 10;
      n.paddingBottom = isCompact ? 6 : 10;
    }
  });
  figma.notify('Density: ' + mode);
}

// -----------------------------------------------------------------------------
//  21. Message router
// -----------------------------------------------------------------------------

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'build') {
      await buildAll();
    } else if (msg.type === 'toggleAnnotations') {
      await toggleAnnotations(msg.show);
    } else if (msg.type === 'toggleGrid') {
      await toggleGrid(msg.show);
    } else if (msg.type === 'swapFont') {
      await swapFont(msg.family);
    } else if (msg.type === 'density') {
      await setDensity(msg.mode);
    }
  } catch (e) {
    console.error(e);
    figma.notify('Error: ' + (e && e.message ? e.message : String(e)), { error: true });
  }
};
