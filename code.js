"use strict";
(() => {
  // src/lib/pluginData.ts
  var PD = {
    nodeId: "ppwf:nodeId",
    // stamped on every component we author
    pageMarker: "ppwf:page",
    // marks pages owned by this plugin
    registryNode: "ppwf:registry"
    // holds a JSON map<key, nodeId>
  };

  // src/lib/fonts.ts
  var FONT_FALLBACKS = ["Segoe UI Variable", "Segoe UI", "Inter", "Roboto"];
  var _resolvedFamily = null;
  var _styleCache = /* @__PURE__ */ new Map();
  async function resolveFamily() {
    if (_resolvedFamily) return _resolvedFamily;
    const avail = await figma.listAvailableFontsAsync();
    const families = new Set(avail.map((f) => f.fontName.family));
    for (const f of FONT_FALLBACKS) {
      if (families.has(f)) {
        _resolvedFamily = f;
        return f;
      }
    }
    _resolvedFamily = "Roboto";
    return _resolvedFamily;
  }
  async function stylesFor(family) {
    const cached = _styleCache.get(family);
    if (cached) return cached;
    const avail = await figma.listAvailableFontsAsync();
    const styles = avail.filter((f) => f.fontName.family === family).map((f) => f.fontName.style);
    _styleCache.set(family, styles);
    return styles;
  }
  async function fontFor(weight = "regular") {
    const family = await resolveFamily();
    const styles = await stylesFor(family);
    const want = {
      regular: ["Regular", "Text", "Book", "Normal"],
      medium: ["Medium", "Regular"],
      semibold: ["Semibold", "Semi Bold", "SemiBold", "DemiBold", "Display", "Medium", "Bold"],
      bold: ["Bold", "Heavy", "Black", "Semibold", "Semi Bold"]
    };
    let style = "Regular";
    for (const s of want[weight]) {
      if (styles.includes(s)) {
        style = s;
        break;
      }
    }
    if (!styles.includes(style) && styles.length) style = styles[0];
    const fn = { family, style };
    try {
      await figma.loadFontAsync(fn);
    } catch (_) {
    }
    return fn;
  }
  async function preloadFonts() {
    for (const w of ["regular", "medium", "semibold", "bold"]) {
      await fontFor(w);
    }
  }

  // src/lib/colors.ts
  var PALETTE = {
    "color/brand/primary": { light: "#0F6CBD", dark: "#2886DE" },
    "color/brand/primary-hover": { light: "#115EA3", dark: "#479EF5" },
    "color/brand/primary-pressed": { light: "#0F548C", dark: "#62ABF5" },
    "color/canvas/background": { light: "#FFFFFF", dark: "#1F1F1F" },
    "color/canvas/surface": { light: "#FAFAFA", dark: "#292929" },
    "color/canvas/surface-alt": { light: "#F5F5F5", dark: "#333333" },
    "color/stroke/default": { light: "#D1D1D1", dark: "#666666" },
    "color/stroke/subtle": { light: "#E0E0E0", dark: "#525252" },
    "color/text/primary": { light: "#242424", dark: "#FFFFFF" },
    "color/text/secondary": { light: "#616161", dark: "#D6D6D6" },
    "color/text/disabled": { light: "#BDBDBD", dark: "#5C5C5C" },
    "color/status/success": { light: "#107C10", dark: "#54B054" },
    "color/status/warning": { light: "#F7630C", dark: "#FAA06B" },
    "color/status/danger": { light: "#C50F1F", dark: "#E37D80" },
    "color/status/info": { light: "#0F6CBD", dark: "#479EF5" },
    "color/flow/trigger": { light: "#742774", dark: "#B4A0FF" },
    "color/flow/action": { light: "#0F6CBD", dark: "#479EF5" },
    "color/flow/control": { light: "#616161", dark: "#D6D6D6" },
    "color/flow/connector-o365": { light: "#0078D4", dark: "#2886DE" },
    "color/flow/connector-dataverse": { light: "#0B5A9D", dark: "#62ABF5" },
    "color/flow/connector-sharepoint": { light: "#0B6B3A", dark: "#54B054" },
    "color/flow/connector-teams": { light: "#4B53BC", dark: "#8A92E8" }
  };
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h, 16);
    return { r: (n >> 16 & 255) / 255, g: (n >> 8 & 255) / 255, b: (n & 255) / 255 };
  }
  function hexToRgba(hex, a = 1) {
    return { ...hexToRgb(hex), a };
  }

  // src/lib/tokens.ts
  var COLLECTION_NAME = "Power Platform Tokens";
  var SPACING = {
    "space/0": 0,
    "space/2": 2,
    "space/4": 4,
    "space/6": 6,
    "space/8": 8,
    "space/12": 12,
    "space/16": 16,
    "space/20": 20,
    "space/24": 24,
    "space/32": 32,
    "space/40": 40,
    "space/48": 48
  };
  var RADIUS = {
    "radius/none": 0,
    "radius/small": 2,
    "radius/medium": 4,
    "radius/large": 8,
    "radius/circular": 9999
  };
  var STROKE = {
    "stroke/thin": 1,
    "stroke/thick": 2
  };
  var TYPE = [
    { name: "type/caption", size: 12, lineHeight: 16, weight: "regular" },
    { name: "type/body", size: 14, lineHeight: 20, weight: "regular" },
    { name: "type/body-strong", size: 14, lineHeight: 20, weight: "semibold" },
    { name: "type/subtitle", size: 16, lineHeight: 22, weight: "semibold" },
    { name: "type/title-3", size: 20, lineHeight: 28, weight: "semibold" },
    { name: "type/title-2", size: 24, lineHeight: 32, weight: "semibold" },
    { name: "type/title-1", size: 32, lineHeight: 40, weight: "semibold" },
    { name: "type/display", size: 40, lineHeight: 52, weight: "bold" }
  ];
  async function getOrCreateCollection() {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    let col = collections.find((c) => c.name === COLLECTION_NAME);
    if (!col) {
      col = figma.variables.createVariableCollection(COLLECTION_NAME);
    }
    let lightMode = col.modes.find((m) => m.name === "Light");
    let darkMode = col.modes.find((m) => m.name === "Dark");
    if (!lightMode) {
      const firstId = col.modes[0].modeId;
      col.renameMode(firstId, "Light");
      lightMode = col.modes.find((m) => m.name === "Light");
    }
    if (!darkMode) {
      const newId = col.addMode("Dark");
      darkMode = col.modes.find((m) => m.modeId === newId);
    }
    return { collection: col, lightId: lightMode.modeId, darkId: darkMode.modeId };
  }
  async function upsertVariable(name, type, collection) {
    const all = await figma.variables.getLocalVariablesAsync(type);
    const existing = all.find((v) => v.name === name && v.variableCollectionId === collection.id);
    if (existing) return existing;
    return figma.variables.createVariable(name, collection, type);
  }
  async function buildTokens() {
    const { collection, lightId, darkId } = await getOrCreateCollection();
    const colorMap = /* @__PURE__ */ new Map();
    for (const [name, modes] of Object.entries(PALETTE)) {
      const v = await upsertVariable(name, "COLOR", collection);
      v.setValueForMode(lightId, hexToRgba(modes.light));
      v.setValueForMode(darkId, hexToRgba(modes.dark));
      colorMap.set(name, v);
    }
    const spaceMap = /* @__PURE__ */ new Map();
    for (const [name, n] of Object.entries(SPACING)) {
      const v = await upsertVariable(name, "FLOAT", collection);
      v.setValueForMode(lightId, n);
      v.setValueForMode(darkId, n);
      spaceMap.set(name, v);
    }
    const radiusMap = /* @__PURE__ */ new Map();
    for (const [name, n] of Object.entries(RADIUS)) {
      const v = await upsertVariable(name, "FLOAT", collection);
      v.setValueForMode(lightId, n);
      v.setValueForMode(darkId, n);
      radiusMap.set(name, v);
    }
    const strokeMap = /* @__PURE__ */ new Map();
    for (const [name, n] of Object.entries(STROKE)) {
      const v = await upsertVariable(name, "FLOAT", collection);
      v.setValueForMode(lightId, n);
      v.setValueForMode(darkId, n);
      strokeMap.set(name, v);
    }
    const typeMap = /* @__PURE__ */ new Map();
    const existingText = await figma.getLocalTextStylesAsync();
    for (const t of TYPE) {
      const fn = await fontFor(t.weight);
      let style = existingText.find((s) => s.name === t.name);
      if (!style) style = figma.createTextStyle();
      style.name = t.name;
      style.fontName = fn;
      style.fontSize = t.size;
      style.lineHeight = { unit: "PIXELS", value: t.lineHeight };
      style.letterSpacing = { unit: "PERCENT", value: 0 };
      typeMap.set(t.name, style);
    }
    const elevationMap = /* @__PURE__ */ new Map();
    const existingEffect = await figma.getLocalEffectStylesAsync();
    const elevations = [
      { name: "elevation/2", y: 1, blur: 2, alpha: 0.1 },
      { name: "elevation/4", y: 2, blur: 4, alpha: 0.12 },
      { name: "elevation/8", y: 4, blur: 8, alpha: 0.14 },
      { name: "elevation/16", y: 8, blur: 16, alpha: 0.18 }
    ];
    for (const e of elevations) {
      let style = existingEffect.find((s) => s.name === e.name);
      if (!style) style = figma.createEffectStyle();
      style.name = e.name;
      style.effects = [{
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: e.alpha },
        offset: { x: 0, y: e.y },
        radius: e.blur,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
        showShadowBehindNode: false
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
      elevation: elevationMap
    };
  }

  // src/lib/primitives.ts
  async function buildPrimitives(_tokens, _page) {
    return { components: [], sets: [] };
  }

  // src/libraries/canvas/index.ts
  async function buildCanvasLibrary(_tokens, _page) {
    return { components: [], sets: [] };
  }

  // src/libraries/mda/index.ts
  async function buildMdaLibrary(_tokens, _page) {
    return { components: [], sets: [] };
  }

  // src/libraries/flow/index.ts
  async function buildFlowLibrary(_tokens, _page) {
    return { components: [], sets: [] };
  }

  // src/main.ts
  figma.showUI(__html__, { width: 340, height: 560, themeColors: true });
  figma.ui.onmessage = async (msg) => {
    try {
      if (msg.type === "generate") {
        const opts = msg;
        await run(
          opts,
          /* updateOnly */
          false
        );
      } else if (msg.type === "update") {
        const opts = msg;
        await run(
          opts,
          /* updateOnly */
          true
        );
      }
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : String(e);
      figma.ui.postMessage({ type: "error", message });
      figma.notify("Error: " + message, { error: true });
    }
  };
  function progress(pct, label) {
    figma.ui.postMessage({ type: "progress", pct, label });
  }
  var PAGE_NAMES = {
    readme: "\u{1F4D6} Readme",
    tokens: "\u{1F3A8} Tokens",
    primitives: "\u{1F9F1} Primitives",
    canvas: "\u{1F5BC} Canvas Apps",
    mda: "\u{1F3DB} Model-Driven Apps",
    flow: "\u{1F500} Power Automate",
    examples: "\u{1F4D0} Wireframe Examples",
    playground: "\u{1F9EA} Playground"
  };
  async function ensurePage(name) {
    const existing = figma.root.children.find((p) => p.name === name);
    if (existing) {
      await existing.loadAsync();
      return existing;
    }
    const page = figma.createPage();
    page.name = name;
    page.setPluginData(PD.pageMarker, "true");
    return page;
  }
  async function purgePage(page) {
    await page.loadAsync();
    for (const child of page.children.slice()) {
      child.remove();
    }
  }
  async function run(opts, updateOnly) {
    const t0 = Date.now();
    progress(1, "Preloading fonts\u2026");
    await preloadFonts();
    progress(6, "Creating pages\u2026");
    const readmePage = await ensurePage(PAGE_NAMES.readme);
    const tokensPage = await ensurePage(PAGE_NAMES.tokens);
    const primitivesPage = await ensurePage(PAGE_NAMES.primitives);
    const canvasPage = opts.libraries.canvas ? await ensurePage(PAGE_NAMES.canvas) : null;
    const mdaPage = opts.libraries.mda ? await ensurePage(PAGE_NAMES.mda) : null;
    const flowPage = opts.libraries.flow ? await ensurePage(PAGE_NAMES.flow) : null;
    const examplesPage = opts.examples ? await ensurePage(PAGE_NAMES.examples) : null;
    const playgroundPage = await ensurePage(PAGE_NAMES.playground);
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
    progress(10, "Building tokens\u2026");
    const tokens = await buildTokens();
    progress(20, "Building primitives\u2026");
    await figma.setCurrentPageAsync(primitivesPage);
    const prim = await buildPrimitives(tokens, primitivesPage);
    let created = prim.components.length;
    let updated = 0;
    if (canvasPage) {
      progress(35, "Building Canvas Apps\u2026");
      await figma.setCurrentPageAsync(canvasPage);
      const out = await buildCanvasLibrary(tokens, canvasPage);
      created += out.components.length;
    }
    if (mdaPage) {
      progress(55, "Building Model-Driven Apps\u2026");
      await figma.setCurrentPageAsync(mdaPage);
      const out = await buildMdaLibrary(tokens, mdaPage);
      created += out.components.length;
    }
    if (flowPage) {
      progress(75, "Building Power Automate\u2026");
      await figma.setCurrentPageAsync(flowPage);
      const out = await buildFlowLibrary(tokens, flowPage);
      created += out.components.length;
    }
    if (examplesPage) {
      progress(90, "Building examples\u2026");
    }
    await figma.setCurrentPageAsync(readmePage);
    progress(100, "Done.");
    const elapsed = ((Date.now() - t0) / 1e3).toFixed(1);
    figma.notify(`Library generated in ${elapsed}s \u2014 ${created} components.`);
    figma.ui.postMessage({
      type: "done",
      created,
      updated,
      tokens: tokens.color.size + tokens.space.size + tokens.radius.size + tokens.stroke.size + tokens.type.size + tokens.elevation.size,
      size: "\u2248 \u2014 MB"
      // Increment 10 will compute a real estimate.
    });
  }
})();
