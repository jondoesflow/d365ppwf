/**
 * Canvas/Chart/* — visual wireframe placeholders (Bar, Column, Line, Pie, Donut, KPI).
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

function chartShell(tokens: Tokens, w = 320, h = 200): FrameNode {
  const f = frame('Chart', undefined);
  autoLayout(f, 'v', 8, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(w, h); f.cornerRadius = 6;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  return f;
}

async function buildBar(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = chartShell(tokens);
  const t = await text('Revenue by region', 'semibold', 13, f);
  bindText(t, tokens, 'color/text/primary');
  const plot = frame('plot', f);
  autoLayout(plot, 'h', 8, 0);
  plot.primaryAxisSizingMode = 'FIXED'; plot.counterAxisSizingMode = 'FIXED';
  plot.counterAxisAlignItems = 'MAX';
  plot.resize(288, 140);
  for (const pct of [0.5, 0.8, 0.3, 0.65, 0.9, 0.7, 0.45]) {
    const bar = rect('bar', 32, 140 * pct, plot);
    bar.cornerRadius = 2;
    bindFill(bar, tokens, 'color/brand/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Canvas/Chart/Bar', {
    purpose: 'Horizontal bar chart wireframe placeholder.',
    pp: 'Power BI Bar visual / Chart control (Modern).',
  }, 'canvas/chart/bar');
}

async function buildColumn(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = chartShell(tokens);
  const t = await text('Deals per month', 'semibold', 13, f);
  bindText(t, tokens, 'color/text/primary');
  const plot = frame('plot', f);
  autoLayout(plot, 'h', 8, 0);
  plot.primaryAxisSizingMode = 'FIXED'; plot.counterAxisSizingMode = 'FIXED';
  plot.counterAxisAlignItems = 'MAX';
  plot.resize(288, 140);
  for (const pct of [0.4, 0.6, 0.55, 0.75, 0.9, 0.8, 0.65, 0.85]) {
    const bar = rect('col', 24, 140 * pct, plot);
    bar.cornerRadius = 2;
    bindFill(bar, tokens, 'color/brand/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Canvas/Chart/Column', {
    purpose: 'Vertical column chart wireframe placeholder.',
    pp: 'Power BI Column visual / Chart control (Modern).',
  }, 'canvas/chart/column');
}

async function buildLine(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = chartShell(tokens);
  const t = await text('Pipeline trend', 'semibold', 13, f);
  bindText(t, tokens, 'color/text/primary');
  const plot = frame('plot', f);
  plot.resize(288, 140);
  plot.layoutAlign = 'STRETCH';
  const path = figma.createVector();
  path.strokes = [];
  path.vectorPaths = [{
    windingRule: 'NONZERO',
    data: 'M 0 100 L 40 80 L 80 90 L 120 60 L 160 70 L 200 40 L 240 50 L 280 20',
  }];
  path.strokeWeight = 2;
  bindStroke(path, tokens, 'color/brand/primary', 2);
  path.resize(288, 140);
  plot.appendChild(path);
  return publishSet(page, [figma.createComponentFromNode(f)], 'Canvas/Chart/Line', {
    purpose: 'Line chart wireframe placeholder.',
    pp: 'Power BI Line visual / Chart control (Modern).',
  }, 'canvas/chart/line');
}

async function buildPie(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = chartShell(tokens, 260, 260);
  const t = await text('Share by source', 'semibold', 13, f);
  bindText(t, tokens, 'color/text/primary');
  const circ = ellipse('pie', 180, 180, f);
  bindFill(circ, tokens, 'color/brand/primary');
  return publishSet(page, [figma.createComponentFromNode(f)], 'Canvas/Chart/Pie', {
    purpose: 'Pie chart wireframe placeholder.',
    pp: 'Power BI Pie visual / Chart control (Modern).',
  }, 'canvas/chart/pie');
}

async function buildDonut(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = chartShell(tokens, 260, 260);
  const t = await text('Status mix', 'semibold', 13, f);
  bindText(t, tokens, 'color/text/primary');
  const circ = ellipse('donut', 180, 180, f);
  circ.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 0.6 };
  bindFill(circ, tokens, 'color/brand/primary');
  return publishSet(page, [figma.createComponentFromNode(f)], 'Canvas/Chart/Donut', {
    purpose: 'Donut chart wireframe placeholder.',
    pp: 'Power BI Donut visual / Chart control (Modern).',
  }, 'canvas/chart/donut');
}

async function buildKPI(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const trend of ['Up', 'Flat', 'Down']) {
    const f = frame(`Trend=${trend}`, undefined);
    autoLayout(f, 'v', 4, 16);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
    f.resize(200, 1); f.cornerRadius = 6;
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const label = await text('Open deals', 'semibold', 12, f);
    bindText(label, tokens, 'color/text/secondary');
    const val = await text('142', 'bold', 32, f);
    bindText(val, tokens, 'color/text/primary');
    const delta = await text(`${trend === 'Up' ? '▲ +12' : trend === 'Down' ? '▼ −4' : '● 0'}`, 'semibold', 12, f);
    bindText(delta, tokens, trend === 'Up' ? 'color/status/success' : trend === 'Down' ? 'color/status/danger' : 'color/text/secondary');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Chart/KPI', {
    purpose: 'Single-value tile with trend indicator.',
    pp: 'Power BI KPI / Canvas Card pattern.',
  }, 'canvas/chart/kpi');
}

export async function buildCanvasCharts(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildBar(page, tokens),
    await buildColumn(page, tokens),
    await buildLine(page, tokens),
    await buildPie(page, tokens),
    await buildDonut(page, tokens),
    await buildKPI(page, tokens),
  ];
}
