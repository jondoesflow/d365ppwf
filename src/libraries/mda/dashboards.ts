/**
 * MDA/Dashboard/* — Layout frames (2x2, 3x2, Focused) and Tile primitives
 * (KPI, Chart, List).
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function tile(tokens: Tokens, w: number, h: number, title: string, inner: (f: FrameNode) => Promise<void>): Promise<FrameNode> {
  const f = frame(title, undefined);
  autoLayout(f, 'v', 8, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(w, h); f.cornerRadius = 6;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const t = await text(title, 'semibold', 13, f);
  bindText(t, tokens, 'color/text/secondary');
  await inner(f);
  return f;
}

async function buildKpiTile(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const trend of ['Up', 'Flat', 'Down']) {
    const f = await tile(tokens, 220, 120, `Trend=${trend}`, async (f) => {
      const val = await text('$ 1.2M', 'bold', 28, f);
      bindText(val, tokens, 'color/text/primary');
      const delta = await text(trend === 'Up' ? '▲ +8.4%' : trend === 'Down' ? '▼ −2.1%' : '● 0', 'semibold', 12, f);
      bindText(delta, tokens, trend === 'Up' ? 'color/status/success' : trend === 'Down' ? 'color/status/danger' : 'color/text/secondary');
    });
    f.name = `Trend=${trend}`;
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/Dashboard/Tile — KPI', {
    purpose: 'Single metric tile with value and trend.',
    pp: 'Dashboard KPI tile (Unified Interface).',
  }, 'mda/dashboard/tile-kpi');
}

async function buildChartTile(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = await tile(tokens, 380, 240, 'Default', async (f) => {
    const plot = frame('plot', f);
    autoLayout(plot, 'h', 4, 0);
    plot.primaryAxisSizingMode = 'FIXED'; plot.counterAxisSizingMode = 'FIXED';
    plot.counterAxisAlignItems = 'MAX';
    plot.resize(348, 176);
    for (const pct of [0.3, 0.6, 0.4, 0.75, 0.9, 0.55, 0.8, 0.65]) {
      const bar = rect('b', 36, 176 * pct, plot); bar.cornerRadius = 2;
      bindFill(bar, tokens, 'color/brand/primary');
    }
  });
  f.name = 'Default';
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dashboard/Tile — Chart', {
    purpose: 'Embedded chart on a dashboard.',
    pp: 'Dashboard chart tile (Unified Interface).',
  }, 'mda/dashboard/tile-chart');
}

async function buildListTile(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = await tile(tokens, 380, 240, 'Default', async (f) => {
    for (let i = 0; i < 5; i++) {
      const row = frame(`r-${i}`, f);
      autoLayout(row, 'h', 8, 0);
      row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
      row.counterAxisAlignItems = 'CENTER';
      row.resize(348, 1);
      bindStroke(row, tokens, 'color/stroke/subtle', 1);
      const n = await text(`Case CAS-${1200 + i}`, 'medium', 13, row);
      bindText(n, tokens, 'color/brand/primary');
      const pad = rect('p', 1, 1, row); pad.fills = []; pad.layoutGrow = 1;
      const w = await text(['2h','Today','Mon','Tue','Wed'][i], 'regular', 11, row);
      bindText(w, tokens, 'color/text/secondary');
    }
  });
  f.name = 'Default';
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dashboard/Tile — List', {
    purpose: 'List tile showing N recent records.',
    pp: 'Dashboard list tile (Unified Interface).',
  }, 'mda/dashboard/tile-list');
}

async function buildLayout2x2(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('2x2', undefined);
  autoLayout(f, 'v', 16, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(920, 520);
  bindFill(f, tokens, 'color/canvas/surface');
  for (let r = 0; r < 2; r++) {
    const row = frame(`row-${r}`, f);
    autoLayout(row, 'h', 16, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.resize(888, 240);
    for (let c = 0; c < 2; c++) {
      const t = rect('tile', 436, 240, row); t.cornerRadius = 6;
      bindFill(t, tokens, 'color/canvas/background');
      bindStroke(t, tokens, 'color/stroke/subtle', 1);
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dashboard/Layout — 2x2', {
    purpose: 'Dashboard grid with four equal tiles.',
    pp: '2x2 dashboard layout (Unified Interface).',
  }, 'mda/dashboard/layout-2x2');
}

async function buildLayout3x2(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('3x2', undefined);
  autoLayout(f, 'v', 16, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1180, 520);
  bindFill(f, tokens, 'color/canvas/surface');
  for (let r = 0; r < 2; r++) {
    const row = frame(`row-${r}`, f);
    autoLayout(row, 'h', 16, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.resize(1148, 240);
    for (let c = 0; c < 3; c++) {
      const t = rect('tile', 372, 240, row); t.cornerRadius = 6;
      bindFill(t, tokens, 'color/canvas/background');
      bindStroke(t, tokens, 'color/stroke/subtle', 1);
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dashboard/Layout — 3x2', {
    purpose: 'Dashboard grid with six equal tiles.',
    pp: '3x2 dashboard layout (Unified Interface).',
  }, 'mda/dashboard/layout-3x2');
}

async function buildLayoutFocused(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Focused', undefined);
  autoLayout(f, 'h', 16, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1180, 520);
  bindFill(f, tokens, 'color/canvas/surface');
  // 4 tiles in a 2x2 on the left
  const leftCol = frame('left', f);
  autoLayout(leftCol, 'v', 16, 0);
  leftCol.primaryAxisSizingMode = 'FIXED'; leftCol.counterAxisSizingMode = 'FIXED';
  leftCol.resize(540, 488);
  for (let r = 0; r < 2; r++) {
    const row = frame(`row-${r}`, leftCol);
    autoLayout(row, 'h', 16, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.resize(540, 236);
    for (let c = 0; c < 2; c++) {
      const t = rect('tile', 262, 236, row); t.cornerRadius = 6;
      bindFill(t, tokens, 'color/canvas/background');
      bindStroke(t, tokens, 'color/stroke/subtle', 1);
    }
  }
  // List on the right
  const list = rect('focused-list', 592, 488, f); list.cornerRadius = 6;
  bindFill(list, tokens, 'color/canvas/background');
  bindStroke(list, tokens, 'color/stroke/subtle', 1);
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Dashboard/Layout — Focused', {
    purpose: '4 KPI tiles + a dominant list tile — "focused view" pattern.',
    pp: 'Focused dashboard layout (Unified Interface).',
  }, 'mda/dashboard/layout-focused');
}

export async function buildMdaDashboards(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildLayout2x2(page, tokens),
    await buildLayout3x2(page, tokens),
    await buildLayoutFocused(page, tokens),
    await buildKpiTile(page, tokens),
    await buildChartTile(page, tokens),
    await buildListTile(page, tokens),
  ];
}
