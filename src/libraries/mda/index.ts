/**
 * Model-Driven Apps (Fluent UI 2) library — entry point.
 */

import type { Tokens } from '../../lib/tokens.js';
import { text, placeGrid } from '../../lib/layout.js';
import { bindText } from '../../lib/componentKit.js';
import { buildMdaShell } from './shell.js';
import { buildMdaViews } from './views.js';
import { buildMdaForms } from './forms.js';
import { buildMdaDialogs } from './dialogs.js';
import { buildMdaDashboards } from './dashboards.js';
import { buildMdaAdmin } from './admin.js';
import type { LibraryBuild } from '../canvas/index.js';

async function renderSection(
  page: PageNode,
  tokens: Tokens,
  title: string,
  sets: ReadonlyArray<ComponentSetNode>,
  y: number,
): Promise<number> {
  const t = await text(title, 'semibold', 24, page);
  t.x = 40; t.y = y;
  bindText(t, tokens, 'color/text/primary');
  const { height } = placeGrid(sets, { cols: 2, gap: 64, x: 40, y: y + 48 });
  return y + 48 + height + 80;
}

export async function buildMdaLibrary(tokens: Tokens, page: PageNode): Promise<LibraryBuild> {
  const header = await text('Model-Driven Apps — Fluent UI 2', 'bold', 40, page);
  header.x = 40; header.y = 40;
  bindText(header, tokens, 'color/text/primary');
  const sub = await text('Unified Interface patterns for Dynamics 365 / Power Apps model-driven apps, implemented as real Figma Component Sets with variants.', 'regular', 14, page);
  sub.x = 40; sub.y = 96; sub.textAutoResize = 'HEIGHT'; sub.resize(1000, sub.height);
  bindText(sub, tokens, 'color/text/secondary');

  let y = 160;
  const all: ComponentSetNode[] = [];

  const shell = await buildMdaShell(page, tokens);     all.push(...shell);     y = await renderSection(page, tokens, 'App Shell', shell, y);
  const views = await buildMdaViews(page, tokens);     all.push(...views);     y = await renderSection(page, tokens, 'Views & Grids', views, y);
  const forms = await buildMdaForms(page, tokens);     all.push(...forms);     y = await renderSection(page, tokens, 'Forms', forms, y);
  const dialogs = await buildMdaDialogs(page, tokens); all.push(...dialogs);   y = await renderSection(page, tokens, 'Dialogs & Overlays', dialogs, y);
  const dash = await buildMdaDashboards(page, tokens); all.push(...dash);      y = await renderSection(page, tokens, 'Dashboards', dash, y);
  const admin = await buildMdaAdmin(page, tokens);     all.push(...admin);     y = await renderSection(page, tokens, 'Admin / Settings', admin, y);

  return { components: [], sets: all };
}
