/**
 * A curated subset of Fluent UI System Icons (MIT licensed) as inline SVG
 * path strings. Each icon is rendered as a 20×20 component via figma's
 * createNodeFromSvg — giving us resizable vector Components.
 *
 * The full library's 80-icon subset is finalised in increment 3.
 */

export interface IconDef {
  name: string;   // key like 'add', 'delete', 'mail'
  viewBox?: string;
  svg: string;    // raw SVG markup (without outer <svg>)
}

// Seed set — expanded in increment 3.
export const ICONS: IconDef[] = [];

export function svgDoc(def: IconDef): string {
  const vb = def.viewBox ?? '0 0 20 20';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="20" height="20">${def.svg}</svg>`;
}
