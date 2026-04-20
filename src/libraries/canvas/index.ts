/**
 * Canvas Apps (Modern Controls) library — entry point.
 */

import type { Tokens } from '../../lib/tokens.js';
import { text } from '../../lib/layout.js';
import { placeGrid } from '../../lib/layout.js';
import { bindText } from '../../lib/componentKit.js';
import { buildCanvasStructural } from './structural.js';
import { buildCanvasNavigation } from './navigation.js';
import { buildCanvasInputs } from './inputs.js';
import { buildCanvasButtons } from './buttons.js';
import { buildCanvasData } from './data.js';
import { buildCanvasFeedback } from './feedback.js';
import { buildCanvasCharts } from './charts.js';

export interface LibraryBuild {
  components: ComponentNode[];
  sets: ComponentSetNode[];
}

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
  const { height } = placeGrid(sets, { cols: 3, gap: 64, x: 40, y: y + 48 });
  return y + 48 + height + 80;
}

export async function buildCanvasLibrary(tokens: Tokens, page: PageNode): Promise<LibraryBuild> {
  const header = await text('Canvas Apps — Modern Controls', 'bold', 40, page);
  header.x = 40; header.y = 40;
  bindText(header, tokens, 'color/text/primary');

  const sub = await text('Fluent 2 visual language for Canvas Apps Modern Controls. Every component is a real Figma Component Set with variants and descriptions.', 'regular', 14, page);
  sub.x = 40; sub.y = 96; sub.textAutoResize = 'HEIGHT'; sub.resize(1000, sub.height);
  bindText(sub, tokens, 'color/text/secondary');

  let y = 160;
  const allSets: ComponentSetNode[] = [];

  const structural = await buildCanvasStructural(page, tokens);
  allSets.push(...structural);
  y = await renderSection(page, tokens, 'Structural', structural, y);

  const nav = await buildCanvasNavigation(page, tokens);
  allSets.push(...nav);
  y = await renderSection(page, tokens, 'Navigation', nav, y);

  const inputs = await buildCanvasInputs(page, tokens);
  allSets.push(...inputs);
  y = await renderSection(page, tokens, 'Input', inputs, y);

  const buttons = await buildCanvasButtons(page, tokens);
  allSets.push(...buttons);
  y = await renderSection(page, tokens, 'Buttons', buttons, y);

  const data = await buildCanvasData(page, tokens);
  allSets.push(...data);
  y = await renderSection(page, tokens, 'Data Display', data, y);

  const feedback = await buildCanvasFeedback(page, tokens);
  allSets.push(...feedback);
  y = await renderSection(page, tokens, 'Feedback', feedback, y);

  const charts = await buildCanvasCharts(page, tokens);
  allSets.push(...charts);
  y = await renderSection(page, tokens, 'Charts', charts, y);

  return { components: [], sets: allSets };
}
