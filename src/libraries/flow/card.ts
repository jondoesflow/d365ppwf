/**
 * Shared "flow card" factory. Every trigger / action / control renders as a
 * 360×auto card with a connector-coloured leading edge, an icon tile, a
 * title, and a subtitle showing the connector name. Consumers can then wire
 * inputs / outputs underneath.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText } from '../../lib/componentKit.js';

export interface CardSpec {
  title: string;
  connectorName: string;
  connectorColourKey: string;   // token key
  isTrigger?: boolean;
  state?: 'Default' | 'Selected' | 'Error';
}

export async function buildFlowCard(spec: CardSpec): Promise<FrameNode> {
  throw new Error('use buildFlowCardInto instead');
}

export async function buildFlowCardInto(
  tokens: Tokens,
  parent: (BaseNode & ChildrenMixin) | undefined,
  spec: CardSpec,
): Promise<FrameNode> {
  const f = frame(spec.title, parent);
  autoLayout(f, 'h', 12, { l: 0, r: 16, t: 0, b: 0 });
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.counterAxisAlignItems = 'CENTER';
  f.resize(360, 76); f.cornerRadius = 6;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, spec.state === 'Selected' ? 'color/brand/primary' : spec.state === 'Error' ? 'color/status/danger' : 'color/stroke/default', spec.state === 'Selected' ? 2 : 1);

  // Connector-coloured leading edge (rounded).
  const edge = rect('edge', 8, 76, f);
  bindFill(edge, tokens, spec.connectorColourKey);

  // Icon tile
  const iconTile = frame('icon-tile', f);
  autoLayout(iconTile, 'h', 0, 0);
  iconTile.primaryAxisSizingMode = 'FIXED'; iconTile.counterAxisSizingMode = 'FIXED';
  iconTile.primaryAxisAlignItems = 'CENTER'; iconTile.counterAxisAlignItems = 'CENTER';
  iconTile.resize(44, 44); iconTile.cornerRadius = 4;
  bindFill(iconTile, tokens, spec.connectorColourKey);
  const iconGlyph = rect('glyph', 22, 22, iconTile);
  bindFill(iconGlyph, tokens, 'color/canvas/background');

  // Text column
  const col = frame('col', f);
  autoLayout(col, 'v', 2, 0);
  col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'AUTO';
  col.layoutGrow = 1;
  const kindLabel = await text(spec.isTrigger ? 'Trigger' : 'Action', 'semibold', 10, col);
  bindText(kindLabel, tokens, 'color/text/secondary');
  const title = await text(spec.title, 'semibold', 13, col);
  bindText(title, tokens, 'color/text/primary');
  const sub = await text(spec.connectorName, 'regular', 11, col);
  bindText(sub, tokens, 'color/text/secondary');
  return f;
}

/**
 * Build a Component Set containing State=Default/Selected/Error of one card.
 */
export async function buildFlowCardSet(
  tokens: Tokens,
  spec: Omit<CardSpec, 'state'>,
): Promise<ComponentNode[]> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Selected', 'Error'] as const) {
    const f = await buildFlowCardInto(tokens, undefined, { ...spec, state });
    f.name = `State=${state}`;
    variants.push(figma.createComponentFromNode(f));
  }
  return variants;
}
