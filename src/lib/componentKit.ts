/**
 * Opinionated helpers for authoring Components: creating component sets from
 * a matrix of variant names, binding tokens, stamping descriptions, and
 * registering stable ids.
 */

import type { Tokens } from './tokens.js';
import { remember, loadRegistry } from './pluginData.js';

// Run-scoped counters. Reset at the start of each orchestrator run.
export const runStats = { created: 0, updated: 0 };
export function resetRunStats(): void { runStats.created = 0; runStats.updated = 0; }

export function bindFill(node: SceneNode & MinimalFillsMixin, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  node.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', v)];
}

export function bindStroke(node: SceneNode & MinimalStrokesMixin, tokens: Tokens, key: string, weight = 1): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  node.strokes = [figma.variables.setBoundVariableForPaint(paint, 'color', v)];
  node.strokeWeight = weight;
}

export function bindText(node: TextNode, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  node.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', v)];
}

export function setDescription(
  n: ComponentNode | ComponentSetNode,
  purpose: string,
  ppName: string,
  docs?: string,
): void {
  const parts = [
    `**Purpose:** ${purpose}`,
    `**Power Platform equivalent:** ${ppName}`,
  ];
  if (docs) parts.push(`**Docs:** ${docs}`);
  n.description = parts.join('\n\n');
}

export interface BuiltSet {
  set: ComponentSetNode;
}

/**
 * Combine a list of authored variant frames into a ComponentSet, name it,
 * describe it, and register it.
 */
export function publishSet(
  page: PageNode,
  variants: ComponentNode[],
  name: string,
  desc: { purpose: string; pp: string; docs?: string; },
  registryKey: string,
): ComponentSetNode {
  // Detect whether the registry already knows this key to distinguish
  // "created" from "updated" in run summaries. The actual node is fresh
  // either way because the page was purged at the start of the run.
  const reg = loadRegistry();
  const wasKnown = Object.prototype.hasOwnProperty.call(reg, registryKey);
  const set = figma.combineAsVariants(variants, page);
  set.name = name;
  setDescription(set, desc.purpose, desc.pp, desc.docs);
  remember(registryKey, set);
  if (wasKnown) runStats.updated += 1; else runStats.created += 1;
  return set;
}
