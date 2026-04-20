/**
 * Small set of layout helpers. All containers use auto-layout; consumers
 * then bind padding / itemSpacing to spacing Variables.
 */

import type { Tokens } from './tokens.js';
import { fontFor, type Weight } from './fonts.js';

export function frame(name: string, parent?: (BaseNode & ChildrenMixin)): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.fills = [];
  if (parent) parent.appendChild(f);
  return f;
}

export function autoLayout(
  f: FrameNode,
  dir: 'h' | 'v',
  itemSpacing: number,
  padding: number | { l?: number; r?: number; t?: number; b?: number },
): FrameNode {
  f.layoutMode = dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
  f.itemSpacing = itemSpacing;
  if (typeof padding === 'number') {
    f.paddingLeft = padding; f.paddingRight = padding;
    f.paddingTop = padding; f.paddingBottom = padding;
  } else {
    f.paddingLeft = padding.l ?? 0; f.paddingRight = padding.r ?? 0;
    f.paddingTop = padding.t ?? 0; f.paddingBottom = padding.b ?? 0;
  }
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  return f;
}

export function rect(
  name: string,
  w: number,
  h: number,
  parent?: (BaseNode & ChildrenMixin),
): RectangleNode {
  const r = figma.createRectangle();
  r.name = name;
  r.resizeWithoutConstraints(Math.max(1, w), Math.max(1, h));
  r.fills = [];
  if (parent) parent.appendChild(r);
  return r;
}

export function ellipse(
  name: string,
  w: number,
  h: number,
  parent?: (BaseNode & ChildrenMixin),
): EllipseNode {
  const e = figma.createEllipse();
  e.name = name;
  e.resizeWithoutConstraints(Math.max(1, w), Math.max(1, h));
  e.fills = [];
  if (parent) parent.appendChild(e);
  return e;
}

export async function text(
  str: string,
  weight: Weight,
  size: number,
  parent?: (BaseNode & ChildrenMixin),
): Promise<TextNode> {
  const t = figma.createText();
  t.fontName = await fontFor(weight);
  t.fontSize = size;
  t.characters = str;
  if (parent) parent.appendChild(t);
  return t;
}

/**
 * Apply a named text style from the tokens set.
 */
export async function applyTypeStyle(node: TextNode, tokens: Tokens, styleName: string): Promise<void> {
  const s = tokens.type.get(styleName);
  if (s) await node.setTextStyleIdAsync(s.id);
}

export interface GridLayoutOptions {
  cols?: number;
  gap?: number;
  x?: number;
  y?: number;
}

export function placeGrid(
  items: ReadonlyArray<SceneNode>,
  opts: GridLayoutOptions = {},
): { width: number; height: number } {
  const cols = opts.cols ?? 4;
  const gap = opts.gap ?? 64;
  const x0 = opts.x ?? 0;
  const y0 = opts.y ?? 0;
  const rowHeights: number[] = [];
  const colWidths: number[] = [];
  for (let i = 0; i < items.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const node = items[i];
    rowHeights[r] = Math.max(rowHeights[r] ?? 0, node.height);
    colWidths[c] = Math.max(colWidths[c] ?? 0, node.width);
  }
  let totalW = 0;
  for (const w of colWidths) totalW += w + gap;
  let totalH = 0;
  for (const h of rowHeights) totalH += h + gap;
  for (let i = 0; i < items.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = x0 + colWidths.slice(0, c).reduce((a, b) => a + b + gap, 0);
    const y = y0 + rowHeights.slice(0, r).reduce((a, b) => a + b + gap, 0);
    items[i].x = x; items[i].y = y;
  }
  return { width: totalW - gap, height: totalH - gap };
}
