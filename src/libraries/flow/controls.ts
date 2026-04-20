/**
 * Flow/Control/* — Condition, Switch, Apply to each, Do until, Scope, Parallel branch, Terminate.
 * These are container shapes with slots — users nest other cards inside.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';
import { buildFlowCardInto } from './card.js';

function controlContainer(tokens: Tokens, name: string, minHeight = 320): FrameNode {
  const f = frame(name, undefined);
  autoLayout(f, 'v', 12, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(720, minHeight); f.cornerRadius = 6;
  bindFill(f, tokens, 'color/canvas/surface');
  bindStroke(f, tokens, 'color/flow/control', 1);
  return f;
}

async function controlHeader(tokens: Tokens, parent: FrameNode, title: string): Promise<FrameNode> {
  const h = await buildFlowCardInto(tokens, parent, {
    title,
    connectorName: 'Control',
    connectorColourKey: 'color/flow/control',
  });
  return h;
}

async function buildCondition(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = controlContainer(tokens, 'Default', 320);
  await controlHeader(tokens, f, 'Condition');
  const branches = frame('branches', f);
  autoLayout(branches, 'h', 12, 0);
  branches.primaryAxisSizingMode = 'FIXED'; branches.counterAxisSizingMode = 'FIXED';
  branches.resize(688, 220);
  for (const label of ['If yes', 'If no']) {
    const b = frame(label, branches);
    autoLayout(b, 'v', 8, 12);
    b.primaryAxisSizingMode = 'FIXED'; b.counterAxisSizingMode = 'FIXED';
    b.resize(338, 220); b.cornerRadius = 4;
    bindFill(b, tokens, 'color/canvas/background');
    bindStroke(b, tokens, 'color/stroke/subtle', 1);
    const h = await text(label, 'semibold', 12, b);
    bindText(h, tokens, 'color/text/secondary');
    const slot = rect('slot', 314, 120, b);
    slot.cornerRadius = 4;
    slot.dashPattern = [6, 4];
    bindStroke(slot, tokens, 'color/stroke/default', 1);
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Control/Condition', {
    purpose: 'Two-branch container — yes / no — evaluated from a predicate.',
    pp: 'Condition control (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/add-condition',
  }, 'flow/control/condition');
}

async function buildSwitch(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = controlContainer(tokens, 'Default', 360);
  await controlHeader(tokens, f, 'Switch');
  const cases = frame('cases', f);
  autoLayout(cases, 'h', 12, 0);
  cases.primaryAxisSizingMode = 'FIXED'; cases.counterAxisSizingMode = 'FIXED';
  cases.resize(688, 260);
  for (const label of ['Case: "High"', 'Case: "Normal"', 'Default']) {
    const b = frame(label, cases);
    autoLayout(b, 'v', 8, 12);
    b.primaryAxisSizingMode = 'FIXED'; b.counterAxisSizingMode = 'FIXED';
    b.resize(220, 260); b.cornerRadius = 4;
    bindFill(b, tokens, 'color/canvas/background');
    bindStroke(b, tokens, 'color/stroke/subtle', 1);
    const h = await text(label, 'semibold', 12, b);
    bindText(h, tokens, 'color/text/secondary');
    const slot = rect('slot', 196, 160, b);
    slot.cornerRadius = 4;
    slot.dashPattern = [6, 4];
    bindStroke(slot, tokens, 'color/stroke/default', 1);
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Control/Switch', {
    purpose: 'N-case container with a Default branch.',
    pp: 'Switch control (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/switch-case',
  }, 'flow/control/switch');
}

async function buildApplyToEach(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = controlContainer(tokens, 'Default', 240);
  await controlHeader(tokens, f, 'Apply to each');
  const slot = rect('slot', 688, 120, f);
  slot.cornerRadius = 4;
  slot.dashPattern = [6, 4];
  bindStroke(slot, tokens, 'color/stroke/default', 1);
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Control/Apply to each', {
    purpose: 'Loop over the items in an array; body runs per item.',
    pp: 'Apply to each control (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/apply-to-each',
  }, 'flow/control/apply-to-each');
}

async function buildDoUntil(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = controlContainer(tokens, 'Default', 240);
  await controlHeader(tokens, f, 'Do until');
  const slot = rect('slot', 688, 120, f);
  slot.cornerRadius = 4;
  slot.dashPattern = [6, 4];
  bindStroke(slot, tokens, 'color/stroke/default', 1);
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Control/Do until', {
    purpose: 'Repeat body until a predicate evaluates to true.',
    pp: 'Do until control (Power Automate).',
  }, 'flow/control/do-until');
}

async function buildScope(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = controlContainer(tokens, 'Default', 240);
  await controlHeader(tokens, f, 'Scope');
  const slot = rect('slot', 688, 120, f);
  slot.cornerRadius = 4;
  slot.dashPattern = [6, 4];
  bindStroke(slot, tokens, 'color/stroke/default', 1);
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Control/Scope', {
    purpose: 'Group of actions sharing run-after logic; common in try/catch patterns.',
    pp: 'Scope control (Power Automate).',
  }, 'flow/control/scope');
}

async function buildParallelBranch(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 40, 0);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(720, 120);
  bindFill(f, tokens, 'color/canvas/surface');
  for (const _ of [0, 1, 2]) {
    const b = rect('branch', 200, 120, f);
    b.cornerRadius = 4;
    b.dashPattern = [6, 4];
    bindStroke(b, tokens, 'color/stroke/default', 1);
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Control/Parallel branch', {
    purpose: 'Connector allowing a flow to fork into multiple parallel branches.',
    pp: 'Parallel branch connector (Power Automate).',
  }, 'flow/control/parallel');
}

async function buildTerminate(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const status of ['Succeeded', 'Failed', 'Cancelled']) {
    const f = await buildFlowCardInto(tokens, undefined, {
      title: 'Terminate',
      connectorName: `Status: ${status}`,
      connectorColourKey: status === 'Succeeded' ? 'color/status/success' : status === 'Failed' ? 'color/status/danger' : 'color/flow/control',
    });
    f.name = `Status=${status}`;
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Flow/Control/Terminate', {
    purpose: 'End the flow run explicitly with a specified status.',
    pp: 'Terminate control (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/terminate-a-flow',
  }, 'flow/control/terminate');
}

export async function buildFlowControls(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildCondition(page, tokens),
    await buildSwitch(page, tokens),
    await buildApplyToEach(page, tokens),
    await buildDoUntil(page, tokens),
    await buildScope(page, tokens),
    await buildParallelBranch(page, tokens),
    await buildTerminate(page, tokens),
  ];
}
