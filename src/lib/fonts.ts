/**
 * Runtime font resolver. Segoe UI Variable only ships on Windows 11 — on
 * other platforms we fall back to Segoe UI, Inter, Roboto (which Figma
 * ships universally).
 */

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

export const FONT_FALLBACKS = ['Segoe UI Variable', 'Segoe UI', 'Inter', 'Roboto'];

let _resolvedFamily: string | null = null;
const _styleCache = new Map<string, string[]>();

export async function resolveFamily(): Promise<string> {
  if (_resolvedFamily) return _resolvedFamily;
  const avail = await figma.listAvailableFontsAsync();
  const families = new Set(avail.map(f => f.fontName.family));
  for (const f of FONT_FALLBACKS) {
    if (families.has(f)) { _resolvedFamily = f; return f; }
  }
  _resolvedFamily = 'Roboto';
  return _resolvedFamily;
}

async function stylesFor(family: string): Promise<string[]> {
  const cached = _styleCache.get(family);
  if (cached) return cached;
  const avail = await figma.listAvailableFontsAsync();
  const styles = avail.filter(f => f.fontName.family === family).map(f => f.fontName.style);
  _styleCache.set(family, styles);
  return styles;
}

export async function fontFor(weight: Weight = 'regular'): Promise<FontName> {
  const family = await resolveFamily();
  const styles = await stylesFor(family);
  const want: Record<Weight, string[]> = {
    regular:  ['Regular', 'Text', 'Book', 'Normal'],
    medium:   ['Medium', 'Regular'],
    semibold: ['Semibold', 'Semi Bold', 'SemiBold', 'DemiBold', 'Display', 'Medium', 'Bold'],
    bold:     ['Bold', 'Heavy', 'Black', 'Semibold', 'Semi Bold']
  };
  let style = 'Regular';
  for (const s of want[weight]) { if (styles.includes(s)) { style = s; break; } }
  if (!styles.includes(style) && styles.length) style = styles[0];
  const fn: FontName = { family, style };
  try { await figma.loadFontAsync(fn); } catch (_) { /* nop */ }
  return fn;
}

/** Preload the family across weights we commonly use. */
export async function preloadFonts(): Promise<void> {
  for (const w of ['regular', 'medium', 'semibold', 'bold'] as Weight[]) {
    await fontFor(w);
  }
}
