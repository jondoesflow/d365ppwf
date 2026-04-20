/**
 * Flow/Variable/* — Initialize / Set / Increment / Append to array / Append to string.
 */

import type { Tokens } from '../../lib/tokens.js';
import { publishSet } from '../../lib/componentKit.js';
import { buildFlowCardSet } from './card.js';

interface Op { setName: string; title: string; purpose: string; key: string; }

const OPS: Op[] = [
  { setName: 'Flow/Variable/Initialize variable',          title: 'Initialize variable',          purpose: 'Declare a variable with a name, type, and starting value.', key: 'flow/variable/init' },
  { setName: 'Flow/Variable/Set variable',                  title: 'Set variable',                 purpose: 'Overwrite a variable\'s value.', key: 'flow/variable/set' },
  { setName: 'Flow/Variable/Increment variable',            title: 'Increment variable',           purpose: 'Add to an integer variable.', key: 'flow/variable/inc' },
  { setName: 'Flow/Variable/Append to array variable',      title: 'Append to array variable',     purpose: 'Append one item to an array variable.', key: 'flow/variable/append-array' },
  { setName: 'Flow/Variable/Append to string variable',     title: 'Append to string variable',    purpose: 'Append a string to a string variable.', key: 'flow/variable/append-string' },
];

export async function buildFlowVariables(page: PageNode, tokens: Tokens): Promise<ComponentSetNode[]> {
  const sets: ComponentSetNode[] = [];
  for (const o of OPS) {
    const variants = await buildFlowCardSet(tokens, {
      title: o.title,
      connectorName: 'Variable',
      connectorColourKey: 'color/flow/control',
    });
    sets.push(publishSet(page, variants, o.setName, {
      purpose: o.purpose,
      pp: 'Variable connector — ' + o.title,
      docs: 'https://learn.microsoft.com/power-automate/use-expressions-in-conditions#variables',
    }, o.key));
  }
  return sets;
}
