/**
 * Flow/Pattern/* — Reusable error-handling and retry templates.
 * Flow/Annotation/* — Comment / Expression / Dynamic content chip / Run After badge.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';
import { buildFlowCardInto } from './card.js';

async function buildTryCatchFinally(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 16, 20);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(760, 480);
  bindFill(f, tokens, 'color/canvas/surface');
  bindStroke(f, tokens, 'color/flow/control', 1);
  f.cornerRadius = 6;
  for (const [label, colour, note] of [
    ['Try', 'color/flow/action', 'Run After: default'],
    ['Catch', 'color/status/danger', 'Run After: is failed, has timed out'],
    ['Finally', 'color/flow/control', 'Run After: is successful, has failed, is skipped, has timed out'],
  ] as const) {
    const scope = frame(label, f);
    autoLayout(scope, 'v', 8, 12);
    scope.primaryAxisSizingMode = 'FIXED'; scope.counterAxisSizingMode = 'FIXED';
    scope.resize(720, 128); scope.cornerRadius = 4;
    bindFill(scope, tokens, 'color/canvas/background');
    bindStroke(scope, tokens, colour, 1);
    const head = frame('head', scope);
    autoLayout(head, 'h', 10, 0);
    head.primaryAxisSizingMode = 'AUTO'; head.counterAxisSizingMode = 'AUTO';
    head.counterAxisAlignItems = 'CENTER';
    const t = await text(label + ' scope', 'semibold', 13, head);
    bindText(t, tokens, 'color/text/primary');
    const note2 = await text(note, 'regular', 11, head);
    bindText(note2, tokens, 'color/text/secondary');
    const slot = rect('slot', 696, 64, scope);
    slot.cornerRadius = 4;
    slot.dashPattern = [6, 4];
    bindStroke(slot, tokens, 'color/stroke/default', 1);
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Pattern/Try-Catch-Finally', {
    purpose: 'Three-scope template with Run After pre-set for robust error handling.',
    pp: 'Try / Catch / Finally pattern (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/fix-flow-failures',
  }, 'flow/pattern/try-catch-finally');
}

async function buildRetryAnnotation(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 8, { l: 12, r: 12, t: 8, b: 8 });
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'CENTER';
  f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/surface-alt');
  const icon = rect('icon', 14, 14, f);
  bindFill(icon, tokens, 'color/status/info');
  const title = await text('Retry policy', 'semibold', 12, f);
  bindText(title, tokens, 'color/text/primary');
  const v = await text('Exponential · 4 retries · 20s..3m', 'regular', 12, f);
  bindText(v, tokens, 'color/text/secondary');
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Pattern/Retry policy annotation', {
    purpose: 'Annotation chip summarising an action\'s retry policy.',
    pp: 'Retry policy setting (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/implement-retry-policy',
  }, 'flow/pattern/retry');
}

async function buildComment(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 4, 10);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO';
  f.resize(280, 1); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/surface-alt');
  const h = await text('Note', 'semibold', 11, f);
  bindText(h, tokens, 'color/text/secondary');
  const b = await text('Wait for manager approval before sending the customer confirmation.', 'regular', 12, f);
  b.layoutAlign = 'STRETCH';
  bindText(b, tokens, 'color/text/primary');
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Annotation/Comment', {
    purpose: 'Inline author comment — attach alongside any action.',
    pp: 'Flow comment (Power Automate).',
  }, 'flow/annotation/comment');
}

async function buildExpression(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 6, 10);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'CENTER';
  f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/surface-alt');
  bindStroke(f, tokens, 'color/stroke/default', 1);
  const badge = frame('fx', f);
  autoLayout(badge, 'h', 0, { l: 4, r: 4, t: 1, b: 1 });
  badge.primaryAxisAlignItems = 'CENTER'; badge.counterAxisAlignItems = 'CENTER';
  badge.primaryAxisSizingMode = 'AUTO'; badge.counterAxisSizingMode = 'AUTO';
  badge.cornerRadius = 3;
  bindFill(badge, tokens, 'color/brand/primary');
  const fx = await text('fx', 'semibold', 11, badge);
  bindText(fx, tokens, 'color/canvas/background');
  const code = await text('formatDateTime(utcNow(), \'yyyy-MM-dd\')', 'regular', 12, f);
  bindText(code, tokens, 'color/text/primary');
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Annotation/Expression', {
    purpose: 'Inline expression chip showing a workflow-definition-language expression.',
    pp: 'Expression (Power Automate).',
    docs: 'https://learn.microsoft.com/azure/logic-apps/workflow-definition-language-functions-reference',
  }, 'flow/annotation/expression');
}

async function buildDynamicContentChip(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 6, 8);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'CENTER';
  f.cornerRadius = 3;
  bindFill(f, tokens, 'color/canvas/surface-alt');
  const swatch = rect('sw', 10, 10, f);
  swatch.cornerRadius = 2;
  bindFill(swatch, tokens, 'color/flow/action');
  const label = await text('triggerBody()?.accountid', 'medium', 12, f);
  bindText(label, tokens, 'color/text/primary');
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Annotation/Dynamic Content Chip', {
    purpose: 'Token chip for a dynamic-content reference embedded in an input.',
    pp: 'Dynamic content (Power Automate).',
  }, 'flow/annotation/dynamic-content');
}

async function buildRunAfterBadge(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const status of ['is successful', 'has failed', 'is skipped', 'has timed out']) {
    const f = frame(`Status=${status}`, undefined);
    autoLayout(f, 'h', 4, 8);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
    f.counterAxisAlignItems = 'CENTER';
    f.cornerRadius = 3;
    bindFill(f, tokens, status === 'is successful' ? 'color/status/success' : status === 'has failed' ? 'color/status/danger' : status === 'has timed out' ? 'color/status/warning' : 'color/canvas/surface-alt');
    const t = await text('Run after ' + status, 'semibold', 10, f);
    const fg = status === 'is skipped' ? 'color/text/secondary' : 'color/canvas/background';
    bindText(t, tokens, fg);
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Flow/Annotation/Run After Badge', {
    purpose: 'Badge indicating the Run After condition configured on an action.',
    pp: 'Run after setting (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/fix-flow-failures#change-the-run-after-behavior',
  }, 'flow/annotation/run-after');
}

export async function buildFlowPatterns(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildTryCatchFinally(page, tokens),
    await buildRetryAnnotation(page, tokens),
    await buildComment(page, tokens),
    await buildExpression(page, tokens),
    await buildDynamicContentChip(page, tokens),
    await buildRunAfterBadge(page, tokens),
  ];
}
