/**
 * Canvas/Feedback/* — Progress Bar, Message Bar, Toast, Dialog, Teaching Callout.
 * Spinner is shipped on the Primitives page.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function buildProgressBar(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const kind of ['Determinate', 'Indeterminate']) {
    for (const value of kind === 'Determinate' ? [0, 40, 80, 100] : [0]) {
      const f = frame(`Kind=${kind}${kind === 'Determinate' ? `, Value=${value}` : ''}`, undefined);
      autoLayout(f, 'h', 0, 0);
      f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
      f.resize(240, 4);
      f.cornerRadius = 2;
      bindFill(f, tokens, 'color/canvas/surface-alt');
      const fill = rect('fill', kind === 'Determinate' ? 240 * value / 100 : 80, 4, f);
      fill.cornerRadius = 2;
      bindFill(fill, tokens, 'color/brand/primary');
      variants.push(figma.createComponentFromNode(f));
    }
  }
  return publishSet(page, variants, 'Canvas/Feedback/Progress Bar', {
    purpose: 'Linear progress indicator.',
    pp: 'Progress bar (Modern Controls).',
    docs: 'https://react.fluentui.dev/?path=/docs/components-progressbar--docs',
  }, 'canvas/feedback/progress');
}

async function buildMessageBar(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  const intents: Array<[string, string, string]> = [
    ['Info',    'color/status/info',    'color/canvas/surface-alt'],
    ['Success', 'color/status/success', 'color/canvas/surface-alt'],
    ['Warning', 'color/status/warning', 'color/canvas/surface-alt'],
    ['Danger',  'color/status/danger',  'color/canvas/surface-alt'],
  ];
  for (const [intent, icon, bg] of intents) {
    const f = frame(`Intent=${intent}`, undefined);
    autoLayout(f, 'h', 12, 12);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO';
    f.counterAxisAlignItems = 'CENTER';
    f.resize(480, 1); f.cornerRadius = 4;
    bindFill(f, tokens, bg);
    bindStroke(f, tokens, icon, 1);
    const dot = ellipse('icon', 20, 20, f);
    bindFill(dot, tokens, icon);
    const t = await text(`${intent} message example text.`, 'semibold', 13, f);
    bindText(t, tokens, 'color/text/primary');
    const pad = rect('pad', 1, 1, f); pad.fills = []; pad.layoutGrow = 1;
    const close = await text('×', 'bold', 16, f);
    bindText(close, tokens, 'color/text/secondary');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Feedback/Message Bar', {
    purpose: 'Page-level status banner in four intents.',
    pp: 'Message bar (Modern Controls).',
    docs: 'https://react.fluentui.dev/?path=/docs/components-messagebar--docs',
  }, 'canvas/feedback/message-bar');
}

async function buildToast(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const intent of ['Info', 'Success', 'Warning', 'Danger']) {
    const f = frame(`Intent=${intent}`, undefined);
    autoLayout(f, 'h', 12, { l: 12, r: 16, t: 12, b: 12 });
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO';
    f.resize(320, 1); f.cornerRadius = 4;
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const dot = ellipse('icon', 20, 20, f);
    bindFill(dot, tokens, `color/status/${intent.toLowerCase()}`);
    const col = frame('col', f);
    autoLayout(col, 'v', 2, 0);
    col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'AUTO';
    col.layoutGrow = 1;
    const title = await text(`${intent} toast`, 'semibold', 13, col);
    bindText(title, tokens, 'color/text/primary');
    const body = await text('Brief explanation of what happened.', 'regular', 12, col);
    bindText(body, tokens, 'color/text/secondary');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Feedback/Toast', {
    purpose: 'Transient notification anchored to a corner of the screen.',
    pp: 'Toast notification pattern (Modern Controls).',
  }, 'canvas/feedback/toast');
}

async function buildDialog(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const size of ['Small', 'Medium', 'Large']) {
    const w = size === 'Small' ? 360 : size === 'Medium' ? 480 : 640;
    const f = frame(`Size=${size}`, undefined);
    autoLayout(f, 'v', 16, 24);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
    f.resize(w, 1); f.cornerRadius = 8;
    bindFill(f, tokens, 'color/canvas/background');
    bindStroke(f, tokens, 'color/stroke/subtle', 1);
    const t = await text('Confirm deletion', 'semibold', 20, f);
    bindText(t, tokens, 'color/text/primary');
    const b = await text('Are you sure you want to delete this record? This action cannot be undone.', 'regular', 14, f);
    b.textAutoResize = 'HEIGHT'; b.resize(w - 48, b.height);
    bindText(b, tokens, 'color/text/secondary');
    const actions = frame('actions', f);
    autoLayout(actions, 'h', 8, 0);
    actions.primaryAxisSizingMode = 'AUTO'; actions.counterAxisSizingMode = 'AUTO';
    actions.primaryAxisAlignItems = 'MAX'; actions.layoutGrow = 0;
    const cancel = frame('cancel', actions);
    autoLayout(cancel, 'h', 0, { l: 14, r: 14, t: 8, b: 8 });
    cancel.primaryAxisAlignItems = 'CENTER'; cancel.counterAxisAlignItems = 'CENTER';
    cancel.cornerRadius = 4;
    bindStroke(cancel, tokens, 'color/stroke/default', 1);
    const ct = await text('Cancel', 'semibold', 13, cancel);
    bindText(ct, tokens, 'color/text/primary');
    const confirm = frame('confirm', actions);
    autoLayout(confirm, 'h', 0, { l: 14, r: 14, t: 8, b: 8 });
    confirm.primaryAxisAlignItems = 'CENTER'; confirm.counterAxisAlignItems = 'CENTER';
    confirm.cornerRadius = 4;
    bindFill(confirm, tokens, 'color/status/danger');
    const xt = await text('Delete', 'semibold', 13, confirm);
    bindText(xt, tokens, 'color/canvas/background');
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Feedback/Dialog', {
    purpose: 'Blocking modal for confirmations and forms.',
    pp: 'Dialog (Modern Controls).',
    docs: 'https://react.fluentui.dev/?path=/docs/components-dialog--docs',
  }, 'canvas/feedback/dialog');
}

async function buildTeachingCallout(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 8, 16);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(320, 1); f.cornerRadius = 6;
  bindFill(f, tokens, 'color/brand/primary');
  const t = await text('Did you know?', 'semibold', 14, f);
  bindText(t, tokens, 'color/canvas/background');
  const b = await text('You can pin your favourite views to the top of the list for quick access.', 'regular', 13, f);
  b.textAutoResize = 'HEIGHT'; b.resize(288, b.height);
  bindText(b, tokens, 'color/canvas/background');
  const actions = frame('actions', f);
  autoLayout(actions, 'h', 8, 0);
  actions.primaryAxisSizingMode = 'AUTO'; actions.counterAxisSizingMode = 'AUTO';
  actions.primaryAxisAlignItems = 'MAX';
  const ok = await text('Got it', 'semibold', 13, actions);
  bindText(ok, tokens, 'color/canvas/background');
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, 'Canvas/Feedback/Teaching Callout', {
    purpose: 'Contextual tip overlay for onboarding.',
    pp: 'Teaching bubble pattern (Modern Controls).',
  }, 'canvas/feedback/teaching-callout');
}

async function buildSpinnerAlias(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 8, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'CENTER';
  const ring = ellipse('ring', 32, 32, f);
  ring.fills = [];
  bindStroke(ring, tokens, 'color/stroke/subtle', 2);
  const arc = ellipse('arc', 32, 32, f);
  arc.layoutPositioning = 'ABSOLUTE'; arc.x = 0; arc.y = 0;
  arc.fills = [];
  bindStroke(arc, tokens, 'color/brand/primary', 2);
  arc.arcData = { startingAngle: 0, endingAngle: Math.PI * 0.7, innerRadius: 0 };
  const t = await text('Loading…', 'regular', 12, f);
  bindText(t, tokens, 'color/text/secondary');
  const variants = [figma.createComponentFromNode(f)];
  return publishSet(page, variants, 'Canvas/Feedback/Spinner', {
    purpose: 'Loading indicator with a label.',
    pp: 'Spinner (Modern Controls).',
    docs: 'https://react.fluentui.dev/?path=/docs/components-spinner--docs',
  }, 'canvas/feedback/spinner');
}

export async function buildCanvasFeedback(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildSpinnerAlias(page, tokens),
    await buildProgressBar(page, tokens),
    await buildMessageBar(page, tokens),
    await buildToast(page, tokens),
    await buildDialog(page, tokens),
    await buildTeachingCallout(page, tokens),
  ];
}
