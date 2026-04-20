import type { Tokens } from '../../lib/tokens.js';
import type { LibraryBuild } from '../canvas/index.js';

/**
 * Build the Model-Driven Apps (Fluent UI 2) component library on the given
 * page. Filled in during Increment 5.
 */
export async function buildMdaLibrary(_tokens: Tokens, _page: PageNode): Promise<LibraryBuild> {
  return { components: [], sets: [] };
}
