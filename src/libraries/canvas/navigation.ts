/**
 * Canvas/Nav/* — App Header, Side Menu, Breadcrumb, Tabs
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function buildAppHeader(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const width of [1280, 768]) {
    const f = frame(`Width=${width}`, undefined);
    autoLayout(f, 'h', 16, { l: 20, r: 20, t: 0, b: 0 });
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.counterAxisAlignItems = 'CENTER';
    f.resize(width, 56);
    bindFill(f, tokens, 'color/brand/primary');
    const logo = rect('logo', 28, 28, f);
    logo.cornerRadius = 4;
    bindFill(logo, tokens, 'color/canvas/background');
    const title = await text('App Title', 'semibold', 16, f);
    bindText(title, tokens, 'color/canvas/background');
    const pad = rect('pad', 1, 1, f); pad.fills = []; pad.layoutGrow = 1;
    const av = ellipse('avatar', 32, 32, f);
    bindFill(av, tokens, 'color/brand/primary-hover');
    const over = await text('⋯', 'bold', 20, f);
    bindText(over, tokens, 'color/canvas/background');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Nav/App Header', {
    purpose: 'Top-bar with logo, title, and trailing user/overflow.',
    pp: 'App header container (Canvas Apps Modern Controls).',
  }, 'canvas/nav/app-header');
}

async function buildSideMenu(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Expanded', 'Collapsed']) {
    const w = state === 'Expanded' ? 240 : 64;
    const f = frame(`State=${state}`, undefined);
    autoLayout(f, 'v', 4, { l: 8, r: 8, t: 12, b: 12 });
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(w, 480);
    bindFill(f, tokens, 'color/canvas/surface');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    for (let i = 0; i < 6; i++) {
      const row = frame(`item-${i}`, f);
      autoLayout(row, 'h', 12, { l: 12, r: 12, t: 0, b: 0 });
      row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
      row.counterAxisAlignItems = 'CENTER';
      row.resize(w - 16, 36);
      row.cornerRadius = 4;
      if (i === 0) bindFill(row, tokens, 'color/canvas/surface-alt');
      const ic = rect('icon', 20, 20, row);
      bindFill(ic, tokens, i === 0 ? 'color/brand/primary' : 'color/text/secondary');
      if (state === 'Expanded') {
        const lbl = await text(['Dashboard','Records','Activities','Reports','Tools','Settings'][i], i === 0 ? 'semibold' : 'regular', 14, row);
        bindText(lbl, tokens, i === 0 ? 'color/brand/primary' : 'color/text/primary');
      }
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Nav/Side Menu', {
    purpose: 'Vertical navigation rail, expandable to reveal labels.',
    pp: 'Side navigation pattern (Canvas Apps).',
  }, 'canvas/nav/side-menu');
}

async function buildBreadcrumb(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 8, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'CENTER';
  const parts = ['Home', 'Projects', 'Cloud migration'];
  for (let i = 0; i < parts.length; i++) {
    const t = await text(parts[i], i === parts.length - 1 ? 'semibold' : 'regular', 13, f);
    bindText(t, tokens, i === parts.length - 1 ? 'color/text/primary' : 'color/text/secondary');
    if (i < parts.length - 1) {
      const sep = await text('›', 'regular', 13, f);
      bindText(sep, tokens, 'color/text/secondary');
    }
  }
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, 'Canvas/Nav/Breadcrumb', {
    purpose: 'Hierarchical location indicator.',
    pp: 'Breadcrumb pattern (Canvas Apps).',
  }, 'canvas/nav/breadcrumb');
}

async function buildTabs(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const selected of [0, 1, 2]) {
    const f = frame(`Selected=${selected}`, undefined);
    autoLayout(f, 'h', 4, 0);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
    const labels = ['Overview', 'Activities', 'Files'];
    for (let i = 0; i < labels.length; i++) {
      const tab = frame(`tab-${i}`, f);
      autoLayout(tab, 'v', 6, { l: 16, r: 16, t: 10, b: 10 });
      tab.primaryAxisSizingMode = 'AUTO'; tab.counterAxisSizingMode = 'AUTO';
      tab.counterAxisAlignItems = 'CENTER';
      const lab = await text(labels[i], i === selected ? 'semibold' : 'regular', 14, tab);
      bindText(lab, tokens, i === selected ? 'color/brand/primary' : 'color/text/secondary');
      const under = rect('underline', 1, 2, tab);
      under.layoutGrow = 1;
      if (i === selected) bindFill(under, tokens, 'color/brand/primary');
      else under.fills = [];
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Nav/Tabs', {
    purpose: 'Horizontal tab selector with underline indicator.',
    pp: 'Tablist (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-tablist',
  }, 'canvas/nav/tabs');
}

export async function buildCanvasNavigation(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildAppHeader(page, tokens),
    await buildSideMenu(page, tokens),
    await buildBreadcrumb(page, tokens),
    await buildTabs(page, tokens),
  ];
}
