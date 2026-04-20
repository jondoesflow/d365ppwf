/**
 * MDA/Form/* — Main Form, Header, Tab Strip, Section, Field types,
 * Business Process Flow, Quick View, Sub-Grid, Timeline, Related Menu.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

// ---------------------------------------------------------------------------
// Shared field factory
// ---------------------------------------------------------------------------

interface FieldOpts {
  label: string;
  value?: string;
  required?: boolean;
  state?: 'Default' | 'Focus' | 'Readonly' | 'Disabled';
  width?: number;
  trailingIcon?: string;
  placeholder?: string;
  multiline?: boolean;
  appearance?: 'underline' | 'outline';
}

async function buildField(
  page: PageNode,
  tokens: Tokens,
  name: string,
  opts: FieldOpts,
  docs?: string,
  key?: string,
): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  const states: Array<'Default' | 'Focus' | 'Readonly' | 'Disabled'> = ['Default', 'Focus', 'Readonly', 'Disabled'];
  for (const st of states) {
    const f = frame(`State=${st}`, undefined);
    autoLayout(f, 'v', 4, 0);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
    f.resize(opts.width ?? 320, 1);
    const lbl = await text(opts.label + (opts.required ? ' *' : ''), 'semibold', 12, f);
    bindText(lbl, tokens, st === 'Disabled' ? 'color/text/disabled' : 'color/text/secondary');
    const box = frame('box', f);
    autoLayout(box, 'h', 8, { l: 10, r: 10, t: 0, b: 0 });
    box.primaryAxisSizingMode = 'FIXED'; box.counterAxisSizingMode = 'FIXED';
    box.counterAxisAlignItems = 'CENTER';
    box.resize(opts.width ?? 320, opts.multiline ? 72 : 32);
    const bgKey = st === 'Readonly' ? 'color/canvas/surface' : st === 'Disabled' ? 'color/canvas/surface-alt' : 'color/canvas/background';
    bindFill(box, tokens, bgKey);
    const borderKey = st === 'Focus' ? 'color/brand/primary' : 'color/stroke/default';
    if (opts.appearance === 'underline') {
      const ln = rect('underline', opts.width ?? 320, st === 'Focus' ? 2 : 1, box);
      ln.layoutPositioning = 'ABSOLUTE'; ln.x = 0; ln.y = 31;
      bindFill(ln, tokens, borderKey);
    } else {
      bindStroke(box, tokens, borderKey, st === 'Focus' ? 2 : 1);
      box.cornerRadius = 4;
    }
    const val = await text(opts.value ?? opts.placeholder ?? 'Value', 'regular', 13, box);
    bindText(val, tokens, opts.value ? (st === 'Disabled' ? 'color/text/disabled' : 'color/text/primary') : 'color/text/secondary');
    if (opts.trailingIcon) {
      const pad = rect('pad', 1, 1, box); pad.fills = []; pad.layoutGrow = 1;
      const ic = await text(opts.trailingIcon, 'regular', 13, box);
      bindText(ic, tokens, 'color/text/secondary');
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, name, {
    purpose: `${opts.label} form field.`,
    pp: name,
    docs,
  }, key ?? name.toLowerCase().replace(/\s+/g, '-'));
}

// ---------------------------------------------------------------------------
// Specific field components
// ---------------------------------------------------------------------------

export async function buildMdaFormFields(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Single Line Text',    { label: 'Name',          value: 'Cloud migration',       required: true, appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Multi-Line Text',     { label: 'Description',   value: 'Customer requires…',    multiline: true, appearance: 'outline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Option Set',          { label: 'Status',        value: 'In Progress',           trailingIcon: '▾', appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Multi-Select Option Set', { label: 'Tags',      value: 'Cloud, ERP, Teams',     trailingIcon: '▾', appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Yes/No',              { label: 'Active',        value: 'Yes',                   appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Date Only',           { label: 'Due date',      value: '04/20/2026',            trailingIcon: '📅', appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Date and Time',       { label: 'Meeting',       value: '04/20/2026 09:30 AM',   trailingIcon: '🕑', appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Number',              { label: 'Quantity',      value: '142',                   appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Currency',            { label: 'Est. revenue',  value: '$ 250,000.00',          appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Lookup',              { label: 'Account',       value: 'Contoso Ltd',           trailingIcon: '🔎', appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Customer Lookup',     { label: 'Customer',      value: 'Contoso Ltd (Account)', trailingIcon: '🔎', appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Owner',               { label: 'Owner',         value: 'Avery Brooks',          trailingIcon: '🔎', appearance: 'underline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — File / Image',        { label: 'Attachment',    value: 'proposal-v2.pdf',       trailingIcon: '📎', appearance: 'outline' }));
  sets.push(await buildField(page, tokens, 'MDA/Form/Field — Rich Text',           { label: 'Notes',         value: 'Bold + italic supported',multiline: true, appearance: 'outline' }));
  return sets;
}

// ---------------------------------------------------------------------------
// Form header
// ---------------------------------------------------------------------------

async function buildFormHeader(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 12, 20);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1184, 1);
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const titleRow = frame('title', f);
  autoLayout(titleRow, 'h', 16, 0);
  titleRow.primaryAxisSizingMode = 'AUTO'; titleRow.counterAxisSizingMode = 'AUTO';
  titleRow.counterAxisAlignItems = 'CENTER';
  const title = await text('Cloud migration — Contoso Ltd', 'bold', 24, titleRow);
  bindText(title, tokens, 'color/text/primary');
  const pill = frame('pill', titleRow);
  autoLayout(pill, 'h', 4, { l: 8, r: 8, t: 2, b: 2 });
  pill.primaryAxisSizingMode = 'AUTO'; pill.counterAxisSizingMode = 'AUTO';
  pill.cornerRadius = 4;
  bindFill(pill, tokens, 'color/canvas/surface-alt');
  const pt = await text('Open', 'semibold', 11, pill);
  bindText(pt, tokens, 'color/text/primary');
  // Header fields
  const row = frame('fields', f);
  autoLayout(row, 'h', 32, 0);
  row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
  row.resize(1144, 1);
  for (const [label, value] of [['Est. revenue', '$ 250,000'], ['Close date', 'Jun 30, 2026'], ['Probability', '65%'], ['Owner', 'Avery Brooks']]) {
    const col = frame(`h-${label}`, row);
    autoLayout(col, 'v', 4, 0);
    col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'AUTO';
    const l = await text(label, 'semibold', 11, col);
    bindText(l, tokens, 'color/text/secondary');
    const v = await text(value, 'regular', 14, col);
    bindText(v, tokens, 'color/text/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Form/Header', {
    purpose: 'Form header: title, status pill, and key header fields.',
    pp: 'Unified Interface form header.',
  }, 'mda/form/header');
}

// ---------------------------------------------------------------------------
// Tab strip
// ---------------------------------------------------------------------------

async function buildTabStrip(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const selected of [0, 1, 2]) {
    const f = frame(`Selected=${selected}`, undefined);
    autoLayout(f, 'h', 0, 0);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(1184, 42);
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    for (const [i, label] of ['Summary', 'Product & Pricing', 'Stakeholders', 'Activities', 'Related'].entries()) {
      const tab = frame(`tab-${i}`, f);
      autoLayout(tab, 'h', 0, { l: 18, r: 18, t: 0, b: 0 });
      tab.primaryAxisAlignItems = 'CENTER'; tab.counterAxisAlignItems = 'CENTER';
      tab.primaryAxisSizingMode = 'AUTO'; tab.counterAxisSizingMode = 'FIXED';
      tab.resize(tab.width, 42);
      const t = await text(label, i === selected ? 'semibold' : 'regular', 13, tab);
      bindText(t, tokens, i === selected ? 'color/brand/primary' : 'color/text/secondary');
      if (i === selected) {
        const under = rect('underline', 1, 2, tab);
        under.layoutPositioning = 'ABSOLUTE'; under.x = 0; under.y = 40;
        under.layoutAlign = 'STRETCH';
        bindFill(under, tokens, 'color/brand/primary');
      }
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/Form/Tab Strip', {
    purpose: 'Horizontal tabs dividing a form into sections.',
    pp: 'Form tabs (Unified Interface).',
  }, 'mda/form/tab-strip');
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

async function buildSection(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const cols of [1, 2, 3] as const) {
    const f = frame(`Columns=${cols}`, undefined);
    autoLayout(f, 'v', 12, { l: 20, r: 20, t: 16, b: 20 });
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
    f.resize(1184, 1);
    bindFill(f, tokens, 'color/canvas/background');
    const h = await text('Section heading', 'semibold', 14, f);
    bindText(h, tokens, 'color/text/primary');
    const body = frame('body', f);
    autoLayout(body, 'h', 24, 0);
    body.primaryAxisSizingMode = 'FIXED'; body.counterAxisSizingMode = 'AUTO';
    body.resize(1144, 1);
    for (let c = 0; c < cols; c++) {
      const col = frame(`col-${c}`, body);
      autoLayout(col, 'v', 12, 0);
      col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'FIXED';
      col.layoutGrow = 1;
      col.resize((1144 - (cols - 1) * 24) / cols, 1);
      for (let r = 0; r < 3; r++) {
        const row = frame(`fld-${r}`, col);
        autoLayout(row, 'v', 4, 0);
        row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'FIXED';
        row.resize(col.width, 1);
        const l = await text(['Name','Status','Owner'][r], 'semibold', 12, row);
        bindText(l, tokens, 'color/text/secondary');
        const box = frame('box', row);
        autoLayout(box, 'h', 0, 10);
        box.primaryAxisSizingMode = 'FIXED'; box.counterAxisSizingMode = 'FIXED';
        box.counterAxisAlignItems = 'CENTER';
        box.resize(col.width, 32);
        const ln = rect('under', col.width, 1, box);
        ln.layoutPositioning = 'ABSOLUTE'; ln.x = 0; ln.y = 31;
        bindFill(ln, tokens, 'color/stroke/default');
        const v = await text('Value', 'regular', 13, box);
        bindText(v, tokens, 'color/text/primary');
      }
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/Form/Section', {
    purpose: 'Form section with 1, 2, or 3 column layouts.',
    pp: 'Form section (Unified Interface).',
  }, 'mda/form/section');
}

// ---------------------------------------------------------------------------
// Main form composition
// ---------------------------------------------------------------------------

async function buildMainForm(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1184, 1);
  bindFill(f, tokens, 'color/canvas/surface');
  // Header
  const hdr = frame('header', f);
  autoLayout(hdr, 'v', 12, 20);
  hdr.primaryAxisSizingMode = 'AUTO'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.resize(1184, 1);
  bindFill(hdr, tokens, 'color/canvas/background');
  const title = await text('Cloud migration — Contoso Ltd', 'bold', 24, hdr);
  bindText(title, tokens, 'color/text/primary');
  const meta = await text('Open · $250,000 · Est. close Q2 2026 · Avery Brooks', 'regular', 13, hdr);
  bindText(meta, tokens, 'color/text/secondary');
  // Tabs
  const tabs = frame('tabs', f);
  autoLayout(tabs, 'h', 0, 20);
  tabs.primaryAxisSizingMode = 'FIXED'; tabs.counterAxisSizingMode = 'FIXED';
  tabs.resize(1184, 42);
  bindFill(tabs, tokens, 'color/canvas/background');
  bindStroke(tabs, tokens, 'color/stroke/subtle', 1);
  for (const [i, label] of ['Summary', 'Activities', 'Related'].entries()) {
    const tab = await text(label, i === 0 ? 'semibold' : 'regular', 13, tabs);
    bindText(tab, tokens, i === 0 ? 'color/brand/primary' : 'color/text/secondary');
  }
  // Body — two-column section
  const body = frame('body', f);
  autoLayout(body, 'h', 24, 24);
  body.primaryAxisSizingMode = 'FIXED'; body.counterAxisSizingMode = 'AUTO';
  body.resize(1184, 1);
  for (const side of ['left', 'right']) {
    const col = frame(side, body);
    autoLayout(col, 'v', 12, 16);
    col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'FIXED';
    col.layoutGrow = 1;
    col.resize((1184 - 48 - 24) / 2, 1);
    col.cornerRadius = 4;
    bindFill(col, tokens, 'color/canvas/background');
    bindStroke(col, tokens, 'color/stroke/subtle', 1);
    const h = await text(side === 'left' ? 'General' : 'Stakeholders', 'semibold', 14, col);
    bindText(h, tokens, 'color/text/primary');
    for (let r = 0; r < 4; r++) {
      const row = frame(`fld-${r}`, col);
      autoLayout(row, 'v', 4, 0);
      row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'FIXED';
      row.resize(col.width - 32, 1);
      const l = await text(['Name','Customer','Revenue','Close'][r], 'semibold', 12, row);
      bindText(l, tokens, 'color/text/secondary');
      const v = await text(['Cloud migration','Contoso Ltd','$ 250,000','Jun 30, 2026'][r], 'regular', 13, row);
      bindText(v, tokens, 'color/text/primary');
      const ln = rect('ln', col.width - 32, 1, row);
      bindFill(ln, tokens, 'color/stroke/subtle');
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Form/Main Form', {
    purpose: 'Full record form: header + tabs + two-column section layout.',
    pp: 'Main form (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/form-designer-overview',
  }, 'mda/form/main-form');
}

// ---------------------------------------------------------------------------
// Business Process Flow
// ---------------------------------------------------------------------------

async function buildBPF(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const active of [0, 1, 2, 3]) {
    const f = frame(`Active=${active}`, undefined);
    autoLayout(f, 'h', 0, 0);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(960, 48);
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const stages = ['Qualify', 'Develop', 'Propose', 'Close'];
    for (const [i, label] of stages.entries()) {
      const stage = frame(`stage-${i}`, f);
      autoLayout(stage, 'h', 8, { l: 16, r: 24, t: 0, b: 0 });
      stage.primaryAxisSizingMode = 'FIXED'; stage.counterAxisSizingMode = 'FIXED';
      stage.counterAxisAlignItems = 'CENTER';
      stage.resize(240, 48);
      if (i === active) bindFill(stage, tokens, 'color/brand/primary');
      else if (i < active) bindFill(stage, tokens, 'color/canvas/surface-alt');
      const dot = ellipse('dot', 16, 16, stage);
      bindFill(dot, tokens, i === active ? 'color/canvas/background' : i < active ? 'color/status/success' : 'color/stroke/default');
      const t = await text(label, 'semibold', 13, stage);
      bindText(t, tokens, i === active ? 'color/canvas/background' : 'color/text/primary');
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/Form/Business Process Flow', {
    purpose: 'Horizontal stage indicator driving a guided process.',
    pp: 'Business Process Flow (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-automate/business-process-flows-overview',
  }, 'mda/form/bpf');
}

// ---------------------------------------------------------------------------
// Quick View Form
// ---------------------------------------------------------------------------

async function buildQuickView(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 8, 14);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(320, 1); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/surface');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const title = await text('Contoso Ltd', 'semibold', 14, f);
  bindText(title, tokens, 'color/text/primary');
  for (const [l, v] of [['Industry','Manufacturing'],['Revenue','$ 420M'],['Primary contact','Alicia Garcia']]) {
    const row = frame('row', f);
    autoLayout(row, 'v', 2, 0);
    row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'AUTO';
    const ll = await text(l, 'semibold', 11, row);
    bindText(ll, tokens, 'color/text/secondary');
    const vv = await text(v, 'regular', 13, row);
    bindText(vv, tokens, 'color/text/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Form/Quick View Form', {
    purpose: 'Read-only inline view of a related record.',
    pp: 'Quick View form (Unified Interface).',
  }, 'mda/form/quick-view');
}

// ---------------------------------------------------------------------------
// Sub-Grid
// ---------------------------------------------------------------------------

async function buildSubGrid(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(720, 1); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  // Sub-grid header
  const hdr = frame('header', f);
  autoLayout(hdr, 'h', 12, 12);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.counterAxisAlignItems = 'CENTER';
  hdr.resize(720, 40);
  const t = await text('Contacts (4)', 'semibold', 13, hdr);
  bindText(t, tokens, 'color/text/primary');
  const pad = rect('pad', 1, 1, hdr); pad.fills = []; pad.layoutGrow = 1;
  for (const a of ['+ New', 'Add existing']) {
    const btn = await text(a, 'semibold', 12, hdr);
    bindText(btn, tokens, 'color/brand/primary');
  }
  const over = await text('⋯', 'bold', 14, hdr);
  bindText(over, tokens, 'color/text/secondary');
  // Rows
  for (let i = 0; i < 4; i++) {
    const row = frame(`row-${i}`, f);
    autoLayout(row, 'h', 12, 12);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.counterAxisAlignItems = 'CENTER';
    row.resize(720, 40);
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    const av = ellipse('av', 24, 24, row);
    bindFill(av, tokens, 'color/brand/primary');
    const n = await text(['Alicia Garcia','Bruno Hart','Ciara Nolan','Davit Petrov'][i], 'medium', 13, row);
    bindText(n, tokens, 'color/brand/primary');
    const rpad = rect('rpad', 1, 1, row); rpad.fills = []; rpad.layoutGrow = 1;
    const title = await text(['CIO','IT Director','Architect','PM'][i], 'regular', 13, row);
    bindText(title, tokens, 'color/text/secondary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Form/Sub-Grid', {
    purpose: 'Associated records grid with its own command bar.',
    pp: 'Sub-grid (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/add-edit-subgrid-on-form',
  }, 'mda/form/sub-grid');
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

async function buildTimeline(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(560, 1); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const hdr = frame('hdr', f);
  autoLayout(hdr, 'h', 12, 12);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.counterAxisAlignItems = 'CENTER';
  hdr.resize(560, 40);
  const h = await text('Timeline', 'semibold', 13, hdr);
  bindText(h, tokens, 'color/text/primary');
  const pad = rect('pad', 1, 1, hdr); pad.fills = []; pad.layoutGrow = 1;
  const add = await text('+ New activity', 'semibold', 12, hdr);
  bindText(add, tokens, 'color/brand/primary');
  // Items
  const items: Array<[string, string, string, string]> = [
    ['Email',  'Avery Brooks', '2h ago',   'Sent proposal draft to Alicia for review.'],
    ['Phone',  'Morgan Yu',    'Today',    'Discovery call — moved DB to Q2.'],
    ['Note',   'Jess Rivera',  'Yesterday','Stakeholder map updated; added CTO as approver.'],
    ['Task',   'Avery Brooks', 'Mon',      'Prep SoW with architecture team — due Fri.'],
  ];
  for (const [kind, who, when, body] of items) {
    const row = frame('item', f);
    autoLayout(row, 'h', 12, 12);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
    row.resize(560, 1);
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    const av = ellipse('av', 28, 28, row);
    bindFill(av, tokens, 'color/brand/primary');
    const col = frame('col', row);
    autoLayout(col, 'v', 4, 0);
    col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'AUTO';
    col.layoutGrow = 1;
    const head = frame('head', col);
    autoLayout(head, 'h', 8, 0);
    head.primaryAxisSizingMode = 'AUTO'; head.counterAxisSizingMode = 'AUTO';
    head.counterAxisAlignItems = 'CENTER';
    const n = await text(who, 'semibold', 13, head);
    bindText(n, tokens, 'color/text/primary');
    const kindPill = frame('k', head);
    autoLayout(kindPill, 'h', 0, { l: 6, r: 6, t: 2, b: 2 });
    kindPill.primaryAxisSizingMode = 'AUTO'; kindPill.counterAxisSizingMode = 'AUTO';
    kindPill.cornerRadius = 3;
    bindFill(kindPill, tokens, 'color/canvas/surface-alt');
    const kt = await text(kind, 'semibold', 10, kindPill);
    bindText(kt, tokens, 'color/text/secondary');
    const w = await text(when, 'regular', 11, head);
    bindText(w, tokens, 'color/text/secondary');
    const b = await text(body, 'regular', 13, col);
    b.layoutAlign = 'STRETCH';
    bindText(b, tokens, 'color/text/secondary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Form/Timeline', {
    purpose: 'Chronological feed of activities (emails, tasks, notes, calls).',
    pp: 'Timeline control (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/set-up-timeline-control',
  }, 'mda/form/timeline');
}

// ---------------------------------------------------------------------------
// Related menu
// ---------------------------------------------------------------------------

async function buildRelatedMenu(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 0, 4);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(240, 1); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/default', 1);
  for (const group of [['Common', ['Activities', 'Notes', 'Audit History']], ['Related', ['Contacts', 'Orders', 'Quotes', 'Cases']]]) {
    const g = await text(group[0] as string, 'semibold', 10, f);
    g.x = 12; g.y = 0;
    bindText(g, tokens, 'color/text/secondary');
    for (const item of group[1] as string[]) {
      const row = frame('r', f);
      autoLayout(row, 'h', 12, { l: 12, r: 12, t: 6, b: 6 });
      row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
      row.resize(240, 1);
      const ic = rect('ic', 14, 14, row);
      bindFill(ic, tokens, 'color/text/secondary');
      const t = await text(item, 'regular', 13, row);
      bindText(t, tokens, 'color/text/primary');
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Form/Related Menu', {
    purpose: 'Menu of related entities/records accessible from the form.',
    pp: 'Related tab / menu (Unified Interface).',
  }, 'mda/form/related-menu');
}

export async function buildMdaForms(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  sets.push(await buildMainForm(page, tokens));
  sets.push(await buildFormHeader(page, tokens));
  sets.push(await buildTabStrip(page, tokens));
  sets.push(await buildSection(page, tokens));
  sets.push(...(await buildMdaFormFields(page, tokens)));
  sets.push(await buildBPF(page, tokens));
  sets.push(await buildQuickView(page, tokens));
  sets.push(await buildSubGrid(page, tokens));
  sets.push(await buildTimeline(page, tokens));
  sets.push(await buildRelatedMenu(page, tokens));
  return sets;
}
