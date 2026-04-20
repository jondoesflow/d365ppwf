/**
 * Cross-library primitives — the atoms consumed by Canvas, MDA and Flow
 * libraries. Increment 3 implements the real components; this file exposes
 * the function surface early so downstream libraries can import it.
 */

import type { Tokens } from './tokens.js';

export interface PrimitivesBuild {
  components: ComponentNode[];
  sets: ComponentSetNode[];
}

export async function buildPrimitives(_tokens: Tokens, _page: PageNode): Promise<PrimitivesBuild> {
  // Filled in during Increment 3.
  return { components: [], sets: [] };
}
