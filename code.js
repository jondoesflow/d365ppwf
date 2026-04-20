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
