/**
 * 📐 Wireframe Examples — realistic compositions per library. Kept compact
 * by delegating to the existing layout + componentKit helpers; intentionally
 * does not instantiate from the stable-id registry (that's riskier and can
 * be swapped in later).
 */

import type { Tokens } from '../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../lib/layout.js';
import { bindFill, bindStroke, bindText } from '../lib/componentKit.js';
import { buildFlowCardInto } from '../libraries/flow/card.js';

async function sectionLabel(page: PageNode, tokens: Tokens, title: string, subtitle: string, x: number, y: number): Promise<void> {
  const t = await text(title, 'semibold', 22, page);
  t.x = x; t.y = y;
  bindText(t, tokens, 'color/text/primary');
  const s = await text(subtitle, 'regular', 13, page);
  s.x = x; s.y = y + 30;
  bindText(s, tokens, 'color/text/secondary');
}

async function chip(parent: FrameNode, tokens: Tokens, label: string, fg: string, bg: string): Promise<void> {
  const f = frame('chip', parent);
  autoLayout(f, 'h', 0, { l: 8, r: 8, t: 2, b: 2 });
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.cornerRadius = 4;
  bindFill(f, tokens, bg);
  const t = await text(label, 'semibold', 11, f);
  bindText(t, tokens, fg);
}

async function btn(parent: FrameNode, tokens: Tokens, label: string, primary: boolean): Promise<FrameNode> {
  const f = frame('btn', parent);
  autoLayout(f, 'h', 0, { l: 14, r: 14, t: 8, b: 8 });
  f.primaryAxisAlignItems = 'CENTER'; f.counterAxisAlignItems = 'CENTER';
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.cornerRadius = 4;
  if (primary) bindFill(f, tokens, 'color/brand/primary');
  else bindStroke(f, tokens, 'color/stroke/default', 1);
  const t = await text(label, 'semibold', 13, f);
  bindText(t, tokens, primary ? 'color/canvas/background' : 'color/text/primary');
  return f;
}

async function labeledField(parent: FrameNode, tokens: Tokens, label: string, value: string): Promise<void> {
  const row = frame('f', parent);
  autoLayout(row, 'v', 4, 0);
  row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'FIXED';
  row.resize(parent.width - 32, 1);
  const l = await text(label, 'semibold', 12, row);
  bindText(l, tokens, 'color/text/secondary');
  const v = await text(value, 'regular', 14, row);
  bindText(v, tokens, 'color/text/primary');
  const ln = rect('ln', parent.width - 32, 1, row);
  bindFill(ln, tokens, 'color/stroke/subtle');
}

// ---------- Canvas examples ----------

async function canvasApproval(page: PageNode, tokens: Tokens, x: number, y: number): Promise<void> {
  const f = frame('Canvas · Approval request', page);
  autoLayout(f, 'v', 16, 24);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(520, 1); f.cornerRadius = 8;
  f.x = x; f.y = y;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const h = await text('Approval request', 'semibold', 20, f);
  bindText(h, tokens, 'color/text/primary');
  const s = await text('Requested by Avery Brooks · Yesterday', 'regular', 13, f);
  bindText(s, tokens, 'color/text/secondary');
  const body = frame('body', f);
  autoLayout(body, 'v', 12, 16);
  body.primaryAxisSizingMode = 'AUTO'; body.counterAxisSizingMode = 'FIXED';
  body.resize(472, 1); body.cornerRadius = 4;
  bindFill(body, tokens, 'color/canvas/surface');
  await labeledField(body, tokens, 'Amount', '$ 4,200.00');
  await labeledField(body, tokens, 'Category', 'Travel — client visit');
  await labeledField(body, tokens, 'Justification', 'Two-day on-site with Contoso to close Q2 deal.');
  const actions = frame('actions', f);
  autoLayout(actions, 'h', 8, 0);
  actions.primaryAxisSizingMode = 'AUTO'; actions.counterAxisSizingMode = 'AUTO';
  actions.primaryAxisAlignItems = 'MAX';
  await btn(actions, tokens, 'Reject', false);
  await btn(actions, tokens, 'Approve', true);
}

async function canvasCaseList(page: PageNode, tokens: Tokens, x: number, y: number): Promise<void> {
  const f = frame('Canvas · Case list', page);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(520, 1); f.cornerRadius = 8;
  f.x = x; f.y = y;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const hdr = frame('hdr', f);
  autoLayout(hdr, 'h', 12, 20);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.counterAxisAlignItems = 'CENTER';
  hdr.resize(520, 56);
  bindFill(hdr, tokens, 'color/brand/primary');
  const t = await text('My cases', 'semibold', 16, hdr);
  bindText(t, tokens, 'color/canvas/background');
  const pad = rect('p', 1, 1, hdr); pad.fills = []; pad.layoutGrow = 1;
  const count = await text('12 open', 'regular', 13, hdr);
  bindText(count, tokens, 'color/canvas/background');
  const cases = [
    ['Printer offline on Floor 3',  'Contoso',  'High',   'danger'],
    ['Laptop won\'t charge',         'Fabrikam', 'Normal', 'neutral'],
    ['VPN intermittent',             'Litware',  'High',   'danger'],
    ['Email disk full',              'Tailwind', 'Low',    'neutral'],
    ['SSO login error',              'Northwind','High',   'danger'],
  ];
  for (let i = 0; i < cases.length; i++) {
    const row = frame('r', f);
    autoLayout(row, 'h', 12, 16);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.counterAxisAlignItems = 'CENTER';
    row.resize(520, 56);
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    const av = ellipse('av', 32, 32, row);
    bindFill(av, tokens, 'color/canvas/surface-alt');
    const col = frame('c', row);
    autoLayout(col, 'v', 2, 0);
    col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'AUTO';
    col.layoutGrow = 1;
    const title = await text(cases[i][0], 'semibold', 13, col);
    bindText(title, tokens, 'color/text/primary');
    const meta = await text(`${cases[i][1]} · CAS-${1200 + i}`, 'regular', 11, col);
    bindText(meta, tokens, 'color/text/secondary');
    await chip(row, tokens, cases[i][2],
      cases[i][3] === 'danger' ? 'color/canvas/background' : 'color/text/primary',
      cases[i][3] === 'danger' ? 'color/status/danger' : 'color/canvas/surface-alt');
  }
}

// ---------- MDA example ----------

async function mdaDashboard(page: PageNode, tokens: Tokens, x: number, y: number): Promise<void> {
  const f = frame('MDA · Sales Activity Dashboard', page);
  autoLayout(f, 'v', 16, 20);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(880, 1); f.cornerRadius = 6;
  f.x = x; f.y = y;
  bindFill(f, tokens, 'color/canvas/surface');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const h = await text('Sales Activity Dashboard', 'semibold', 22, f);
  bindText(h, tokens, 'color/text/primary');
  const kpis = frame('kpis', f);
  autoLayout(kpis, 'h', 16, 0);
  kpis.primaryAxisSizingMode = 'FIXED'; kpis.counterAxisSizingMode = 'FIXED';
  kpis.resize(840, 110);
  for (const [label, value, delta, tone] of [
    ['Open revenue', '$ 1.2M', '+8.4%', 'color/status/success'],
    ['Pipeline',     '142',    '+12',   'color/status/success'],
    ['Won MTD',      '$ 328K', '+14.1%','color/status/success'],
    ['Avg deal',     '$ 18.5K','-2.1%', 'color/status/danger'],
  ] as const) {
    const tile = frame(label, kpis);
    autoLayout(tile, 'v', 6, 16);
    tile.primaryAxisSizingMode = 'FIXED'; tile.counterAxisSizingMode = 'FIXED';
    tile.resize(198, 110); tile.cornerRadius = 6;
    bindFill(tile, tokens, 'color/canvas/background');
    bindStroke(tile, tokens, 'color/stroke/subtle', 1);
    const l = await text(label, 'semibold', 11, tile);
    bindText(l, tokens, 'color/text/secondary');
    const v = await text(value, 'bold', 26, tile);
    bindText(v, tokens, 'color/text/primary');
    const d = await text(delta, 'semibold', 12, tile);
    bindText(d, tokens, tone);
  }
  const chart = frame('chart', f);
  autoLayout(chart, 'h', 6, 16);
  chart.primaryAxisSizingMode = 'FIXED'; chart.counterAxisSizingMode = 'FIXED';
  chart.counterAxisAlignItems = 'MAX';
  chart.resize(840, 200); chart.cornerRadius = 6;
  bindFill(chart, tokens, 'color/canvas/background');
  bindStroke(chart, tokens, 'color/stroke/subtle', 1);
  for (const pct of [0.4, 0.55, 0.3, 0.72, 0.85, 0.6, 0.78, 0.92, 0.68, 0.8, 0.7, 0.95]) {
    const bar = rect('bar', 48, 160 * pct, chart); bar.cornerRadius = 2;
    bindFill(bar, tokens, 'color/brand/primary');
  }
}

// ---------- Flow example ----------

async function flowCaseIntake(page: PageNode, tokens: Tokens, x: number, y: number): Promise<void> {
  const f = frame('Flow · Case intake with approval', page);
  autoLayout(f, 'v', 20, 24);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.counterAxisAlignItems = 'CENTER';
  f.resize(460, 1); f.cornerRadius = 8;
  f.x = x; f.y = y;
  bindFill(f, tokens, 'color/canvas/surface');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const h = await text('Case intake with approval', 'semibold', 18, f);
  bindText(h, tokens, 'color/text/primary');
  const nodes: Array<[string, string, string, boolean]> = [
    ['When a new Case is created', 'Microsoft Dataverse', 'color/flow/connector-dataverse', true],
    ['Get related Account',        'Microsoft Dataverse', 'color/flow/connector-dataverse', false],
    ['Start and wait for approval','Approvals',           'color/flow/action', false],
    ['Post message to Teams',      'Microsoft Teams',     'color/flow/connector-teams', false],
  ];
  for (const [title, conn, key, isTrigger] of nodes) {
    const card = await buildFlowCardInto(tokens, f, {
      title, connectorName: conn, connectorColourKey: key, isTrigger,
    });
    // Connector between nodes
  }
}

// ---------- Orchestrator ----------

export async function buildExamplesPage(tokens: Tokens, page: PageNode): Promise<void> {
  const title = await text('Wireframe Examples', 'bold', 40, page);
  title.x = 40; title.y = 40;
  bindText(title, tokens, 'color/text/primary');
  const sub = await text('Composed screens demonstrating realistic combinations of the components on the other library pages.', 'regular', 14, page);
  sub.x = 40; sub.y = 96; sub.textAutoResize = 'HEIGHT'; sub.resize(900, sub.height);
  bindText(sub, tokens, 'color/text/secondary');

  await sectionLabel(page, tokens, 'Canvas Apps', 'Approval request · Case list', 40, 160);
  await canvasApproval(page, tokens, 40, 220);
  await canvasCaseList(page, tokens, 600, 220);

  await sectionLabel(page, tokens, 'Model-Driven Apps', 'Sales activity dashboard', 40, 860);
  await mdaDashboard(page, tokens, 40, 920);

  await sectionLabel(page, tokens, 'Power Automate', 'Case intake with approval', 40, 1360);
  await flowCaseIntake(page, tokens, 40, 1420);
}
