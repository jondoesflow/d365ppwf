/**
 * Flow/Data/* — Data operations (Compose, Parse JSON, Select, Filter array, Join, CSV/HTML tables).
 */

import type { Tokens } from '../../lib/tokens.js';
import { publishSet } from '../../lib/componentKit.js';
import { buildFlowCardSet } from './card.js';

interface Op { setName: string; title: string; purpose: string; key: string; }

const OPS: Op[] = [
  { setName: 'Flow/Data/Compose',          title: 'Compose',          purpose: 'Store a value without looping; useful for expressions.', key: 'flow/data/compose' },
  { setName: 'Flow/Data/Parse JSON',       title: 'Parse JSON',       purpose: 'Produce typed outputs from a JSON body via schema.', key: 'flow/data/parse-json' },
  { setName: 'Flow/Data/Select',           title: 'Select',           purpose: 'Map an array of objects to a new shape.', key: 'flow/data/select' },
  { setName: 'Flow/Data/Filter array',     title: 'Filter array',     purpose: 'Filter an array based on a predicate.', key: 'flow/data/filter-array' },
  { setName: 'Flow/Data/Join',             title: 'Join',             purpose: 'Concatenate array items with a separator.', key: 'flow/data/join' },
  { setName: 'Flow/Data/Create CSV table', title: 'Create CSV table', purpose: 'Render an array as a CSV string.', key: 'flow/data/csv' },
  { setName: 'Flow/Data/Create HTML table',title: 'Create HTML table',purpose: 'Render an array as an HTML table string.', key: 'flow/data/html' },
];

export async function buildFlowData(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  for (const o of OPS) {
    const variants = await buildFlowCardSet(tokens, {
      title: o.title,
      connectorName: 'Data operations',
      connectorColourKey: 'color/flow/action',
    });
    sets.push(publishSet(page, variants, o.setName, {
      purpose: o.purpose,
      pp: 'Data Operations connector — ' + o.title,
    }, o.key));
  }
  return sets;
}
