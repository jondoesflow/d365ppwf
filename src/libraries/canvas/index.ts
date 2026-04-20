import type { Tokens } from '../../lib/tokens.js';

export interface LibraryBuild {
  components: ComponentNode[];
  sets: ComponentSetNode[];
}

/**
 * Build the Canvas Apps (Modern Controls) component library on the given
 * page. Filled in during Increment 4.
 */
export async function buildCanvasLibrary(_tokens: Tokens, _page: PageNode): Promise<LibraryBuild> {
  return { components: [], sets: [] };
}
