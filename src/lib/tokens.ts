/**
 * `Power Platform Tokens` — colour Variables (Light/Dark modes), typography
 * text styles, spacing Variables, radius Variables, stroke Variables, and
 * elevation Effect styles.
 *
 * Idempotent: re-runs update existing variables/styles rather than creating
 * duplicates.
 */

import { PALETTE, hexToRgba } from './colors.js';
import { fontFor } from './fonts.js';

export const COLLECTION_NAME = 'Power Platform Tokens';

export const SPACING: Record<string, number> = {
  'space/0': 0,  'space/2': 2,  'space/4': 4,  'space/6': 6,
  'space/8': 8,  'space/12': 12,'space/16': 16,'space/20': 20,
  'space/24': 24,'space/32': 32,'space/40': 40,'space/48': 48,
};

export const RADIUS: Record<string, number> = {
  'radius/none': 0,
  'radius/small': 2,
  'radius/medium': 4,
  'radius/large': 8,
  'radius/circular': 9999,
};

export const STROKE: Record<string, number> = {
  'stroke/thin': 1,
  'stroke/thick': 2,
};

export interface TypeToken {
  name: string;
  size: number;
  lineHeight: number;
  weight: 'regular' | 'medium' | 'semibold' | 'bold';
}

export const TYPE: TypeToken[] = [
  { name: 'type/caption',      size: 12, lineHeight: 16, weight: 'regular' },
  { name: 'type/body',         size: 14, lineHeight: 20, weight: 'regular' },
  { name: 'type/body-strong',  size: 14, lineHeight: 20, weight: 'semibold' },
  { name: 'type/subtitle',     size: 16, lineHeight: 22, weight: 'semibold' },
  { name: 'type/title-3',      size: 20, lineHeight: 28, weight: 'semibold' },
  { name: 'type/title-2',      size: 24, lineHeight: 32, weight: 'semibold' },
  { name: 'type/title-1',      size: 32, lineHeight: 40, weight: 'semibold' },
  { name: 'type/display',      size: 40, lineHeight: 52, weight: 'bold' },
];

export interface Tokens {
  collection: VariableCollection;
  lightMode: string;
  darkMode: string;
  color: Map<string, Variable>;
  space: Map<string, Variable>;
  radius: Map<string, Variable>;
  stroke: Map<string, Variable>;
  type: Map<string, TextStyle>;
  elevation: Map<string, EffectStyle>;
}

async function getOrCreateCollection(): Promise<{ collection: VariableCollection; lightId: string; darkId: string; }> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let col = collections.find(c => c.name === COLLECTION_NAME);
  if (!col) {
    col = figma.variables.createVariableCollection(COLLECTION_NAME);
  }
  // Ensure two modes named Light and Dark exist.
  let lightMode = col.modes.find(m => m.name === 'Light');
  let darkMode = col.modes.find(m => m.name === 'Dark');
  if (!lightMode) {
    const firstId = col.modes[0].modeId;
    col.renameMode(firstId, 'Light');
    lightMode = col.modes.find(m => m.name === 'Light')!;
  }
  if (!darkMode) {
    const newId = col.addMode('Dark');
    darkMode = col.modes.find(m => m.modeId === newId)!;
  }
  return { collection: col, lightId: lightMode.modeId, darkId: darkMode.modeId };
}

async function upsertVariable(
  name: string,
  type: VariableResolvedDataType,
  collection: VariableCollection,
): Promise<Variable> {
  const all = await figma.variables.getLocalVariablesAsync(type);
  const existing = all.find(v => v.name === name && v.variableCollectionId === collection.id);
  if (existing) return existing;
  return figma.variables.createVariable(name, collection, type);
}

export async function buildTokens(): Promise<Tokens> {
  const { collection, lightId, darkId } = await getOrCreateCollection();

  // ----- Colour variables -----
  const colorMap = new Map<string, Variable>();
  for (const [name, modes] of Object.entries(PALETTE)) {
    const v = await upsertVariable(name, 'COLOR', collection);
    v.setValueForMode(lightId, hexToRgba(modes.light));
    v.setValueForMode(darkId, hexToRgba(modes.dark));
    colorMap.set(name, v);
  }

  // ----- Spacing, radius, stroke -----
  const spaceMap = new Map<string, Variable>();
  for (const [name, n] of Object.entries(SPACING)) {
    const v = await upsertVariable(name, 'FLOAT', collection);
    v.setValueForMode(lightId, n);
    v.setValueForMode(darkId, n);
    spaceMap.set(name, v);
  }
  const radiusMap = new Map<string, Variable>();
  for (const [name, n] of Object.entries(RADIUS)) {
    const v = await upsertVariable(name, 'FLOAT', collection);
    v.setValueForMode(lightId, n);
    v.setValueForMode(darkId, n);
    radiusMap.set(name, v);
  }
  const strokeMap = new Map<string, Variable>();
  for (const [name, n] of Object.entries(STROKE)) {
    const v = await upsertVariable(name, 'FLOAT', collection);
    v.setValueForMode(lightId, n);
    v.setValueForMode(darkId, n);
    strokeMap.set(name, v);
  }

  // ----- Type styles (TextStyle is separate from Variables in Figma today) -----
  const typeMap = new Map<string, TextStyle>();
  const existingText = await figma.getLocalTextStylesAsync();
  for (const t of TYPE) {
    const fn = await fontFor(t.weight);
    let style = existingText.find(s => s.name === t.name);
    if (!style) style = figma.createTextStyle();
    style.name = t.name;
    style.fontName = fn;
    style.fontSize = t.size;
    style.lineHeight = { unit: 'PIXELS', value: t.lineHeight };
    style.letterSpacing = { unit: 'PERCENT', value: 0 };
    typeMap.set(t.name, style);
  }

  // ----- Elevation effect styles -----
  const elevationMap = new Map<string, EffectStyle>();
  const existingEffect = await figma.getLocalEffectStylesAsync();
  const elevations: Array<{ name: string; y: number; blur: number; alpha: number; }> = [
    { name: 'elevation/2',  y: 1, blur: 2,  alpha: 0.10 },
    { name: 'elevation/4',  y: 2, blur: 4,  alpha: 0.12 },
    { name: 'elevation/8',  y: 4, blur: 8,  alpha: 0.14 },
    { name: 'elevation/16', y: 8, blur: 16, alpha: 0.18 },
  ];
  for (const e of elevations) {
    let style = existingEffect.find(s => s.name === e.name);
    if (!style) style = figma.createEffectStyle();
    style.name = e.name;
    style.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: e.alpha },
      offset: { x: 0, y: e.y },
      radius: e.blur,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
      showShadowBehindNode: false,
    }];
    elevationMap.set(e.name, style);
  }

  return {
    collection,
    lightMode: lightId,
    darkMode: darkId,
    color: colorMap,
    space: spaceMap,
    radius: radiusMap,
    stroke: strokeMap,
    type: typeMap,
    elevation: elevationMap,
  };
}

/**
 * Convenience helpers for binding variables to nodes.
 */
export function bindFill(node: SceneNode & MinimalFillsMixin, variable: Variable): void {
  const paint = figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
    'color',
    variable,
  );
  node.fills = [paint];
}

export function bindStrokeColor(node: SceneNode & MinimalStrokesMixin, variable: Variable): void {
  const paint = figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
    'color',
    variable,
  );
  node.strokes = [paint];
}

export function bindNumber<K extends keyof VariableBindableNodeField>(
  node: SceneNode,
  field: K,
  variable: Variable,
): void {
  // @ts-expect-error — Figma typings for setBoundVariable accept this field set.
  node.setBoundVariable(field, variable);
}

export type VariableBindableNodeField =
  | 'width' | 'height'
  | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'
  | 'itemSpacing' | 'counterAxisSpacing'
  | 'topLeftRadius' | 'topRightRadius' | 'bottomLeftRadius' | 'bottomRightRadius'
  | 'strokeWeight';
