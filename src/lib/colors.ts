/**
 * Fluent 2 / Power Platform colour palette.
 * The Light/Dark pairs here are the source of truth consumed by tokens.ts.
 */

export type Hex = string;

export interface ColorModes { light: Hex; dark: Hex; }

export const PALETTE: Record<string, ColorModes> = {
  'color/brand/primary':         { light: '#0F6CBD', dark: '#2886DE' },
  'color/brand/primary-hover':   { light: '#115EA3', dark: '#479EF5' },
  'color/brand/primary-pressed': { light: '#0F548C', dark: '#62ABF5' },

  'color/canvas/background':     { light: '#FFFFFF', dark: '#1F1F1F' },
  'color/canvas/surface':        { light: '#FAFAFA', dark: '#292929' },
  'color/canvas/surface-alt':    { light: '#F5F5F5', dark: '#333333' },

  'color/stroke/default':        { light: '#D1D1D1', dark: '#666666' },
  'color/stroke/subtle':         { light: '#E0E0E0', dark: '#525252' },

  'color/text/primary':          { light: '#242424', dark: '#FFFFFF' },
  'color/text/secondary':        { light: '#616161', dark: '#D6D6D6' },
  'color/text/disabled':         { light: '#BDBDBD', dark: '#5C5C5C' },

  'color/status/success':        { light: '#107C10', dark: '#54B054' },
  'color/status/warning':        { light: '#F7630C', dark: '#FAA06B' },
  'color/status/danger':         { light: '#C50F1F', dark: '#E37D80' },
  'color/status/info':           { light: '#0F6CBD', dark: '#479EF5' },

  'color/flow/trigger':              { light: '#742774', dark: '#B4A0FF' },
  'color/flow/action':               { light: '#0F6CBD', dark: '#479EF5' },
  'color/flow/control':              { light: '#616161', dark: '#D6D6D6' },
  'color/flow/connector-o365':       { light: '#0078D4', dark: '#2886DE' },
  'color/flow/connector-dataverse':  { light: '#0B5A9D', dark: '#62ABF5' },
  'color/flow/connector-sharepoint': { light: '#0B6B3A', dark: '#54B054' },
  'color/flow/connector-teams':      { light: '#4B53BC', dark: '#8A92E8' },
};

export function hexToRgb(hex: Hex): RGB {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export function hexToRgba(hex: Hex, a = 1): RGBA {
  return { ...hexToRgb(hex), a };
}
