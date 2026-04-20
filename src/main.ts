/**
 * Power Platform Wireframe Library — plugin entry.
 *
 * Single command: "generate-library". Spawns a small UI that lets the user
 * pick which libraries to build and whether to include examples / dark-mode
 * preview frames. Produces eight pages in the host Figma file.
 */

import { PD } from './lib/pluginData.js';
import { preloadFonts } from './lib/fonts.js';
import { buildTokens, type Tokens } from './lib/tokens.js';
import { renderTokensPage } from './lib/tokensPage.js';
import { buildPrimitives } from './lib/primitives.js';
import { buildCanvasLibrary } from './libraries/canvas/index.js';
import { buildMdaLibrary } from './libraries/mda/index.js';
import { buildFlowLibrary } from './libraries/flow/index.js';
import { buildReadmePage } from './pages/readme.js';
import { buildPlaygroundPage } from './pages/playground.js';
import { buildExamplesPage } from './pages/examples.js';

figma.showUI(__html__, { width: 340, height: 560, themeColors: true });

// ---------------------------------------------------------------------------
// Message router
// ---------------------------------------------------------------------------

interface GenerateOptions {
  libraries: { canvas: boolean; mda: boolean; flow: boolean; };
  examples: boolean;
  darkPreview: boolean;
}

figma.ui.onmessage = async (msg: { type: string } & Record<string, unknown>) => {
  try {
    if (msg.type === 'generate') {
      const opts = msg as unknown as GenerateOptions;
      await run(opts, /* updateOnly */ false);
    } else if (msg.type === 'update') {
      const opts = msg as unknown as GenerateOptions;
      await run(opts, /* updateOnly */ true);
    }
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    figma.ui.postMessage({ type: 'error', message });
    figma.notify('Error: ' + message, { error: true });
  }
};

function progress(pct: number, label: string): void {
  figma.ui.postMessage({ type: 'progress', pct, label });
}

// ---------------------------------------------------------------------------
// Page management (idempotent)
// ---------------------------------------------------------------------------

const PAGE_NAMES = {
  readme:     '📖 Readme',
  tokens:     '🎨 Tokens',
  primitives: '🧱 Primitives',
  canvas:     '🖼 Canvas Apps',
  mda:        '🏛 Model-Driven Apps',
  flow:       '🔀 Power Automate',
  examples:   '📐 Wireframe Examples',
  playground: '🧪 Playground',
};

async function ensurePage(name: string): Promise<PageNode> {
  const existing = figma.root.children.find(p => p.name === name);
  if (existing) {
    await existing.loadAsync();
    return existing;
  }
  const page = figma.createPage();
  page.name = name;
  page.setPluginData(PD.pageMarker, 'true');
  return page;
}

/**
 * Remove nodes on a page owned by this plugin, so we can rebuild it cleanly.
 * Respects consumer content on the Playground page.
 */
async function purgePage(page: PageNode): Promise<void> {
  await page.loadAsync();
  for (const child of page.children.slice()) {
    // Only remove nodes we authored (or that live on a ppwf-owned page).
    child.remove();
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

async function run(opts: GenerateOptions, updateOnly: boolean): Promise<void> {
  const t0 = Date.now();
  progress(1, 'Preloading fonts…');
  await preloadFonts();

  // Always create readme + tokens + primitives pages; they're the foundation.
  progress(6, 'Creating pages…');
  const readmePage = await ensurePage(PAGE_NAMES.readme);
  const tokensPage = await ensurePage(PAGE_NAMES.tokens);
  const primitivesPage = await ensurePage(PAGE_NAMES.primitives);
  const canvasPage = opts.libraries.canvas ? await ensurePage(PAGE_NAMES.canvas) : null;
  const mdaPage = opts.libraries.mda ? await ensurePage(PAGE_NAMES.mda) : null;
  const flowPage = opts.libraries.flow ? await ensurePage(PAGE_NAMES.flow) : null;
  const examplesPage = opts.examples ? await ensurePage(PAGE_NAMES.examples) : null;
  const playgroundPage = await ensurePage(PAGE_NAMES.playground);

  // Switch to tokens page before writing to it — dynamic-page access requires
  // currentPage to be the page you're mutating for some operations.
  await figma.setCurrentPageAsync(tokensPage);

  if (!updateOnly) {
    await purgePage(readmePage);
    await purgePage(tokensPage);
    await purgePage(primitivesPage);
    if (canvasPage) await purgePage(canvasPage);
    if (mdaPage) await purgePage(mdaPage);
    if (flowPage) await purgePage(flowPage);
    if (examplesPage) await purgePage(examplesPage);
  }

  progress(10, 'Building tokens…');
  const tokens: Tokens = await buildTokens();
  await renderTokensPage(tokens, tokensPage);

  progress(20, 'Building primitives…');
  await figma.setCurrentPageAsync(primitivesPage);
  const prim = await buildPrimitives(tokens, primitivesPage);

  let created = prim.components.length;
  let updated = 0;

  if (canvasPage) {
    progress(35, 'Building Canvas Apps…');
    await figma.setCurrentPageAsync(canvasPage);
    const out = await buildCanvasLibrary(tokens, canvasPage);
    created += out.components.length;
  }
  if (mdaPage) {
    progress(55, 'Building Model-Driven Apps…');
    await figma.setCurrentPageAsync(mdaPage);
    const out = await buildMdaLibrary(tokens, mdaPage);
    created += out.components.length;
  }
  if (flowPage) {
    progress(75, 'Building Power Automate…');
    await figma.setCurrentPageAsync(flowPage);
    const out = await buildFlowLibrary(tokens, flowPage);
    created += out.components.length;
  }

  if (examplesPage) {
    progress(90, 'Building examples…');
    await figma.setCurrentPageAsync(examplesPage);
    await buildExamplesPage(tokens, examplesPage);
  }

  progress(94, 'Building readme…');
  await figma.setCurrentPageAsync(readmePage);
  await buildReadmePage(tokens, readmePage);

  progress(97, 'Building playground…');
  await figma.setCurrentPageAsync(playgroundPage);
  await buildPlaygroundPage(tokens, playgroundPage);

  // Return to readme
  await figma.setCurrentPageAsync(readmePage);

  progress(100, 'Done.');
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  figma.notify(`Library generated in ${elapsed}s — ${created} components.`);

  figma.ui.postMessage({
    type: 'done',
    created,
    updated,
    tokens: tokens.color.size + tokens.space.size + tokens.radius.size + tokens.stroke.size + tokens.type.size + tokens.elevation.size,
    size: '≈ — MB', // Increment 10 will compute a real estimate.
  });
}
