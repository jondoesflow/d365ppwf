import type { Tokens } from '../../lib/tokens.js';
import type { LibraryBuild } from '../canvas/index.js';

/**
 * Build the Power Automate (Cloud Flows) component library on the given
 * page. Filled in during Increment 6.
 */
export async function buildFlowLibrary(_tokens: Tokens, _page: PageNode): Promise<LibraryBuild> {
  return { components: [], sets: [] };
}
