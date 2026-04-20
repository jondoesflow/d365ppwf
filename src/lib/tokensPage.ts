/**
 * Renders the `🎨 Tokens` page — visual swatches/specimens for every variable
 * and style in the Power Platform Tokens collection. Every node here binds
 * its colour/number to a variable, so the page itself re-themes when you
 * switch the collection mode from Light to Dark.
 */

import type { Tokens } from './tokens.js';
import { PALETTE } from './colors.js';
import { frame, autoLayout, rect, text, applyTypeStyle } from './layout.js';

const PAD = 40;

export async function renderTokensPage(tokens: Tokens, page: PageNode): Promise<void> {
  // ---------- Header
  const header = await text('Power Platform Tokens', 'bold', 40, page);
  header.x = PAD; header.y = PAD;
  bindTextColor(header, tokens, 'color/text/primary');

  const sub = await text('Every Variable and Style in this kit. Re-skin the library by switching the collection mode from Light to Dark.', 'regular', 14, page);
  sub.x = PAD; sub.y = PAD + 56;
  bindTextColor(sub, tokens, 'color/text/secondary');

  let cursorY = PAD + 112;

  // ---------- Colour
  cursorY = await renderSectionHeading('Colour', cursorY, tokens, page);
  const groups = groupColours();
  for (const [groupName, items] of groups) {
    const label = await text(groupName.toUpperCase(), 'semibold', 11, page);
    label.x = PAD; label.y = cursorY;
    bindTextColor(label, tokens, 'color/text/secondary');
    cursorY += 20;

    const rowFrame = frame('color-row', page);
    autoLayout(rowFrame, 'h', 16, 0);
    rowFrame.x = PAD; rowFrame.y = cursorY;
    for (const name of items) {
      const v = tokens.color.get(name);
      if (!v) continue;
      await renderSwatch(name, v, tokens, rowFrame);
    }
    cursorY += rowFrame.height + 32;
  }

  // ---------- Type
  cursorY = await renderSectionHeading('Typography', cursorY, tokens, page);
  for (const [name, style] of tokens.type) {
    const t = await text(`${name} — The quick brown fox jumps over the lazy dog`, 'regular', 14, page);
    await t.setTextStyleIdAsync(style.id);
    t.x = PAD; t.y = cursorY;
    bindTextColor(t, tokens, 'color/text/primary');
    cursorY += t.height + 12;
  }
  cursorY += 20;

  // ---------- Spacing
  cursorY = await renderSectionHeading('Spacing', cursorY, tokens, page);
  const spaceRow = frame('space-row', page);
  autoLayout(spaceRow, 'h', 32, 0);
  spaceRow.counterAxisAlignItems = 'MAX';
  spaceRow.x = PAD; spaceRow.y = cursorY;
  for (const [name, variable] of tokens.space) {
    const group = frame(name, spaceRow);
    autoLayout(group, 'v', 6, 0);
    group.counterAxisAlignItems = 'CENTER';
    const size = Number(variable.valuesByMode[tokens.lightMode]) || 0;
    const box = rect('box', Math.max(2, size), Math.max(2, size), group);
    bindFillVar(box, tokens, 'color/brand/primary');
    const labelA = await text(name.replace('space/', ''), 'semibold', 11, group);
    bindTextColor(labelA, tokens, 'color/text/primary');
    const labelB = await text(`${size}px`, 'regular', 10, group);
    bindTextColor(labelB, tokens, 'color/text/secondary');
  }
  cursorY += spaceRow.height + 40;

  // ---------- Radius
  cursorY = await renderSectionHeading('Radius', cursorY, tokens, page);
  const radiusRow = frame('radius-row', page);
  autoLayout(radiusRow, 'h', 20, 0);
  radiusRow.counterAxisAlignItems = 'CENTER';
  radiusRow.x = PAD; radiusRow.y = cursorY;
  for (const [name, variable] of tokens.radius) {
    const group = frame(name, radiusRow);
    autoLayout(group, 'v', 6, 0);
    group.counterAxisAlignItems = 'CENTER';
    const r = Math.min(24, Number(variable.valuesByMode[tokens.lightMode]) || 0);
    const box = rect('box', 56, 56, group);
    box.cornerRadius = r;
    bindFillVar(box, tokens, 'color/brand/primary');
    bindStrokeColorVar(box, tokens, 'color/stroke/default');
    const lab = await text(name.replace('radius/', ''), 'semibold', 11, group);
    bindTextColor(lab, tokens, 'color/text/primary');
  }
  cursorY += radiusRow.height + 40;

  // ---------- Elevation
  cursorY = await renderSectionHeading('Elevation', cursorY, tokens, page);
  const elevRow = frame('elev-row', page);
  autoLayout(elevRow, 'h', 32, 32);
  elevRow.x = PAD; elevRow.y = cursorY;
  for (const [name, style] of tokens.elevation) {
    const group = frame(name, elevRow);
    autoLayout(group, 'v', 10, 0);
    group.counterAxisAlignItems = 'CENTER';
    const card = rect('card', 120, 80, group);
    card.cornerRadius = 6;
    bindFillVar(card, tokens, 'color/canvas/background');
    bindStrokeColorVar(card, tokens, 'color/stroke/subtle');
    await card.setEffectStyleIdAsync(style.id);
    const lab = await text(name, 'semibold', 11, group);
    bindTextColor(lab, tokens, 'color/text/primary');
  }
  cursorY += elevRow.height + 40;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function renderSectionHeading(title: string, y: number, tokens: Tokens, page: PageNode): Promise<number> {
  const t = await text(title, 'semibold', 24, page);
  t.x = PAD; t.y = y;
  bindTextColor(t, tokens, 'color/text/primary');
  const rule = rect('rule', 1200, 1, page);
  rule.x = PAD; rule.y = y + 36;
  bindFillVar(rule, tokens, 'color/stroke/subtle');
  return y + 52;
}

async function renderSwatch(name: string, variable: Variable, tokens: Tokens, parent: FrameNode): Promise<void> {
  const col = frame(name, parent);
  autoLayout(col, 'v', 6, 0);
  col.counterAxisSizingMode = 'FIXED';
  col.resize(120, col.height);

  const swatch = rect('bg', 120, 72, col);
  swatch.cornerRadius = 4;
  bindFillVar(swatch, tokens, name);
  bindStrokeColorVar(swatch, tokens, 'color/stroke/subtle');

  const n = await text(name, 'semibold', 11, col);
  bindTextColor(n, tokens, 'color/text/primary');

  const hex = PALETTE[name]?.light ?? '';
  const v = await text(hex, 'regular', 10, col);
  bindTextColor(v, tokens, 'color/text/secondary');
}

function groupColours(): Array<[string, string[]]> {
  const groups: Record<string, string[]> = { brand: [], canvas: [], stroke: [], text: [], status: [], flow: [] };
  for (const name of Object.keys(PALETTE)) {
    for (const key of Object.keys(groups)) {
      if (name.startsWith(`color/${key}/`)) { groups[key].push(name); break; }
    }
  }
  return Object.entries(groups);
}

function bindFillVar(node: SceneNode & MinimalFillsMixin, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  const bound = figma.variables.setBoundVariableForPaint(paint, 'color', v);
  node.fills = [bound];
}

function bindStrokeColorVar(node: SceneNode & MinimalStrokesMixin, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  const bound = figma.variables.setBoundVariableForPaint(paint, 'color', v);
  node.strokes = [bound];
  node.strokeWeight = 1;
}

function bindTextColor(node: TextNode, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  const bound = figma.variables.setBoundVariableForPaint(paint, 'color', v);
  node.fills = [bound];
}
