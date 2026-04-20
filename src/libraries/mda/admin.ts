/**
 * MDA/Admin/* — Settings Page, Security Role Matrix.
 */

import type { Tokens } from '../../lib/tokens.js';
import { frame, autoLayout, rect, text } from '../../lib/layout.js';
import { bindFill, bindStroke, bindText, publishSet } from '../../lib/componentKit.js';

async function buildSettingsPage(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'h', 0, 0);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(1180, 600); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  // Left nav
  const nav = frame('nav', f);
  autoLayout(nav, 'v', 4, 16);
  nav.primaryAxisSizingMode = 'FIXED'; nav.counterAxisSizingMode = 'FIXED';
  nav.resize(260, 600);
  bindFill(nav, tokens, 'color/canvas/surface');
  for (const [i, label] of ['Overview', 'Environment', 'Users', 'Security roles', 'Teams', 'Auditing', 'Integrations'].entries()) {
    const row = frame('r', nav);
    autoLayout(row, 'h', 10, { l: 12, r: 12, t: 8, b: 8 });
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
    row.resize(228, 1); row.cornerRadius = 3;
    if (i === 3) bindFill(row, tokens, 'color/canvas/surface-alt');
    const t = await text(label, i === 3 ? 'semibold' : 'regular', 13, row);
    bindText(t, tokens, i === 3 ? 'color/brand/primary' : 'color/text/primary');
  }
  // Body
  const body = frame('body', f);
  autoLayout(body, 'v', 16, 24);
  body.primaryAxisSizingMode = 'FIXED'; body.counterAxisSizingMode = 'FIXED';
  body.resize(920, 600);
  const t = await text('Security roles', 'bold', 24, body);
  bindText(t, tokens, 'color/text/primary');
  const s = await text('Manage roles and the privileges they grant to users.', 'regular', 13, body);
  bindText(s, tokens, 'color/text/secondary');
  for (let i = 0; i < 4; i++) {
    const row = frame(`r-${i}`, body);
    autoLayout(row, 'h', 12, { l: 16, r: 16, t: 12, b: 12 });
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
    row.counterAxisAlignItems = 'CENTER';
    row.resize(872, 1); row.cornerRadius = 4;
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    const nm = await text(['System Administrator', 'Salesperson', 'Customer Service Representative', 'Marketing Manager'][i], 'semibold', 13, row);
    bindText(nm, tokens, 'color/text/primary');
    const pad = rect('p', 1, 1, row); pad.fills = []; pad.layoutGrow = 1;
    const users = await text(`${['128','84','42','6'][i]} users`, 'regular', 12, row);
    bindText(users, tokens, 'color/text/secondary');
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Admin/Settings Page', {
    purpose: 'Typical admin settings shell with left nav and content list.',
    pp: 'Power Platform admin center — entity/settings layout.',
    docs: 'https://learn.microsoft.com/power-platform/admin/admin-documentation',
  }, 'mda/admin/settings-page');
}

async function buildSecurityMatrix(page: PageNode, tokens: Tokens): Promise<ComponentSetNode> {
  const f = frame('Default', undefined);
  autoLayout(f, 'v', 0, 0);
  f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
  f.resize(900, 360); f.cornerRadius = 4;
  bindFill(f, tokens, 'color/canvas/background');
  bindStroke(f, tokens, 'color/stroke/subtle', 1);
  const privileges = ['Create', 'Read', 'Write', 'Delete', 'Append'];
  const entities = ['Account', 'Contact', 'Lead', 'Opportunity', 'Case'];
  // Header
  const hdr = frame('header', f);
  autoLayout(hdr, 'h', 0, 0);
  hdr.primaryAxisSizingMode = 'FIXED'; hdr.counterAxisSizingMode = 'FIXED';
  hdr.resize(900, 40);
  bindFill(hdr, tokens, 'color/canvas/surface');
  const head0 = frame('h0', hdr);
  autoLayout(head0, 'h', 0, { l: 16, r: 16, t: 0, b: 0 });
  head0.primaryAxisSizingMode = 'FIXED'; head0.counterAxisSizingMode = 'FIXED';
  head0.counterAxisAlignItems = 'CENTER';
  head0.resize(200, 40);
  const e = await text('Entity', 'semibold', 12, head0);
  bindText(e, tokens, 'color/text/secondary');
  for (const p of privileges) {
    const cell = frame('hc', hdr);
    autoLayout(cell, 'h', 0, 0); cell.primaryAxisAlignItems = 'CENTER'; cell.counterAxisAlignItems = 'CENTER';
    cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
    cell.resize(140, 40);
    const t = await text(p, 'semibold', 12, cell);
    bindText(t, tokens, 'color/text/secondary');
  }
  // Rows
  for (const [r, entity] of entities.entries()) {
    const row = frame(`r-${r}`, f);
    autoLayout(row, 'h', 0, 0);
    row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'FIXED';
    row.resize(900, 60);
    bindStroke(row, tokens, 'color/stroke/subtle', 1);
    const labelCell = frame('lc', row);
    autoLayout(labelCell, 'h', 0, { l: 16, r: 16, t: 0, b: 0 });
    labelCell.primaryAxisSizingMode = 'FIXED'; labelCell.counterAxisSizingMode = 'FIXED';
    labelCell.counterAxisAlignItems = 'CENTER';
    labelCell.resize(200, 60);
    const lt = await text(entity, 'medium', 13, labelCell);
    bindText(lt, tokens, 'color/text/primary');
    for (let c = 0; c < privileges.length; c++) {
      const cell = frame('cc', row);
      autoLayout(cell, 'h', 0, 0); cell.primaryAxisAlignItems = 'CENTER'; cell.counterAxisAlignItems = 'CENTER';
      cell.primaryAxisSizingMode = 'FIXED'; cell.counterAxisSizingMode = 'FIXED';
      cell.resize(140, 60);
      // Access level indicator (ring circle, filled segment)
      const ring = figma.createEllipse();
      ring.resize(22, 22); ring.fills = [];
      bindStroke(ring, tokens, 'color/stroke/default', 2);
      cell.appendChild(ring);
      const level = (c + r) % 4; // 0..3 filled
      if (level > 0) {
        const filled = figma.createEllipse();
        filled.resize(22, 22); filled.fills = [];
        filled.arcData = { startingAngle: 0, endingAngle: Math.PI * 2 * level / 4, innerRadius: 0.6 };
        bindFill(filled, tokens, level === 3 ? 'color/status/success' : 'color/brand/primary');
        cell.appendChild(filled);
      }
    }
  }
  return publishSet(page, [figma.createComponentFromNode(f)], 'MDA/Admin/Security Role Matrix', {
    purpose: 'Entity × privilege matrix showing access levels per combination.',
    pp: 'Security role editor (Power Platform admin center).',
    docs: 'https://learn.microsoft.com/power-platform/admin/security-roles-privileges',
  }, 'mda/admin/security-matrix');
}

export async function buildMdaAdmin(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  return [
    await buildSettingsPage(page, tokens),
    await buildSecurityMatrix(page, tokens),
  ];
}
