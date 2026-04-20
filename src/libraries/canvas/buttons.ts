/**
 * Canvas/Button/* — Primary / Secondary / Subtle / Transparent / Icon Only / Split
 * Variants: State × Size
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

type Appearance = 'Primary' | 'Secondary' | 'Subtle' | 'Transparent';
type State = 'Default' | 'Hover' | 'Pressed' | 'Disabled';
type Size = 'Small' | 'Medium' | 'Large';

const SIZES: Record<Size, { h: number; pad: number; gap: number; font: number; }> = {
  Small:  { h: 24, pad: 8,  gap: 4, font: 12 },
  Medium: { h: 32, pad: 12, gap: 6, font: 14 },
  Large:  { h: 40, pad: 16, gap: 8, font: 16 },
};

function appearanceColors(appearance: Appearance, state: State): { bg?: string; bgAlt?: string; border?: string; fg: string; } {
  if (state === 'Disabled') {
    return {
      bg: appearance === 'Primary' ? 'color/canvas/surface-alt' : undefined,
      border: appearance === 'Secondary' ? 'color/stroke/subtle' : undefined,
      fg: 'color/text/disabled',
    };
  }
  switch (appearance) {
    case 'Primary': {
      const bg = state === 'Hover' ? 'color/brand/primary-hover' : state === 'Pressed' ? 'color/brand/primary-pressed' : 'color/brand/primary';
      return { bg, fg: 'color/canvas/background' };
    }
    case 'Secondary': {
      const bg = state === 'Hover' ? 'color/canvas/surface-alt' : 'color/canvas/background';
      return { bg, border: 'color/stroke/default', fg: 'color/text/primary' };
    }
    case 'Subtle': {
      const bg = state === 'Default' ? undefined : 'color/canvas/surface-alt';
      return { bg, fg: 'color/text/primary' };
    }
    case 'Transparent':
    default:
      return { fg: 'color/brand/primary' };
  }
}

async function buildButtonVariant(
  tokens: Tokens,
  appearance: Appearance,
  state: State,
  size: Size,
): Promise<ComponentNode> {
  const s = SIZES[size];
  const colors = appearanceColors(appearance, state);
  const f = frame(`State=${state}, Size=${size}`, undefined);
  autoLayout(f, 'h', s.gap, { l: s.pad, r: s.pad, t: 0, b: 0 });
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'FIXED';
  f.counterAxisAlignItems = 'CENTER';
  f.primaryAxisAlignItems = 'CENTER';
  f.resize(f.width, s.h);
  f.cornerRadius = 4;
  if (colors.bg) bindFill(f, tokens, colors.bg);
  if (colors.border) bindStroke(f, tokens, colors.border, 1);
  const t = await text('Button', 'semibold', s.font, f);
  bindText(t, tokens, colors.fg);
  return figma.createComponentFromNode(f);
}

async function buildAppearanceSet(
  page: PageNode,
  tokens: Tokens,
  appearance: Appearance,
): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Hover', 'Pressed', 'Disabled'] as State[]) {
    for (const size of ['Small', 'Medium', 'Large'] as Size[]) {
      variants.push(await buildButtonVariant(tokens, appearance, state, size));
    }
  }
  return publishSet(page, variants, `Canvas/Button/${appearance}`, {
    purpose: `${appearance} emphasis Fluent-style button.`,
    pp: 'Button (Modern Controls) — appearance variants',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-button',
  }, `canvas/button/${appearance.toLowerCase()}`);
}

async function buildIconOnlyButtonSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Hover', 'Pressed', 'Disabled'] as State[]) {
    for (const size of ['Small', 'Medium', 'Large'] as Size[]) {
      const s = SIZES[size];
      const f = frame(`State=${state}, Size=${size}`, undefined);
      autoLayout(f, 'h', 0, 0);
      f.primaryAxisSizingMode = 'FIXED';
      f.counterAxisSizingMode = 'FIXED';
      f.primaryAxisAlignItems = 'CENTER';
      f.counterAxisAlignItems = 'CENTER';
      f.resize(s.h, s.h);
      f.cornerRadius = 4;
      if (state !== 'Default') bindFill(f, tokens, state === 'Pressed' ? 'color/canvas/surface' : 'color/canvas/surface-alt');
      bindStroke(f, tokens, 'color/stroke/default', 1);
      const glyph = figma.createRectangle();
      glyph.resize(16, 16); glyph.fills = []; glyph.name = 'icon';
      bindStroke(glyph, tokens, state === 'Disabled' ? 'color/text/disabled' : 'color/text/primary');
      f.appendChild(glyph);
      variants.push(figma.createComponentFromNode(f));
    }
  }
  return publishSet(page, variants, 'Canvas/Button/Icon Only', {
    purpose: 'Square icon button. Use with Instance Swap on the icon child.',
    pp: 'Button with only Icon property set (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-button',
  }, 'canvas/button/icon-only');
}

async function buildSplitButtonSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Hover', 'Disabled'] as State[]) {
    const f = frame(`State=${state}`, undefined);
    autoLayout(f, 'h', 0, 0);
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'FIXED';
    f.counterAxisAlignItems = 'CENTER';
    f.resize(f.width, 32);
    const left = frame('primary', f);
    autoLayout(left, 'h', 6, { l: 12, r: 12, t: 0, b: 0 });
    left.counterAxisSizingMode = 'FIXED'; left.primaryAxisSizingMode = 'AUTO';
    left.counterAxisAlignItems = 'CENTER';
    left.resize(left.width, 32);
    const colors = appearanceColors('Primary', state);
    if (colors.bg) bindFill(left, tokens, colors.bg);
    const txt = await text('Primary action', 'semibold', 14, left);
    bindText(txt, tokens, colors.fg);
    const chev = frame('chev', f);
    autoLayout(chev, 'h', 0, 0);
    chev.counterAxisSizingMode = 'FIXED'; chev.primaryAxisSizingMode = 'FIXED';
    chev.counterAxisAlignItems = 'CENTER'; chev.primaryAxisAlignItems = 'CENTER';
    chev.resize(32, 32);
    if (colors.bg) bindFill(chev, tokens, state === 'Hover' ? 'color/brand/primary-pressed' : 'color/brand/primary-hover');
    const c = await text('▾', 'bold', 12, chev);
    bindText(c, tokens, colors.fg);
    f.cornerRadius = 4;
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Button/Split Button', {
    purpose: 'Primary action plus a dropdown of related actions.',
    pp: 'Command Bar split button pattern (Modern Controls).',
    docs: 'https://react.fluentui.dev/?path=/docs/components-button-splitbutton--docs',
  }, 'canvas/button/split');
}

export async function buildCanvasButtons(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  for (const a of ['Primary', 'Secondary', 'Subtle', 'Transparent'] as Appearance[]) {
    sets.push(await buildAppearanceSet(page, tokens, a));
  }
  sets.push(await buildIconOnlyButtonSet(page, tokens));
  sets.push(await buildSplitButtonSet(page, tokens));
  return sets;
}
