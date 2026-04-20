/**
 * Flow/Action/* — Dataverse CRUD, SharePoint CRUD, Outlook, Teams, HTTP, Approvals.
 * Plus a generic connector-agnostic Action card.
 */

import type { Tokens } from '../../lib/tokens.js';
import { publishSet } from '../../lib/componentKit.js';
import { buildFlowCardSet } from './card.js';

interface ActionDef {
  setName: string;
  title: string;
  connectorName: string;
  colourKey: string;
  purpose: string;
  docs?: string;
  key: string;
}

const ACTIONS: ActionDef[] = [
  // Dataverse
  { setName: 'Flow/Action/Dataverse — List rows',    title: 'List rows',                  connectorName: 'Microsoft Dataverse', colourKey: 'color/flow/connector-dataverse', purpose: 'Query Dataverse rows via OData.', key: 'flow/action/dv/list' },
  { setName: 'Flow/Action/Dataverse — Get a row by ID', title: 'Get a row by ID',         connectorName: 'Microsoft Dataverse', colourKey: 'color/flow/connector-dataverse', purpose: 'Fetch a single Dataverse row by primary key.', key: 'flow/action/dv/get' },
  { setName: 'Flow/Action/Dataverse — Add a new row', title: 'Add a new row',             connectorName: 'Microsoft Dataverse', colourKey: 'color/flow/connector-dataverse', purpose: 'Create a new Dataverse row.', key: 'flow/action/dv/add' },
  { setName: 'Flow/Action/Dataverse — Update a row',  title: 'Update a row',              connectorName: 'Microsoft Dataverse', colourKey: 'color/flow/connector-dataverse', purpose: 'Update an existing Dataverse row.', key: 'flow/action/dv/update' },
  { setName: 'Flow/Action/Dataverse — Delete a row',  title: 'Delete a row',              connectorName: 'Microsoft Dataverse', colourKey: 'color/flow/connector-dataverse', purpose: 'Delete a Dataverse row by primary key.', key: 'flow/action/dv/delete' },
  // SharePoint
  { setName: 'Flow/Action/SharePoint — Get items',    title: 'Get items',                 connectorName: 'SharePoint',          colourKey: 'color/flow/connector-sharepoint', purpose: 'Query SharePoint list items.', key: 'flow/action/sp/list' },
  { setName: 'Flow/Action/SharePoint — Create item',  title: 'Create item',               connectorName: 'SharePoint',          colourKey: 'color/flow/connector-sharepoint', purpose: 'Create a new SharePoint list item.', key: 'flow/action/sp/create' },
  { setName: 'Flow/Action/SharePoint — Update item',  title: 'Update item',               connectorName: 'SharePoint',          colourKey: 'color/flow/connector-sharepoint', purpose: 'Update an existing SharePoint list item.', key: 'flow/action/sp/update' },
  { setName: 'Flow/Action/SharePoint — Delete item',  title: 'Delete item',               connectorName: 'SharePoint',          colourKey: 'color/flow/connector-sharepoint', purpose: 'Delete a SharePoint list item.', key: 'flow/action/sp/delete' },
  // Outlook
  { setName: 'Flow/Action/Outlook — Send email V2',   title: 'Send an email (V2)',        connectorName: 'Office 365 Outlook',  colourKey: 'color/flow/connector-o365', purpose: 'Send an Outlook email with HTML body and attachments.', docs: 'https://learn.microsoft.com/connectors/office365/', key: 'flow/action/out/send' },
  { setName: 'Flow/Action/Outlook — Send email with options', title: 'Send email with options', connectorName: 'Office 365 Outlook', colourKey: 'color/flow/connector-o365', purpose: 'Send an email offering actionable response buttons.', key: 'flow/action/out/options' },
  // Teams
  { setName: 'Flow/Action/Teams — Post message',      title: 'Post message in a chat or channel', connectorName: 'Microsoft Teams', colourKey: 'color/flow/connector-teams', purpose: 'Post a message to a Teams chat or channel.', key: 'flow/action/teams/post' },
  { setName: 'Flow/Action/Teams — Post adaptive card', title: 'Post adaptive card and wait for a response', connectorName: 'Microsoft Teams', colourKey: 'color/flow/connector-teams', purpose: 'Post an adaptive card and suspend the flow until the user responds.', key: 'flow/action/teams/adaptive' },
  // HTTP
  { setName: 'Flow/Action/HTTP — HTTP request',       title: 'HTTP',                      connectorName: 'HTTP',                colourKey: 'color/flow/action', purpose: 'Generic HTTP request (GET, POST, PATCH, DELETE…).', key: 'flow/action/http' },
  // Approvals
  { setName: 'Flow/Action/Approvals — Start and wait', title: 'Start and wait for an approval', connectorName: 'Approvals',      colourKey: 'color/flow/action', purpose: 'Suspend the flow until an approval is received or rejected.', docs: 'https://learn.microsoft.com/power-automate/modern-approvals', key: 'flow/action/approvals' },
  // Generic
  { setName: 'Flow/Action/Generic Action Card',       title: 'Custom connector action',   connectorName: 'Any connector',       colourKey: 'color/flow/action', purpose: 'Template for an unmapped connector — swap icon tint and labels.', key: 'flow/action/generic' },
];

export async function buildFlowActions(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  for (const a of ACTIONS) {
    const variants = await buildFlowCardSet(tokens, {
      title: a.title,
      connectorName: a.connectorName,
      connectorColourKey: a.colourKey,
      isTrigger: false,
    });
    sets.push(publishSet(page, variants, a.setName, {
      purpose: a.purpose,
      pp: a.connectorName + ' — ' + a.title,
      docs: a.docs,
    }, a.key));
  }
  return sets;
}
