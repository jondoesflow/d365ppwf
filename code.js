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
  function loadRegistry() {
    const raw = figma.root.getPluginData(PD.registryNode);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (_) {
      return {};
    }
  }
  function saveRegistry(reg) {
    figma.root.setPluginData(PD.registryNode, JSON.stringify(reg));
  }
  function remember(key, node) {
    const reg = loadRegistry();
    reg[key] = node.id;
    saveRegistry(reg);
    node.setPluginData(PD.nodeId, key);
  }

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
    let col = collections.find((c2) => c2.name === COLLECTION_NAME);
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

  // src/lib/layout.ts
  function frame(name, parent) {
    const f = figma.createFrame();
    f.name = name;
    f.fills = [];
    if (parent) parent.appendChild(f);
    return f;
  }
  function autoLayout(f, dir, itemSpacing, padding) {
    f.layoutMode = dir === "h" ? "HORIZONTAL" : "VERTICAL";
    f.itemSpacing = itemSpacing;
    if (typeof padding === "number") {
      f.paddingLeft = padding;
      f.paddingRight = padding;
      f.paddingTop = padding;
      f.paddingBottom = padding;
    } else {
      f.paddingLeft = padding.l ?? 0;
      f.paddingRight = padding.r ?? 0;
      f.paddingTop = padding.t ?? 0;
      f.paddingBottom = padding.b ?? 0;
    }
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
    return f;
  }
  function rect(name, w, h, parent) {
    const r2 = figma.createRectangle();
    r2.name = name;
    r2.resizeWithoutConstraints(Math.max(1, w), Math.max(1, h));
    r2.fills = [];
    if (parent) parent.appendChild(r2);
    return r2;
  }
  function ellipse(name, w, h, parent) {
    const e = figma.createEllipse();
    e.name = name;
    e.resizeWithoutConstraints(Math.max(1, w), Math.max(1, h));
    e.fills = [];
    if (parent) parent.appendChild(e);
    return e;
  }
  async function text(str, weight, size, parent) {
    const t = figma.createText();
    t.fontName = await fontFor(weight);
    t.fontSize = size;
    t.characters = str;
    if (parent) parent.appendChild(t);
    return t;
  }
  function placeGrid(items, opts = {}) {
    const cols = opts.cols ?? 4;
    const gap = opts.gap ?? 64;
    const x0 = opts.x ?? 0;
    const y0 = opts.y ?? 0;
    const rowHeights = [];
    const colWidths = [];
    for (let i = 0; i < items.length; i++) {
      const r2 = Math.floor(i / cols);
      const c2 = i % cols;
      const node = items[i];
      rowHeights[r2] = Math.max(rowHeights[r2] ?? 0, node.height);
      colWidths[c2] = Math.max(colWidths[c2] ?? 0, node.width);
    }
    let totalW = 0;
    for (const w of colWidths) totalW += w + gap;
    let totalH = 0;
    for (const h of rowHeights) totalH += h + gap;
    for (let i = 0; i < items.length; i++) {
      const r2 = Math.floor(i / cols);
      const c2 = i % cols;
      const x = x0 + colWidths.slice(0, c2).reduce((a, b) => a + b + gap, 0);
      const y = y0 + rowHeights.slice(0, r2).reduce((a, b) => a + b + gap, 0);
      items[i].x = x;
      items[i].y = y;
    }
    return { width: totalW - gap, height: totalH - gap };
  }

  // src/lib/tokensPage.ts
  var PAD = 40;
  async function renderTokensPage(tokens, page) {
    const header = await text("Power Platform Tokens", "bold", 40, page);
    header.x = PAD;
    header.y = PAD;
    bindTextColor(header, tokens, "color/text/primary");
    const sub = await text("Every Variable and Style in this kit. Re-skin the library by switching the collection mode from Light to Dark.", "regular", 14, page);
    sub.x = PAD;
    sub.y = PAD + 56;
    bindTextColor(sub, tokens, "color/text/secondary");
    let cursorY = PAD + 112;
    cursorY = await renderSectionHeading("Colour", cursorY, tokens, page);
    const groups = groupColours();
    for (const [groupName, items] of groups) {
      const label = await text(groupName.toUpperCase(), "semibold", 11, page);
      label.x = PAD;
      label.y = cursorY;
      bindTextColor(label, tokens, "color/text/secondary");
      cursorY += 20;
      const rowFrame = frame("color-row", page);
      autoLayout(rowFrame, "h", 16, 0);
      rowFrame.x = PAD;
      rowFrame.y = cursorY;
      for (const name of items) {
        const v = tokens.color.get(name);
        if (!v) continue;
        await renderSwatch(name, v, tokens, rowFrame);
      }
      cursorY += rowFrame.height + 32;
    }
    cursorY = await renderSectionHeading("Typography", cursorY, tokens, page);
    for (const [name, style] of tokens.type) {
      const t = await text(`${name} \u2014 The quick brown fox jumps over the lazy dog`, "regular", 14, page);
      await t.setTextStyleIdAsync(style.id);
      t.x = PAD;
      t.y = cursorY;
      bindTextColor(t, tokens, "color/text/primary");
      cursorY += t.height + 12;
    }
    cursorY += 20;
    cursorY = await renderSectionHeading("Spacing", cursorY, tokens, page);
    const spaceRow = frame("space-row", page);
    autoLayout(spaceRow, "h", 32, 0);
    spaceRow.counterAxisAlignItems = "MAX";
    spaceRow.x = PAD;
    spaceRow.y = cursorY;
    for (const [name, variable] of tokens.space) {
      const group = frame(name, spaceRow);
      autoLayout(group, "v", 6, 0);
      group.counterAxisAlignItems = "CENTER";
      const size = Number(variable.valuesByMode[tokens.lightMode]) || 0;
      const box = rect("box", Math.max(2, size), Math.max(2, size), group);
      bindFillVar(box, tokens, "color/brand/primary");
      const labelA = await text(name.replace("space/", ""), "semibold", 11, group);
      bindTextColor(labelA, tokens, "color/text/primary");
      const labelB = await text(`${size}px`, "regular", 10, group);
      bindTextColor(labelB, tokens, "color/text/secondary");
    }
    cursorY += spaceRow.height + 40;
    cursorY = await renderSectionHeading("Radius", cursorY, tokens, page);
    const radiusRow = frame("radius-row", page);
    autoLayout(radiusRow, "h", 20, 0);
    radiusRow.counterAxisAlignItems = "CENTER";
    radiusRow.x = PAD;
    radiusRow.y = cursorY;
    for (const [name, variable] of tokens.radius) {
      const group = frame(name, radiusRow);
      autoLayout(group, "v", 6, 0);
      group.counterAxisAlignItems = "CENTER";
      const r2 = Math.min(24, Number(variable.valuesByMode[tokens.lightMode]) || 0);
      const box = rect("box", 56, 56, group);
      box.cornerRadius = r2;
      bindFillVar(box, tokens, "color/brand/primary");
      bindStrokeColorVar(box, tokens, "color/stroke/default");
      const lab = await text(name.replace("radius/", ""), "semibold", 11, group);
      bindTextColor(lab, tokens, "color/text/primary");
    }
    cursorY += radiusRow.height + 40;
    cursorY = await renderSectionHeading("Elevation", cursorY, tokens, page);
    const elevRow = frame("elev-row", page);
    autoLayout(elevRow, "h", 32, 32);
    elevRow.x = PAD;
    elevRow.y = cursorY;
    for (const [name, style] of tokens.elevation) {
      const group = frame(name, elevRow);
      autoLayout(group, "v", 10, 0);
      group.counterAxisAlignItems = "CENTER";
      const card = rect("card", 120, 80, group);
      card.cornerRadius = 6;
      bindFillVar(card, tokens, "color/canvas/background");
      bindStrokeColorVar(card, tokens, "color/stroke/subtle");
      await card.setEffectStyleIdAsync(style.id);
      const lab = await text(name, "semibold", 11, group);
      bindTextColor(lab, tokens, "color/text/primary");
    }
    cursorY += elevRow.height + 40;
  }
  async function renderSectionHeading(title, y, tokens, page) {
    const t = await text(title, "semibold", 24, page);
    t.x = PAD;
    t.y = y;
    bindTextColor(t, tokens, "color/text/primary");
    const rule = rect("rule", 1200, 1, page);
    rule.x = PAD;
    rule.y = y + 36;
    bindFillVar(rule, tokens, "color/stroke/subtle");
    return y + 52;
  }
  async function renderSwatch(name, variable, tokens, parent) {
    const col = frame(name, parent);
    autoLayout(col, "v", 6, 0);
    col.counterAxisSizingMode = "FIXED";
    col.resize(120, col.height);
    const swatch = rect("bg", 120, 72, col);
    swatch.cornerRadius = 4;
    bindFillVar(swatch, tokens, name);
    bindStrokeColorVar(swatch, tokens, "color/stroke/subtle");
    const n = await text(name, "semibold", 11, col);
    bindTextColor(n, tokens, "color/text/primary");
    const hex = PALETTE[name]?.light ?? "";
    const v = await text(hex, "regular", 10, col);
    bindTextColor(v, tokens, "color/text/secondary");
  }
  function groupColours() {
    const groups = { brand: [], canvas: [], stroke: [], text: [], status: [], flow: [] };
    for (const name of Object.keys(PALETTE)) {
      for (const key of Object.keys(groups)) {
        if (name.startsWith(`color/${key}/`)) {
          groups[key].push(name);
          break;
        }
      }
    }
    return Object.entries(groups);
  }
  function bindFillVar(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    const bound = figma.variables.setBoundVariableForPaint(paint, "color", v);
    node.fills = [bound];
  }
  function bindStrokeColorVar(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    const bound = figma.variables.setBoundVariableForPaint(paint, "color", v);
    node.strokes = [bound];
    node.strokeWeight = 1;
  }
  function bindTextColor(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    const bound = figma.variables.setBoundVariableForPaint(paint, "color", v);
    node.fills = [bound];
  }

  // src/lib/icons.ts
  var p = (d, fill = "currentColor") => `<path d="${d}" fill="${fill}"/>`;
  var r = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="currentColor"/>`;
  var c = (cx, cy, r2) => `<circle cx="${cx}" cy="${cy}" r="${r2}" fill="currentColor"/>`;
  var ICONS = [
    // ----- Navigation -----
    { name: "home", group: "nav", svg: p("M10 2 L17 8 L17 17 L13 17 L13 12 L7 12 L7 17 L3 17 L3 8 Z") },
    { name: "menu", group: "nav", svg: r(3, 5, 14, 1.5, 0.5) + r(3, 9.25, 14, 1.5, 0.5) + r(3, 13.5, 14, 1.5, 0.5) },
    { name: "search", group: "nav", svg: p("M9 3a6 6 0 1 0 3.6 10.8l3.3 3.3 1.4-1.4-3.3-3.3A6 6 0 0 0 9 3Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z") },
    { name: "chevron-right", group: "nav", svg: p("M7 3 L14 10 L7 17 L5.6 15.6 L11.2 10 L5.6 4.4 Z") },
    { name: "chevron-down", group: "nav", svg: p("M3 7 L10 14 L17 7 L15.6 5.6 L10 11.2 L4.4 5.6 Z") },
    { name: "chevron-up", group: "nav", svg: p("M3 13 L10 6 L17 13 L15.6 14.4 L10 8.8 L4.4 14.4 Z") },
    { name: "chevron-left", group: "nav", svg: p("M13 3 L6 10 L13 17 L14.4 15.6 L8.8 10 L14.4 4.4 Z") },
    { name: "arrow-left", group: "nav", svg: p("M10 3 L2 10 L10 17 L11.4 15.6 L6 11 L18 11 L18 9 L6 9 L11.4 4.4 Z") },
    { name: "arrow-right", group: "nav", svg: p("M10 3 L18 10 L10 17 L8.6 15.6 L14 11 L2 11 L2 9 L14 9 L8.6 4.4 Z") },
    { name: "more-horizontal", group: "nav", svg: c(5, 10, 1.5) + c(10, 10, 1.5) + c(15, 10, 1.5) },
    { name: "more-vertical", group: "nav", svg: c(10, 5, 1.5) + c(10, 10, 1.5) + c(10, 15, 1.5) },
    // ----- Actions -----
    { name: "add", group: "action", svg: r(9, 3, 2, 14, 0.5) + r(3, 9, 14, 2, 0.5) },
    { name: "close", group: "action", svg: p("M4 5.4 L5.4 4 L10 8.6 L14.6 4 L16 5.4 L11.4 10 L16 14.6 L14.6 16 L10 11.4 L5.4 16 L4 14.6 L8.6 10 Z") },
    { name: "edit", group: "action", svg: p("M3 14 L13 4 L16 7 L6 17 L3 17 Z M12 5 L15 8") },
    { name: "delete", group: "action", svg: p("M7 3 L13 3 L13 4 L16 4 L16 6 L4 6 L4 4 L7 4 Z M5 7 L15 7 L14 17 L6 17 Z") },
    { name: "save", group: "action", svg: p("M3 3 H14 L17 6 V17 H3 Z M6 3 V8 H13 V3 M6 12 H14 V17 H6 Z") },
    { name: "copy", group: "action", svg: p("M5 3 H13 V13 H5 Z M7 5 H15 V15 H7 M5 11 V15 H11") },
    { name: "share", group: "action", svg: c(5, 10, 2) + c(15, 5, 2) + c(15, 15, 2) + p("M6.5 9 L13.5 6 M6.5 11 L13.5 14", "none") },
    { name: "send", group: "action", svg: p("M3 3 L17 10 L3 17 L5 10 Z") },
    { name: "upload", group: "action", svg: p("M10 3 L16 9 L13 9 L13 13 L7 13 L7 9 L4 9 Z M3 15 H17 V17 H3 Z") },
    { name: "download", group: "action", svg: p("M10 13 L4 7 L7 7 L7 3 L13 3 L13 7 L16 7 Z M3 15 H17 V17 H3 Z") },
    { name: "refresh", group: "action", svg: p("M10 3 A7 7 0 1 1 3.5 13 L5 12 A5 5 0 1 0 10 5 L10 7 L6 4 L10 1 Z") },
    { name: "filter", group: "action", svg: p("M3 4 L17 4 L12 11 L12 16 L8 16 L8 11 Z") },
    { name: "settings", group: "action", svg: p("M10 6 A4 4 0 1 1 6 10 A4 4 0 0 1 10 6 Z M9 2 H11 L11.5 4 H8.5 Z M9 16 H11 L11.5 18 H8.5 Z") + c(10, 10, 2) },
    { name: "sort", group: "action", svg: p("M5 3 V13 M3 11 L5 13 L7 11 M13 17 V7 M11 9 L13 7 L15 9") },
    // ----- Status -----
    { name: "success", group: "status", svg: c(10, 10, 8) + p("M6 10 L9 13 L14 7", "none") },
    { name: "warning", group: "status", svg: p("M10 3 L18 17 L2 17 Z") + r(9, 8, 2, 5, 0.5) + c(10, 15, 1) },
    { name: "error", group: "status", svg: c(10, 10, 8) + p("M7 7 L13 13 M13 7 L7 13", "none") },
    { name: "info", group: "status", svg: c(10, 10, 8) + r(9, 9, 2, 6, 0.5) + c(10, 6, 1) },
    { name: "lock", group: "status", svg: r(5, 9, 10, 8, 1) + p("M7 9 V6 A3 3 0 0 1 13 6 V9") },
    { name: "unlock", group: "status", svg: r(5, 9, 10, 8, 1) + p("M7 9 V6 A3 3 0 0 1 13 6") },
    { name: "checkmark", group: "status", svg: p("M4 10 L8 14 L16 6", "none") },
    { name: "new", group: "status", svg: c(10, 10, 6) },
    // ----- Form fields -----
    { name: "calendar", group: "form", svg: r(3, 5, 14, 12, 1) + r(3, 5, 14, 3, 1) + r(6, 3, 1, 4) + r(13, 3, 1, 4) },
    { name: "clock", group: "form", svg: c(10, 10, 7) + p("M10 5 V10 L13 13", "none") },
    { name: "mail", group: "form", svg: r(2, 5, 16, 11, 1) + p("M2 5 L10 12 L18 5", "none") },
    { name: "phone", group: "form", svg: p("M4 3 L8 3 L9 7 L7 9 A7 7 0 0 0 11 13 L13 11 L17 12 L17 16 A2 2 0 0 1 15 18 A14 14 0 0 1 2 5 A2 2 0 0 1 4 3 Z") },
    { name: "person", group: "form", svg: c(10, 6, 3) + p("M3 18 A7 7 0 0 1 17 18 Z") },
    { name: "people", group: "form", svg: c(7, 7, 3) + c(14, 8, 2.5) + p("M1 18 A6 6 0 0 1 13 18 Z M12 18 A4 4 0 0 1 19 18 Z") },
    { name: "globe", group: "form", svg: c(10, 10, 7) + p("M3 10 H17 M10 3 A7 9 0 0 1 10 17 A7 9 0 0 1 10 3", "none") },
    { name: "attach", group: "form", svg: p("M13 3 L6 10 A3 3 0 0 0 10 14 L15 9 A5 5 0 0 0 8 2 L3 7 A7 7 0 0 0 13 17 L17 13") },
    { name: "link", group: "form", svg: p("M7 13 L13 7 M6 11 A3 3 0 0 0 9 14 L12 11 M11 9 A3 3 0 0 1 14 6 L17 3") },
    { name: "text", group: "form", svg: r(4, 5, 12, 2) + r(4, 9, 10, 2) + r(4, 13, 8, 2) },
    { name: "image", group: "form", svg: r(3, 4, 14, 12, 1) + c(7, 8, 1.5) + p("M3 14 L8 10 L12 13 L17 8 V16 L3 16 Z") },
    // ----- Flow / data ops -----
    { name: "trigger", group: "flow", svg: p("M5 3 L15 10 L5 17 Z") },
    { name: "condition", group: "flow", svg: p("M10 2 L18 10 L10 18 L2 10 Z") },
    { name: "loop", group: "flow", svg: p("M10 3 A7 7 0 1 1 3.5 13 L5 12 A5 5 0 1 0 10 5 L12 5 L9 8 L6 5 Z") },
    { name: "scope", group: "flow", svg: r(3, 3, 14, 14, 2) + r(6, 6, 8, 8, 1) },
    { name: "variable", group: "flow", svg: p("M6 4 C2 8 2 12 6 16 M14 4 C18 8 18 12 14 16 M8 8 L12 12 M12 8 L8 12") },
    { name: "expression", group: "flow", svg: p("M5 4 L5 16 M7 4 Q4 10 7 16 M15 4 L15 16 M13 4 Q16 10 13 16 M8 10 L12 10") },
    { name: "branch", group: "flow", svg: c(5, 5, 2) + c(15, 5, 2) + c(10, 15, 2) + p("M5 7 V11 L10 13 L15 11 V7", "none") },
    { name: "terminate", group: "flow", svg: c(10, 10, 8) + r(6, 9, 8, 2) },
    // ----- Connector logos (approximated as tinted glyphs) -----
    { name: "connector-o365", group: "connector", svg: p("M3 4 L13 3 L13 17 L3 16 Z M14 5 L17 6 L17 14 L14 15 Z") },
    { name: "connector-dataverse", group: "connector", svg: p("M10 3 L17 7 L17 13 L10 17 L3 13 L3 7 Z") + p("M10 3 L10 17 M3 7 L17 7 M3 13 L17 13", "none") },
    { name: "connector-sharepoint", group: "connector", svg: c(7, 8, 3.5) + c(13, 12, 2.5) + c(15, 7, 2) },
    { name: "connector-teams", group: "connector", svg: r(2, 5, 10, 10, 1) + r(12, 3, 6, 14, 1) + p("M4 8 H10 M7 8 V13", "none") },
    { name: "connector-outlook", group: "connector", svg: r(2, 4, 10, 12, 1) + c(7, 10, 3) + r(12, 6, 6, 8, 1) },
    { name: "connector-http", group: "connector", svg: p("M4 6 H16 M4 10 H16 M4 14 H16 M8 4 L6 16 M14 4 L12 16") },
    { name: "connector-approvals", group: "connector", svg: c(10, 10, 8) + p("M6 10 L9 13 L14 7", "none") },
    { name: "connector-forms", group: "connector", svg: r(3, 3, 14, 14, 1) + r(6, 7, 8, 1) + r(6, 10, 8, 1) + r(6, 13, 5, 1) },
    { name: "connector-excel", group: "connector", svg: r(3, 3, 14, 14, 1) + p("M6 6 L14 14 M14 6 L6 14", "none") },
    { name: "connector-sql", group: "connector", svg: p("M3 6 A7 3 0 1 0 17 6 A7 3 0 1 0 3 6 Z M3 6 V14 A7 3 0 0 0 17 14 V6") },
    // ----- Misc -----
    { name: "star", group: "misc", svg: p("M10 2 L12.5 7.5 L18 8 L13.5 12 L15 18 L10 15 L5 18 L6.5 12 L2 8 L7.5 7.5 Z") },
    { name: "heart", group: "misc", svg: p("M10 17 C4 13 2 9 4 5 C6 2 9 3 10 6 C11 3 14 2 16 5 C18 9 16 13 10 17 Z") },
    { name: "bookmark", group: "misc", svg: p("M5 3 H15 V17 L10 14 L5 17 Z") },
    { name: "tag", group: "misc", svg: p("M3 3 H10 L17 10 L10 17 L3 10 Z") + c(6, 6, 1) },
    { name: "database", group: "misc", svg: p("M3 5 A7 3 0 1 0 17 5 A7 3 0 1 0 3 5 Z M3 5 V10 A7 3 0 0 0 17 10 V5 M3 10 V15 A7 3 0 0 0 17 15 V10", "none") },
    { name: "chart", group: "misc", svg: r(4, 10, 2, 6) + r(9, 6, 2, 10) + r(14, 3, 2, 13) },
    { name: "file", group: "misc", svg: p("M5 3 H12 L15 6 V17 H5 Z M12 3 V6 H15") }
  ];
  function svgDoc(def) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">${def.svg}</svg>`;
  }

  // src/lib/primitives.ts
  function bindFillVar2(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    node.fills = [figma.variables.setBoundVariableForPaint(paint, "color", v)];
  }
  function bindStrokeVar(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    node.strokes = [figma.variables.setBoundVariableForPaint(paint, "color", v)];
    node.strokeWeight = 1;
  }
  function bindTextColor2(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    node.fills = [figma.variables.setBoundVariableForPaint(paint, "color", v)];
  }
  function setDescription(n, purpose, ppName, docs) {
    const parts = [
      `**Purpose:** ${purpose}`,
      `**Power Platform equivalent:** ${ppName}`
    ];
    if (docs) parts.push(`**Docs:** ${docs}`);
    n.description = parts.join("\n\n");
  }
  async function buildIconVariant(def, tokens) {
    const doc = svgDoc(def);
    const node = figma.createNodeFromSvg(doc);
    node.name = `Name=${def.name}`;
    node.resize(20, 20);
    node.findAll((n) => n.type === "VECTOR" || n.type === "RECTANGLE" || n.type === "ELLIPSE").forEach((n) => {
      try {
        bindFillVar2(n, tokens, "color/text/primary");
      } catch (_) {
      }
    });
    const comp = figma.createComponentFromNode(node);
    comp.name = `Name=${def.name}`;
    return comp;
  }
  async function buildIconSet(page, tokens) {
    const variants = [];
    for (const def of ICONS) {
      const c2 = await buildIconVariant(def, tokens);
      page.appendChild(c2);
      variants.push(c2);
    }
    if (!variants.length) return null;
    const set = figma.combineAsVariants(variants, page);
    set.name = "Primitives/Icon";
    setDescription(
      set,
      "20\xD720 vector icon glyph drawn from the Fluent UI System Icons set.",
      "Icon control (Canvas Apps) / various in MDA and Power Automate",
      "https://github.com/microsoft/fluentui-system-icons"
    );
    remember("primitives/icon", set);
    return set;
  }
  var AVATAR_SIZES = { XS: 16, S: 24, M: 32, L: 48, XL: 72 };
  async function buildAvatarSet(page, tokens) {
    const variants = [];
    for (const [label, size] of Object.entries(AVATAR_SIZES)) {
      for (const content of ["Initials", "Image"]) {
        const f = frame(`Size=${label}, Content=${content}`, page);
        autoLayout(f, "h", 0, 0);
        f.counterAxisAlignItems = "CENTER";
        f.primaryAxisAlignItems = "CENTER";
        f.counterAxisSizingMode = "FIXED";
        f.primaryAxisSizingMode = "FIXED";
        f.resize(size, size);
        f.cornerRadius = size / 2;
        f.clipsContent = true;
        bindFillVar2(f, tokens, content === "Image" ? "color/canvas/surface-alt" : "color/brand/primary");
        if (content === "Initials") {
          const fontSize = Math.max(9, Math.round(size * 0.38));
          const t = await text("AB", "semibold", fontSize, f);
          bindTextColor2(t, tokens, "color/canvas/background");
        } else {
          const swatch = rect("placeholder", size, size, f);
          bindFillVar2(swatch, tokens, "color/stroke/default");
        }
        const comp = figma.createComponentFromNode(f);
        variants.push(comp);
      }
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = "Primitives/Avatar";
    setDescription(
      set,
      "Circular avatar showing either a user image or initials.",
      "Persona / avatar pattern used across Canvas gallery items and MDA form headers",
      "https://react.fluentui.dev/?path=/docs/components-avatar--docs"
    );
    remember("primitives/avatar", set);
    return set;
  }
  async function buildBadgeSet(page, tokens) {
    const tones = [
      { key: "Neutral", fill: "color/canvas/surface-alt", fg: "color/text/primary" },
      { key: "Brand", fill: "color/brand/primary", fg: "color/canvas/background" },
      { key: "Success", fill: "color/status/success", fg: "color/canvas/background" },
      { key: "Warning", fill: "color/status/warning", fg: "color/canvas/background" },
      { key: "Danger", fill: "color/status/danger", fg: "color/canvas/background" }
    ];
    const types = ["Dot", "Counter", "Status"];
    const variants = [];
    for (const type of types) {
      for (const tone of tones) {
        const f = frame(`Type=${type}, Tone=${tone.key}`, page);
        autoLayout(f, "h", 4, { l: type === "Dot" ? 0 : 6, r: type === "Dot" ? 0 : 6, t: 2, b: 2 });
        f.primaryAxisSizingMode = "AUTO";
        f.counterAxisSizingMode = "AUTO";
        f.counterAxisAlignItems = "CENTER";
        f.cornerRadius = 9999;
        bindFillVar2(f, tokens, tone.fill);
        if (type === "Dot") {
          const d = ellipse("dot", 8, 8, f);
          bindFillVar2(d, tokens, tone.fill);
          f.fills = [];
        } else if (type === "Counter") {
          const t = await text("9", "semibold", 10, f);
          bindTextColor2(t, tokens, tone.fg);
        } else {
          const t = await text("Status", "semibold", 10, f);
          bindTextColor2(t, tokens, tone.fg);
        }
        variants.push(figma.createComponentFromNode(f));
      }
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = "Primitives/Badge";
    setDescription(
      set,
      "Small inline marker for counts, statuses, or presence.",
      "Badge / count indicator used in Canvas Apps gallery items and MDA command bar",
      "https://react.fluentui.dev/?path=/docs/components-badge--docs"
    );
    remember("primitives/badge", set);
    return set;
  }
  async function buildTagSet(page, tokens) {
    const variantStyles = ["Filled", "Outlined"];
    const sizes = [
      { key: "Small", pad: 6, font: 11, height: 22 },
      { key: "Medium", pad: 8, font: 12, height: 26 }
    ];
    const variants = [];
    for (const v of variantStyles) {
      for (const s of sizes) {
        const f = frame(`Variant=${v}, Size=${s.key}`, page);
        autoLayout(f, "h", 4, { l: s.pad, r: s.pad, t: 2, b: 2 });
        f.primaryAxisSizingMode = "AUTO";
        f.counterAxisSizingMode = "FIXED";
        f.counterAxisAlignItems = "CENTER";
        f.resize(f.width, s.height);
        f.cornerRadius = 4;
        if (v === "Filled") bindFillVar2(f, tokens, "color/canvas/surface-alt");
        else {
          bindFillVar2(f, tokens, "color/canvas/background");
          bindStrokeVar(f, tokens, "color/stroke/default");
        }
        const t = await text("Tag", "medium", s.font, f);
        bindTextColor2(t, tokens, "color/text/primary");
        variants.push(figma.createComponentFromNode(f));
      }
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = "Primitives/Tag";
    setDescription(
      set,
      "Short categorical chip. Use for filters, selected items, categories.",
      "Tag control (Canvas Apps) \u2014 used extensively in Combo Box multi-select and MDA filter pane",
      "https://react.fluentui.dev/?path=/docs/components-tag--docs"
    );
    remember("primitives/tag", set);
    return set;
  }
  async function buildSpinnerSet(page, tokens) {
    const sizes = [
      { key: "Tiny", d: 16 },
      { key: "Small", d: 20 },
      { key: "Medium", d: 28 },
      { key: "Large", d: 36 },
      { key: "Huge", d: 48 }
    ];
    const variants = [];
    for (const s of sizes) {
      const f = frame(`Size=${s.key}`, page);
      f.resize(s.d, s.d);
      f.fills = [];
      const ring = ellipse("ring", s.d, s.d, f);
      ring.fills = [];
      bindStrokeVar(ring, tokens, "color/stroke/subtle");
      ring.strokeWeight = 2;
      const arc = ellipse("arc", s.d, s.d, f);
      arc.fills = [];
      bindStrokeVar(arc, tokens, "color/brand/primary");
      arc.strokeWeight = 2;
      arc.arcData = { startingAngle: 0, endingAngle: Math.PI * 0.7, innerRadius: 0 };
      variants.push(figma.createComponentFromNode(f));
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = "Primitives/Spinner";
    setDescription(
      set,
      "Indeterminate loading indicator \u2014 use when duration is unknown.",
      "Spinner \u2014 used in Canvas Apps Timer/loading screens and MDA command bar during async operations",
      "https://react.fluentui.dev/?path=/docs/components-spinner--docs"
    );
    remember("primitives/spinner", set);
    return set;
  }
  async function buildPersonaSet(page, tokens, avatar) {
    const sizes = [
      { key: "Small", avatar: "S", font: 12, subFont: 11 },
      { key: "Medium", avatar: "M", font: 14, subFont: 12 },
      { key: "Large", avatar: "L", font: 16, subFont: 13 }
    ];
    const variants = [];
    for (const s of sizes) {
      for (const hasSub of [true, false]) {
        const f = frame(`Size=${s.key}, Show secondary=${hasSub}`, page);
        autoLayout(f, "h", 12, 0);
        f.primaryAxisSizingMode = "AUTO";
        f.counterAxisSizingMode = "AUTO";
        f.counterAxisAlignItems = "CENTER";
        const avatarVariant = avatar.children.find((c2) => c2.name.includes(`Size=${s.avatar}`) && c2.name.includes("Initials"));
        if (avatarVariant) {
          const inst = avatarVariant.createInstance();
          f.appendChild(inst);
        }
        const stack = frame("texts", f);
        autoLayout(stack, "v", 2, 0);
        stack.primaryAxisSizingMode = "AUTO";
        stack.counterAxisSizingMode = "AUTO";
        const name = await text("Avery Brooks", "semibold", s.font, stack);
        bindTextColor2(name, tokens, "color/text/primary");
        if (hasSub) {
          const sub = await text("Senior Consultant", "regular", s.subFont, stack);
          bindTextColor2(sub, tokens, "color/text/secondary");
        }
        variants.push(figma.createComponentFromNode(f));
      }
    }
    const set = figma.combineAsVariants(variants, page);
    set.name = "Primitives/Persona";
    setDescription(
      set,
      "Avatar plus name plus optional secondary line. Use in forms, galleries, timelines.",
      "Persona control (Canvas Apps) \u2014 used in MDA form headers, timeline entries, share dialogs",
      "https://react.fluentui.dev/?path=/docs/components-persona--docs"
    );
    remember("primitives/persona", set);
    return set;
  }
  async function writePageHeader(page, tokens) {
    const title = await text("Primitives", "bold", 40, page);
    title.x = 40;
    title.y = 40;
    bindTextColor2(title, tokens, "color/text/primary");
    const sub = await text("Atoms shared by Canvas, MDA and Flow libraries. Every primitive binds its colour to a Variable and can be restyled by switching modes.", "regular", 14, page);
    sub.x = 40;
    sub.y = 96;
    sub.textAutoResize = "HEIGHT";
    sub.resize(900, sub.height);
    bindTextColor2(sub, tokens, "color/text/secondary");
  }
  async function sectionHeading(title, y, tokens, page) {
    const t = await text(title, "semibold", 20, page);
    t.x = 40;
    t.y = y;
    bindTextColor2(t, tokens, "color/text/primary");
    return y + 40;
  }
  async function buildPrimitives(tokens, page) {
    await writePageHeader(page, tokens);
    let y = 160;
    y = await sectionHeading("Icons", y, tokens, page);
    const iconSet = await buildIconSet(page, tokens);
    if (iconSet) {
      iconSet.x = 40;
      iconSet.y = y;
      y += iconSet.height + 64;
    }
    y = await sectionHeading("Avatar", y, tokens, page);
    const avatar = await buildAvatarSet(page, tokens);
    avatar.x = 40;
    avatar.y = y;
    y += avatar.height + 64;
    y = await sectionHeading("Badge", y, tokens, page);
    const badge = await buildBadgeSet(page, tokens);
    badge.x = 40;
    badge.y = y;
    y += badge.height + 64;
    y = await sectionHeading("Tag", y, tokens, page);
    const tag = await buildTagSet(page, tokens);
    tag.x = 40;
    tag.y = y;
    y += tag.height + 64;
    y = await sectionHeading("Spinner", y, tokens, page);
    const spinner = await buildSpinnerSet(page, tokens);
    spinner.x = 40;
    spinner.y = y;
    y += spinner.height + 64;
    y = await sectionHeading("Persona", y, tokens, page);
    const persona = await buildPersonaSet(page, tokens, avatar);
    persona.x = 40;
    persona.y = y;
    y += persona.height + 64;
    const iconByName = /* @__PURE__ */ new Map();
    if (iconSet) {
      for (const c2 of iconSet.children) {
        if (c2.type === "COMPONENT") {
          const m = c2.name.match(/Name=([^,]+)/);
          if (m) iconByName.set(m[1], c2);
        }
      }
    }
    const sets = [];
    if (iconSet) sets.push(iconSet);
    sets.push(avatar, badge, tag, spinner, persona);
    return { components: [], sets, iconByName };
  }

  // src/lib/componentKit.ts
  function bindFill(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    node.fills = [figma.variables.setBoundVariableForPaint(paint, "color", v)];
  }
  function bindStroke(node, tokens, key, weight = 1) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    node.strokes = [figma.variables.setBoundVariableForPaint(paint, "color", v)];
    node.strokeWeight = weight;
  }
  function bindText(node, tokens, key) {
    const v = tokens.color.get(key);
    if (!v) return;
    const paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    node.fills = [figma.variables.setBoundVariableForPaint(paint, "color", v)];
  }
  function setDescription2(n, purpose, ppName, docs) {
    const parts = [
      `**Purpose:** ${purpose}`,
      `**Power Platform equivalent:** ${ppName}`
    ];
    if (docs) parts.push(`**Docs:** ${docs}`);
    n.description = parts.join("\n\n");
  }
  function publishSet(page, variants, name, desc, registryKey) {
    const set = figma.combineAsVariants(variants, page);
    set.name = name;
    setDescription2(set, desc.purpose, desc.pp, desc.docs);
    remember(registryKey, set);
    return set;
  }

  // src/libraries/canvas/structural.ts
  async function buildScreenBlank(page, tokens) {
    const variants = [];
    const presets = [
      { key: "Desktop", w: 1366, h: 768 },
      { key: "Phone", w: 640, h: 1136 }
    ];
    for (const p2 of presets) {
      const f = frame(`Device=${p2.key}`, void 0);
      f.resize(p2.w, p2.h);
      f.clipsContent = true;
      bindFill(f, tokens, "color/canvas/background");
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Screen/Blank", {
      purpose: "Blank app screen at common Canvas size presets.",
      pp: "Screen (Canvas Apps).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/add-screen-context-variables"
    }, "canvas/screen/blank");
  }
  async function buildScreenScrollable(page, tokens) {
    const variants = [];
    const presets = [
      { key: "Desktop", w: 1366, h: 768 },
      { key: "Phone", w: 640, h: 1136 }
    ];
    for (const p2 of presets) {
      const f = frame(`Device=${p2.key}`, void 0);
      autoLayout(f, "v", 0, 0);
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "FIXED";
      f.resize(p2.w, p2.h);
      f.clipsContent = true;
      bindFill(f, tokens, "color/canvas/background");
      const hdr = frame("sticky-header", f);
      autoLayout(hdr, "h", 12, 16);
      hdr.primaryAxisSizingMode = "FIXED";
      hdr.counterAxisSizingMode = "FIXED";
      hdr.resize(p2.w, 56);
      bindFill(hdr, tokens, "color/canvas/surface");
      bindStroke(hdr, tokens, "color/stroke/subtle", 1);
      const body = rect("body-placeholder", p2.w, p2.h - 56, f);
      body.fills = [];
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Screen/Scrollable", {
      purpose: "Screen with a sticky header slot above a scrollable body.",
      pp: "Screen with docked Header container (Canvas Apps)."
    }, "canvas/screen/scrollable");
  }
  async function buildContainer(page, tokens, dir, name, pp, key) {
    const variants = [];
    for (const gap of [8, 16, 24]) {
      const f = frame(`Gap=${gap}`, void 0);
      autoLayout(f, dir, gap, 16);
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "FIXED";
      f.resize(dir === "h" ? 480 : 240, dir === "h" ? 80 : 320);
      bindFill(f, tokens, "color/canvas/surface");
      bindStroke(f, tokens, "color/stroke/subtle", 1);
      for (let i = 0; i < 3; i++) {
        const box = rect(`slot-${i}`, dir === "h" ? 120 : 200, dir === "h" ? 48 : 60, f);
        box.cornerRadius = 4;
        bindFill(box, tokens, "color/canvas/surface-alt");
      }
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, name, {
      purpose: `${dir === "h" ? "Horizontal" : "Vertical"} auto-layout container with configurable gap.`,
      pp,
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-horizontal-container"
    }, key);
  }
  async function buildGridContainer(page, tokens) {
    const f = frame("Cols=12", void 0);
    autoLayout(f, "h", 16, 16);
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "FIXED";
    f.resize(1280, 120);
    bindFill(f, tokens, "color/canvas/surface");
    bindStroke(f, tokens, "color/stroke/subtle", 1);
    for (let i = 0; i < 12; i++) {
      const col = rect(`col-${i + 1}`, 88, 88, f);
      col.cornerRadius = 4;
      bindFill(col, tokens, "color/canvas/surface-alt");
    }
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, "Canvas/Container/Grid", {
      purpose: "12-column responsive grid reference.",
      pp: "Horizontal container pattern with equal flex slots."
    }, "canvas/container/grid");
  }
  async function buildCanvasStructural(page, tokens) {
    return [
      await buildScreenBlank(page, tokens),
      await buildScreenScrollable(page, tokens),
      await buildContainer(page, tokens, "h", "Canvas/Container/Horizontal", "Horizontal container (Canvas Apps).", "canvas/container/horizontal"),
      await buildContainer(page, tokens, "v", "Canvas/Container/Vertical", "Vertical container (Canvas Apps).", "canvas/container/vertical"),
      await buildGridContainer(page, tokens)
    ];
  }

  // src/libraries/canvas/navigation.ts
  async function buildAppHeader(page, tokens) {
    const variants = [];
    for (const width of [1280, 768]) {
      const f = frame(`Width=${width}`, void 0);
      autoLayout(f, "h", 16, { l: 20, r: 20, t: 0, b: 0 });
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "FIXED";
      f.counterAxisAlignItems = "CENTER";
      f.resize(width, 56);
      bindFill(f, tokens, "color/brand/primary");
      const logo = rect("logo", 28, 28, f);
      logo.cornerRadius = 4;
      bindFill(logo, tokens, "color/canvas/background");
      const title = await text("App Title", "semibold", 16, f);
      bindText(title, tokens, "color/canvas/background");
      const pad = rect("pad", 1, 1, f);
      pad.fills = [];
      pad.layoutGrow = 1;
      const av = ellipse("avatar", 32, 32, f);
      bindFill(av, tokens, "color/brand/primary-hover");
      const over = await text("\u22EF", "bold", 20, f);
      bindText(over, tokens, "color/canvas/background");
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Nav/App Header", {
      purpose: "Top-bar with logo, title, and trailing user/overflow.",
      pp: "App header container (Canvas Apps Modern Controls)."
    }, "canvas/nav/app-header");
  }
  async function buildSideMenu(page, tokens) {
    const variants = [];
    for (const state of ["Expanded", "Collapsed"]) {
      const w = state === "Expanded" ? 240 : 64;
      const f = frame(`State=${state}`, void 0);
      autoLayout(f, "v", 4, { l: 8, r: 8, t: 12, b: 12 });
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "FIXED";
      f.resize(w, 480);
      bindFill(f, tokens, "color/canvas/surface");
      bindStroke(f, tokens, "color/stroke/subtle", 1);
      for (let i = 0; i < 6; i++) {
        const row = frame(`item-${i}`, f);
        autoLayout(row, "h", 12, { l: 12, r: 12, t: 0, b: 0 });
        row.primaryAxisSizingMode = "FIXED";
        row.counterAxisSizingMode = "FIXED";
        row.counterAxisAlignItems = "CENTER";
        row.resize(w - 16, 36);
        row.cornerRadius = 4;
        if (i === 0) bindFill(row, tokens, "color/canvas/surface-alt");
        const ic = rect("icon", 20, 20, row);
        bindFill(ic, tokens, i === 0 ? "color/brand/primary" : "color/text/secondary");
        if (state === "Expanded") {
          const lbl = await text(["Dashboard", "Records", "Activities", "Reports", "Tools", "Settings"][i], i === 0 ? "semibold" : "regular", 14, row);
          bindText(lbl, tokens, i === 0 ? "color/brand/primary" : "color/text/primary");
        }
      }
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Nav/Side Menu", {
      purpose: "Vertical navigation rail, expandable to reveal labels.",
      pp: "Side navigation pattern (Canvas Apps)."
    }, "canvas/nav/side-menu");
  }
  async function buildBreadcrumb(page, tokens) {
    const f = frame("Default", void 0);
    autoLayout(f, "h", 8, 0);
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
    f.counterAxisAlignItems = "CENTER";
    const parts = ["Home", "Projects", "Cloud migration"];
    for (let i = 0; i < parts.length; i++) {
      const t = await text(parts[i], i === parts.length - 1 ? "semibold" : "regular", 13, f);
      bindText(t, tokens, i === parts.length - 1 ? "color/text/primary" : "color/text/secondary");
      if (i < parts.length - 1) {
        const sep = await text("\u203A", "regular", 13, f);
        bindText(sep, tokens, "color/text/secondary");
      }
    }
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, "Canvas/Nav/Breadcrumb", {
      purpose: "Hierarchical location indicator.",
      pp: "Breadcrumb pattern (Canvas Apps)."
    }, "canvas/nav/breadcrumb");
  }
  async function buildTabs(page, tokens) {
    const variants = [];
    for (const selected of [0, 1, 2]) {
      const f = frame(`Selected=${selected}`, void 0);
      autoLayout(f, "h", 4, 0);
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "AUTO";
      const labels = ["Overview", "Activities", "Files"];
      for (let i = 0; i < labels.length; i++) {
        const tab = frame(`tab-${i}`, f);
        autoLayout(tab, "v", 6, { l: 16, r: 16, t: 10, b: 10 });
        tab.primaryAxisSizingMode = "AUTO";
        tab.counterAxisSizingMode = "AUTO";
        tab.counterAxisAlignItems = "CENTER";
        const lab = await text(labels[i], i === selected ? "semibold" : "regular", 14, tab);
        bindText(lab, tokens, i === selected ? "color/brand/primary" : "color/text/secondary");
        const under = rect("underline", 1, 2, tab);
        under.layoutGrow = 1;
        if (i === selected) bindFill(under, tokens, "color/brand/primary");
        else under.fills = [];
      }
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Nav/Tabs", {
      purpose: "Horizontal tab selector with underline indicator.",
      pp: "Tablist (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-tablist"
    }, "canvas/nav/tabs");
  }
  async function buildCanvasNavigation(page, tokens) {
    return [
      await buildAppHeader(page, tokens),
      await buildSideMenu(page, tokens),
      await buildBreadcrumb(page, tokens),
      await buildTabs(page, tokens)
    ];
  }

  // src/libraries/canvas/inputs.ts
  function borderFor(state) {
    switch (state) {
      case "Focus":
        return "color/brand/primary";
      case "Error":
        return "color/status/danger";
      case "Disabled":
      case "Readonly":
        return "color/stroke/subtle";
      default:
        return "color/stroke/default";
    }
  }
  function bgFor(state) {
    return state === "Disabled" ? "color/canvas/surface-alt" : "color/canvas/background";
  }
  function textColorFor(state) {
    return state === "Disabled" ? "color/text/disabled" : "color/text/primary";
  }
  async function buildLabelledField(tokens, state, render) {
    const outer = frame(`State=${state}`, void 0);
    autoLayout(outer, "v", 4, 0);
    outer.primaryAxisSizingMode = "AUTO";
    outer.counterAxisSizingMode = "FIXED";
    outer.resize(260, 1);
    const label = await text("Label", "semibold", 12, outer);
    bindText(label, tokens, "color/text/primary");
    const box = frame("box", outer);
    autoLayout(box, "h", 8, { l: 12, r: 12, t: 0, b: 0 });
    box.counterAxisSizingMode = "FIXED";
    box.primaryAxisSizingMode = "FIXED";
    box.counterAxisAlignItems = "CENTER";
    box.resize(260, 32);
    box.cornerRadius = 4;
    bindFill(box, tokens, bgFor(state));
    bindStroke(box, tokens, borderFor(state), state === "Focus" ? 2 : 1);
    await render(box);
    if (state === "Error") {
      const msg = await text("This field is required", "regular", 11, outer);
      bindText(msg, tokens, "color/status/danger");
    } else {
      const hint = await text("Helper text", "regular", 11, outer);
      bindText(hint, tokens, "color/text/secondary");
    }
    return figma.createComponentFromNode(outer);
  }
  async function buildTextInput(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Hover", "Focus", "Error", "Disabled", "Readonly"]) {
      variants.push(await buildLabelledField(tokens, state, async (box) => {
        const val = await text("Enter value\u2026", "regular", 14, box);
        bindText(val, tokens, state === "Default" ? "color/text/secondary" : textColorFor(state));
      }));
    }
    return publishSet(page, variants, "Canvas/Input/Text Input", {
      purpose: "Single-line text entry.",
      pp: "Text input (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-text-input"
    }, "canvas/input/text");
  }
  async function buildTextArea(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Focus", "Error", "Disabled"]) {
      const outer = frame(`State=${state}`, void 0);
      autoLayout(outer, "v", 4, 0);
      outer.primaryAxisSizingMode = "AUTO";
      outer.counterAxisSizingMode = "FIXED";
      outer.resize(260, 1);
      const label = await text("Notes", "semibold", 12, outer);
      bindText(label, tokens, "color/text/primary");
      const box = frame("box", outer);
      autoLayout(box, "v", 4, 12);
      box.counterAxisSizingMode = "FIXED";
      box.primaryAxisSizingMode = "FIXED";
      box.resize(260, 90);
      box.cornerRadius = 4;
      bindFill(box, tokens, bgFor(state));
      bindStroke(box, tokens, borderFor(state), state === "Focus" ? 2 : 1);
      for (let i = 0; i < 3; i++) {
        const ln = rect("line", 220, 1, box);
        bindFill(ln, tokens, "color/stroke/subtle");
      }
      variants.push(figma.createComponentFromNode(outer));
    }
    return publishSet(page, variants, "Canvas/Input/Text Area", {
      purpose: "Multi-line text entry (default 3 rows).",
      pp: "Text input with multiline = true."
    }, "canvas/input/text-area");
  }
  async function buildDropdown(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Focus", "Disabled"]) {
      for (const open of ["Closed", "Open"]) {
        const outer = frame(`State=${state}, Open=${open}`, void 0);
        autoLayout(outer, "v", 4, 0);
        outer.primaryAxisSizingMode = "AUTO";
        outer.counterAxisSizingMode = "FIXED";
        outer.resize(260, 1);
        const label = await text("Select option", "semibold", 12, outer);
        bindText(label, tokens, "color/text/primary");
        const box = frame("box", outer);
        autoLayout(box, "h", 8, { l: 12, r: 12, t: 0, b: 0 });
        box.counterAxisSizingMode = "FIXED";
        box.primaryAxisSizingMode = "FIXED";
        box.counterAxisAlignItems = "CENTER";
        box.resize(260, 32);
        box.cornerRadius = 4;
        bindFill(box, tokens, bgFor(state));
        bindStroke(box, tokens, borderFor(state), state === "Focus" ? 2 : 1);
        const val = await text("\u2014 Select \u2014", "regular", 14, box);
        bindText(val, tokens, "color/text/secondary");
        const pad = rect("pad", 1, 1, box);
        pad.fills = [];
        pad.layoutGrow = 1;
        const chev = await text("\u25BE", "bold", 12, box);
        bindText(chev, tokens, "color/text/secondary");
        if (open === "Open") {
          const menu = frame("menu", outer);
          autoLayout(menu, "v", 0, 4);
          menu.primaryAxisSizingMode = "AUTO";
          menu.counterAxisSizingMode = "FIXED";
          menu.resize(260, 1);
          menu.cornerRadius = 4;
          bindFill(menu, tokens, "color/canvas/background");
          bindStroke(menu, tokens, "color/stroke/default", 1);
          for (const label2 of ["Option A", "Option B", "Option C"]) {
            const row = frame("row", menu);
            autoLayout(row, "h", 0, { l: 12, r: 12, t: 6, b: 6 });
            row.counterAxisSizingMode = "FIXED";
            row.primaryAxisSizingMode = "FIXED";
            row.counterAxisAlignItems = "CENTER";
            row.resize(252, 28);
            const t = await text(label2, "regular", 14, row);
            bindText(t, tokens, "color/text/primary");
          }
        }
        variants.push(figma.createComponentFromNode(outer));
      }
    }
    return publishSet(page, variants, "Canvas/Input/Dropdown", {
      purpose: "Single-select dropdown with closed and open states.",
      pp: "Dropdown (Modern Controls) / Combo box single-select.",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-dropdown"
    }, "canvas/input/dropdown");
  }
  async function buildToggleSet(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Hover", "Disabled"]) {
      for (const on of ["On", "Off"]) {
        const outer = frame(`State=${state}, Value=${on}`, void 0);
        autoLayout(outer, "h", 8, 0);
        outer.primaryAxisSizingMode = "AUTO";
        outer.counterAxisSizingMode = "AUTO";
        outer.counterAxisAlignItems = "CENTER";
        const track = frame("track", outer);
        autoLayout(track, "h", 0, 2);
        track.primaryAxisSizingMode = "FIXED";
        track.counterAxisSizingMode = "FIXED";
        track.counterAxisAlignItems = "CENTER";
        track.primaryAxisAlignItems = on === "On" ? "MAX" : "MIN";
        track.resize(36, 20);
        track.cornerRadius = 10;
        if (state === "Disabled") bindFill(track, tokens, "color/canvas/surface-alt");
        else bindFill(track, tokens, on === "On" ? "color/brand/primary" : "color/canvas/surface-alt");
        const thumb = ellipse("thumb", 16, 16, track);
        bindFill(thumb, tokens, "color/canvas/background");
        const label = await text("Toggle label", "regular", 14, outer);
        bindText(label, tokens, state === "Disabled" ? "color/text/disabled" : "color/text/primary");
        variants.push(figma.createComponentFromNode(outer));
      }
    }
    return publishSet(page, variants, "Canvas/Input/Toggle", {
      purpose: "Binary on/off switch.",
      pp: "Toggle (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-toggle"
    }, "canvas/input/toggle");
  }
  async function buildCheckboxSet(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Hover", "Disabled"]) {
      for (const value of ["Unchecked", "Checked", "Indeterminate"]) {
        const outer = frame(`State=${state}, Value=${value}`, void 0);
        autoLayout(outer, "h", 8, 0);
        outer.primaryAxisSizingMode = "AUTO";
        outer.counterAxisSizingMode = "AUTO";
        outer.counterAxisAlignItems = "CENTER";
        const box = rect("box", 16, 16, outer);
        box.cornerRadius = 2;
        if (value === "Unchecked") {
          bindFill(box, tokens, "color/canvas/background");
          bindStroke(box, tokens, state === "Disabled" ? "color/stroke/subtle" : "color/stroke/default");
        } else {
          bindFill(box, tokens, state === "Disabled" ? "color/text/disabled" : "color/brand/primary");
        }
        if (value === "Checked") {
          const chk = await text("\u2713", "bold", 12, outer);
          chk.x = 1;
          chk.y = 0;
          bindText(chk, tokens, "color/canvas/background");
        } else if (value === "Indeterminate") {
          const bar = rect("bar", 8, 2, outer);
          bindFill(bar, tokens, "color/canvas/background");
        }
        const label = await text("Option", "regular", 14, outer);
        bindText(label, tokens, state === "Disabled" ? "color/text/disabled" : "color/text/primary");
        variants.push(figma.createComponentFromNode(outer));
      }
    }
    return publishSet(page, variants, "Canvas/Input/Checkbox", {
      purpose: "Binary or tri-state boolean selector.",
      pp: "Checkbox (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-checkbox"
    }, "canvas/input/checkbox");
  }
  async function buildRadioGroup(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Disabled"]) {
      const outer = frame(`State=${state}`, void 0);
      autoLayout(outer, "v", 8, 0);
      outer.primaryAxisSizingMode = "AUTO";
      outer.counterAxisSizingMode = "FIXED";
      outer.resize(220, 1);
      for (let i = 0; i < 3; i++) {
        const row = frame("row", outer);
        autoLayout(row, "h", 8, 0);
        row.counterAxisAlignItems = "CENTER";
        row.primaryAxisSizingMode = "AUTO";
        row.counterAxisSizingMode = "AUTO";
        const ring = ellipse("ring", 16, 16, row);
        bindFill(ring, tokens, "color/canvas/background");
        bindStroke(ring, tokens, i === 0 ? "color/brand/primary" : "color/stroke/default", i === 0 ? 5 : 1);
        const lbl = await text(["Option A", "Option B", "Option C"][i], "regular", 14, row);
        bindText(lbl, tokens, state === "Disabled" ? "color/text/disabled" : "color/text/primary");
      }
      variants.push(figma.createComponentFromNode(outer));
    }
    return publishSet(page, variants, "Canvas/Input/Radio Group", {
      purpose: "Mutually exclusive selection from a small set of options.",
      pp: "Radio (Modern Controls) in a group container.",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-radio"
    }, "canvas/input/radio");
  }
  async function buildSlider(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Disabled"]) {
      const outer = frame(`State=${state}`, void 0);
      autoLayout(outer, "v", 8, 0);
      outer.primaryAxisSizingMode = "AUTO";
      outer.counterAxisSizingMode = "FIXED";
      outer.resize(260, 1);
      const label = await text("Slider", "semibold", 12, outer);
      bindText(label, tokens, "color/text/primary");
      const row = frame("row", outer);
      autoLayout(row, "h", 12, 0);
      row.primaryAxisSizingMode = "FIXED";
      row.counterAxisSizingMode = "FIXED";
      row.counterAxisAlignItems = "CENTER";
      row.resize(260, 20);
      const track = rect("track", 210, 4, row);
      track.cornerRadius = 2;
      bindFill(track, tokens, "color/canvas/surface-alt");
      const filled = rect("filled", 120, 4, row);
      filled.layoutPositioning = "ABSOLUTE";
      filled.x = 0;
      filled.y = 8;
      filled.cornerRadius = 2;
      bindFill(filled, tokens, state === "Disabled" ? "color/stroke/default" : "color/brand/primary");
      const thumb = ellipse("thumb", 16, 16, row);
      thumb.layoutPositioning = "ABSOLUTE";
      thumb.x = 114;
      thumb.y = 2;
      bindFill(thumb, tokens, "color/canvas/background");
      bindStroke(thumb, tokens, state === "Disabled" ? "color/stroke/default" : "color/brand/primary", 2);
      const val = await text("50", "semibold", 12, row);
      bindText(val, tokens, "color/text/primary");
      variants.push(figma.createComponentFromNode(outer));
    }
    return publishSet(page, variants, "Canvas/Input/Slider", {
      purpose: "Continuous numeric selection along a range.",
      pp: "Slider (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-slider"
    }, "canvas/input/slider");
  }
  async function buildRating(page, tokens) {
    const variants = [];
    for (const value of [0, 1, 2, 3, 4, 5]) {
      const f = frame(`Value=${value}`, void 0);
      autoLayout(f, "h", 4, 0);
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "AUTO";
      for (let i = 0; i < 5; i++) {
        const star = await text("\u2605", "bold", 18, f);
        bindText(star, tokens, i < value ? "color/status/warning" : "color/stroke/default");
      }
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Input/Rating", {
      purpose: "Discrete rating, commonly 0\u20135 stars.",
      pp: "Rating (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-rating"
    }, "canvas/input/rating");
  }
  async function buildNumberInput(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Focus", "Disabled"]) {
      const outer = frame(`State=${state}`, void 0);
      autoLayout(outer, "v", 4, 0);
      outer.primaryAxisSizingMode = "AUTO";
      outer.counterAxisSizingMode = "FIXED";
      outer.resize(180, 1);
      const label = await text("Quantity", "semibold", 12, outer);
      bindText(label, tokens, "color/text/primary");
      const row = frame("row", outer);
      autoLayout(row, "h", 0, 0);
      row.counterAxisSizingMode = "FIXED";
      row.primaryAxisSizingMode = "FIXED";
      row.resize(180, 32);
      row.cornerRadius = 4;
      bindFill(row, tokens, bgFor(state));
      bindStroke(row, tokens, borderFor(state), state === "Focus" ? 2 : 1);
      const minus = frame("minus", row);
      autoLayout(minus, "h", 0, 0);
      minus.primaryAxisAlignItems = "CENTER";
      minus.counterAxisAlignItems = "CENTER";
      minus.primaryAxisSizingMode = "FIXED";
      minus.counterAxisSizingMode = "FIXED";
      minus.resize(30, 32);
      const mt = await text("\u2212", "bold", 18, minus);
      bindText(mt, tokens, "color/text/primary");
      const valBox = frame("value", row);
      autoLayout(valBox, "h", 0, 0);
      valBox.primaryAxisAlignItems = "CENTER";
      valBox.counterAxisAlignItems = "CENTER";
      valBox.primaryAxisSizingMode = "FIXED";
      valBox.counterAxisSizingMode = "FIXED";
      valBox.resize(120, 32);
      const v = await text("1", "regular", 14, valBox);
      bindText(v, tokens, "color/text/primary");
      const plus = frame("plus", row);
      autoLayout(plus, "h", 0, 0);
      plus.primaryAxisAlignItems = "CENTER";
      plus.counterAxisAlignItems = "CENTER";
      plus.primaryAxisSizingMode = "FIXED";
      plus.counterAxisSizingMode = "FIXED";
      plus.resize(30, 32);
      const pt = await text("+", "bold", 18, plus);
      bindText(pt, tokens, "color/text/primary");
      variants.push(figma.createComponentFromNode(outer));
    }
    return publishSet(page, variants, "Canvas/Input/Number Input", {
      purpose: "Integer entry with stepper buttons.",
      pp: "Number input (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-number-input"
    }, "canvas/input/number");
  }
  async function buildComboBox(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Focus"]) {
      const outer = frame(`State=${state}`, void 0);
      autoLayout(outer, "v", 4, 0);
      outer.primaryAxisSizingMode = "AUTO";
      outer.counterAxisSizingMode = "FIXED";
      outer.resize(320, 1);
      const label = await text("Assignees", "semibold", 12, outer);
      bindText(label, tokens, "color/text/primary");
      const box = frame("box", outer);
      autoLayout(box, "h", 6, { l: 8, r: 8, t: 4, b: 4 });
      box.counterAxisSizingMode = "AUTO";
      box.primaryAxisSizingMode = "FIXED";
      box.resize(320, 1);
      box.cornerRadius = 4;
      bindFill(box, tokens, bgFor(state));
      bindStroke(box, tokens, borderFor(state), state === "Focus" ? 2 : 1);
      for (const name of ["Avery", "Morgan", "Jess"]) {
        const chip = frame("chip", box);
        autoLayout(chip, "h", 4, { l: 6, r: 6, t: 2, b: 2 });
        chip.counterAxisSizingMode = "AUTO";
        chip.primaryAxisSizingMode = "AUTO";
        chip.counterAxisAlignItems = "CENTER";
        chip.cornerRadius = 4;
        bindFill(chip, tokens, "color/canvas/surface-alt");
        const nm = await text(name, "medium", 12, chip);
        bindText(nm, tokens, "color/text/primary");
        const x = await text("\xD7", "bold", 12, chip);
        bindText(x, tokens, "color/text/secondary");
      }
      variants.push(figma.createComponentFromNode(outer));
    }
    return publishSet(page, variants, "Canvas/Input/Combo Box", {
      purpose: "Multi-select with chip-style chosen items.",
      pp: "Combo box (Modern Controls) with SelectMultiple = true.",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-combobox"
    }, "canvas/input/combo-box");
  }
  async function buildDatePicker(page, tokens) {
    const variants = [];
    for (const state of ["Closed", "Open"]) {
      const outer = frame(`State=${state}`, void 0);
      autoLayout(outer, "v", 4, 0);
      outer.primaryAxisSizingMode = "AUTO";
      outer.counterAxisSizingMode = "FIXED";
      outer.resize(260, 1);
      const label = await text("Due date", "semibold", 12, outer);
      bindText(label, tokens, "color/text/primary");
      const box = frame("box", outer);
      autoLayout(box, "h", 8, { l: 12, r: 12, t: 0, b: 0 });
      box.counterAxisSizingMode = "FIXED";
      box.primaryAxisSizingMode = "FIXED";
      box.counterAxisAlignItems = "CENTER";
      box.resize(260, 32);
      box.cornerRadius = 4;
      bindFill(box, tokens, "color/canvas/background");
      bindStroke(box, tokens, "color/stroke/default", 1);
      const v = await text("Apr 20, 2026", "regular", 14, box);
      bindText(v, tokens, "color/text/primary");
      const pad = rect("pad", 1, 1, box);
      pad.fills = [];
      pad.layoutGrow = 1;
      const cal = await text("\u{1F4C5}", "regular", 14, box);
      if (state === "Open") {
        const cal2 = frame("calendar", outer);
        autoLayout(cal2, "v", 4, 8);
        cal2.primaryAxisSizingMode = "AUTO";
        cal2.counterAxisSizingMode = "FIXED";
        cal2.resize(260, 1);
        cal2.cornerRadius = 4;
        bindFill(cal2, tokens, "color/canvas/background");
        bindStroke(cal2, tokens, "color/stroke/default", 1);
        const hdr = await text("April 2026", "semibold", 13, cal2);
        bindText(hdr, tokens, "color/text/primary");
        for (let r2 = 0; r2 < 5; r2++) {
          const row = frame("row", cal2);
          autoLayout(row, "h", 4, 0);
          row.primaryAxisSizingMode = "FIXED";
          row.counterAxisSizingMode = "AUTO";
          row.resize(244, 1);
          for (let c2 = 0; c2 < 7; c2++) {
            const cell = frame("cell", row);
            autoLayout(cell, "h", 0, 0);
            cell.primaryAxisAlignItems = "CENTER";
            cell.counterAxisAlignItems = "CENTER";
            cell.primaryAxisSizingMode = "FIXED";
            cell.counterAxisSizingMode = "FIXED";
            cell.resize(32, 28);
            const d = r2 * 7 + c2 - 2;
            const n = d > 0 && d < 31 ? String(d) : "";
            const tx = await text(n, "regular", 12, cell);
            bindText(tx, tokens, "color/text/primary");
            if (d === 20) {
              cell.cornerRadius = 14;
              bindFill(cell, tokens, "color/brand/primary");
              bindText(tx, tokens, "color/canvas/background");
            }
          }
        }
      }
      variants.push(figma.createComponentFromNode(outer));
    }
    return publishSet(page, variants, "Canvas/Input/Date Picker", {
      purpose: "Date selection with optional calendar popup.",
      pp: "Date picker (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-date-picker"
    }, "canvas/input/date-picker");
  }
  async function buildTimePicker(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Focus"]) {
      const outer = frame(`State=${state}`, void 0);
      autoLayout(outer, "v", 4, 0);
      outer.primaryAxisSizingMode = "AUTO";
      outer.counterAxisSizingMode = "FIXED";
      outer.resize(200, 1);
      const label = await text("Start time", "semibold", 12, outer);
      bindText(label, tokens, "color/text/primary");
      const box = frame("box", outer);
      autoLayout(box, "h", 8, { l: 12, r: 12, t: 0, b: 0 });
      box.counterAxisSizingMode = "FIXED";
      box.primaryAxisSizingMode = "FIXED";
      box.counterAxisAlignItems = "CENTER";
      box.resize(200, 32);
      box.cornerRadius = 4;
      bindFill(box, tokens, "color/canvas/background");
      bindStroke(box, tokens, borderFor(state), state === "Focus" ? 2 : 1);
      const v = await text("09:30 AM", "regular", 14, box);
      bindText(v, tokens, "color/text/primary");
      variants.push(figma.createComponentFromNode(outer));
    }
    return publishSet(page, variants, "Canvas/Input/Time Picker", {
      purpose: "Time selection.",
      pp: "Time picker (Modern Controls)."
    }, "canvas/input/time-picker");
  }
  async function buildCanvasInputs(page, tokens) {
    const sets = [];
    sets.push(await buildTextInput(page, tokens));
    sets.push(await buildTextArea(page, tokens));
    sets.push(await buildDropdown(page, tokens));
    sets.push(await buildComboBox(page, tokens));
    sets.push(await buildDatePicker(page, tokens));
    sets.push(await buildTimePicker(page, tokens));
    sets.push(await buildToggleSet(page, tokens));
    sets.push(await buildCheckboxSet(page, tokens));
    sets.push(await buildRadioGroup(page, tokens));
    sets.push(await buildSlider(page, tokens));
    sets.push(await buildRating(page, tokens));
    sets.push(await buildNumberInput(page, tokens));
    return sets;
  }

  // src/libraries/canvas/buttons.ts
  var SIZES = {
    Small: { h: 24, pad: 8, gap: 4, font: 12 },
    Medium: { h: 32, pad: 12, gap: 6, font: 14 },
    Large: { h: 40, pad: 16, gap: 8, font: 16 }
  };
  function appearanceColors(appearance, state) {
    if (state === "Disabled") {
      return {
        bg: appearance === "Primary" ? "color/canvas/surface-alt" : void 0,
        border: appearance === "Secondary" ? "color/stroke/subtle" : void 0,
        fg: "color/text/disabled"
      };
    }
    switch (appearance) {
      case "Primary": {
        const bg = state === "Hover" ? "color/brand/primary-hover" : state === "Pressed" ? "color/brand/primary-pressed" : "color/brand/primary";
        return { bg, fg: "color/canvas/background" };
      }
      case "Secondary": {
        const bg = state === "Hover" ? "color/canvas/surface-alt" : "color/canvas/background";
        return { bg, border: "color/stroke/default", fg: "color/text/primary" };
      }
      case "Subtle": {
        const bg = state === "Default" ? void 0 : "color/canvas/surface-alt";
        return { bg, fg: "color/text/primary" };
      }
      case "Transparent":
      default:
        return { fg: "color/brand/primary" };
    }
  }
  async function buildButtonVariant(tokens, appearance, state, size) {
    const s = SIZES[size];
    const colors = appearanceColors(appearance, state);
    const f = frame(`State=${state}, Size=${size}`, void 0);
    autoLayout(f, "h", s.gap, { l: s.pad, r: s.pad, t: 0, b: 0 });
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "FIXED";
    f.counterAxisAlignItems = "CENTER";
    f.primaryAxisAlignItems = "CENTER";
    f.resize(f.width, s.h);
    f.cornerRadius = 4;
    if (colors.bg) bindFill(f, tokens, colors.bg);
    if (colors.border) bindStroke(f, tokens, colors.border, 1);
    const t = await text("Button", "semibold", s.font, f);
    bindText(t, tokens, colors.fg);
    return figma.createComponentFromNode(f);
  }
  async function buildAppearanceSet(page, tokens, appearance) {
    const variants = [];
    for (const state of ["Default", "Hover", "Pressed", "Disabled"]) {
      for (const size of ["Small", "Medium", "Large"]) {
        variants.push(await buildButtonVariant(tokens, appearance, state, size));
      }
    }
    return publishSet(page, variants, `Canvas/Button/${appearance}`, {
      purpose: `${appearance} emphasis Fluent-style button.`,
      pp: "Button (Modern Controls) \u2014 appearance variants",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-button"
    }, `canvas/button/${appearance.toLowerCase()}`);
  }
  async function buildIconOnlyButtonSet(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Hover", "Pressed", "Disabled"]) {
      for (const size of ["Small", "Medium", "Large"]) {
        const s = SIZES[size];
        const f = frame(`State=${state}, Size=${size}`, void 0);
        autoLayout(f, "h", 0, 0);
        f.primaryAxisSizingMode = "FIXED";
        f.counterAxisSizingMode = "FIXED";
        f.primaryAxisAlignItems = "CENTER";
        f.counterAxisAlignItems = "CENTER";
        f.resize(s.h, s.h);
        f.cornerRadius = 4;
        if (state !== "Default") bindFill(f, tokens, state === "Pressed" ? "color/canvas/surface" : "color/canvas/surface-alt");
        bindStroke(f, tokens, "color/stroke/default", 1);
        const glyph = figma.createRectangle();
        glyph.resize(16, 16);
        glyph.fills = [];
        glyph.name = "icon";
        bindStroke(glyph, tokens, state === "Disabled" ? "color/text/disabled" : "color/text/primary");
        f.appendChild(glyph);
        variants.push(figma.createComponentFromNode(f));
      }
    }
    return publishSet(page, variants, "Canvas/Button/Icon Only", {
      purpose: "Square icon button. Use with Instance Swap on the icon child.",
      pp: "Button with only Icon property set (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-button"
    }, "canvas/button/icon-only");
  }
  async function buildSplitButtonSet(page, tokens) {
    const variants = [];
    for (const state of ["Default", "Hover", "Disabled"]) {
      const f = frame(`State=${state}`, void 0);
      autoLayout(f, "h", 0, 0);
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "FIXED";
      f.counterAxisAlignItems = "CENTER";
      f.resize(f.width, 32);
      const left = frame("primary", f);
      autoLayout(left, "h", 6, { l: 12, r: 12, t: 0, b: 0 });
      left.counterAxisSizingMode = "FIXED";
      left.primaryAxisSizingMode = "AUTO";
      left.counterAxisAlignItems = "CENTER";
      left.resize(left.width, 32);
      const colors = appearanceColors("Primary", state);
      if (colors.bg) bindFill(left, tokens, colors.bg);
      const txt = await text("Primary action", "semibold", 14, left);
      bindText(txt, tokens, colors.fg);
      const chev = frame("chev", f);
      autoLayout(chev, "h", 0, 0);
      chev.counterAxisSizingMode = "FIXED";
      chev.primaryAxisSizingMode = "FIXED";
      chev.counterAxisAlignItems = "CENTER";
      chev.primaryAxisAlignItems = "CENTER";
      chev.resize(32, 32);
      if (colors.bg) bindFill(chev, tokens, state === "Hover" ? "color/brand/primary-pressed" : "color/brand/primary-hover");
      const c2 = await text("\u25BE", "bold", 12, chev);
      bindText(c2, tokens, colors.fg);
      f.cornerRadius = 4;
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Button/Split Button", {
      purpose: "Primary action plus a dropdown of related actions.",
      pp: "Command Bar split button pattern (Modern Controls).",
      docs: "https://react.fluentui.dev/?path=/docs/components-button-splitbutton--docs"
    }, "canvas/button/split");
  }
  async function buildCanvasButtons(page, tokens) {
    const sets = [];
    for (const a of ["Primary", "Secondary", "Subtle", "Transparent"]) {
      sets.push(await buildAppearanceSet(page, tokens, a));
    }
    sets.push(await buildIconOnlyButtonSet(page, tokens));
    sets.push(await buildSplitButtonSet(page, tokens));
    return sets;
  }

  // src/libraries/canvas/data.ts
  async function galleryItem(tokens, variant) {
    const row = frame("GalleryItem", void 0);
    autoLayout(row, "h", 12, { l: 16, r: 16, t: 10, b: 10 });
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    row.counterAxisAlignItems = "CENTER";
    row.resize(360, 1);
    if (variant === "Selected") bindFill(row, tokens, "color/canvas/surface-alt");
    else if (variant === "Hover") bindFill(row, tokens, "color/canvas/surface");
    const av = ellipse("avatar", 36, 36, row);
    bindFill(av, tokens, "color/brand/primary");
    const info = frame("info", row);
    autoLayout(info, "v", 2, 0);
    info.primaryAxisSizingMode = "AUTO";
    info.counterAxisSizingMode = "AUTO";
    info.layoutGrow = 1;
    const title = await text("Alicia Contoso", "semibold", 14, info);
    bindText(title, tokens, "color/text/primary");
    const sub = await text("alicia@contoso.com \xB7 Senior Director", "regular", 12, info);
    bindText(sub, tokens, "color/text/secondary");
    const chev = await text("\u203A", "bold", 18, row);
    bindText(chev, tokens, "color/text/secondary");
    return row;
  }
  async function buildGalleryVertical(page, tokens) {
    const variants = [];
    for (const variant of ["Default", "Selected", "Hover"]) {
      variants.push(figma.createComponentFromNode(await (async () => {
        const f = await galleryItem(tokens, variant);
        f.name = `Variant=${variant}`;
        return f;
      })()));
    }
    return publishSet(page, variants, "Canvas/Data/Gallery \u2014 Vertical", {
      purpose: "Vertical gallery list item (avatar + two lines + chevron).",
      pp: "Vertical Gallery (Modern Controls) with item template.",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-gallery"
    }, "canvas/data/gallery-vertical");
  }
  async function buildGalleryHorizontal(page, tokens) {
    const f = frame("Default", void 0);
    autoLayout(f, "h", 12, 16);
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "FIXED";
    f.resize(720, 160);
    bindFill(f, tokens, "color/canvas/background");
    for (let i = 0; i < 4; i++) {
      const card = frame(`card-${i}`, f);
      autoLayout(card, "v", 8, 12);
      card.primaryAxisSizingMode = "FIXED";
      card.counterAxisSizingMode = "FIXED";
      card.resize(160, 128);
      card.cornerRadius = 6;
      bindFill(card, tokens, "color/canvas/surface");
      bindStroke(card, tokens, "color/stroke/subtle", 1);
      const img = rect("image", 136, 72, card);
      img.cornerRadius = 4;
      bindFill(img, tokens, "color/canvas/surface-alt");
      const t = await text(`Item ${i + 1}`, "semibold", 13, card);
      bindText(t, tokens, "color/text/primary");
    }
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, "Canvas/Data/Gallery \u2014 Horizontal", {
      purpose: "Horizontal gallery of cards (e.g. images or summaries).",
      pp: "Horizontal Gallery (Modern Controls)."
    }, "canvas/data/gallery-horizontal");
  }
  async function buildGalleryFlexible(page, tokens) {
    const f = frame("Default", void 0);
    autoLayout(f, "v", 8, 16);
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "AUTO";
    f.resize(520, 1);
    bindFill(f, tokens, "color/canvas/background");
    for (let i = 0; i < 3; i++) {
      const row = frame(`row-${i}`, f);
      autoLayout(row, "v", 4, 12);
      row.primaryAxisSizingMode = "AUTO";
      row.counterAxisSizingMode = "FIXED";
      row.resize(488, 1);
      row.cornerRadius = 6;
      bindFill(row, tokens, "color/canvas/surface");
      bindStroke(row, tokens, "color/stroke/subtle", 1);
      const t = await text(`Case CAS-${1e3 + i}`, "semibold", 13, row);
      bindText(t, tokens, "color/text/primary");
      const b = await text("Body text that wraps to multiple lines when the content is long. Gallery item grows with content.", "regular", 12, row);
      b.textAutoResize = "HEIGHT";
      b.resize(464, b.height);
      bindText(b, tokens, "color/text/secondary");
    }
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, "Canvas/Data/Gallery \u2014 Flexible Height", {
      purpose: "Gallery rows that grow to content height.",
      pp: "Flexible Height gallery (Modern Controls)."
    }, "canvas/data/gallery-flexible");
  }
  async function buildDataTable(page, tokens) {
    const variants = [];
    for (const sel of ["Off", "On"]) {
      const f = frame(`Selection=${sel}`, void 0);
      autoLayout(f, "v", 0, 0);
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "FIXED";
      f.resize(720, 1);
      f.cornerRadius = 6;
      bindFill(f, tokens, "color/canvas/background");
      bindStroke(f, tokens, "color/stroke/subtle", 1);
      const hdr = frame("header", f);
      autoLayout(hdr, "h", 0, 0);
      hdr.primaryAxisSizingMode = "FIXED";
      hdr.counterAxisSizingMode = "FIXED";
      hdr.counterAxisAlignItems = "CENTER";
      hdr.resize(720, 40);
      bindFill(hdr, tokens, "color/canvas/surface");
      bindStroke(hdr, tokens, "color/stroke/subtle", 1);
      const cols = sel === "On" ? [48, 280, 180, 130, 82] : [280, 200, 140, 100];
      const colLabels = sel === "On" ? ["", "Name", "Status", "Owner", ""] : ["Name", "Status", "Owner", "Due"];
      for (let c2 = 0; c2 < cols.length; c2++) {
        const cell = frame(`hc-${c2}`, hdr);
        autoLayout(cell, "h", 0, { l: 12, r: 12, t: 0, b: 0 });
        cell.primaryAxisSizingMode = "FIXED";
        cell.counterAxisSizingMode = "FIXED";
        cell.counterAxisAlignItems = "CENTER";
        cell.resize(cols[c2], 40);
        if (c2 === 0 && sel === "On") {
          const cb = rect("cb", 16, 16, cell);
          cb.cornerRadius = 2;
          bindStroke(cb, tokens, "color/stroke/default", 1);
        } else if (colLabels[c2]) {
          const t = await text(colLabels[c2], "semibold", 12, cell);
          bindText(t, tokens, "color/text/secondary");
        }
      }
      for (let r2 = 0; r2 < 5; r2++) {
        const row = frame(`row-${r2}`, f);
        autoLayout(row, "h", 0, 0);
        row.primaryAxisSizingMode = "FIXED";
        row.counterAxisSizingMode = "FIXED";
        row.counterAxisAlignItems = "CENTER";
        row.resize(720, 44);
        if (r2 % 2 === 1) bindFill(row, tokens, "color/canvas/surface");
        bindStroke(row, tokens, "color/stroke/subtle", 1);
        const cellLabels = sel === "On" ? ["", ["Cloud migration", "Licensing renew", "DB uplift", "Teams adoption", "Power BI"][r2], ["Open", "Won", "Qualified", "Working", "Paused"][r2], ["Avery", "Morgan", "Jess", "Sam", "Avery"][r2], "\u22EF"] : [["Cloud migration", "Licensing renew", "DB uplift", "Teams adoption", "Power BI"][r2], ["Open", "Won", "Qualified", "Working", "Paused"][r2], ["Avery", "Morgan", "Jess", "Sam", "Avery"][r2], "Q2 2026"];
        for (let c2 = 0; c2 < cols.length; c2++) {
          const cell = frame(`c${r2}-${c2}`, row);
          autoLayout(cell, "h", 0, { l: 12, r: 12, t: 0, b: 0 });
          cell.primaryAxisSizingMode = "FIXED";
          cell.counterAxisSizingMode = "FIXED";
          cell.counterAxisAlignItems = "CENTER";
          cell.resize(cols[c2], 44);
          if (c2 === 0 && sel === "On") {
            const cb = rect("cb", 16, 16, cell);
            cb.cornerRadius = 2;
            bindStroke(cb, tokens, "color/stroke/default", 1);
          } else if (cellLabels[c2]) {
            const t = await text(String(cellLabels[c2]), "regular", 13, cell);
            bindText(t, tokens, "color/text/primary");
          }
        }
      }
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Data/Data Table", {
      purpose: "Tabular record view with header, rows, and optional selection column.",
      pp: "Data Table (Modern Controls).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/modern-controls/modern-control-data-table"
    }, "canvas/data/table");
  }
  async function buildCard(page, tokens) {
    const variants = [];
    for (const footer of ["None", "Actions"]) {
      const f = frame(`Footer=${footer}`, void 0);
      autoLayout(f, "v", 12, 16);
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "FIXED";
      f.resize(280, 1);
      f.cornerRadius = 6;
      bindFill(f, tokens, "color/canvas/background");
      bindStroke(f, tokens, "color/stroke/subtle", 1);
      const hdr = await text("Card title", "semibold", 16, f);
      bindText(hdr, tokens, "color/text/primary");
      const body = await text("Descriptive text summarising the card contents, spanning a line or two.", "regular", 13, f);
      body.textAutoResize = "HEIGHT";
      body.resize(248, body.height);
      bindText(body, tokens, "color/text/secondary");
      if (footer === "Actions") {
        const actions = frame("actions", f);
        autoLayout(actions, "h", 8, 0);
        actions.primaryAxisSizingMode = "AUTO";
        actions.counterAxisSizingMode = "AUTO";
        const primary = frame("primary", actions);
        autoLayout(primary, "h", 0, { l: 12, r: 12, t: 0, b: 0 });
        primary.primaryAxisAlignItems = "CENTER";
        primary.counterAxisAlignItems = "CENTER";
        primary.primaryAxisSizingMode = "AUTO";
        primary.counterAxisSizingMode = "FIXED";
        primary.resize(80, 32);
        primary.cornerRadius = 4;
        bindFill(primary, tokens, "color/brand/primary");
        const pt = await text("Open", "semibold", 13, primary);
        bindText(pt, tokens, "color/canvas/background");
      }
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Data/Card", {
      purpose: "Composable card with title, body, and optional actions.",
      pp: "Card container (Canvas Apps)."
    }, "canvas/data/card");
  }
  async function buildForm(page, tokens, edit) {
    const f = frame("Default", void 0);
    autoLayout(f, "v", 16, 20);
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "FIXED";
    f.resize(420, 1);
    f.cornerRadius = 6;
    bindFill(f, tokens, "color/canvas/background");
    bindStroke(f, tokens, "color/stroke/subtle", 1);
    for (const fld of ["Name", "Email", "Department"]) {
      const row = frame(`row-${fld}`, f);
      autoLayout(row, "v", 4, 0);
      row.primaryAxisSizingMode = "AUTO";
      row.counterAxisSizingMode = "FIXED";
      row.resize(380, 1);
      const lbl = await text(fld, "semibold", 12, row);
      bindText(lbl, tokens, "color/text/primary");
      if (edit) {
        const box = frame("box", row);
        autoLayout(box, "h", 0, 12);
        box.primaryAxisSizingMode = "FIXED";
        box.counterAxisSizingMode = "FIXED";
        box.resize(380, 32);
        box.cornerRadius = 4;
        bindFill(box, tokens, "color/canvas/background");
        bindStroke(box, tokens, "color/stroke/default", 1);
        const v = await text("\u2014", "regular", 14, box);
        bindText(v, tokens, "color/text/secondary");
      } else {
        const v = await text("Avery Brooks", "regular", 14, row);
        bindText(v, tokens, "color/text/primary");
      }
    }
    if (edit) {
      const footer = frame("footer", f);
      autoLayout(footer, "h", 8, 0);
      footer.primaryAxisSizingMode = "AUTO";
      footer.counterAxisSizingMode = "AUTO";
      footer.primaryAxisAlignItems = "MAX";
      const cancel = frame("cancel", footer);
      autoLayout(cancel, "h", 0, { l: 12, r: 12, t: 0, b: 0 });
      cancel.primaryAxisAlignItems = "CENTER";
      cancel.counterAxisAlignItems = "CENTER";
      cancel.primaryAxisSizingMode = "AUTO";
      cancel.counterAxisSizingMode = "FIXED";
      cancel.resize(80, 32);
      cancel.cornerRadius = 4;
      bindStroke(cancel, tokens, "color/stroke/default", 1);
      const ct = await text("Cancel", "semibold", 13, cancel);
      bindText(ct, tokens, "color/text/primary");
      const save = frame("save", footer);
      autoLayout(save, "h", 0, { l: 12, r: 12, t: 0, b: 0 });
      save.primaryAxisAlignItems = "CENTER";
      save.counterAxisAlignItems = "CENTER";
      save.primaryAxisSizingMode = "AUTO";
      save.counterAxisSizingMode = "FIXED";
      save.resize(80, 32);
      save.cornerRadius = 4;
      bindFill(save, tokens, "color/brand/primary");
      const st = await text("Submit", "semibold", 13, save);
      bindText(st, tokens, "color/canvas/background");
    }
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, edit ? "Canvas/Data/Form \u2014 Edit" : "Canvas/Data/Form \u2014 Display", {
      purpose: edit ? "Editable form with fields plus submit footer." : "Read-only display of record fields.",
      pp: edit ? "Edit form (Canvas Apps)." : "Display form (Canvas Apps).",
      docs: "https://learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-form-detail"
    }, edit ? "canvas/data/form-edit" : "canvas/data/form-display");
  }
  async function buildEmptyState(page, tokens) {
    const f = frame("Default", void 0);
    autoLayout(f, "v", 12, 40);
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "FIXED";
    f.counterAxisAlignItems = "CENTER";
    f.resize(360, 1);
    const placeholder = rect("art", 96, 96, f);
    placeholder.cornerRadius = 48;
    bindFill(placeholder, tokens, "color/canvas/surface-alt");
    const t = await text("Nothing here yet", "semibold", 18, f);
    bindText(t, tokens, "color/text/primary");
    const d = await text("Get started by creating your first record.", "regular", 13, f);
    bindText(d, tokens, "color/text/secondary");
    const cta = frame("cta", f);
    autoLayout(cta, "h", 0, { l: 14, r: 14, t: 8, b: 8 });
    cta.primaryAxisAlignItems = "CENTER";
    cta.counterAxisAlignItems = "CENTER";
    cta.primaryAxisSizingMode = "AUTO";
    cta.counterAxisSizingMode = "AUTO";
    cta.cornerRadius = 4;
    bindFill(cta, tokens, "color/brand/primary");
    const ct = await text("Create new", "semibold", 13, cta);
    bindText(ct, tokens, "color/canvas/background");
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, "Canvas/Data/Empty State", {
      purpose: "Message + call-to-action shown when a collection is empty.",
      pp: "Empty-state pattern (Canvas Apps)."
    }, "canvas/data/empty-state");
  }
  async function buildCanvasData(page, tokens) {
    return [
      await buildGalleryVertical(page, tokens),
      await buildGalleryHorizontal(page, tokens),
      await buildGalleryFlexible(page, tokens),
      await buildDataTable(page, tokens),
      await buildCard(page, tokens),
      await buildForm(page, tokens, true),
      await buildForm(page, tokens, false),
      await buildEmptyState(page, tokens)
    ];
  }

  // src/libraries/canvas/feedback.ts
  async function buildProgressBar(page, tokens) {
    const variants = [];
    for (const kind of ["Determinate", "Indeterminate"]) {
      for (const value of kind === "Determinate" ? [0, 40, 80, 100] : [0]) {
        const f = frame(`Kind=${kind}${kind === "Determinate" ? `, Value=${value}` : ""}`, void 0);
        autoLayout(f, "h", 0, 0);
        f.primaryAxisSizingMode = "FIXED";
        f.counterAxisSizingMode = "FIXED";
        f.resize(240, 4);
        f.cornerRadius = 2;
        bindFill(f, tokens, "color/canvas/surface-alt");
        const fill = rect("fill", kind === "Determinate" ? 240 * value / 100 : 80, 4, f);
        fill.cornerRadius = 2;
        bindFill(fill, tokens, "color/brand/primary");
        variants.push(figma.createComponentFromNode(f));
      }
    }
    return publishSet(page, variants, "Canvas/Feedback/Progress Bar", {
      purpose: "Linear progress indicator.",
      pp: "Progress bar (Modern Controls).",
      docs: "https://react.fluentui.dev/?path=/docs/components-progressbar--docs"
    }, "canvas/feedback/progress");
  }
  async function buildMessageBar(page, tokens) {
    const variants = [];
    const intents = [
      ["Info", "color/status/info", "color/canvas/surface-alt"],
      ["Success", "color/status/success", "color/canvas/surface-alt"],
      ["Warning", "color/status/warning", "color/canvas/surface-alt"],
      ["Danger", "color/status/danger", "color/canvas/surface-alt"]
    ];
    for (const [intent, icon, bg] of intents) {
      const f = frame(`Intent=${intent}`, void 0);
      autoLayout(f, "h", 12, 12);
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "AUTO";
      f.counterAxisAlignItems = "CENTER";
      f.resize(480, 1);
      f.cornerRadius = 4;
      bindFill(f, tokens, bg);
      bindStroke(f, tokens, icon, 1);
      const dot = ellipse("icon", 20, 20, f);
      bindFill(dot, tokens, icon);
      const t = await text(`${intent} message example text.`, "semibold", 13, f);
      bindText(t, tokens, "color/text/primary");
      const pad = rect("pad", 1, 1, f);
      pad.fills = [];
      pad.layoutGrow = 1;
      const close = await text("\xD7", "bold", 16, f);
      bindText(close, tokens, "color/text/secondary");
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Feedback/Message Bar", {
      purpose: "Page-level status banner in four intents.",
      pp: "Message bar (Modern Controls).",
      docs: "https://react.fluentui.dev/?path=/docs/components-messagebar--docs"
    }, "canvas/feedback/message-bar");
  }
  async function buildToast(page, tokens) {
    const variants = [];
    for (const intent of ["Info", "Success", "Warning", "Danger"]) {
      const f = frame(`Intent=${intent}`, void 0);
      autoLayout(f, "h", 12, { l: 12, r: 16, t: 12, b: 12 });
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "AUTO";
      f.resize(320, 1);
      f.cornerRadius = 4;
      bindFill(f, tokens, "color/canvas/background");
      bindStroke(f, tokens, "color/stroke/subtle", 1);
      const dot = ellipse("icon", 20, 20, f);
      bindFill(dot, tokens, `color/status/${intent.toLowerCase()}`);
      const col = frame("col", f);
      autoLayout(col, "v", 2, 0);
      col.primaryAxisSizingMode = "AUTO";
      col.counterAxisSizingMode = "AUTO";
      col.layoutGrow = 1;
      const title = await text(`${intent} toast`, "semibold", 13, col);
      bindText(title, tokens, "color/text/primary");
      const body = await text("Brief explanation of what happened.", "regular", 12, col);
      bindText(body, tokens, "color/text/secondary");
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Feedback/Toast", {
      purpose: "Transient notification anchored to a corner of the screen.",
      pp: "Toast notification pattern (Modern Controls)."
    }, "canvas/feedback/toast");
  }
  async function buildDialog(page, tokens) {
    const variants = [];
    for (const size of ["Small", "Medium", "Large"]) {
      const w = size === "Small" ? 360 : size === "Medium" ? 480 : 640;
      const f = frame(`Size=${size}`, void 0);
      autoLayout(f, "v", 16, 24);
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "FIXED";
      f.resize(w, 1);
      f.cornerRadius = 8;
      bindFill(f, tokens, "color/canvas/background");
      bindStroke(f, tokens, "color/stroke/subtle", 1);
      const t = await text("Confirm deletion", "semibold", 20, f);
      bindText(t, tokens, "color/text/primary");
      const b = await text("Are you sure you want to delete this record? This action cannot be undone.", "regular", 14, f);
      b.textAutoResize = "HEIGHT";
      b.resize(w - 48, b.height);
      bindText(b, tokens, "color/text/secondary");
      const actions = frame("actions", f);
      autoLayout(actions, "h", 8, 0);
      actions.primaryAxisSizingMode = "AUTO";
      actions.counterAxisSizingMode = "AUTO";
      actions.primaryAxisAlignItems = "MAX";
      actions.layoutGrow = 0;
      const cancel = frame("cancel", actions);
      autoLayout(cancel, "h", 0, { l: 14, r: 14, t: 8, b: 8 });
      cancel.primaryAxisAlignItems = "CENTER";
      cancel.counterAxisAlignItems = "CENTER";
      cancel.cornerRadius = 4;
      bindStroke(cancel, tokens, "color/stroke/default", 1);
      const ct = await text("Cancel", "semibold", 13, cancel);
      bindText(ct, tokens, "color/text/primary");
      const confirm = frame("confirm", actions);
      autoLayout(confirm, "h", 0, { l: 14, r: 14, t: 8, b: 8 });
      confirm.primaryAxisAlignItems = "CENTER";
      confirm.counterAxisAlignItems = "CENTER";
      confirm.cornerRadius = 4;
      bindFill(confirm, tokens, "color/status/danger");
      const xt = await text("Delete", "semibold", 13, confirm);
      bindText(xt, tokens, "color/canvas/background");
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Feedback/Dialog", {
      purpose: "Blocking modal for confirmations and forms.",
      pp: "Dialog (Modern Controls).",
      docs: "https://react.fluentui.dev/?path=/docs/components-dialog--docs"
    }, "canvas/feedback/dialog");
  }
  async function buildTeachingCallout(page, tokens) {
    const f = frame("Default", void 0);
    autoLayout(f, "v", 8, 16);
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "FIXED";
    f.resize(320, 1);
    f.cornerRadius = 6;
    bindFill(f, tokens, "color/brand/primary");
    const t = await text("Did you know?", "semibold", 14, f);
    bindText(t, tokens, "color/canvas/background");
    const b = await text("You can pin your favourite views to the top of the list for quick access.", "regular", 13, f);
    b.textAutoResize = "HEIGHT";
    b.resize(288, b.height);
    bindText(b, tokens, "color/canvas/background");
    const actions = frame("actions", f);
    autoLayout(actions, "h", 8, 0);
    actions.primaryAxisSizingMode = "AUTO";
    actions.counterAxisSizingMode = "AUTO";
    actions.primaryAxisAlignItems = "MAX";
    const ok = await text("Got it", "semibold", 13, actions);
    bindText(ok, tokens, "color/canvas/background");
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, "Canvas/Feedback/Teaching Callout", {
      purpose: "Contextual tip overlay for onboarding.",
      pp: "Teaching bubble pattern (Modern Controls)."
    }, "canvas/feedback/teaching-callout");
  }
  async function buildSpinnerAlias(page, tokens) {
    const f = frame("Default", void 0);
    autoLayout(f, "v", 8, 0);
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
    f.counterAxisAlignItems = "CENTER";
    const ring = ellipse("ring", 32, 32, f);
    ring.fills = [];
    bindStroke(ring, tokens, "color/stroke/subtle", 2);
    const arc = ellipse("arc", 32, 32, f);
    arc.layoutPositioning = "ABSOLUTE";
    arc.x = 0;
    arc.y = 0;
    arc.fills = [];
    bindStroke(arc, tokens, "color/brand/primary", 2);
    arc.arcData = { startingAngle: 0, endingAngle: Math.PI * 0.7, innerRadius: 0 };
    const t = await text("Loading\u2026", "regular", 12, f);
    bindText(t, tokens, "color/text/secondary");
    const variants = [figma.createComponentFromNode(f)];
    return publishSet(page, variants, "Canvas/Feedback/Spinner", {
      purpose: "Loading indicator with a label.",
      pp: "Spinner (Modern Controls).",
      docs: "https://react.fluentui.dev/?path=/docs/components-spinner--docs"
    }, "canvas/feedback/spinner");
  }
  async function buildCanvasFeedback(page, tokens) {
    return [
      await buildSpinnerAlias(page, tokens),
      await buildProgressBar(page, tokens),
      await buildMessageBar(page, tokens),
      await buildToast(page, tokens),
      await buildDialog(page, tokens),
      await buildTeachingCallout(page, tokens)
    ];
  }

  // src/libraries/canvas/charts.ts
  function chartShell(tokens, w = 320, h = 200) {
    const f = frame("Chart", void 0);
    autoLayout(f, "v", 8, 16);
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "FIXED";
    f.resize(w, h);
    f.cornerRadius = 6;
    bindFill(f, tokens, "color/canvas/background");
    bindStroke(f, tokens, "color/stroke/subtle", 1);
    return f;
  }
  async function buildBar(page, tokens) {
    const f = chartShell(tokens);
    const t = await text("Revenue by region", "semibold", 13, f);
    bindText(t, tokens, "color/text/primary");
    const plot = frame("plot", f);
    autoLayout(plot, "h", 8, 0);
    plot.primaryAxisSizingMode = "FIXED";
    plot.counterAxisSizingMode = "FIXED";
    plot.counterAxisAlignItems = "MAX";
    plot.resize(288, 140);
    for (const pct of [0.5, 0.8, 0.3, 0.65, 0.9, 0.7, 0.45]) {
      const bar = rect("bar", 32, 140 * pct, plot);
      bar.cornerRadius = 2;
      bindFill(bar, tokens, "color/brand/primary");
    }
    return publishSet(page, [figma.createComponentFromNode(f)], "Canvas/Chart/Bar", {
      purpose: "Horizontal bar chart wireframe placeholder.",
      pp: "Power BI Bar visual / Chart control (Modern)."
    }, "canvas/chart/bar");
  }
  async function buildColumn(page, tokens) {
    const f = chartShell(tokens);
    const t = await text("Deals per month", "semibold", 13, f);
    bindText(t, tokens, "color/text/primary");
    const plot = frame("plot", f);
    autoLayout(plot, "h", 8, 0);
    plot.primaryAxisSizingMode = "FIXED";
    plot.counterAxisSizingMode = "FIXED";
    plot.counterAxisAlignItems = "MAX";
    plot.resize(288, 140);
    for (const pct of [0.4, 0.6, 0.55, 0.75, 0.9, 0.8, 0.65, 0.85]) {
      const bar = rect("col", 24, 140 * pct, plot);
      bar.cornerRadius = 2;
      bindFill(bar, tokens, "color/brand/primary");
    }
    return publishSet(page, [figma.createComponentFromNode(f)], "Canvas/Chart/Column", {
      purpose: "Vertical column chart wireframe placeholder.",
      pp: "Power BI Column visual / Chart control (Modern)."
    }, "canvas/chart/column");
  }
  async function buildLine(page, tokens) {
    const f = chartShell(tokens);
    const t = await text("Pipeline trend", "semibold", 13, f);
    bindText(t, tokens, "color/text/primary");
    const plot = frame("plot", f);
    plot.resize(288, 140);
    plot.layoutAlign = "STRETCH";
    const path = figma.createVector();
    path.strokes = [];
    path.vectorPaths = [{
      windingRule: "NONZERO",
      data: "M 0 100 L 40 80 L 80 90 L 120 60 L 160 70 L 200 40 L 240 50 L 280 20"
    }];
    path.strokeWeight = 2;
    bindStroke(path, tokens, "color/brand/primary", 2);
    path.resize(288, 140);
    plot.appendChild(path);
    return publishSet(page, [figma.createComponentFromNode(f)], "Canvas/Chart/Line", {
      purpose: "Line chart wireframe placeholder.",
      pp: "Power BI Line visual / Chart control (Modern)."
    }, "canvas/chart/line");
  }
  async function buildPie(page, tokens) {
    const f = chartShell(tokens, 260, 260);
    const t = await text("Share by source", "semibold", 13, f);
    bindText(t, tokens, "color/text/primary");
    const circ = ellipse("pie", 180, 180, f);
    bindFill(circ, tokens, "color/brand/primary");
    return publishSet(page, [figma.createComponentFromNode(f)], "Canvas/Chart/Pie", {
      purpose: "Pie chart wireframe placeholder.",
      pp: "Power BI Pie visual / Chart control (Modern)."
    }, "canvas/chart/pie");
  }
  async function buildDonut(page, tokens) {
    const f = chartShell(tokens, 260, 260);
    const t = await text("Status mix", "semibold", 13, f);
    bindText(t, tokens, "color/text/primary");
    const circ = ellipse("donut", 180, 180, f);
    circ.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 0.6 };
    bindFill(circ, tokens, "color/brand/primary");
    return publishSet(page, [figma.createComponentFromNode(f)], "Canvas/Chart/Donut", {
      purpose: "Donut chart wireframe placeholder.",
      pp: "Power BI Donut visual / Chart control (Modern)."
    }, "canvas/chart/donut");
  }
  async function buildKPI(page, tokens) {
    const variants = [];
    for (const trend of ["Up", "Flat", "Down"]) {
      const f = frame(`Trend=${trend}`, void 0);
      autoLayout(f, "v", 4, 16);
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "FIXED";
      f.resize(200, 1);
      f.cornerRadius = 6;
      bindFill(f, tokens, "color/canvas/background");
      bindStroke(f, tokens, "color/stroke/subtle", 1);
      const label = await text("Open deals", "semibold", 12, f);
      bindText(label, tokens, "color/text/secondary");
      const val = await text("142", "bold", 32, f);
      bindText(val, tokens, "color/text/primary");
      const delta = await text(`${trend === "Up" ? "\u25B2 +12" : trend === "Down" ? "\u25BC \u22124" : "\u25CF 0"}`, "semibold", 12, f);
      bindText(delta, tokens, trend === "Up" ? "color/status/success" : trend === "Down" ? "color/status/danger" : "color/text/secondary");
      variants.push(figma.createComponentFromNode(f));
    }
    return publishSet(page, variants, "Canvas/Chart/KPI", {
      purpose: "Single-value tile with trend indicator.",
      pp: "Power BI KPI / Canvas Card pattern."
    }, "canvas/chart/kpi");
  }
  async function buildCanvasCharts(page, tokens) {
    return [
      await buildBar(page, tokens),
      await buildColumn(page, tokens),
      await buildLine(page, tokens),
      await buildPie(page, tokens),
      await buildDonut(page, tokens),
      await buildKPI(page, tokens)
    ];
  }

  // src/libraries/canvas/index.ts
  async function renderSection(page, tokens, title, sets, y) {
    const t = await text(title, "semibold", 24, page);
    t.x = 40;
    t.y = y;
    bindText(t, tokens, "color/text/primary");
    const { height } = placeGrid(sets, { cols: 3, gap: 64, x: 40, y: y + 48 });
    return y + 48 + height + 80;
  }
  async function buildCanvasLibrary(tokens, page) {
    const header = await text("Canvas Apps \u2014 Modern Controls", "bold", 40, page);
    header.x = 40;
    header.y = 40;
    bindText(header, tokens, "color/text/primary");
    const sub = await text("Fluent 2 visual language for Canvas Apps Modern Controls. Every component is a real Figma Component Set with variants and descriptions.", "regular", 14, page);
    sub.x = 40;
    sub.y = 96;
    sub.textAutoResize = "HEIGHT";
    sub.resize(1e3, sub.height);
    bindText(sub, tokens, "color/text/secondary");
    let y = 160;
    const allSets = [];
    const structural = await buildCanvasStructural(page, tokens);
    allSets.push(...structural);
    y = await renderSection(page, tokens, "Structural", structural, y);
    const nav = await buildCanvasNavigation(page, tokens);
    allSets.push(...nav);
    y = await renderSection(page, tokens, "Navigation", nav, y);
    const inputs = await buildCanvasInputs(page, tokens);
    allSets.push(...inputs);
    y = await renderSection(page, tokens, "Input", inputs, y);
    const buttons = await buildCanvasButtons(page, tokens);
    allSets.push(...buttons);
    y = await renderSection(page, tokens, "Buttons", buttons, y);
    const data = await buildCanvasData(page, tokens);
    allSets.push(...data);
    y = await renderSection(page, tokens, "Data Display", data, y);
    const feedback = await buildCanvasFeedback(page, tokens);
    allSets.push(...feedback);
    y = await renderSection(page, tokens, "Feedback", feedback, y);
    const charts = await buildCanvasCharts(page, tokens);
    allSets.push(...charts);
    y = await renderSection(page, tokens, "Charts", charts, y);
    return { components: [], sets: allSets };
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
    const existing = figma.root.children.find((p2) => p2.name === name);
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
    await renderTokensPage(tokens, tokensPage);
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
