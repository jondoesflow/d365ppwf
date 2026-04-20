/**
 * MDA/Shell/* — App Header, Site Map, Nav Bar, Command Bar.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function buildAppHeader(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 16, { l: 12, r: 16, t: 0, b: 0 });
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.counterAxisAlignItems = 'CENTER';
  f.resize(1440, 48);
  bindFill(f, tokens, 'color/brand/primary');
  const waffle = rect('waffle', 20, 20, f);
  bindFill(waffle, tokens, 'color/canvas/background');
  const appName = await text('Sales Hub', 'semibold', 14, f);
  bindText(appName, tokens, 'color/canvas/background');
  const sep = rect('sep', 1, 20, f);
  bindFill(sep, tokens, 'color/brand/primary-hover');
  const env = await text('Contoso · Production', 'regular', 13, f);
  bindText(env, tokens, 'color/canvas/background');
  env.opacity = 0.8;
  const pad = rect('pad', 1, 1, f); pad.fills = []; pad.layoutGrow = 1;
  // Search
  const search = frame('search', f);
  autoLayout(search, 'h', 8, 8);
  search.primaryAxisSizingMode = 'FIXED'; search.counterAxisSizingMode = 'FIXED';
  search.counterAxisAlignItems = 'CENTER';
  search.resize(320, 30); search.cornerRadius = 4;
  bindFill(search, tokens, 'color/brand/primary-hover');
  const sp = await text('Search', 'regular', 13, search);
  bindText(sp, tokens, 'color/canvas/background');
  sp.opacity = 0.8;
  // Icons
  for (const ic of ['?', '⚙', '🔔']) {
    const t = await text(ic, 'regular', 16, f);
    bindText(t, tokens, 'color/canvas/background');
  }
  const avatar = ellipse('avatar', 28, 28, f);
  bindFill(avatar, tokens, 'color/brand/primary-pressed');
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Shell/App Header', {
    purpose: 'Unified Interface top bar: app name, search, help, settings, notifications, user.',
    pp: 'Unified Interface app bar (Dynamics 365 / Model-driven Power Apps).',
    docs: 'https://learn.microsoft.com/power-apps/user/unified-interface',
  }, 'mda/shell/app-header');
}

async function buildSiteMap(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Expanded', 'Collapsed']) {
    const w = state === 'Expanded' ? 240 : 56;
    const f = frame(`State=${state}`, undefined);
    autoLayout(f, 'v', 0, 0);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(w, 600);
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    // Area switcher
    const area = frame('area', f);
    autoLayout(area, 'h', 8, { l: 12, r: 12, t: 0, b: 0 });
    area.primaryAxisSizingMode = 'FIXED'; area.counterAxisSizingMode = 'FIXED';
    area.counterAxisAlignItems = 'CENTER';
    area.resize(w, 48);
    bindStroke(area, tokens, 'color/stroke/subtle', 1);
    if (state === 'Expanded') {
      const at = await text('Sales', 'semibold', 14, area);
      bindText(at, tokens, 'color/text/primary');
      const pad = rect('pad', 1, 1, area); pad.fills = []; pad.layoutGrow = 1;
      const chev = await text('▾', 'regular', 12, area);
      bindText(chev, tokens, 'color/text/secondary');
    }
    // Group heading
    if (state === 'Expanded') {
      const grp = await text('MY WORK', 'semibold', 10, f);
      bindText(grp, tokens, 'color/text/secondary');
      grp.x = 12; grp.y = 60;
    }
    // Items
    const items = ['Dashboards', 'Activities', 'Leads', 'Opportunities', 'Accounts', 'Contacts', 'Cases'];
    for (let i = 0; i < items.length; i++) {
      const row = frame(`item-${i}`, f);
      autoLayout(row, 'h', 12, { l: 12, r: 12, t: 0, b: 0 });
      row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
      row.counterAxisAlignItems = 'CENTER';
      row.resize(w, 36);
      if (i === 2) bindFill(row, tokens, 'color/canvas/surface-alt');
      const ic = rect('icon', 16, 16, row);
      bindFill(ic, tokens, i === 2 ? 'color/brand/primary' : 'color/text/secondary');
      if (state === 'Expanded') {
        const lbl = await text(items[i], i === 2 ? 'semibold' : 'regular', 13, row);
        bindText(lbl, tokens, i === 2 ? 'color/brand/primary' : 'color/text/primary');
      }
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/Shell/Site Map', {
    purpose: 'Entity navigation sidebar with area switcher and groups.',
    pp: 'Site map (Unified Interface) — area + group + subarea.',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/create-site-map-app',
  }, 'mda/shell/sitemap');
}

async function buildNavBar(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 12, { l: 16, r: 16, t: 0, b: 0 });
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.counterAxisAlignItems = 'CENTER';
  f.resize(1184, 40);
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const back = await text('←', 'bold', 16, f);
  bindText(back, tokens, 'color/text/secondary');
  for (const [i, part] of ['Opportunities', 'Cloud migration — Contoso Ltd'].entries()) {
    const t = await text(part, i === 1 ? 'semibold' : 'regular', 13, f);
    bindText(t, tokens, i === 1 ? 'color/text/primary' : 'color/text/secondary');
    if (i === 0) {
      const sep = await text('›', 'regular', 13, f);
      bindText(sep, tokens, 'color/text/secondary');
    }
  }
  const pad = rect('pad', 1, 1, f); pad.fills = []; pad.layoutGrow = 1;
  const ent = await text('Record ▾', 'regular', 13, f);
  bindText(ent, tokens, 'color/text/secondary');
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Shell/Nav Bar', {
    purpose: 'Record breadcrumb and entity context switcher below the app header.',
    pp: 'Breadcrumb + entity switcher (Unified Interface).',
  }, 'mda/shell/nav-bar');
}

async function buildCommandBar(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const selCount of ['None', 'Single', 'Multi']) {
    const f = frame(`Selection=${selCount}`, undefined);
    autoLayout(f, 'h', 4, { l: 12, r: 12, t: 0, b: 0 });
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.counterAxisAlignItems = 'CENTER';
    f.resize(1184, 40);
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const actions = selCount === 'None'
      ? ['+ New', 'Edit', 'Refresh', 'Export to Excel', 'Flow', 'Run Report']
      : selCount === 'Single'
        ? ['+ New', 'Edit', 'Deactivate', 'Assign', 'Share', 'Email a Link', 'Delete']
        : ['Edit', 'Deactivate', 'Assign', 'Delete', 'Merge', 'Bulk edit'];
    for (const a of actions) {
      const btn = frame('btn', f);
      autoLayout(btn, 'h', 6, { l: 8, r: 8, t: 6, b: 6 });
      btn.primaryAxisSizingMode = 'AUTO'; btn.counterAxisSizingMode = 'AUTO';
      btn.counterAxisAlignItems = 'CENTER';
      btn.cornerRadius = 4;
      const ic = rect('ic', 14, 14, btn);
      bindFill(ic, tokens, 'color/text/secondary');
      const t = await text(a, 'regular', 13, btn);
      bindText(t, tokens, 'color/text/primary');
    }
    const pad = rect('pad', 1, 1, f); pad.fills = []; pad.layoutGrow = 1;
    const over = await text('⋯', 'bold', 16, f);
    bindText(over, tokens, 'color/text/secondary');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/Shell/Command Bar', {
    purpose: 'Entity-level action bar; visible actions vary by selection count.',
    pp: 'Command bar (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/commanding-overview',
  }, 'mda/shell/command-bar');
}

export async function buildMdaShell(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildAppHeader(page, tokens),
    await buildSiteMap(page, tokens),
    await buildNavBar(page, tokens),
    await buildCommandBar(page, tokens),
  ];
}
