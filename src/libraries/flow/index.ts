/**
 * Power Automate (Cloud Flows) library — entry point.
 */

import type { Tokens } from '../../lib/tokens.js';
import { text, placeGrid } from '../../lib/layout.js';
import { bindText } from '../../lib/componentKit.js';
import { buildFlowChrome } from './chrome.js';
import { buildFlowTriggers } from './triggers.js';
import { buildFlowActions } from './actions.js';
import { buildFlowData } from './data.js';
import { buildFlowVariables } from './variables.js';
import { buildFlowControls } from './controls.js';
import { buildFlowPatterns } from './patterns.js';
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
  const { height } = placeGrid(sets, { cols: 3, gap: 64, x: 40, y: y + 48 });
  return y + 48 + height + 80;
}

export async function buildFlowLibrary(tokens: Tokens, page: PageNode): Promise<LibraryBuild> {
  const header = await text('Power Automate — Cloud Flows', 'bold', 40, page);
  header.x = 40; header.y = 40;
  bindText(header, tokens, 'color/text/primary');
  const sub = await text('Card-based designer vocabulary: triggers, actions, controls, data ops, annotations. Every card carries a connector-coloured leading edge bound to a Variable so swapping connector colours is one-click.', 'regular', 14, page);
  sub.x = 40; sub.y = 96; sub.textAutoResize = 'HEIGHT'; sub.resize(1000, sub.height);
  bindText(sub, tokens, 'color/text/secondary');

  let y = 160;
  const all: ComponentSetNode[] = [];

  const chrome = await buildFlowChrome(page, tokens);
  all.push(...chrome);
  y = await renderSection(page, tokens, 'Canvas / Chrome', chrome, y);

  const triggers = await buildFlowTriggers(page, tokens);
  all.push(...triggers);
  y = await renderSection(page, tokens, 'Triggers', triggers, y);

  const actions = await buildFlowActions(page, tokens);
  all.push(...actions);
  y = await renderSection(page, tokens, 'Actions', actions, y);

  const data = await buildFlowData(page, tokens);
  all.push(...data);
  y = await renderSection(page, tokens, 'Data operations', data, y);

  const variables = await buildFlowVariables(page, tokens);
  all.push(...variables);
  y = await renderSection(page, tokens, 'Variables', variables, y);

  const controls = await buildFlowControls(page, tokens);
  all.push(...controls);
  y = await renderSection(page, tokens, 'Control blocks', controls, y);

  const patterns = await buildFlowPatterns(page, tokens);
  all.push(...patterns);
  y = await renderSection(page, tokens, 'Patterns & Annotations', patterns, y);

  return { components: [], sets: all };
}
