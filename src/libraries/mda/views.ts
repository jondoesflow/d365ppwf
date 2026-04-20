/**
 * MDA/View/* — Read-Only Grid, Editable Grid, Card View, Calendar, Kanban,
 * View Selector, Filter Pane, Charts Pane.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, ellipse, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function gridShell(tokens: Tokens, name: string): Promise<FrameNode> {
  const f = frame(name, undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(880, 1);
  f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  return f;
}

async function buildReadOnlyGrid(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = await gridShell(tokens, 'Default');
  const cols = [44, 280, 150, 120, 120, 166];
  const labels = ['', 'Topic', 'Customer', 'Est. revenue', 'Status reason', 'Owner'];
  // Header
  const hdr = frame('header', f);
  autoLayout(hdr, 'h', 0, 0);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.counterAxisAlignItems = 'CENTER';
  hdr.resize(880, 40);
  bindFill(hdr, tokens, 'color/canvas/surface');
  bindStroke(hdr, tokens, 'color/stroke/subtle', 1);
  for (let c = 0; c < cols.length; c++) {
    const cell = frame(`hc-${c}`, hdr);
    autoLayout(cell, 'h', 6, { l: 12, r: 12, t: 0, b: 0 });
    cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
    cell.counterAxisAlignItems = 'CENTER';
    cell.resize(cols[c], 40);
    if (c === 0) {
      const cb = rect('cb', 16, 16, cell); cb.cornerRadius = 2;
      bindStroke(cb, tokens, 'color/stroke/default', 1);
    } else {
      const t = await text(labels[c], 'semibold', 12, cell);
      bindText(t, tokens, 'color/text/secondary');
      const arrow = await text('▾', 'regular', 9, cell);
      bindText(arrow, tokens, 'color/text/secondary');
    }
  }
  // Rows
  const rows = [
    ['', 'Cloud migration',       'Contoso Ltd',   '$ 250,000', 'In Progress', 'Avery Brooks'],
    ['', 'Licensing renew — 2026','Fabrikam Inc',  '$ 85,000',  'Won',         'Morgan Yu'],
    ['', 'Power BI rollout',      'Litware',       '$ 120,000', 'In Progress', 'Jess Rivera'],
    ['', 'Teams adoption',        'Tailwind',      '$ 42,000',  'Open',        'Sam Ngo'],
    ['', 'Data platform pilot',   'Adventure Wks', '$ 65,000',  'Paused',      'Avery Brooks'],
    ['', 'DB consolidation',      'Northwind',     '$ 180,000', 'Lost',        'Morgan Yu'],
    ['', 'Office rollout',        'Proseware',     '$ 35,000',  'Won',         'Jess Rivera'],
    ['', 'Training pilot',        'Alpine Ski',    '$ 22,000',  'In Progress', 'Sam Ngo'],
    ['', 'Integration review',    'Contoso Ltd',   '$ 150,000', 'Open',        'Avery Brooks'],
    ['', 'Marketplace build',     'Fabrikam Inc',  '$ 95,000',  'In Progress', 'Morgan Yu'],
  ];
  for (let r = 0; r < rows.length; r++) {
    const row = frame(`row-${r}`, f);
    autoLayout(row, 'h', 0, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.counterAxisAlignItems = 'CENTER';
    row.resize(880, 44);
    if (r % 2 === 1) bindFill(row, tokens, 'color/canvas/surface');
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    for (let c = 0; c < cols.length; c++) {
      const cell = frame(`c-${r}-${c}`, row);
      autoLayout(cell, 'h', 0, { l: 12, r: 12, t: 0, b: 0 });
      cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
      cell.counterAxisAlignItems = 'CENTER';
      cell.resize(cols[c], 44);
      if (c === 0) {
        const cb = rect('cb', 16, 16, cell); cb.cornerRadius = 2;
        bindStroke(cb, tokens, 'color/stroke/default', 1);
      } else if (c === 1) {
        const t = await text(rows[r][c], 'medium', 13, cell);
        bindText(t, tokens, 'color/brand/primary');
      } else {
        const t = await text(rows[r][c], 'regular', 13, cell);
        bindText(t, tokens, 'color/text/primary');
      }
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/View/Read-Only Grid', {
    purpose: 'Tabular view of records with sortable columns and selection.',
    pp: 'Read-only grid (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/make-views-understand-managed-properties',
  }, 'mda/view/read-only-grid');
}

async function buildEditableGrid(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = await gridShell(tokens, 'Default');
  const cols = [280, 160, 160, 160, 120];
  const labels = ['Topic', 'Customer', 'Est. revenue', 'Close date', 'Probability'];
  const hdr = frame('header', f);
  autoLayout(hdr, 'h', 0, 0);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.counterAxisAlignItems = 'CENTER';
  hdr.resize(880, 40);
  bindFill(hdr, tokens, 'color/canvas/surface');
  bindStroke(hdr, tokens, 'color/stroke/subtle', 1);
  for (let c = 0; c < cols.length; c++) {
    const cell = frame(`hc-${c}`, hdr);
    autoLayout(cell, 'h', 0, { l: 12, r: 12, t: 0, b: 0 });
    cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
    cell.counterAxisAlignItems = 'CENTER';
    cell.resize(cols[c], 40);
    const t = await text(labels[c], 'semibold', 12, cell);
    bindText(t, tokens, 'color/text/secondary');
  }
  for (let r = 0; r < 4; r++) {
    const row = frame(`row-${r}`, f);
    autoLayout(row, 'h', 4, 4);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.counterAxisAlignItems = 'CENTER';
    row.resize(880, 44);
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    for (let c = 0; c < cols.length; c++) {
      const cell = frame(`c-${r}-${c}`, row);
      autoLayout(cell, 'h', 0, { l: 8, r: 8, t: 0, b: 0 });
      cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
      cell.counterAxisAlignItems = 'CENTER';
      cell.resize(cols[c] - 4, 36);
      cell.cornerRadius = 3;
      if (r === 1 && c === 2) { bindFill(cell, tokens, 'color/canvas/background'); bindStroke(cell, tokens, 'color/brand/primary', 2); }
      const val = ['Pipeline', 'Acct', '$ 85,000', '2026-06-30', '65%'][c];
      const t = await text(val, 'regular', 13, cell);
      bindText(t, tokens, 'color/text/primary');
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/View/Editable Grid', {
    purpose: 'Inline-editable grid with focus highlight on active cell.',
    pp: 'Editable grid (Unified Interface).',
    docs: 'https://learn.microsoft.com/power-apps/maker/model-driven-apps/use-editable-grids',
  }, 'mda/view/editable-grid');
}

async function buildCardView(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 16, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(960, 240);
  f.layoutWrap = 'WRAP';
  bindFill(f, tokens, 'color/canvas/background');
  for (let i = 0; i < 6; i++) {
    const card = frame(`card-${i}`, f);
    autoLayout(card, 'v', 6, 16);
    card.primaryAxisSizingMode = 'AUTO'; card.counterAxisSizingMode = 'FIXED';
    card.resize(280, 1); card.cornerRadius = 6;
    bindFill(card, tokens, 'color/canvas/background');
    bindStroke(card, tokens, 'color/stroke/subtle', 1);
    const t = await text(`Case CAS-${1200 + i}`, 'semibold', 14, card);
    bindText(t, tokens, 'color/text/primary');
    const s = await text('Printer offline on Floor 3', 'regular', 13, card);
    bindText(s, tokens, 'color/text/secondary');
    const meta = await text('Contoso · High · Open', 'regular', 12, card);
    bindText(meta, tokens, 'color/text/secondary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/View/Card View', {
    purpose: 'Grid of record cards — alternative to tabular view.',
    pp: 'Card form rendered as a list (Unified Interface).',
  }, 'mda/view/card-view');
}

async function buildCalendarView(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(960, 520); f.cornerRadius = 6;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  // Header
  const hdr = frame('hdr', f);
  autoLayout(hdr, 'h', 0, 0);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.resize(960, 40);
  bindFill(hdr, tokens, 'color/canvas/surface');
  for (const d of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
    const cell = frame('dh', hdr);
    autoLayout(cell, 'h', 0, 10); cell.primaryAxisAlignItems = 'CENTER'; cell.counterAxisAlignItems = 'CENTER';
    cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
    cell.resize(960 / 7, 40);
    const t = await text(d, 'semibold', 12, cell);
    bindText(t, tokens, 'color/text/secondary');
  }
  for (let r = 0; r < 5; r++) {
    const row = frame(`row-${r}`, f);
    autoLayout(row, 'h', 0, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.resize(960, 96);
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    for (let c = 0; c < 7; c++) {
      const cell = frame('cell', row);
      autoLayout(cell, 'v', 4, 6);
      cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
      cell.resize(960 / 7, 96);
      bindStroke(cell, tokens, 'color/stroke/subtle', 1);
      const d = r * 7 + c - 2;
      if (d > 0 && d < 31) {
        const day = await text(String(d), 'regular', 11, cell);
        bindText(day, tokens, 'color/text/secondary');
        if ((r + c) % 3 === 0) {
          const ev = rect('event', 120, 16, cell); ev.cornerRadius = 3;
          bindFill(ev, tokens, 'color/brand/primary');
        }
      }
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/View/Calendar View', {
    purpose: 'Month grid of record events.',
    pp: 'Calendar view (Unified Interface).',
  }, 'mda/view/calendar');
}

async function buildKanban(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 16, 16);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1160, 560);
  bindFill(f, tokens, 'color/canvas/surface');
  for (const col of ['Qualify', 'Develop', 'Propose', 'Close']) {
    const column = frame(col, f);
    autoLayout(column, 'v', 12, 12);
    column.primaryAxisSizingMode = 'FIXED'; column.counterAxisSizingMode = 'FIXED';
    column.resize(260, 530); column.cornerRadius = 6;
    bindFill(column, tokens, 'color/canvas/background');
    bindStroke(column, tokens, 'color/stroke/subtle', 1);
    const h = await text(col, 'semibold', 13, column);
    bindText(h, tokens, 'color/text/primary');
    for (let i = 0; i < 3; i++) {
      const card = frame(`card-${i}`, column);
      autoLayout(card, 'v', 4, 10);
      card.primaryAxisSizingMode = 'AUTO'; card.counterAxisSizingMode = 'FIXED';
      card.resize(236, 1); card.cornerRadius = 4;
      bindFill(card, tokens, 'color/canvas/background');
      bindStroke(card, tokens, 'color/stroke/subtle', 1);
      const t = await text(['Contoso uplift','Fabrikam deal','Litware pilot'][i], 'semibold', 13, card);
      bindText(t, tokens, 'color/text/primary');
      const m = await text('$ 120,000 · Q2', 'regular', 12, card);
      bindText(m, tokens, 'color/text/secondary');
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/View/Kanban', {
    purpose: 'Board view with columns per stage, records as draggable cards.',
    pp: 'Kanban view (Unified Interface) — Opportunities and Cases.',
    docs: 'https://learn.microsoft.com/dynamics365/sales/sales-kanban-board',
  }, 'mda/view/kanban');
}

async function buildViewSelector(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const variants: ComponentNode[] = [];
  for (const state of ['Closed', 'Open']) {
    const f = frame(`State=${state}`, undefined);
    autoLayout(f, 'v', 4, 0);
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
    f.resize(320, 1);
    const btn = frame('btn', f);
    autoLayout(btn, 'h', 6, 0);
    btn.primaryAxisSizingMode = 'AUTO'; btn.counterAxisSizingMode = 'AUTO';
    btn.counterAxisAlignItems = 'CENTER';
    const t = await text('My Open Opportunities', 'semibold', 16, btn);
    bindText(t, tokens, 'color/text/primary');
    const chev = await text('▾', 'regular', 12, btn);
    bindText(chev, tokens, 'color/text/secondary');
    if (state === 'Open') {
      const menu = frame('menu', f);
      autoLayout(menu, 'v', 0, 8);
      menu.primaryAxisSizingMode = 'AUTO'; menu.counterAxisSizingMode = 'FIXED';
      menu.resize(320, 1); menu.cornerRadius = 4;
      bindFill(menu, tokens, 'color/canvas/background');
      bindStroke(menu, tokens, 'color/stroke/default', 1);
      for (const group of [['Pinned', ['My Open', 'All Won']], ['Recent', ['Q2 Forecast', 'High Priority']]]) {
        const g = await text(group[0] as string, 'semibold', 10, menu);
        bindText(g, tokens, 'color/text/secondary');
        for (const item of group[1] as string[]) {
          const row = frame('row', menu);
          autoLayout(row, 'h', 0, { l: 8, r: 8, t: 6, b: 6 });
          row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
          row.resize(304, 1);
          const rt = await text(item, 'regular', 13, row);
          bindText(rt, tokens, 'color/text/primary');
        }
      }
    }
    variants.push(figma.createComponentFromNode(f));
  }
  return publishSet(page, variants, 'MDA/View/View Selector', {
    purpose: 'Dropdown to switch between saved queries / views.',
    pp: 'View selector (Unified Interface).',
  }, 'mda/view/view-selector');
}

async function buildFilterPane(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 12, 16);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(280, 1); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const h = await text('Filter', 'semibold', 14, f);
  bindText(h, tokens, 'color/text/primary');
  for (const group of [['Owner', ['Me', 'My team', 'Everyone']], ['Status', ['Open', 'Won', 'Lost']]]) {
    const gh = await text(group[0] as string, 'semibold', 12, f);
    bindText(gh, tokens, 'color/text/secondary');
    for (const item of group[1] as string[]) {
      const row = frame('row', f);
      autoLayout(row, 'h', 8, 0);
      row.primaryAxisSizingMode = 'AUTO'; row.counterAxisSizingMode = 'AUTO';
      row.counterAxisAlignItems = 'CENTER';
      const cb = rect('cb', 16, 16, row); cb.cornerRadius = 2;
      bindStroke(cb, tokens, 'color/stroke/default', 1);
      const t = await text(item, 'regular', 13, row);
      bindText(t, tokens, 'color/text/primary');
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/View/Filter Pane', {
    purpose: 'Right-hand facet filters over the current view.',
    pp: 'Filter pane (Unified Interface).',
  }, 'mda/view/filter-pane');
}

async function buildChartsPane(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 16, 16);
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
  f.resize(320, 1); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const h = await text('Opportunities by status', 'semibold', 14, f);
  bindText(h, tokens, 'color/text/primary');
  const plot = frame('plot', f);
  autoLayout(plot, 'h', 4, 0);
  plot.primaryAxisSizingMode = 'FIXED'; plot.counterAxisSizingMode = 'FIXED';
  plot.counterAxisAlignItems = 'MAX';
  plot.resize(288, 120);
  for (const pct of [0.3, 0.8, 0.55, 0.72]) {
    const b = rect('bar', 56, 120 * pct, plot);
    b.cornerRadius = 2; bindFill(b, tokens, 'color/brand/primary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/View/Charts Pane', {
    purpose: 'Embedded chart tile beside a list view.',
    pp: 'Charts pane (Unified Interface).',
  }, 'mda/view/charts-pane');
}

export async function buildMdaViews(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildReadOnlyGrid(page, tokens),
    await buildEditableGrid(page, tokens),
    await buildCardView(page, tokens),
    await buildCalendarView(page, tokens),
    await buildKanban(page, tokens),
    await buildViewSelector(page, tokens),
    await buildFilterPane(page, tokens),
    await buildChartsPane(page, tokens),
  ];
}
