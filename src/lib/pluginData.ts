/**
 * Stable node-id registry for idempotent plugin runs.
 *
 * We stamp each component we create with a string we control (ppwf:nodeId)
 * and store a map of that string → Figma node id on a well-known node so we
 * can find and update components on a subsequent run instead of duplicating.
 */

export const PD = {
  nodeId: 'ppwf:nodeId',            // stamped on every component we author
  pageMarker: 'ppwf:page',          // marks pages owned by this plugin
  registryNode: 'ppwf:registry',    // holds a JSON map<key, nodeId>
} as const;

export interface Registry {
  [key: string]: string; // componentKey -> figma node id
}

/**
 * Returns the document-level registry mapping our stable component keys to
 * Figma node ids.
 */
export function loadRegistry(): Registry {
  const raw = figma.root.getPluginData(PD.registryNode);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Registry;
  } catch (_) {
    return {};
  }
}

export function saveRegistry(reg: Registry): void {
  figma.root.setPluginData(PD.registryNode, JSON.stringify(reg));
}

/**
 * Resolve a previously-authored component by stable key. Returns undefined
 * if the key is unknown or the node has been deleted.
 */
export async function findByKey(key: string): Promise<ComponentNode | ComponentSetNode | undefined> {
  const reg = loadRegistry();
  const id = reg[key];
  if (!id) return undefined;
  try {
    const node = await figma.getNodeByIdAsync(id);
    if (!node) return undefined;
    if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') return undefined;
    if (node.removed) return undefined;
    return node;
  } catch {
    return undefined;
  }
}

export function remember(key: string, node: BaseNode): void {
  const reg = loadRegistry();
  reg[key] = node.id;
  saveRegistry(reg);
  node.setPluginData(PD.nodeId, key);
}
