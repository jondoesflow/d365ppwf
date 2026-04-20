/**
 * 🧪 Playground — empty page with a gentle watermark that reminds consumers
 * this is the space for their own compositions. Re-running the plugin does
 * not touch user content on this page (except the watermark itself).
 */

import type { Tokens } from '../lib/tokens.js';
import { frame, autoLayout, rect, text } from '../lib/layout.js';
import { bindFill, bindStroke, bindText } from '../lib/componentKit.js';

export async function buildPlaygroundPage(tokens: Tokens, page: PageNode): Promise<void> {
  const w = frame('watermark', page);
  autoLayout(w, 'v', 8, 32);
  w.primaryAxisSizingMode = 'FIXED'; w.counterAxisSizingMode = 'FIXED';
  w.counterAxisAlignItems = 'CENTER'; w.primaryAxisAlignItems = 'CENTER';
  w.resize(640, 240); w.cornerRadius = 12;
  w.x = 100; w.y = 100;
  w.dashPattern = [8, 6];
  bindStroke(w, tokens, 'color/stroke/default', 1);
  const t = await text('Playground', 'bold', 36, w);
  bindText(t, tokens, 'color/text/primary');
  t.opacity = 0.5;
  const h = await text('Drag components from the Assets panel and compose your own wireframes here.', 'regular', 14, w);
  h.textAutoResize = 'HEIGHT'; h.resize(480, h.height);
  bindText(h, tokens, 'color/text/secondary');
  const hint = await text('This watermark is cosmetic — it is safe to ignore or delete.', 'regular', 11, w);
  bindText(hint, tokens, 'color/text/secondary');
  hint.opacity = 0.7;
}
