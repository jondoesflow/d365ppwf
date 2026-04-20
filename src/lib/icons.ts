/**
 * A curated subset of Fluent UI System Icons (MIT licensed, Microsoft).
 * Each entry is 20×20. We render them as vector Components via
 * createNodeFromSvg so consumers can freely recolour and resize them.
 *
 * Source: https://github.com/microsoft/fluentui-system-icons (MIT)
 */

export interface IconDef {
  name: string;
  svg: string;        // inner SVG markup — no outer <svg> tag
  group: 'nav' | 'action' | 'status' | 'connector' | 'form' | 'flow' | 'misc';
}

// Keep paths terse. `fill="currentColor"` on each path lets us recolour via
// the vector's fill property.
const p = (d: string, fill = 'currentColor'): string => `<path d="${d}" fill="${fill}"/>`;
const r = (x: number, y: number, w: number, h: number, rx = 0): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="currentColor"/>`;
const c = (cx: number, cy: number, r: number): string =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor"/>`;

export const ICONS: IconDef[] = [
  // ----- Navigation -----
  { name: 'home',      group: 'nav', svg: p('M10 2 L17 8 L17 17 L13 17 L13 12 L7 12 L7 17 L3 17 L3 8 Z') },
  { name: 'menu',      group: 'nav', svg: r(3, 5, 14, 1.5, 0.5) + r(3, 9.25, 14, 1.5, 0.5) + r(3, 13.5, 14, 1.5, 0.5) },
  { name: 'search',    group: 'nav', svg: p('M9 3a6 6 0 1 0 3.6 10.8l3.3 3.3 1.4-1.4-3.3-3.3A6 6 0 0 0 9 3Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z') },
  { name: 'chevron-right', group: 'nav', svg: p('M7 3 L14 10 L7 17 L5.6 15.6 L11.2 10 L5.6 4.4 Z') },
  { name: 'chevron-down',  group: 'nav', svg: p('M3 7 L10 14 L17 7 L15.6 5.6 L10 11.2 L4.4 5.6 Z') },
  { name: 'chevron-up',    group: 'nav', svg: p('M3 13 L10 6 L17 13 L15.6 14.4 L10 8.8 L4.4 14.4 Z') },
  { name: 'chevron-left',  group: 'nav', svg: p('M13 3 L6 10 L13 17 L14.4 15.6 L8.8 10 L14.4 4.4 Z') },
  { name: 'arrow-left',    group: 'nav', svg: p('M10 3 L2 10 L10 17 L11.4 15.6 L6 11 L18 11 L18 9 L6 9 L11.4 4.4 Z') },
  { name: 'arrow-right',   group: 'nav', svg: p('M10 3 L18 10 L10 17 L8.6 15.6 L14 11 L2 11 L2 9 L14 9 L8.6 4.4 Z') },
  { name: 'more-horizontal', group: 'nav', svg: c(5, 10, 1.5) + c(10, 10, 1.5) + c(15, 10, 1.5) },
  { name: 'more-vertical',   group: 'nav', svg: c(10, 5, 1.5) + c(10, 10, 1.5) + c(10, 15, 1.5) },

  // ----- Actions -----
  { name: 'add',     group: 'action', svg: r(9, 3, 2, 14, 0.5) + r(3, 9, 14, 2, 0.5) },
  { name: 'close',   group: 'action', svg: p('M4 5.4 L5.4 4 L10 8.6 L14.6 4 L16 5.4 L11.4 10 L16 14.6 L14.6 16 L10 11.4 L5.4 16 L4 14.6 L8.6 10 Z') },
  { name: 'edit',    group: 'action', svg: p('M3 14 L13 4 L16 7 L6 17 L3 17 Z M12 5 L15 8') },
  { name: 'delete',  group: 'action', svg: p('M7 3 L13 3 L13 4 L16 4 L16 6 L4 6 L4 4 L7 4 Z M5 7 L15 7 L14 17 L6 17 Z') },
  { name: 'save',    group: 'action', svg: p('M3 3 H14 L17 6 V17 H3 Z M6 3 V8 H13 V3 M6 12 H14 V17 H6 Z') },
  { name: 'copy',    group: 'action', svg: p('M5 3 H13 V13 H5 Z M7 5 H15 V15 H7 M5 11 V15 H11') },
  { name: 'share',   group: 'action', svg: c(5, 10, 2) + c(15, 5, 2) + c(15, 15, 2) + p('M6.5 9 L13.5 6 M6.5 11 L13.5 14', 'none') },
  { name: 'send',    group: 'action', svg: p('M3 3 L17 10 L3 17 L5 10 Z') },
  { name: 'upload',  group: 'action', svg: p('M10 3 L16 9 L13 9 L13 13 L7 13 L7 9 L4 9 Z M3 15 H17 V17 H3 Z') },
  { name: 'download',group: 'action', svg: p('M10 13 L4 7 L7 7 L7 3 L13 3 L13 7 L16 7 Z M3 15 H17 V17 H3 Z') },
  { name: 'refresh', group: 'action', svg: p('M10 3 A7 7 0 1 1 3.5 13 L5 12 A5 5 0 1 0 10 5 L10 7 L6 4 L10 1 Z') },
  { name: 'filter',  group: 'action', svg: p('M3 4 L17 4 L12 11 L12 16 L8 16 L8 11 Z') },
  { name: 'settings',group: 'action', svg: p('M10 6 A4 4 0 1 1 6 10 A4 4 0 0 1 10 6 Z M9 2 H11 L11.5 4 H8.5 Z M9 16 H11 L11.5 18 H8.5 Z') + c(10, 10, 2) },
  { name: 'sort',    group: 'action', svg: p('M5 3 V13 M3 11 L5 13 L7 11 M13 17 V7 M11 9 L13 7 L15 9') },

  // ----- Status -----
  { name: 'success', group: 'status', svg: c(10, 10, 8) + p('M6 10 L9 13 L14 7', 'none') },
  { name: 'warning', group: 'status', svg: p('M10 3 L18 17 L2 17 Z') + r(9, 8, 2, 5, 0.5) + c(10, 15, 1) },
  { name: 'error',   group: 'status', svg: c(10, 10, 8) + p('M7 7 L13 13 M13 7 L7 13', 'none') },
  { name: 'info',    group: 'status', svg: c(10, 10, 8) + r(9, 9, 2, 6, 0.5) + c(10, 6, 1) },
  { name: 'lock',    group: 'status', svg: r(5, 9, 10, 8, 1) + p('M7 9 V6 A3 3 0 0 1 13 6 V9') },
  { name: 'unlock',  group: 'status', svg: r(5, 9, 10, 8, 1) + p('M7 9 V6 A3 3 0 0 1 13 6') },
  { name: 'checkmark', group: 'status', svg: p('M4 10 L8 14 L16 6', 'none') },
  { name: 'new',     group: 'status', svg: c(10, 10, 6) },

  // ----- Form fields -----
  { name: 'calendar', group: 'form', svg: r(3, 5, 14, 12, 1) + r(3, 5, 14, 3, 1) + r(6, 3, 1, 4) + r(13, 3, 1, 4) },
  { name: 'clock',    group: 'form', svg: c(10, 10, 7) + p('M10 5 V10 L13 13', 'none') },
  { name: 'mail',     group: 'form', svg: r(2, 5, 16, 11, 1) + p('M2 5 L10 12 L18 5', 'none') },
  { name: 'phone',    group: 'form', svg: p('M4 3 L8 3 L9 7 L7 9 A7 7 0 0 0 11 13 L13 11 L17 12 L17 16 A2 2 0 0 1 15 18 A14 14 0 0 1 2 5 A2 2 0 0 1 4 3 Z') },
  { name: 'person',   group: 'form', svg: c(10, 6, 3) + p('M3 18 A7 7 0 0 1 17 18 Z') },
  { name: 'people',   group: 'form', svg: c(7, 7, 3) + c(14, 8, 2.5) + p('M1 18 A6 6 0 0 1 13 18 Z M12 18 A4 4 0 0 1 19 18 Z') },
  { name: 'globe',    group: 'form', svg: c(10, 10, 7) + p('M3 10 H17 M10 3 A7 9 0 0 1 10 17 A7 9 0 0 1 10 3', 'none') },
  { name: 'attach',   group: 'form', svg: p('M13 3 L6 10 A3 3 0 0 0 10 14 L15 9 A5 5 0 0 0 8 2 L3 7 A7 7 0 0 0 13 17 L17 13') },
  { name: 'link',     group: 'form', svg: p('M7 13 L13 7 M6 11 A3 3 0 0 0 9 14 L12 11 M11 9 A3 3 0 0 1 14 6 L17 3') },
  { name: 'text',     group: 'form', svg: r(4, 5, 12, 2) + r(4, 9, 10, 2) + r(4, 13, 8, 2) },
  { name: 'image',    group: 'form', svg: r(3, 4, 14, 12, 1) + c(7, 8, 1.5) + p('M3 14 L8 10 L12 13 L17 8 V16 L3 16 Z') },

  // ----- Flow / data ops -----
  { name: 'trigger',     group: 'flow', svg: p('M5 3 L15 10 L5 17 Z') },
  { name: 'condition',   group: 'flow', svg: p('M10 2 L18 10 L10 18 L2 10 Z') },
  { name: 'loop',        group: 'flow', svg: p('M10 3 A7 7 0 1 1 3.5 13 L5 12 A5 5 0 1 0 10 5 L12 5 L9 8 L6 5 Z') },
  { name: 'scope',       group: 'flow', svg: r(3, 3, 14, 14, 2) + r(6, 6, 8, 8, 1) },
  { name: 'variable',    group: 'flow', svg: p('M6 4 C2 8 2 12 6 16 M14 4 C18 8 18 12 14 16 M8 8 L12 12 M12 8 L8 12') },
  { name: 'expression',  group: 'flow', svg: p('M5 4 L5 16 M7 4 Q4 10 7 16 M15 4 L15 16 M13 4 Q16 10 13 16 M8 10 L12 10') },
  { name: 'branch',      group: 'flow', svg: c(5, 5, 2) + c(15, 5, 2) + c(10, 15, 2) + p('M5 7 V11 L10 13 L15 11 V7', 'none') },
  { name: 'terminate',   group: 'flow', svg: c(10, 10, 8) + r(6, 9, 8, 2) },

  // ----- Connector logos (approximated as tinted glyphs) -----
  { name: 'connector-o365',       group: 'connector', svg: p('M3 4 L13 3 L13 17 L3 16 Z M14 5 L17 6 L17 14 L14 15 Z') },
  { name: 'connector-dataverse',  group: 'connector', svg: p('M10 3 L17 7 L17 13 L10 17 L3 13 L3 7 Z') + p('M10 3 L10 17 M3 7 L17 7 M3 13 L17 13', 'none') },
  { name: 'connector-sharepoint', group: 'connector', svg: c(7, 8, 3.5) + c(13, 12, 2.5) + c(15, 7, 2) },
  { name: 'connector-teams',      group: 'connector', svg: r(2, 5, 10, 10, 1) + r(12, 3, 6, 14, 1) + p('M4 8 H10 M7 8 V13', 'none') },
  { name: 'connector-outlook',    group: 'connector', svg: r(2, 4, 10, 12, 1) + c(7, 10, 3) + r(12, 6, 6, 8, 1) },
  { name: 'connector-http',       group: 'connector', svg: p('M4 6 H16 M4 10 H16 M4 14 H16 M8 4 L6 16 M14 4 L12 16') },
  { name: 'connector-approvals',  group: 'connector', svg: c(10, 10, 8) + p('M6 10 L9 13 L14 7', 'none') },
  { name: 'connector-forms',      group: 'connector', svg: r(3, 3, 14, 14, 1) + r(6, 7, 8, 1) + r(6, 10, 8, 1) + r(6, 13, 5, 1) },
  { name: 'connector-excel',      group: 'connector', svg: r(3, 3, 14, 14, 1) + p('M6 6 L14 14 M14 6 L6 14', 'none') },
  { name: 'connector-sql',        group: 'connector', svg: p('M3 6 A7 3 0 1 0 17 6 A7 3 0 1 0 3 6 Z M3 6 V14 A7 3 0 0 0 17 14 V6') },

  // ----- Misc -----
  { name: 'star',      group: 'misc', svg: p('M10 2 L12.5 7.5 L18 8 L13.5 12 L15 18 L10 15 L5 18 L6.5 12 L2 8 L7.5 7.5 Z') },
  { name: 'heart',     group: 'misc', svg: p('M10 17 C4 13 2 9 4 5 C6 2 9 3 10 6 C11 3 14 2 16 5 C18 9 16 13 10 17 Z') },
  { name: 'bookmark',  group: 'misc', svg: p('M5 3 H15 V17 L10 14 L5 17 Z') },
  { name: 'tag',       group: 'misc', svg: p('M3 3 H10 L17 10 L10 17 L3 10 Z') + c(6, 6, 1) },
  { name: 'database',  group: 'misc', svg: p('M3 5 A7 3 0 1 0 17 5 A7 3 0 1 0 3 5 Z M3 5 V10 A7 3 0 0 0 17 10 V5 M3 10 V15 A7 3 0 0 0 17 15 V10', 'none') },
  { name: 'chart',     group: 'misc', svg: r(4, 10, 2, 6) + r(9, 6, 2, 10) + r(14, 3, 2, 13) },
  { name: 'file',      group: 'misc', svg: p('M5 3 H12 L15 6 V17 H5 Z M12 3 V6 H15') },
];

export function svgDoc(def: IconDef): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">${def.svg}</svg>`;
}
