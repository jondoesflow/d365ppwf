/**
 * Flow/Trigger/* — Manual, Scheduled, and automated per-connector triggers.
 */

import type { Tokens } from '../../lib/tokens.js';
import { publishSet } from '../../lib/componentKit.js';
import { buildFlowCardSet } from './card.js';

interface TriggerDef {
  setName: string;
  title: string;
  connectorName: string;
  colourKey: string;
  purpose: string;
  docs?: string;
  key: string;
}

const TRIGGERS: TriggerDef[] = [
  {
    setName: 'Flow/Trigger/Manual',
    title: 'Manually trigger a flow',
    connectorName: 'Instant cloud flow',
    colourKey: 'color/flow/trigger',
    purpose: 'Manual / instant starter used for button-driven flows.',
    docs: 'https://learn.microsoft.com/power-automate/introduction-to-button-flows',
    key: 'flow/trigger/manual',
  },
  {
    setName: 'Flow/Trigger/Scheduled',
    title: 'Recurrence',
    connectorName: 'Schedule',
    colourKey: 'color/flow/trigger',
    purpose: 'Time-based trigger — runs on an interval or cron schedule.',
    docs: 'https://learn.microsoft.com/power-automate/run-scheduled-tasks',
    key: 'flow/trigger/scheduled',
  },
  {
    setName: 'Flow/Trigger/Dataverse Row Added Modified Deleted',
    title: 'When a row is added, modified or deleted',
    connectorName: 'Microsoft Dataverse',
    colourKey: 'color/flow/connector-dataverse',
    purpose: 'Automated trigger firing on Dataverse row CRUD events.',
    docs: 'https://learn.microsoft.com/power-automate/dataverse/overview',
    key: 'flow/trigger/dataverse',
  },
  {
    setName: 'Flow/Trigger/SharePoint Item Created',
    title: 'When an item is created',
    connectorName: 'SharePoint',
    colourKey: 'color/flow/connector-sharepoint',
    purpose: 'Automated trigger for new SharePoint list items.',
    key: 'flow/trigger/sharepoint',
  },
  {
    setName: 'Flow/Trigger/Outlook Email Arrives',
    title: 'When a new email arrives (V3)',
    connectorName: 'Office 365 Outlook',
    colourKey: 'color/flow/connector-o365',
    purpose: 'Automated trigger for new incoming mail.',
    key: 'flow/trigger/outlook',
  },
  {
    setName: 'Flow/Trigger/Teams Channel Message',
    title: 'When a new channel message is added',
    connectorName: 'Microsoft Teams',
    colourKey: 'color/flow/connector-teams',
    purpose: 'Automated trigger for new Teams channel posts.',
    key: 'flow/trigger/teams',
  },
  {
    setName: 'Flow/Trigger/HTTP Request',
    title: 'When an HTTP request is received',
    connectorName: 'Request',
    colourKey: 'color/flow/trigger',
    purpose: 'Webhook entry point for external callers (URL + schema).',
    key: 'flow/trigger/http',
  },
];

export async function buildFlowTriggers(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  for (const t of TRIGGERS) {
    const variants = await buildFlowCardSet(tokens, {
      title: t.title,
      connectorName: t.connectorName,
      connectorColourKey: t.colourKey,
      isTrigger: true,
    });
    sets.push(publishSet(page, variants, t.setName, {
      purpose: t.purpose,
      pp: t.connectorName + ' — ' + t.title,
      docs: t.docs,
    }, t.key));
  }
  return sets;
}
