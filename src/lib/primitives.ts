/**
 * Cross-library primitives — the atoms consumed by Canvas, MDA and Flow:
 * Icons, Avatar, Badge, Tag, Spinner, Persona. Every component uses
 * auto-layout and binds colours to token variables.
 */

import type { Tokens } from './tokens.js';
import { ICONS, svgDoc, type IconDef } from './icons.js';
import { frame, autoLayout, rect, ellipse, text } from './layout.js';
import { fontFor } from './fonts.js';
import { remember } from './pluginData.js';

export interface PrimitivesBuild {
  components: ComponentNode[];
  sets: ComponentSetNode[];
  iconByName: Map<string, ComponentNode>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bindFillVar(node: SceneNode & MinimalFillsMixin, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  node.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', v)];
}
function bindStrokeVar(node: SceneNode & MinimalStrokesMixin, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  node.strokes = [figma.variables.setBoundVariableForPaint(paint, 'color', v)];
  node.strokeWeight = 1;
}
function bindTextColor(node: TextNode, tokens: Tokens, key: string): void {
  const v = tokens.color.get(key);
  if (!v) return;
  const paint: SolidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  node.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', v)];
}

function setDescription(
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

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

async function buildIconVariant(def: IconDef, tokens: Tokens): Promise<ComponentNode> {
  const doc = svgDoc(def);
  const node = figma.createNodeFromSvg(doc);
  node.name = `Name=${def.name}`;
  node.resize(20, 20);
  // Bind all vectors inside to color/text/primary. Fluent icons are
  // monochrome; consumers override with component fill if needed.
  node.findAll(n => n.type === 'VECTOR' || n.type === 'RECTANGLE' || n.type === 'ELLIPSE').forEach(n => {
    try { bindFillVar(n as SceneNode & MinimalFillsMixin, tokens, 'color/text/primary'); } catch (_) { /* nop */ }
  });
  const comp = figma.createComponentFromNode(node);
  comp.name = `Name=${def.name}`;
  return comp;
}

async function buildIconSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode | null> {
  const variants: ComponentNode[] = [];
  for (const def of ICONS) {
    const c = await buildIconVariant(def, tokens);
    page.appendChild(c);
    variants.push(c);
  }
  if (!variants.length) return null;
  const set = figma.combineAsVariants(variants, page);
  set.name = 'Primitives/Icon';
  setDescription(
    set,
    '20×20 vector icon glyph drawn from the Fluent UI System Icons set.',
    'Icon control (Canvas Apps) / various in MDA and Power Automate',
    'https://github.com/microsoft/fluentui-system-icons',
  );
  remember('primitives/icon', set);
  return set;
}

// ---------------------------------------------------------------------------
// Avatar — Size × Content variants
// ---------------------------------------------------------------------------

const AVATAR_SIZES = { XS: 16, S: 24, M: 32, L: 48, XL: 72 };

async function buildAvatarSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const [label, size] of Object.entries(AVATAR_SIZES)) {
    for (const content of ['Initials', 'Image']) {
      const f = frame(`Size=${label}, Content=${content}`, page);
      autoLayout(f, 'h', 0, 0);
      f.counterAxisAlignItems = 'CENTER';
      f.primaryAxisAlignItems = 'CENTER';
      f.counterAxisSizingMode = 'FIXED';
      f.primaryAxisSizingMode = 'FIXED';
      f.resize(size, size);
      f.cornerRadius = size / 2;
      f.clipsContent = true;
      bindFillVar(f, tokens, content === 'Image' ? 'color/canvas/surface-alt' : 'color/brand/primary');
      if (content === 'Initials') {
        const fontSize = Math.max(9, Math.round(size * 0.38));
        const t = await text('AB', 'semibold', fontSize, f);
        bindTextColor(t, tokens, 'color/canvas/background');
      } else {
        const swatch = rect('placeholder', size, size, f);
        bindFillVar(swatch, tokens, 'color/stroke/default');
      }
      const comp = figma.createComponentFromNode(f);
      variants.push(comp);
    }
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'Primitives/Avatar';
  setDescription(
    set,
    'Circular avatar showing either a user image or initials.',
    'Persona / avatar pattern used across Canvas gallery items and MDA form headers',
    'https://react.fluentui.dev/?path=/docs/components-avatar--docs',
  );
  remember('primitives/avatar', set);
  return set;
}

// ---------------------------------------------------------------------------
// Badge — Type × Tone
// ---------------------------------------------------------------------------

async function buildBadgeSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const tones = [
    { key: 'Neutral', fill: 'color/canvas/surface-alt', fg: 'color/text/primary' },
    { key: 'Brand',   fill: 'color/brand/primary',      fg: 'color/canvas/background' },
    { key: 'Success', fill: 'color/status/success',     fg: 'color/canvas/background' },
    { key: 'Warning', fill: 'color/status/warning',     fg: 'color/canvas/background' },
    { key: 'Danger',  fill: 'color/status/danger',      fg: 'color/canvas/background' },
  ];
  const types = ['Dot', 'Counter', 'Status'];
  const variants: ComponentNode[] = [];
  for (const type of types) {
    for (const tone of tones) {
      const f = frame(`Type=${type}, Tone=${tone.key}`, page);
      autoLayout(f, 'h', 4, { l: type === 'Dot' ? 0 : 6, r: type === 'Dot' ? 0 : 6, t: 2, b: 2 });
      f.primaryAxisSizingMode = 'AUTO';
      f.counterAxisSizingMode = 'AUTO';
      f.counterAxisAlignItems = 'CENTER';
      f.cornerRadius = 9999;
      bindFillVar(f, tokens, tone.fill);
      if (type === 'Dot') {
        const d = ellipse('dot', 8, 8, f);
        bindFillVar(d, tokens, tone.fill);
        f.fills = [];
      } else if (type === 'Counter') {
        const t = await text('9', 'semibold', 10, f);
        bindTextColor(t, tokens, tone.fg);
      } else {
        const t = await text('Status', 'semibold', 10, f);
        bindTextColor(t, tokens, tone.fg);
      }
      variants.push(figma.createComponentFromNode(f));
    }
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'Primitives/Badge';
  setDescription(
    set,
    'Small inline marker for counts, statuses, or presence.',
    'Badge / count indicator used in Canvas Apps gallery items and MDA command bar',
    'https://react.fluentui.dev/?path=/docs/components-badge--docs',
  );
  remember('primitives/badge', set);
  return set;
}

// ---------------------------------------------------------------------------
// Tag — Variant × Size
// ---------------------------------------------------------------------------

async function buildTagSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variantStyles = ['Filled', 'Outlined'];
  const sizes = [
    { key: 'Small',  pad: 6, font: 11, height: 22 },
    { key: 'Medium', pad: 8, font: 12, height: 26 },
  ];
  const variants: ComponentNode[] = [];
  for (const v of variantStyles) {
    for (const s of sizes) {
      const f = frame(`Variant=${v}, Size=${s.key}`, page);
      autoLayout(f, 'h', 4, { l: s.pad, r: s.pad, t: 2, b: 2 });
      f.primaryAxisSizingMode = 'AUTO';
      f.counterAxisSizingMode = 'FIXED';
      f.counterAxisAlignItems = 'CENTER';
      f.resize(f.width, s.height);
      f.cornerRadius = 4;
      if (v === 'Filled') bindFillVar(f, tokens, 'color/canvas/surface-alt');
      else { bindFillVar(f, tokens, 'color/canvas/background'); bindStrokeVar(f, tokens, 'color/stroke/default'); }
      const t = await text('Tag', 'medium', s.font, f);
      bindTextColor(t, tokens, 'color/text/primary');
      variants.push(figma.createComponentFromNode(f));
    }
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'Primitives/Tag';
  setDescription(
    set,
    'Short categorical chip. Use for filters, selected items, categories.',
    'Tag control (Canvas Apps) — used extensively in Combo Box multi-select and MDA filter pane',
    'https://react.fluentui.dev/?path=/docs/components-tag--docs',
  );
  remember('primitives/tag', set);
  return set;
}

// ---------------------------------------------------------------------------
// Spinner — Size
// ---------------------------------------------------------------------------

async function buildSpinnerSet(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const sizes = [
    { key: 'Tiny',  d: 16 },
    { key: 'Small', d: 20 },
    { key: 'Medium', d: 28 },
    { key: 'Large', d: 36 },
    { key: 'Huge',  d: 48 },
  ];
  const variants: ComponentNode[] = [];
  for (const s of sizes) {
    const f = frame(`Size=${s.key}`, page);
    f.resize(s.d, s.d);
    f.fills = [];
    const ring = ellipse('ring', s.d, s.d, f);
    ring.fills = [];
    bindStrokeVar(ring, tokens, 'color/stroke/subtle');
    ring.strokeWeight = 2;
    // Arc suggestion: an overlaid rotated partial ring
    const arc = ellipse('arc', s.d, s.d, f);
    arc.fills = [];
    bindStrokeVar(arc, tokens, 'color/brand/primary');
    arc.strokeWeight = 2;
    arc.arcData = { startingAngle: 0, endingAngle: Math.PI * 0.7, innerRadius: 0 };
    variants.push(figma.createComponentFromNode(f));
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'Primitives/Spinner';
  setDescription(
    set,
    'Indeterminate loading indicator — use when duration is unknown.',
    'Spinner — used in Canvas Apps Timer/loading screens and MDA command bar during async operations',
    'https://react.fluentui.dev/?path=/docs/components-spinner--docs',
  );
  remember('primitives/spinner', set);
  return set;
}

// ---------------------------------------------------------------------------
// Persona — Size × Show secondary
// ---------------------------------------------------------------------------

async function buildPersonaSet(page: PageNode, tokens: Tokens, avatar: ComponentSetNode): Promise<ComponentSetNode> {
  const sizes = [
    { key: 'Small',  avatar: 'S', font: 12, subFont: 11 },
    { key: 'Medium', avatar: 'M', font: 14, subFont: 12 },
    { key: 'Large',  avatar: 'L', font: 16, subFont: 13 },
  ];
  const variants: ComponentNode[] = [];
  for (const s of sizes) {
    for (const hasSub of [true, false]) {
      const f = frame(`Size=${s.key}, Show secondary=${hasSub}`, page);
      autoLayout(f, 'h', 12, 0);
      f.primaryAxisSizingMode = 'AUTO';
      f.counterAxisSizingMode = 'AUTO';
      f.counterAxisAlignItems = 'CENTER';
      // Use an instance of the avatar variant.
      const avatarVariant = avatar.children.find(c => c.name.includes(`Size=${s.avatar}`) && c.name.includes('Initials')) as ComponentNode | undefined;
      if (avatarVariant) {
        const inst = avatarVariant.createInstance();
        f.appendChild(inst);
      }
      const stack = frame('texts', f);
      autoLayout(stack, 'v', 2, 0);
      stack.primaryAxisSizingMode = 'AUTO';
      stack.counterAxisSizingMode = 'AUTO';
      const name = await text('Avery Brooks', 'semibold', s.font, stack);
      bindTextColor(name, tokens, 'color/text/primary');
      if (hasSub) {
        const sub = await text('Senior Consultant', 'regular', s.subFont, stack);
        bindTextColor(sub, tokens, 'color/text/secondary');
      }
      variants.push(figma.createComponentFromNode(f));
    }
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'Primitives/Persona';
  setDescription(
    set,
    'Avatar plus name plus optional secondary line. Use in forms, galleries, timelines.',
    'Persona control (Canvas Apps) — used in MDA form headers, timeline entries, share dialogs',
    'https://react.fluentui.dev/?path=/docs/components-persona--docs',
  );
  remember('primitives/persona', set);
  return set;
}

// ---------------------------------------------------------------------------
// Page header + section layout
// ---------------------------------------------------------------------------

async function writePageHeader(page: PageNode, tokens: Tokens): Promise<void> {
  const title = await text('Primitives', 'bold', 40, page);
  title.x = 40; title.y = 40;
  bindTextColor(title, tokens, 'color/text/primary');
  const sub = await text('Atoms shared by Canvas, MDA and Flow libraries. Every primitive binds its colour to a Variable and can be restyled by switching modes.', 'regular', 14, page);
  sub.x = 40; sub.y = 96; sub.textAutoResize = 'HEIGHT'; sub.resize(900, sub.height);
  bindTextColor(sub, tokens, 'color/text/secondary');
}

async function sectionHeading(title: string, y: number, tokens: Tokens, page: PageNode): Promise<number> {
  const t = await text(title, 'semibold', 20, page);
  t.x = 40; t.y = y;
  bindTextColor(t, tokens, 'color/text/primary');
  return y + 40;
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export async function buildPrimitives(tokens: Tokens, page: PageNode): Promise<PrimitivesBuild> {
  await writePageHeader(page, tokens);

  let y = 160;

  y = await sectionHeading('Icons', y, tokens, page);
  const iconSet = await buildIconSet(page, tokens);
  if (iconSet) {
    iconSet.x = 40; iconSet.y = y;
    y += iconSet.height + 64;
  }

  y = await sectionHeading('Avatar', y, tokens, page);
  const avatar = await buildAvatarSet(page, tokens);
  avatar.x = 40; avatar.y = y;
  y += avatar.height + 64;

  y = await sectionHeading('Badge', y, tokens, page);
  const badge = await buildBadgeSet(page, tokens);
  badge.x = 40; badge.y = y;
  y += badge.height + 64;

  y = await sectionHeading('Tag', y, tokens, page);
  const tag = await buildTagSet(page, tokens);
  tag.x = 40; tag.y = y;
  y += tag.height + 64;

  y = await sectionHeading('Spinner', y, tokens, page);
  const spinner = await buildSpinnerSet(page, tokens);
  spinner.x = 40; spinner.y = y;
  y += spinner.height + 64;

  y = await sectionHeading('Persona', y, tokens, page);
  const persona = await buildPersonaSet(page, tokens, avatar);
  persona.x = 40; persona.y = y;
  y += persona.height + 64;

  const iconByName = new Map<string, ComponentNode>();
  if (iconSet) {
    for (const c of iconSet.children) {
      if (c.type === 'COMPONENT') {
        const m = c.name.match(/Name=([^,]+)/);
        if (m) iconByName.set(m[1], c);
      }
    }
  }

  const sets: ComponentSetNode[] = [];
  if (iconSet) sets.push(iconSet);
  sets.push(avatar, badge, tag, spinner, persona);
  return { components: [], sets, iconByName };
}
