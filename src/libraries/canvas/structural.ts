/**
 * Canvas/Screen/*, Canvas/Container/*
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect } from '../../lib/layout.js';
import { bindFill, bindStroke, publishSet } from '../../lib/componentKit.js';

async function buildScreenBlank(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  const presets = [
    { key: 'Desktop', w: 1366, h: 768 },
    { key: 'Phone',   w: 640,  h: 1136 },
  ];
  for (const p of presets) {
    const f = frame(`Device=${p.key}`, undefined);
    f.resize(p.w, p.h); f.clipsContent = true;
    bindFill(f, tokens, 'color/canvas/background');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Screen/Blank', {
    purpose: 'Blank app screen at common Canvas size presets.',
    pp: 'Screen (Canvas Apps).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/add-screen-context-variables',
  }, 'canvas/screen/blank');
}

async function buildScreenScrollable(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  const presets = [
    { key: 'Desktop', w: 1366, h: 768 },
    { key: 'Phone',   w: 640,  h: 1136 },
  ];
  for (const p of presets) {
    const f = frame(`Device=${p.key}`, undefined);
    autoLayout(f, 'v', 0, 0);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(p.w, p.h); f.clipsContent = true;
    bindFill(f, tokens, 'color/canvas/background');
    const hdr = frame('sticky-header', f);
    autoLayout(hdr, 'h', 12, 16);
    hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
    hdr.resize(p.w, 56);
    bindFill(hdr, tokens, 'color/canvas/surface');
    bindStroke(hdr, tokens, 'color/stroke/subtle', 1);
    const body = rect('body-placeholder', p.w, p.h - 56, f);
    body.fills = [];
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Screen/Scrollable', {
    purpose: 'Screen with a sticky header slot above a scrollable body.',
    pp: 'Screen with docked Header container (Canvas Apps).',
  }, 'canvas/screen/scrollable');
}

async function buildContainer(
  page: PageNode,
  tokens: Tokens,
  dir: 'h' | 'v',
  name: string,
  pp: string,
  key: string,
): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const gap of [8, 16, 24]) {
    const f = frame(`Gap=${gap}`, undefined);
    autoLayout(f, dir, gap, 16);
    f.primaryAxisSizingMode = 'FIXED';
    f.counterAxisSizingMode = 'FIXED';
    f.resize(dir === 'h' ? 480 : 240, dir === 'h' ? 80 : 320);
    bindFill(f, tokens, 'color/canvas/surface');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    for (let i = 0; i < 3; i++) {
      const box = rect(`slot-${i}`, dir === 'h' ? 120 : 200, dir === 'h' ? 48 : 60, f);
      box.cornerRadius = 4;
      bindFill(box, tokens, 'color/canvas/surface-alt');
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, name, {
    purpose: `${dir === 'h' ? 'Horizontal' : 'Vertical'} auto-layout container with configurable gap.`,
    pp,
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-horizontal-container',
  }, key);
}

async function buildGridContainer(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Cols=12', undefined);
  autoLayout(f, 'h', 16, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1280, 120);
  bindFill(f, tokens, 'color/canvas/surface');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  for (let i = 0; i < 12; i++) {
    const col = rect(`col-${i+1}`, 88, 88, f);
    col.cornerRadius = 4;
    bindFill(col, tokens, 'color/canvas/surface-alt');
  }
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, 'Canvas/Container/Grid', {
    purpose: '12-column responsive grid reference.',
    pp: 'Horizontal container pattern with equal flex slots.',
  }, 'canvas/container/grid');
}

export async function buildCanvasStructural(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildScreenBlank(page, tokens),
    await buildScreenScrollable(page, tokens),
    await buildContainer(page, tokens, 'h', 'Canvas/Container/Horizontal', 'Horizontal container (Canvas Apps).', 'canvas/container/horizontal'),
    await buildContainer(page, tokens, 'v', 'Canvas/Container/Vertical', 'Vertical container (Canvas Apps).', 'canvas/container/vertical'),
    await buildGridContainer(page, tokens),
  ];
}
