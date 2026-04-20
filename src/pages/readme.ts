/**
 * 📖 Readme page — cover card with version, build date, token reference,
 * copy-paste instructions, and a short changelog excerpt.
 */

import type { Tokens } from '../lib/tokens.js';
import { frame, autoLayout, rect, text } from '../lib/layout.js';
import { bindFill, bindStroke, bindText } from '../lib/componentKit.js';

export const VERSION = '0.2.0';

export async function buildReadmePage(tokens: Tokens, page: PageNode): Promise<void> {
  // Hero
  const hero = frame('hero', page);
  autoLayout(hero, 'v', 20, 64);
  hero.primaryAxisSizingMode = 'FIXED'; hero.counterAxisSizingMode = 'FIXED';
  hero.resize(1200, 460); hero.cornerRadius = 12;
  hero.x = 40; hero.y = 40;
  bindFill(hero, tokens, 'color/brand/primary');
  const crumb = await text(`v${VERSION} · built ${new Date().toISOString().slice(0, 10)}`, 'semibold', 12, hero);
  bindText(crumb, tokens, 'color/canvas/background');
  crumb.opacity = 0.8;
  const title = await text('Power Platform Wireframe Library', 'bold', 56, hero);
  bindText(title, tokens, 'color/canvas/background');
  title.lineHeight = { unit: 'PERCENT', value: 100 };
  const tag = await text('Reusable Figma component library for makers and solution architects building on Dynamics 365 and the Power Platform.', 'regular', 18, hero);
  tag.textAutoResize = 'HEIGHT'; tag.resize(900, tag.height);
  bindText(tag, tokens, 'color/canvas/background');
  tag.opacity = 0.9;

  // Three info cards
  const cardsY = 520;
  const cards: Array<[string, string[]]> = [
    ['Contents', [
      '🎨 Tokens — Variables · Text Styles · Effects',
      '🧱 Primitives — Icons · Avatar · Badge · Tag · Spinner · Persona',
      '🖼 Canvas Apps — Modern Controls (~40 sets)',
      '🏛 Model-Driven Apps — Fluent UI 2 (~40 sets)',
      '🔀 Power Automate — Cloud Flows (~50 sets)',
      '📐 Wireframe Examples — 4+ screens per library',
      '🧪 Playground — empty page for your own work',
    ]],
    ['How to use', [
      '1. Open the Assets panel (⇧2).',
      '2. Search for Canvas/, MDA/, or Flow/ to find components.',
      '3. Drag an instance onto your canvas or Playground page.',
      '4. Adjust variant properties in the right-hand panel.',
      '5. Swap mode on Power Platform Tokens to re-theme.',
      '6. Re-run the plugin anytime to patch components in place.',
    ]],
    ['Conventions', [
      'Category/Subcategory/Name naming for assets-panel grouping.',
      'State × Size × Appearance variant axes.',
      'Every colour / stroke / radius bound to a Variable.',
      'Auto-layout on every container.',
      'Descriptions: Purpose · PP equivalent · Docs link.',
      'Idempotent re-runs — stable node ids in pluginData.',
    ]],
  ];
  for (const [i, [titleText, bullets]] of cards.entries()) {
    const card = frame(titleText, page);
    autoLayout(card, 'v', 10, 20);
    card.primaryAxisSizingMode = 'FIXED'; card.counterAxisSizingMode = 'FIXED';
    card.resize(386, 320); card.cornerRadius = 8;
    card.x = 40 + i * (386 + 20); card.y = cardsY;
    bindFill(card, tokens, 'color/canvas/background');
    bindStroke(card, tokens, 'color/stroke/subtle', 1);
    const h = await text(titleText, 'semibold', 18, card);
    bindText(h, tokens, 'color/text/primary');
    for (const b of bullets) {
      const bt = await text(b, 'regular', 13, card);
      bindText(bt, tokens, 'color/text/secondary');
      bt.textAutoResize = 'HEIGHT'; bt.layoutAlign = 'STRETCH';
    }
  }

  // Token quick-reference
  const ref = await text('Token quick reference', 'semibold', 20, page);
  ref.x = 40; ref.y = cardsY + 360;
  bindText(ref, tokens, 'color/text/primary');
  const hint = await text('Every component binds to tokens in the Power Platform Tokens collection. Visit the 🎨 Tokens page for a full specimen.', 'regular', 13, page);
  hint.x = 40; hint.y = cardsY + 390;
  bindText(hint, tokens, 'color/text/secondary');

  const cats: Array<[string, string[]]> = [
    ['Brand',     ['color/brand/primary', 'color/brand/primary-hover', 'color/brand/primary-pressed']],
    ['Canvas',    ['color/canvas/background', 'color/canvas/surface', 'color/canvas/surface-alt']],
    ['Text',      ['color/text/primary', 'color/text/secondary', 'color/text/disabled']],
    ['Status',    ['color/status/success', 'color/status/warning', 'color/status/danger', 'color/status/info']],
    ['Flow',      ['color/flow/trigger', 'color/flow/action', 'color/flow/control']],
    ['Connectors',['color/flow/connector-o365', 'color/flow/connector-dataverse', 'color/flow/connector-sharepoint', 'color/flow/connector-teams']],
  ];
  for (const [i, [name, keys]] of cats.entries()) {
    const col = frame(name, page);
    autoLayout(col, 'v', 6, 0);
    col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'FIXED';
    col.resize(200, 1);
    col.x = 40 + i * 200; col.y = cardsY + 430;
    const h = await text(name.toUpperCase(), 'semibold', 10, col);
    bindText(h, tokens, 'color/text/secondary');
    for (const k of keys) {
      const row = frame('row', col);
      autoLayout(row, 'h', 8, 0);
      row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
      row.counterAxisAlignItems = 'CENTER';
      row.resize(190, 1);
      const sw = rect('sw', 16, 16, row);
      sw.cornerRadius = 3;
      bindFill(sw, tokens, k);
      const lbl = await text(k.replace('color/', ''), 'regular', 11, row);
      bindText(lbl, tokens, 'color/text/primary');
    }
  }

  // Changelog
  const clY = cardsY + 680;
  const cl = await text('Changelog', 'semibold', 20, page);
  cl.x = 40; cl.y = clY;
  bindText(cl, tokens, 'color/text/primary');
  const entries: Array<[string, string]> = [
    ['v0.2.0', 'Rebuild — Power Platform Wireframe Library. TypeScript, Figma Variables, Light/Dark modes, full component authoring, idempotent re-runs.'],
    ['v0.1.0', 'Initial D365 wireframe template — grayscale frames only.'],
  ];
  for (const [i, [v, note]] of entries.entries()) {
    const row = frame(v, page);
    autoLayout(row, 'h', 16, 16);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
    row.resize(1200, 1); row.cornerRadius = 6;
    row.x = 40; row.y = clY + 40 + i * 92;
    bindFill(row, tokens, 'color/canvas/surface');
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    const vt = await text(v, 'semibold', 13, row);
    bindText(vt, tokens, 'color/brand/primary');
    const note2 = await text(note, 'regular', 13, row);
    note2.textAutoResize = 'HEIGHT';
    note2.layoutGrow = 1;
    bindText(note2, tokens, 'color/text/primary');
  }
}
