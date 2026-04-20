/**
 * Canvas/Data/* — Gallery × 3, Data Table, Card, Form × 2, Empty State.
 * Tag / Badge / Avatar / Persona are shipped on the Primitives page.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function galleryItem(tokens: Tokens, variant: 'Default' | 'Selected' | 'Hover'): Promise<FrameNode> {
  const row = frame('GalleryItem', undefined);
  autoLayout(row, 'h', 12, { l: 16, r: 16, t: 10, b: 10 });
  row.primaryAxisSizingMode = 'FIXED';
  row.counterAxisSizingMode = 'AUTO';
  row.counterAxisAlignItems = 'CENTER';
  row.resize(360, 1);
  if (variant === 'Selected') bindFill(row, tokens, 'color/canvas/surface-alt');
  else if (variant === 'Hover') bindFill(row, tokens, 'color/canvas/surface');
  const av = ellipse('avatar', 36, 36, row);
  bindFill(av, tokens, 'color/brand/primary');
  const info = frame('info', row);
  autoLayout(info, 'v', 2, 0);
  info.primaryAxisSizingMode = 'AUTO'; info.counterAxisSizingMode = 'AUTO';
  info.layoutGrow = 1;
  const title = await text('Alicia Contoso', 'semibold', 14, info);
  bindText(title, tokens, 'color/text/primary');
  const sub = await text('alicia@contoso.com · Senior Director', 'regular', 12, info);
  bindText(sub, tokens, 'color/text/secondary');
  const chev = await text('›', 'bold', 18, row);
  bindText(chev, tokens, 'color/text/secondary');
  return row;
}

async function buildGalleryVertical(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const variant of ['Default', 'Selected', 'Hover'] as const) {
    variants.push(figma.createComponentFromNode(await (async () => {
      const f = await galleryItem(tokens, variant);
      f.name = `Variant=${variant}`;
      return f;
    })()));
  }
  return publishSet(page, variants, 'Canvas/Data/Gallery — Vertical', {
    purpose: 'Vertical gallery list item (avatar + two lines + chevron).',
    pp: 'Vertical Gallery (Modern Controls) with item template.',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-gallery',
  }, 'canvas/data/gallery-vertical');
}

async function buildGalleryHorizontal(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 12, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(720, 160);
  bindFill(f, tokens, 'color/canvas/background');
  for (let i = 0; i < 4; i++) {
    const card = frame(`card-${i}`, f);
    autoLayout(card, 'v', 8, 12);
    card.primaryAxisSizingMode = 'FIXED'; card.counterAxisSizingMode = 'FIXED';
    card.resize(160, 128);
    card.cornerRadius = 6;
    bindFill(card, tokens, 'color/canvas/surface');
    bindStroke(card, tokens, 'color/stroke/subtle', 1);
    const img = rect('image', 136, 72, card);
    img.cornerRadius = 4;
    bindFill(img, tokens, 'color/canvas/surface-alt');
    const t = await text(`Item ${i+1}`, 'semibold', 13, card);
    bindText(t, tokens, 'color/text/primary');
  }
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, 'Canvas/Data/Gallery — Horizontal', {
    purpose: 'Horizontal gallery of cards (e.g. images or summaries).',
    pp: 'Horizontal Gallery (Modern Controls).',
  }, 'canvas/data/gallery-horizontal');
}

async function buildGalleryFlexible(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 8, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO';
  f.resize(520, 1);
  bindFill(f, tokens, 'color/canvas/background');
  for (let i = 0; i < 3; i++) {
    const row = frame(`row-${i}`, f);
    autoLayout(row, 'v', 4, 12);
    row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'FIXED';
    row.resize(488, 1);
    row.cornerRadius = 6;
    bindFill(row, tokens, 'color/canvas/surface');
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    const t = await text(`Case CAS-${1000 + i}`, 'semibold', 13, row);
    bindText(t, tokens, 'color/text/primary');
    const b = await text('Body text that wraps to multiple lines when the content is long. Gallery item grows with content.', 'regular', 12, row);
    b.textAutoResize = 'HEIGHT'; b.resize(464, b.height);
    bindText(b, tokens, 'color/text/secondary');
  }
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, 'Canvas/Data/Gallery — Flexible Height', {
    purpose: 'Gallery rows that grow to content height.',
    pp: 'Flexible Height gallery (Modern Controls).',
  }, 'canvas/data/gallery-flexible');
}

async function buildDataTable(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const sel of ['Off', 'On']) {
    const f = frame(`Selection=${sel}`, undefined);
    autoLayout(f, 'v', 0, 0);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(720, 1);
    f.cornerRadius = 6;
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    // Header
    const hdr = frame('header', f);
    autoLayout(hdr, 'h', 0, 0);
    hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
    hdr.counterAxisAlignItems = 'CENTER';
    hdr.resize(720, 40);
    bindFill(hdr, tokens, 'color/canvas/surface');
    bindStroke(hdr, tokens, 'color/stroke/subtle', 1);
    const cols = sel === 'On' ? [48, 280, 180, 130, 82] : [280, 200, 140, 100];
    const colLabels = sel === 'On' ? ['', 'Name', 'Status', 'Owner', ''] : ['Name', 'Status', 'Owner', 'Due'];
    for (let c = 0; c < cols.length; c++) {
      const cell = frame(`hc-${c}`, hdr);
      autoLayout(cell, 'h', 0, { l: 12, r: 12, t: 0, b: 0 });
      cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
      cell.counterAxisAlignItems = 'CENTER';
      cell.resize(cols[c], 40);
      if (c === 0 && sel === 'On') {
        const cb = rect('cb', 16, 16, cell);
        cb.cornerRadius = 2;
        bindStroke(cb, tokens, 'color/stroke/default', 1);
      } else if (colLabels[c]) {
        const t = await text(colLabels[c], 'semibold', 12, cell);
        bindText(t, tokens, 'color/text/secondary');
      }
    }
    // Rows
    for (let r = 0; r < 5; r++) {
      const row = frame(`row-${r}`, f);
      autoLayout(row, 'h', 0, 0);
      row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
      row.counterAxisAlignItems = 'CENTER';
      row.resize(720, 44);
      if (r % 2 === 1) bindFill(row, tokens, 'color/canvas/surface');
      bindStroke(row, tokens, 'color/stroke/subtle', 1);
      const cellLabels = sel === 'On'
        ? ['', ['Cloud migration','Licensing renew','DB uplift','Teams adoption','Power BI'][r], ['Open','Won','Qualified','Working','Paused'][r], ['Avery','Morgan','Jess','Sam','Avery'][r], '⋯']
        : [['Cloud migration','Licensing renew','DB uplift','Teams adoption','Power BI'][r], ['Open','Won','Qualified','Working','Paused'][r], ['Avery','Morgan','Jess','Sam','Avery'][r], 'Q2 2026'];
      for (let c = 0; c < cols.length; c++) {
        const cell = frame(`c${r}-${c}`, row);
        autoLayout(cell, 'h', 0, { l: 12, r: 12, t: 0, b: 0 });
        cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
        cell.counterAxisAlignItems = 'CENTER';
        cell.resize(cols[c], 44);
        if (c === 0 && sel === 'On') {
          const cb = rect('cb', 16, 16, cell);
          cb.cornerRadius = 2;
          bindStroke(cb, tokens, 'color/stroke/default', 1);
        } else if (cellLabels[c]) {
          const t = await text(String(cellLabels[c]), 'regular', 13, cell);
          bindText(t, tokens, 'color/text/primary');
        }
      }
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Data/Data Table', {
    purpose: 'Tabular record view with header, rows, and optional selection column.',
    pp: 'Data Table (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-data-table',
  }, 'canvas/data/table');
}

async function buildCard(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const footer of ['None', 'Actions']) {
    const f = frame(`Footer=${footer}`, undefined);
    autoLayout(f, 'v', 12, 16);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
    f.resize(280, 1);
    f.cornerRadius = 6;
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const hdr = await text('Card title', 'semibold', 16, f);
    bindText(hdr, tokens, 'color/text/primary');
    const body = await text('Descriptive text summarising the card contents, spanning a line or two.', 'regular', 13, f);
    body.textAutoResize = 'HEIGHT'; body.resize(248, body.height);
    bindText(body, tokens, 'color/text/secondary');
    if (footer === 'Actions') {
      const actions = frame('actions', f);
      autoLayout(actions, 'h', 8, 0);
      actions.primaryAxisSizingMode = 'AUTO'; actions.counterAxisSizingMode = 'AUTO';
      const primary = frame('primary', actions);
      autoLayout(primary, 'h', 0, { l: 12, r: 12, t: 0, b: 0 });
      primary.primaryAxisAlignItems = 'CENTER'; primary.counterAxisAlignItems = 'CENTER';
      primary.primaryAxisSizingMode = 'AUTO'; primary.counterAxisSizingMode = 'FIXED';
      primary.resize(80, 32); primary.cornerRadius = 4;
      bindFill(primary, tokens, 'color/brand/primary');
      const pt = await text('Open', 'semibold', 13, primary);
      bindText(pt, tokens, 'color/canvas/background');
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Data/Card', {
    purpose: 'Composable card with title, body, and optional actions.',
    pp: 'Card container (Canvas Apps).',
  }, 'canvas/data/card');
}

async function buildForm(page: PageNode, tokens: Tokens, edit: boolean): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 16, 20);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(420, 1);
  f.cornerRadius = 6;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  for (const fld of ['Name', 'Email', 'Department']) {
    const row = frame(`row-${fld}`, f);
    autoLayout(row, 'v', 4, 0);
    row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'FIXED';
    row.resize(380, 1);
    const lbl = await text(fld, 'semibold', 12, row);
    bindText(lbl, tokens, 'color/text/primary');
    if (edit) {
      const box = frame('box', row);
      autoLayout(box, 'h', 0, 12);
      box.primaryAxisSizingMode = 'FIXED'; box.counterAxisSizingMode = 'FIXED';
      box.resize(380, 32); box.cornerRadius = 4;
      bindFill(box, tokens, 'color/canvas/background');
      bindStroke(box, tokens, 'color/stroke/default', 1);
      const v = await text('—', 'regular', 14, box);
      bindText(v, tokens, 'color/text/secondary');
    } else {
      const v = await text('Avery Brooks', 'regular', 14, row);
      bindText(v, tokens, 'color/text/primary');
    }
  }
  if (edit) {
    const footer = frame('footer', f);
    autoLayout(footer, 'h', 8, 0);
    footer.primaryAxisSizingMode = 'AUTO'; footer.counterAxisSizingMode = 'AUTO';
    footer.primaryAxisAlignItems = 'MAX';
    const cancel = frame('cancel', footer);
    autoLayout(cancel, 'h', 0, { l: 12, r: 12, t: 0, b: 0 });
    cancel.primaryAxisAlignItems = 'CENTER'; cancel.counterAxisAlignItems = 'CENTER';
    cancel.primaryAxisSizingMode = 'AUTO'; cancel.counterAxisSizingMode = 'FIXED';
    cancel.resize(80, 32); cancel.cornerRadius = 4;
    bindStroke(cancel, tokens, 'color/stroke/default', 1);
    const ct = await text('Cancel', 'semibold', 13, cancel);
    bindText(ct, tokens, 'color/text/primary');
    const save = frame('save', footer);
    autoLayout(save, 'h', 0, { l: 12, r: 12, t: 0, b: 0 });
    save.primaryAxisAlignItems = 'CENTER'; save.counterAxisAlignItems = 'CENTER';
    save.primaryAxisSizingMode = 'AUTO'; save.counterAxisSizingMode = 'FIXED';
    save.resize(80, 32); save.cornerRadius = 4;
    bindFill(save, tokens, 'color/brand/primary');
    const st = await text('Submit', 'semibold', 13, save);
    bindText(st, tokens, 'color/canvas/background');
  }
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, edit ? 'Canvas/Data/Form — Edit' : 'Canvas/Data/Form — Display', {
    purpose: edit ? 'Editable form with fields plus submit footer.' : 'Read-only display of record fields.',
    pp: edit ? 'Edit form (Canvas Apps).' : 'Display form (Canvas Apps).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-form-detail',
  }, edit ? 'canvas/data/form-edit' : 'canvas/data/form-display');
}

async function buildEmptyState(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 12, 40);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.counterAxisAlignItems = 'CENTER';
  f.resize(360, 1);
  const placeholder = rect('art', 96, 96, f);
  placeholder.cornerRadius = 48;
  bindFill(placeholder, tokens, 'color/canvas/surface-alt');
  const t = await text('Nothing here yet', 'semibold', 18, f);
  bindText(t, tokens, 'color/text/primary');
  const d = await text('Get started by creating your first record.', 'regular', 13, f);
  bindText(d, tokens, 'color/text/secondary');
  const cta = frame('cta', f);
  autoLayout(cta, 'h', 0, { l: 14, r: 14, t: 8, b: 8 });
  cta.primaryAxisAlignItems = 'CENTER'; cta.counterAxisAlignItems = 'CENTER';
  cta.primaryAxisSizingMode = 'AUTO'; cta.counterAxisSizingMode = 'AUTO';
  cta.cornerRadius = 4;
  bindFill(cta, tokens, 'color/brand/primary');
  const ct = await text('Create new', 'semibold', 13, cta);
  bindText(ct, tokens, 'color/canvas/background');
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, 'Canvas/Data/Empty State', {
    purpose: 'Message + call-to-action shown when a collection is empty.',
    pp: 'Empty-state pattern (Canvas Apps).',
  }, 'canvas/data/empty-state');
}

export async function buildCanvasData(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildGalleryVertical(page, tokens),
    await buildGalleryHorizontal(page, tokens),
    await buildGalleryFlexible(page, tokens),
    await buildDataTable(page, tokens),
    await buildCard(page, tokens),
    await buildForm(page, tokens, true),
    await buildForm(page, tokens, false),
    await buildEmptyState(page, tokens),
  ];
}
