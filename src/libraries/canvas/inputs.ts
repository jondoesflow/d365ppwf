/**
 * Canvas/Input/* — Text Input, Text Area, Dropdown, Combo Box, Date/Time
 * Pickers, Toggle, Checkbox, Radio Group, Slider, Rating, Number Input.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

type FieldState = 'Default' | 'Hover' | 'Focus' | 'Error' | 'Disabled' | 'Readonly';

function borderFor(state: FieldState): string {
  switch (state) {
    case 'Focus': return 'color/brand/primary';
    case 'Error': return 'color/status/danger';
    case 'Disabled':
    case 'Readonly': return 'color/stroke/subtle';
    default: return 'color/stroke/default';
  }
}

function bgFor(state: FieldState): string {
  return state === 'Disabled' ? 'color/canvas/surface-alt' : 'color/canvas/background';
}

function textColorFor(state: FieldState): string {
  return state === 'Disabled' ? 'color/text/disabled' : 'color/text/primary';
}

async function buildLabelledField(
  tokens: Tokens,
  state: FieldState,
  render: (inner: FrameNode) => Promise<void>,
): Promise<ComponentNode> {
  const outer = frame(`State=${state}`, undefined);
  autoLayout(outer, 'v', 4, 0);
  outer.primaryAxisSizingMode = 'AUTO';
  outer.counterAxisSizingMode = 'FIXED';
  outer.resize(260, 1);

  const label = await text('Label', 'semibold', 12, outer);
  bindText(label, tokens, 'color/text/primary');

  const box = frame('box', outer);
  autoLayout(box, 'h', 8, { l: 12, r: 12, t: 0, b: 0 });
  box.counterAxisSizingMode = 'FIXED';
  box.primaryAxisSizingMode = 'FIXED';
  box.counterAxisAlignItems = 'CENTER';
  box.resize(260, 32);
  box.cornerRadius = 4;
  bindFill(box, tokens, bgFor(state));
  bindStroke(box, tokens, borderFor(state), state === 'Focus' ? 2 : 1);

  await render(box);

  if (state === 'Error') {
    const msg = await text('This field is required', 'regular', 11, outer);
    bindText(msg, tokens, 'color/status/danger');
  } else {
    const hint = await text('Helper text', 'regular', 11, outer);
    bindText(hint, tokens, 'color/text/secondary');
  }
  return figma.createComponentFromNode(outer);
}

// ---------------------------------------------------------------------------

async function buildTextInput(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Hover', 'Focus', 'Error', 'Disabled', 'Readonly'] as FieldState[]) {
    variants.push(await buildLabelledField(tokens, state, async (box) => {
      const val = await text('Enter value…', 'regular', 14, box);
      bindText(val, tokens, state === 'Default' ? 'color/text/secondary' : textColorFor(state));
    }));
  }
  return publishSet(page, variants, 'Canvas/Input/Text Input', {
    purpose: 'Single-line text entry.',
    pp: 'Text input (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-text-input',
  }, 'canvas/input/text');
}

async function buildTextArea(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Focus', 'Error', 'Disabled'] as FieldState[]) {
    const outer = frame(`State=${state}`, undefined);
    autoLayout(outer, 'v', 4, 0);
    outer.primaryAxisSizingMode = 'AUTO';
    outer.counterAxisSizingMode = 'FIXED';
    outer.resize(260, 1);
    const label = await text('Notes', 'semibold', 12, outer);
    bindText(label, tokens, 'color/text/primary');
    const box = frame('box', outer);
    autoLayout(box, 'v', 4, 12);
    box.counterAxisSizingMode = 'FIXED'; box.primaryAxisSizingMode = 'FIXED';
    box.resize(260, 90);
    box.cornerRadius = 4;
    bindFill(box, tokens, bgFor(state));
    bindStroke(box, tokens, borderFor(state), state === 'Focus' ? 2 : 1);
    for (let i = 0; i < 3; i++) {
      const ln = rect('line', 220, 1, box);
      bindFill(ln, tokens, 'color/stroke/subtle');
    }
    variants.push(figma.createComponentFromNode(outer));
  }
  return publishSet(page, variants, 'Canvas/Input/Text Area', {
    purpose: 'Multi-line text entry (default 3 rows).',
    pp: 'Text input with multiline = true.',
  }, 'canvas/input/text-area');
}

async function buildDropdown(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Focus', 'Disabled'] as FieldState[]) {
    for (const open of ['Closed', 'Open']) {
      const outer = frame(`State=${state}, Open=${open}`, undefined);
      autoLayout(outer, 'v', 4, 0);
      outer.primaryAxisSizingMode = 'AUTO';
      outer.counterAxisSizingMode = 'FIXED';
      outer.resize(260, 1);
      const label = await text('Select option', 'semibold', 12, outer);
      bindText(label, tokens, 'color/text/primary');
      const box = frame('box', outer);
      autoLayout(box, 'h', 8, { l: 12, r: 12, t: 0, b: 0 });
      box.counterAxisSizingMode = 'FIXED'; box.primaryAxisSizingMode = 'FIXED';
      box.counterAxisAlignItems = 'CENTER';
      box.resize(260, 32);
      box.cornerRadius = 4;
      bindFill(box, tokens, bgFor(state));
      bindStroke(box, tokens, borderFor(state), state === 'Focus' ? 2 : 1);
      const val = await text('— Select —', 'regular', 14, box);
      bindText(val, tokens, 'color/text/secondary');
      const pad = rect('pad', 1, 1, box); pad.fills = []; pad.layoutGrow = 1;
      const chev = await text('▾', 'bold', 12, box);
      bindText(chev, tokens, 'color/text/secondary');

      if (open === 'Open') {
        const menu = frame('menu', outer);
        autoLayout(menu, 'v', 0, 4);
        menu.primaryAxisSizingMode = 'AUTO';
        menu.counterAxisSizingMode = 'FIXED';
        menu.resize(260, 1);
        menu.cornerRadius = 4;
        bindFill(menu, tokens, 'color/canvas/background');
        bindStroke(menu, tokens, 'color/stroke/default', 1);
        for (const label2 of ['Option A', 'Option B', 'Option C']) {
          const row = frame('row', menu);
          autoLayout(row, 'h', 0, { l: 12, r: 12, t: 6, b: 6 });
          row.counterAxisSizingMode = 'FIXED'; row.primaryAxisSizingMode = 'FIXED';
          row.counterAxisAlignItems = 'CENTER';
          row.resize(252, 28);
          const t = await text(label2, 'regular', 14, row);
          bindText(t, tokens, 'color/text/primary');
        }
      }
      variants.push(figma.createComponentFromNode(outer));
    }
  }
  return publishSet(page, variants, 'Canvas/Input/Dropdown', {
    purpose: 'Single-select dropdown with closed and open states.',
    pp: 'Dropdown (Modern Controls) / Combo box single-select.',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-dropdown',
  }, 'canvas/input/dropdown');
}

async function buildToggleSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Hover', 'Disabled'] as FieldState[]) {
    for (const on of ['On', 'Off']) {
      const outer = frame(`State=${state}, Value=${on}`, undefined);
      autoLayout(outer, 'h', 8, 0);
      outer.primaryAxisSizingMode = 'AUTO';
      outer.counterAxisSizingMode = 'AUTO';
      outer.counterAxisAlignItems = 'CENTER';
      const track = frame('track', outer);
      autoLayout(track, 'h', 0, 2);
      track.primaryAxisSizingMode = 'FIXED';
      track.counterAxisSizingMode = 'FIXED';
      track.counterAxisAlignItems = 'CENTER';
      track.primaryAxisAlignItems = on === 'On' ? 'MAX' : 'MIN';
      track.resize(36, 20);
      track.cornerRadius = 10;
      if (state === 'Disabled') bindFill(track, tokens, 'color/canvas/surface-alt');
      else bindFill(track, tokens, on === 'On' ? 'color/brand/primary' : 'color/canvas/surface-alt');
      const thumb = ellipse('thumb', 16, 16, track);
      bindFill(thumb, tokens, 'color/canvas/background');
      const label = await text('Toggle label', 'regular', 14, outer);
      bindText(label, tokens, state === 'Disabled' ? 'color/text/disabled' : 'color/text/primary');
      variants.push(figma.createComponentFromNode(outer));
    }
  }
  return publishSet(page, variants, 'Canvas/Input/Toggle', {
    purpose: 'Binary on/off switch.',
    pp: 'Toggle (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-toggle',
  }, 'canvas/input/toggle');
}

async function buildCheckboxSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Hover', 'Disabled'] as FieldState[]) {
    for (const value of ['Unchecked', 'Checked', 'Indeterminate']) {
      const outer = frame(`State=${state}, Value=${value}`, undefined);
      autoLayout(outer, 'h', 8, 0);
      outer.primaryAxisSizingMode = 'AUTO';
      outer.counterAxisSizingMode = 'AUTO';
      outer.counterAxisAlignItems = 'CENTER';
      const box = rect('box', 16, 16, outer);
      box.cornerRadius = 2;
      if (value === 'Unchecked') {
        bindFill(box, tokens, 'color/canvas/background');
        bindStroke(box, tokens, state === 'Disabled' ? 'color/stroke/subtle' : 'color/stroke/default');
      } else {
        bindFill(box, tokens, state === 'Disabled' ? 'color/text/disabled' : 'color/brand/primary');
      }
      if (value === 'Checked') {
        const chk = await text('✓', 'bold', 12, outer);
        chk.x = 1; chk.y = 0;
        bindText(chk, tokens, 'color/canvas/background');
      } else if (value === 'Indeterminate') {
        const bar = rect('bar', 8, 2, outer);
        bindFill(bar, tokens, 'color/canvas/background');
      }
      const label = await text('Option', 'regular', 14, outer);
      bindText(label, tokens, state === 'Disabled' ? 'color/text/disabled' : 'color/text/primary');
      variants.push(figma.createComponentFromNode(outer));
    }
  }
  return publishSet(page, variants, 'Canvas/Input/Checkbox', {
    purpose: 'Binary or tri-state boolean selector.',
    pp: 'Checkbox (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-checkbox',
  }, 'canvas/input/checkbox');
}

async function buildRadioGroup(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Disabled'] as FieldState[]) {
    const outer = frame(`State=${state}`, undefined);
    autoLayout(outer, 'v', 8, 0);
    outer.primaryAxisSizingMode = 'AUTO';
    outer.counterAxisSizingMode = 'FIXED';
    outer.resize(220, 1);
    for (let i = 0; i < 3; i++) {
      const row = frame('row', outer);
      autoLayout(row, 'h', 8, 0);
      row.counterAxisAlignItems = 'CENTER';
      row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'AUTO';
      const ring = ellipse('ring', 16, 16, row);
      bindFill(ring, tokens, 'color/canvas/background');
      bindStroke(ring, tokens, i === 0 ? 'color/brand/primary' : 'color/stroke/default', i === 0 ? 5 : 1);
      const lbl = await text(['Option A', 'Option B', 'Option C'][i], 'regular', 14, row);
      bindText(lbl, tokens, state === 'Disabled' ? 'color/text/disabled' : 'color/text/primary');
    }
    variants.push(figma.createComponentFromNode(outer));
  }
  return publishSet(page, variants, 'Canvas/Input/Radio Group', {
    purpose: 'Mutually exclusive selection from a small set of options.',
    pp: 'Radio (Modern Controls) in a group container.',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-radio',
  }, 'canvas/input/radio');
}

async function buildSlider(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Disabled'] as FieldState[]) {
    const outer = frame(`State=${state}`, undefined);
    autoLayout(outer, 'v', 8, 0);
    outer.primaryAxisSizingMode = 'AUTO';
    outer.counterAxisSizingMode = 'FIXED';
    outer.resize(260, 1);
    const label = await text('Slider', 'semibold', 12, outer);
    bindText(label, tokens, 'color/text/primary');
    const row = frame('row', outer);
    autoLayout(row, 'h', 12, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.counterAxisAlignItems = 'CENTER';
    row.resize(260, 20);
    const track = rect('track', 210, 4, row);
    track.cornerRadius = 2;
    bindFill(track, tokens, 'color/canvas/surface-alt');
    const filled = rect('filled', 120, 4, row);
    filled.layoutPositioning = 'ABSOLUTE'; filled.x = 0; filled.y = 8;
    filled.cornerRadius = 2;
    bindFill(filled, tokens, state === 'Disabled' ? 'color/stroke/default' : 'color/brand/primary');
    const thumb = ellipse('thumb', 16, 16, row);
    thumb.layoutPositioning = 'ABSOLUTE'; thumb.x = 114; thumb.y = 2;
    bindFill(thumb, tokens, 'color/canvas/background');
    bindStroke(thumb, tokens, state === 'Disabled' ? 'color/stroke/default' : 'color/brand/primary', 2);
    const val = await text('50', 'semibold', 12, row);
    bindText(val, tokens, 'color/text/primary');
    variants.push(figma.createComponentFromNode(outer));
  }
  return publishSet(page, variants, 'Canvas/Input/Slider', {
    purpose: 'Continuous numeric selection along a range.',
    pp: 'Slider (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-slider',
  }, 'canvas/input/slider');
}

async function buildRating(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const value of [0, 1, 2, 3, 4, 5]) {
    const f = frame(`Value=${value}`, undefined);
    autoLayout(f, 'h', 4, 0);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
    for (let i = 0; i < 5; i++) {
      const star = await text('★', 'bold', 18, f);
      bindText(star, tokens, i < value ? 'color/status/warning' : 'color/stroke/default');
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'Canvas/Input/Rating', {
    purpose: 'Discrete rating, commonly 0–5 stars.',
    pp: 'Rating (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-rating',
  }, 'canvas/input/rating');
}

async function buildNumberInput(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Focus', 'Disabled'] as FieldState[]) {
    const outer = frame(`State=${state}`, undefined);
    autoLayout(outer, 'v', 4, 0);
    outer.primaryAxisSizingMode = 'AUTO'; outer.counterAxisSizingMode = 'FIXED';
    outer.resize(180, 1);
    const label = await text('Quantity', 'semibold', 12, outer);
    bindText(label, tokens, 'color/text/primary');
    const row = frame('row', outer);
    autoLayout(row, 'h', 0, 0);
    row.counterAxisSizingMode = 'FIXED'; row.primaryAxisSizingMode = 'FIXED';
    row.resize(180, 32);
    row.cornerRadius = 4;
    bindFill(row, tokens, bgFor(state));
    bindStroke(row, tokens, borderFor(state), state === 'Focus' ? 2 : 1);
    const minus = frame('minus', row);
    autoLayout(minus, 'h', 0, 0); minus.primaryAxisAlignItems = 'CENTER'; minus.counterAxisAlignItems = 'CENTER';
    minus.primaryAxisSizingMode = 'FIXED'; minus.counterAxisSizingMode = 'FIXED';
    minus.resize(30, 32);
    const mt = await text('−', 'bold', 18, minus);
    bindText(mt, tokens, 'color/text/primary');
    const valBox = frame('value', row);
    autoLayout(valBox, 'h', 0, 0); valBox.primaryAxisAlignItems = 'CENTER'; valBox.counterAxisAlignItems = 'CENTER';
    valBox.primaryAxisSizingMode = 'FIXED'; valBox.counterAxisSizingMode = 'FIXED';
    valBox.resize(120, 32);
    const v = await text('1', 'regular', 14, valBox);
    bindText(v, tokens, 'color/text/primary');
    const plus = frame('plus', row);
    autoLayout(plus, 'h', 0, 0); plus.primaryAxisAlignItems = 'CENTER'; plus.counterAxisAlignItems = 'CENTER';
    plus.primaryAxisSizingMode = 'FIXED'; plus.counterAxisSizingMode = 'FIXED';
    plus.resize(30, 32);
    const pt = await text('+', 'bold', 18, plus);
    bindText(pt, tokens, 'color/text/primary');
    variants.push(figma.createComponentFromNode(outer));
  }
  return publishSet(page, variants, 'Canvas/Input/Number Input', {
    purpose: 'Integer entry with stepper buttons.',
    pp: 'Number input (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-number-input',
  }, 'canvas/input/number');
}

async function buildComboBox(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Focus'] as FieldState[]) {
    const outer = frame(`State=${state}`, undefined);
    autoLayout(outer, 'v', 4, 0);
    outer.primaryAxisSizingMode = 'AUTO'; outer.counterAxisSizingMode = 'FIXED';
    outer.resize(320, 1);
    const label = await text('Assignees', 'semibold', 12, outer);
    bindText(label, tokens, 'color/text/primary');
    const box = frame('box', outer);
    autoLayout(box, 'h', 6, { l: 8, r: 8, t: 4, b: 4 });
    box.counterAxisSizingMode = 'AUTO'; box.primaryAxisSizingMode = 'FIXED';
    box.resize(320, 1);
    box.cornerRadius = 4;
    bindFill(box, tokens, bgFor(state));
    bindStroke(box, tokens, borderFor(state), state === 'Focus' ? 2 : 1);
    for (const name of ['Avery', 'Morgan', 'Jess']) {
      const chip = frame('chip', box);
      autoLayout(chip, 'h', 4, { l: 6, r: 6, t: 2, b: 2 });
      chip.counterAxisSizingMode = 'AUTO'; chip.primaryAxisSizingMode = 'AUTO';
      chip.counterAxisAlignItems = 'CENTER';
      chip.cornerRadius = 4;
      bindFill(chip, tokens, 'color/canvas/surface-alt');
      const nm = await text(name, 'medium', 12, chip);
      bindText(nm, tokens, 'color/text/primary');
      const x = await text('×', 'bold', 12, chip);
      bindText(x, tokens, 'color/text/secondary');
    }
    variants.push(figma.createComponentFromNode(outer));
  }
  return publishSet(page, variants, 'Canvas/Input/Combo Box', {
    purpose: 'Multi-select with chip-style chosen items.',
    pp: 'Combo box (Modern Controls) with SelectMultiple = true.',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-combobox',
  }, 'canvas/input/combo-box');
}

async function buildDatePicker(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Closed', 'Open']) {
    const outer = frame(`State=${state}`, undefined);
    autoLayout(outer, 'v', 4, 0);
    outer.primaryAxisSizingMode = 'AUTO'; outer.counterAxisSizingMode = 'FIXED';
    outer.resize(260, 1);
    const label = await text('Due date', 'semibold', 12, outer);
    bindText(label, tokens, 'color/text/primary');
    const box = frame('box', outer);
    autoLayout(box, 'h', 8, { l: 12, r: 12, t: 0, b: 0 });
    box.counterAxisSizingMode = 'FIXED'; box.primaryAxisSizingMode = 'FIXED';
    box.counterAxisAlignItems = 'CENTER';
    box.resize(260, 32);
    box.cornerRadius = 4;
    bindFill(box, tokens, 'color/canvas/background');
    bindStroke(box, tokens, 'color/stroke/default', 1);
    const v = await text('Apr 20, 2026', 'regular', 14, box);
    bindText(v, tokens, 'color/text/primary');
    const pad = rect('pad', 1, 1, box); pad.fills = []; pad.layoutGrow = 1;
    const cal = await text('📅', 'regular', 14, box);
    if (state === 'Open') {
      const cal2 = frame('calendar', outer);
      autoLayout(cal2, 'v', 4, 8);
      cal2.primaryAxisSizingMode = 'AUTO'; cal2.counterAxisSizingMode = 'FIXED';
      cal2.resize(260, 1);
      cal2.cornerRadius = 4;
      bindFill(cal2, tokens, 'color/canvas/background');
      bindStroke(cal2, tokens, 'color/stroke/default', 1);
      const hdr = await text('April 2026', 'semibold', 13, cal2);
      bindText(hdr, tokens, 'color/text/primary');
      for (let r = 0; r < 5; r++) {
        const row = frame('row', cal2);
        autoLayout(row, 'h', 4, 0);
        row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
        row.resize(244, 1);
        for (let c = 0; c < 7; c++) {
          const cell = frame('cell', row);
          autoLayout(cell, 'h', 0, 0);
          cell.primaryAxisAlignItems = 'CENTER'; cell.counterAxisAlignItems = 'CENTER';
          cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
          cell.resize(32, 28);
          const d = r * 7 + c - 2;
          const n = d > 0 && d < 31 ? String(d) : '';
          const tx = await text(n, 'regular', 12, cell);
          bindText(tx, tokens, 'color/text/primary');
          if (d === 20) { cell.cornerRadius = 14; bindFill(cell, tokens, 'color/brand/primary'); bindText(tx, tokens, 'color/canvas/background'); }
        }
      }
    }
    variants.push(figma.createComponentFromNode(outer));
  }
  return publishSet(page, variants, 'Canvas/Input/Date Picker', {
    purpose: 'Date selection with optional calendar popup.',
    pp: 'Date picker (Modern Controls).',
    docs: 'https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-date-picker',
  }, 'canvas/input/date-picker');
}

async function buildTimePicker(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Default', 'Focus'] as FieldState[]) {
    const outer = frame(`State=${state}`, undefined);
    autoLayout(outer, 'v', 4, 0);
    outer.primaryAxisSizingMode = 'AUTO'; outer.counterAxisSizingMode = 'FIXED';
    outer.resize(200, 1);
    const label = await text('Start time', 'semibold', 12, outer);
    bindText(label, tokens, 'color/text/primary');
    const box = frame('box', outer);
    autoLayout(box, 'h', 8, { l: 12, r: 12, t: 0, b: 0 });
    box.counterAxisSizingMode = 'FIXED'; box.primaryAxisSizingMode = 'FIXED';
    box.counterAxisAlignItems = 'CENTER';
    box.resize(200, 32);
    box.cornerRadius = 4;
    bindFill(box, tokens, 'color/canvas/background');
    bindStroke(box, tokens, borderFor(state), state === 'Focus' ? 2 : 1);
    const v = await text('09:30 AM', 'regular', 14, box);
    bindText(v, tokens, 'color/text/primary');
    variants.push(figma.createComponentFromNode(outer));
  }
  return publishSet(page, variants, 'Canvas/Input/Time Picker', {
    purpose: 'Time selection.',
    pp: 'Time picker (Modern Controls).',
  }, 'canvas/input/time-picker');
}

export async function buildCanvasInputs(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  sets.push(await buildTextInput(page, tokens));
  sets.push(await buildTextArea(page, tokens));
  sets.push(await buildDropdown(page, tokens));
  sets.push(await buildComboBox(page, tokens));
  sets.push(await buildDatePicker(page, tokens));
  sets.push(await buildTimePicker(page, tokens));
  sets.push(await buildToggleSet(page, tokens));
  sets.push(await buildCheckboxSet(page, tokens));
  sets.push(await buildRadioGroup(page, tokens));
  sets.push(await buildSlider(page, tokens));
  sets.push(await buildRating(page, tokens));
  sets.push(await buildNumberInput(page, tokens));
  return sets;
}
