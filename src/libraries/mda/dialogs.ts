/**
 * MDA/Dialog/*, MDA/Panel/* — Quick Create, Confirm, Alert, Custom, Side Panel, Inspector.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function dialogShell(tokens: Tokens, w: number, title: string): Promise<FrameNode> {
  const f = frame(title, undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(w, 1); f.cornerRadius = 6;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  return f;
}

async function buildQuickCreate(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = await dialogShell(tokens, 420, 'Default');
  // Header
  const hdr = frame('header', f);
  autoLayout(hdr, 'h', 12, { l: 16, r: 16, t: 0, b: 0 });
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.counterAxisAlignItems = 'CENTER';
  hdr.resize(420, 48);
  bindStroke(hdr, tokens, 'color/stroke/subtle', 1);
  const t = await text('Quick Create · Lead', 'semibold', 14, hdr);
  bindText(t, tokens, 'color/text/primary');
  const pad = rect('p', 1, 1, hdr); pad.fills = []; pad.layoutGrow = 1;
  const x = await text('×', 'bold', 16, hdr);
  bindText(x, tokens, 'color/text/secondary');
  // Body
  const body = frame('body', f);
  autoLayout(body, 'v', 12, 16);
  body.primaryAxisSizingMode = 'AUTO'; body.counterAxisSizingMode = 'FIXED';
  body.resize(420, 1);
  for (const label of ['Topic *', 'First name *', 'Last name *', 'Company', 'Rating']) {
    const row = frame(`r-${label}`, body);
    autoLayout(row, 'v', 4, 0);
    row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'FIXED';
    row.resize(388, 1);
    const l = await text(label, 'semibold', 12, row);
    bindText(l, tokens, 'color/text/secondary');
    const box = frame('box', row);
    autoLayout(box, 'h', 0, 10);
    box.primaryAxisSizingMode = 'FIXED'; box.counterAxisSizingMode = 'FIXED';
    box.resize(388, 32); box.cornerRadius = 4;
    bindFill(box, tokens, 'color/canvas/background');
    bindStroke(box, tokens, 'color/stroke/default', 1);
    const v = await text('—', 'regular', 13, box);
    bindText(v, tokens, 'color/text/secondary');
  }
  // Footer
  const footer = frame('footer', f);
  autoLayout(footer, 'h', 8, 16);
  footer.primaryAxisSizingMode = 'FIXED'; footer.counterAxisSizingMode = 'FIXED';
  footer.counterAxisAlignItems = 'CENTER';
  footer.primaryAxisAlignItems = 'MAX';
  footer.resize(420, 56);
  bindStroke(footer, tokens, 'color/stroke/subtle', 1);
  for (const [kind, label] of [['secondary','Cancel'], ['secondary','Save & Close'], ['primary','Save']] as const) {
    const btn = frame('btn', footer);
    autoLayout(btn, 'h', 0, { l: 12, r: 12, t: 8, b: 8 });
    btn.primaryAxisAlignItems = 'CENTER'; btn.counterAxisAlignItems = 'CENTER';
    btn.primaryAxisSizingMode = 'AUTO'; btn.counterAxisSizingMode = 'AUTO';
    btn.cornerRadius = 4;
    if (kind === 'primary') bindFill(btn, tokens, 'color/brand/primary');
    else bindStroke(btn, tokens, 'color/stroke/default', 1);
    const t = await text(label, 'semibold', 13, btn);
    bindText(t, tokens, kind === 'primary' ? 'color/canvas/background' : 'color/text/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dialog/Quick Create', {
    purpose: 'Fast record creation flyout with a subset of Main form fields.',
    pp: 'Quick Create form (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/create-edit-quick-view-forms',
  }, 'mda/dialog/quick-create');
}

async function buildConfirm(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = await dialogShell(tokens, 440, 'Default');
  const body = frame('body', f);
  autoLayout(body, 'v', 12, 24);
  body.primaryAxisSizingMode = 'AUTO'; body.counterAxisSizingMode = 'FIXED';
  body.resize(440, 1);
  const t = await text('Deactivate opportunity?', 'semibold', 18, body);
  bindText(t, tokens, 'color/text/primary');
  const b = await text('This will move the record to the Inactive state. You can reactivate it later.', 'regular', 13, body);
  b.textAutoResize = 'HEIGHT'; b.resize(392, b.height);
  bindText(b, tokens, 'color/text/secondary');
  const footer = frame('footer', f);
  autoLayout(footer, 'h', 8, 16);
  footer.primaryAxisSizingMode = 'FIXED'; footer.counterAxisSizingMode = 'FIXED';
  footer.primaryAxisAlignItems = 'MAX';
  footer.resize(440, 60);
  bindStroke(footer, tokens, 'color/stroke/subtle', 1);
  for (const [kind, label] of [['secondary','Cancel'], ['primary','Deactivate']] as const) {
    const btn = frame('b', footer);
    autoLayout(btn, 'h', 0, { l: 14, r: 14, t: 8, b: 8 });
    btn.primaryAxisAlignItems = 'CENTER'; btn.counterAxisAlignItems = 'CENTER';
    btn.primaryAxisSizingMode = 'AUTO'; btn.counterAxisSizingMode = 'AUTO';
    btn.cornerRadius = 4;
    if (kind === 'primary') bindFill(btn, tokens, 'color/brand/primary');
    else bindStroke(btn, tokens, 'color/stroke/default', 1);
    const t = await text(label, 'semibold', 13, btn);
    bindText(t, tokens, kind === 'primary' ? 'color/canvas/background' : 'color/text/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dialog/Confirm', {
    purpose: 'Two-button confirmation dialog for reversible actions.',
    pp: 'Confirm dialog (Unified Interface).',
  }, 'mda/dialog/confirm');
}

async function buildAlert(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = await dialogShell(tokens, 400, 'Default');
  const body = frame('body', f);
  autoLayout(body, 'h', 12, 20);
  body.primaryAxisSizingMode = 'FIXED'; body.counterAxisSizingMode = 'AUTO';
  body.resize(400, 1);
  const icon = ellipse('ic', 32, 32, body);
  bindFill(icon, tokens, 'color/status/warning');
  const col = frame('col', body);
  autoLayout(col, 'v', 6, 0);
  col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'AUTO';
  col.layoutGrow = 1;
  const t = await text('Could not save record', 'semibold', 15, col);
  bindText(t, tokens, 'color/text/primary');
  const m = await text('The server returned a 500. Try again later.', 'regular', 13, col);
  bindText(m, tokens, 'color/text/secondary');
  const footer = frame('footer', f);
  autoLayout(footer, 'h', 0, { l: 16, r: 16, t: 0, b: 16 });
  footer.primaryAxisSizingMode = 'FIXED'; footer.counterAxisSizingMode = 'AUTO';
  footer.primaryAxisAlignItems = 'MAX';
  footer.resize(400, 1);
  const btn = frame('b', footer);
  autoLayout(btn, 'h', 0, { l: 14, r: 14, t: 8, b: 8 });
  btn.primaryAxisSizingMode = 'AUTO'; btn.counterAxisSizingMode = 'AUTO';
  btn.cornerRadius = 4;
  bindFill(btn, tokens, 'color/brand/primary');
  const bt = await text('OK', 'semibold', 13, btn);
  bindText(bt, tokens, 'color/canvas/background');
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dialog/Alert', {
    purpose: 'Single-button dismissal dialog for informational events.',
    pp: 'Alert dialog (Unified Interface).',
  }, 'mda/dialog/alert');
}

async function buildCustom(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const size of ['Small', 'Medium', 'Large', 'Full']) {
    const w = size === 'Small' ? 400 : size === 'Medium' ? 560 : size === 'Large' ? 800 : 1200;
    const f = await dialogShell(tokens, w, `Size=${size}`);
    const hdr = frame('header', f);
    autoLayout(hdr, 'h', 12, 16);
    hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
    hdr.counterAxisAlignItems = 'CENTER';
    hdr.resize(w, 48);
    bindStroke(hdr, tokens, 'color/stroke/subtle', 1);
    const t = await text('Custom dialog', 'semibold', 14, hdr);
    bindText(t, tokens, 'color/text/primary');
    const pad = rect('p', 1, 1, hdr); pad.fills = []; pad.layoutGrow = 1;
    const x = await text('×', 'bold', 16, hdr);
    bindText(x, tokens, 'color/text/secondary');
    const body = rect('body', w, 320, f);
    body.fills = [];
    const footer = frame('footer', f);
    autoLayout(footer, 'h', 8, 16);
    footer.primaryAxisSizingMode = 'FIXED'; footer.counterAxisSizingMode = 'FIXED';
    footer.primaryAxisAlignItems = 'MAX';
    footer.resize(w, 56);
    bindStroke(footer, tokens, 'color/stroke/subtle', 1);
    for (const [kind, label] of [['secondary','Cancel'], ['primary','Done']] as const) {
      const btn = frame('b', footer);
      autoLayout(btn, 'h', 0, { l: 14, r: 14, t: 8, b: 8 });
      btn.primaryAxisSizingMode = 'AUTO'; btn.counterAxisSizingMode = 'AUTO';
      btn.cornerRadius = 4;
      if (kind === 'primary') bindFill(btn, tokens, 'color/brand/primary');
      else bindStroke(btn, tokens, 'color/stroke/default', 1);
      const bt = await text(label, 'semibold', 13, btn);
      bindText(bt, tokens, kind === 'primary' ? 'color/canvas/background' : 'color/text/primary');
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/Dialog/Custom', {
    purpose: 'Blank dialog frame at four sizes for custom content.',
    pp: 'Custom dialog (Unified Interface).',
  }, 'mda/dialog/custom');
}

async function buildSidePanel(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(420, 720);
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/default', 1);
  const hdr = frame('header', f);
  autoLayout(hdr, 'h', 12, 16);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.counterAxisAlignItems = 'CENTER';
  hdr.resize(420, 56);
  bindStroke(hdr, tokens, 'color/stroke/subtle', 1);
  const t = await text('Details', 'semibold', 16, hdr);
  bindText(t, tokens, 'color/text/primary');
  const pad = rect('p', 1, 1, hdr); pad.fills = []; pad.layoutGrow = 1;
  const x = await text('×', 'bold', 18, hdr);
  bindText(x, tokens, 'color/text/secondary');
  const body = rect('body', 420, 664, f);
  body.fills = [];
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Panel/Side Panel', {
    purpose: 'Right-anchored panel for details / context.',
    pp: 'Side panel (Unified Interface).',
  }, 'mda/panel/side-panel');
}

async function buildInspector(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 12, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(360, 720);
  bindFill(f, tokens, 'color/canvas/surface');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const h = await text('Inspector', 'semibold', 14, f);
  bindText(h, tokens, 'color/text/primary');
  for (const [l, v] of [['ID', 'OPP-1287'], ['Created', '2026-04-12 09:30 AM'], ['Modified', '2026-04-20 10:02 AM'], ['Owner', 'Avery Brooks'], ['Process', 'Opportunity Sales Process']]) {
    const row = frame('r', f);
    autoLayout(row, 'h', 8, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
    row.resize(328, 1);
    const ll = await text(l, 'semibold', 11, row);
    bindText(ll, tokens, 'color/text/secondary');
    const pad = rect('p', 1, 1, row); pad.fills = []; pad.layoutGrow = 1;
    const vv = await text(v, 'regular', 12, row);
    bindText(vv, tokens, 'color/text/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Panel/Inspector', {
    purpose: 'Right-hand details pane showing record metadata.',
    pp: 'Inspector panel (Unified Interface).',
  }, 'mda/panel/inspector');
}

export async function buildMdaDialogs(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildQuickCreate(page, tokens),
    await buildConfirm(page, tokens),
    await buildAlert(page, tokens),
    await buildCustom(page, tokens),
    await buildSidePanel(page, tokens),
    await buildInspector(page, tokens),
  ];
}
