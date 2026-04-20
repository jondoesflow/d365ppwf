/**
 * Flow/Chrome/* — Designer Canvas, Action Inspector, Left Rail, Run History Row.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function buildDesignerCanvas(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 0, 0);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1440, 900);
  bindFill(f, tokens, 'color/canvas/surface');
  // Left rail
  const rail = frame('rail', f);
  autoLayout(rail, 'v', 16, 16);
  rail.primaryAxisSizingMode = 'FIXED'; rail.counterAxisSizingMode = 'FIXED';
  rail.counterAxisAlignItems = 'CENTER';
  rail.resize(56, 900);
  bindFill(rail, tokens, 'color/canvas/background');
  bindStroke(rail, tokens, 'color/stroke/subtle', 1);
  for (let i = 0; i < 6; i++) {
    const ic = rect('ic', 24, 24, rail);
    bindFill(ic, tokens, i === 0 ? 'color/brand/primary' : 'color/text/secondary');
  }
  // Canvas centre
  const centre = frame('canvas', f);
  autoLayout(centre, 'v', 0, 0);
  centre.primaryAxisSizingMode = 'FIXED'; centre.counterAxisSizingMode = 'FIXED';
  centre.resize(1000, 900);
  bindFill(centre, tokens, 'color/canvas/surface');
  // Right inspector
  const ins = frame('inspector', f);
  autoLayout(ins, 'v', 12, 16);
  ins.primaryAxisSizingMode = 'FIXED'; ins.counterAxisSizingMode = 'FIXED';
  ins.resize(384, 900);
  bindFill(ins, tokens, 'color/canvas/background');
  bindStroke(ins, tokens, 'color/stroke/subtle', 1);
  const h = await text('Action: Get a row by ID', 'semibold', 14, ins);
  bindText(h, tokens, 'color/text/primary');
  const tabs = frame('tabs', ins);
  autoLayout(tabs, 'h', 16, 0);
  tabs.primaryAxisSizingMode = 'AUTO'; tabs.counterAxisSizingMode = 'AUTO';
  for (const [i, t] of ['Parameters','Settings','Code View'].entries()) {
    const tab = await text(t, i === 0 ? 'semibold' : 'regular', 13, tabs);
    bindText(tab, tokens, i === 0 ? 'color/brand/primary' : 'color/text/secondary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Chrome/Designer Canvas', {
    purpose: 'Full flow designer frame: left rail + canvas + right inspector.',
    pp: 'Power Automate cloud flow designer shell.',
    docs: 'https://learn.microsoft.com/power-automate/get-started-logic-flow',
  }, 'flow/chrome/designer-canvas');
}

async function buildActionInspector(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const tab of ['Parameters', 'Settings', 'Code View']) {
    const f = frame(`Tab=${tab}`, undefined);
    autoLayout(f, 'v', 12, 16);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(384, 640); f.cornerRadius = 4;
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const head = await text('Get a row by ID', 'semibold', 15, f);
    bindText(head, tokens, 'color/text/primary');
    const tabs = frame('tabs', f);
    autoLayout(tabs, 'h', 16, 0);
    tabs.primaryAxisSizingMode = 'AUTO'; tabs.counterAxisSizingMode = 'AUTO';
    for (const [i, t] of ['Parameters', 'Settings', 'Code View'].entries()) {
      const tt = await text(t, t === tab ? 'semibold' : 'regular', 13, tabs);
      bindText(tt, tokens, t === tab ? 'color/brand/primary' : 'color/text/secondary');
    }
    if (tab === 'Parameters') {
      for (const [l, v] of [['Table name', 'Accounts'], ['Row ID', '@{triggerBody()?[\'accountid\']}'], ['Columns', 'name, industry']]) {
        const r = frame('p', f);
        autoLayout(r, 'v', 4, 0);
        r.primaryAxisSizingMode = 'AUTO'; r.counterAxisSizingMode = 'FIXED';
        r.resize(352, 1);
        const ll = await text(l, 'semibold', 12, r);
        bindText(ll, tokens, 'color/text/secondary');
        const box = frame('box', r);
        autoLayout(box, 'h', 0, 10);
        box.primaryAxisSizingMode = 'FIXED'; box.counterAxisSizingMode = 'FIXED';
        box.counterAxisAlignItems = 'CENTER';
        box.resize(352, 32); box.cornerRadius = 4;
        bindFill(box, tokens, 'color/canvas/background');
        bindStroke(box, tokens, 'color/stroke/default', 1);
        const vv = await text(v, 'regular', 13, box);
        bindText(vv, tokens, 'color/text/primary');
      }
    } else if (tab === 'Code View') {
      const code = frame('code', f);
      autoLayout(code, 'v', 0, 12);
      code.primaryAxisSizingMode = 'FIXED'; code.counterAxisSizingMode = 'FIXED';
      code.resize(352, 420); code.cornerRadius = 4;
      bindFill(code, tokens, 'color/canvas/surface-alt');
      bindStroke(code, tokens, 'color/stroke/subtle', 1);
      const t = await text('{\n  "inputs": {\n    "host": {\n      "connectionName": "shared_commondataservice",\n      "operationId": "GetItem"\n    },\n    "parameters": {\n      "entityName": "accounts",\n      "recordId": "@triggerBody()?[\'accountid\']"\n    }\n  }\n}', 'regular', 11, code);
      bindText(t, tokens, 'color/text/primary');
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Flow/Chrome/Action Inspector', {
    purpose: 'Right-hand inspector for the selected action with Parameters / Settings / Code View tabs.',
    pp: 'Action inspector (Power Automate designer).',
  }, 'flow/chrome/inspector');
}

async function buildLeftRail(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 16, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.counterAxisAlignItems = 'CENTER';
  f.resize(56, 320);
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  for (const [i, _] of ['Test','Save','Checker','History','Comments','More'].entries()) {
    const ic = rect('ic', 24, 24, f);
    bindFill(ic, tokens, i === 0 ? 'color/brand/primary' : 'color/text/secondary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'Flow/Chrome/Left Rail', {
    purpose: 'Left-hand icon rail in the flow designer: Test, Save, Checker, History, Comments, More.',
    pp: 'Designer left rail (Power Automate).',
  }, 'flow/chrome/left-rail');
}

async function buildRunHistoryRow(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const status of ['Succeeded', 'Failed', 'Running']) {
    const f = frame(`Status=${status}`, undefined);
    autoLayout(f, 'h', 16, 16);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.counterAxisAlignItems = 'CENTER';
    f.resize(720, 56); f.cornerRadius = 3;
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const dot = ellipse('dot', 10, 10, f);
    const statusKey = status === 'Succeeded' ? 'color/status/success' : status === 'Failed' ? 'color/status/danger' : 'color/status/warning';
    bindFill(dot, tokens, statusKey);
    const when = await text('Apr 20, 10:02 AM', 'semibold', 13, f);
    bindText(when, tokens, 'color/text/primary');
    const meta = await text(`${status} · 4 actions · 1.8 s`, 'regular', 13, f);
    bindText(meta, tokens, 'color/text/secondary');
    const pad = rect('p', 1, 1, f); pad.fills = []; pad.layoutGrow = 1;
    const over = await text('⋯', 'bold', 16, f);
    bindText(over, tokens, 'color/text/secondary');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Flow/Chrome/Run History Row', {
    purpose: 'Single row of a flow run-history list.',
    pp: 'Flow run history item (Power Automate).',
    docs: 'https://learn.microsoft.com/power-automate/fix-flow-failures',
  }, 'flow/chrome/run-history-row');
}

export async function buildFlowChrome(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildDesignerCanvas(page, tokens),
    await buildActionInspector(page, tokens),
    await buildLeftRail(page, tokens),
    await buildRunHistoryRow(page, tokens),
  ];
}
