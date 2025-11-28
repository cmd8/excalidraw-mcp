import { shapeEnum } from '@/tools/schemas';
import type { ExcalidrawElement } from './types';

export const findNodeById = (
  elements: ExcalidrawElement[],
  id: string,
): ExcalidrawElement | undefined => elements.find((el) => el.id === id);

export type FindNodeResult =
  | { status: 'found'; node: ExcalidrawElement }
  | { status: 'not-found' }
  | { status: 'ambiguous'; matches: { id: string; label: string }[] };

export const findNodeByLabel = (
  elements: ExcalidrawElement[],
  label: string,
): FindNodeResult => {
  const normalized = label.trim().toLowerCase();

  const matching = elements.filter(
    (el): el is ExcalidrawElement & { text: string; containerId: string } =>
      el.type === 'text' &&
      el.text != null &&
      el.text.trim().toLowerCase() === normalized &&
      el.containerId != null,
  );

  if (matching.length === 0) {
    return { status: 'not-found' };
  }

  if (matching.length > 1) {
    const matches = matching.map((textEl) => ({
      id: textEl.containerId,
      label: textEl.text.trim(),
    }));
    return { status: 'ambiguous', matches };
  }

  const node = elements.find((el) => el.id === matching[0].containerId);
  if (!node) {
    return { status: 'not-found' };
  }

  return { status: 'found', node };
};

export type ResolveNodeResult =
  | { ok: true; node: ExcalidrawElement }
  | { ok: false; error: string };

export const resolveNode = (
  elements: ExcalidrawElement[],
  identifier: string,
): ResolveNodeResult => {
  const node = findNodeById(elements, identifier);
  if (node) return { ok: true, node };

  const result = findNodeByLabel(elements, identifier);

  if (result.status === 'found') return { ok: true, node: result.node };

  if (result.status === 'ambiguous') {
    const options = result.matches
      .map((m) => `  - "${m.label}" (ID: ${m.id})`)
      .join('\n');
    return {
      ok: false,
      error: `Error: Multiple nodes found with label "${identifier}". Use ID instead:\n${options}`,
    };
  }

  return {
    ok: false,
    error: `Error: Could not find node "${identifier}"`,
  };
};

export const resolveNodeByRole = (
  elements: ExcalidrawElement[],
  identifier: string,
  role: 'source' | 'target',
): ResolveNodeResult => {
  const result = resolveNode(elements, identifier);
  if (result.ok) return result;

  return {
    ok: false,
    error: result.error.replace(
      'Could not find node',
      `Could not find ${role} node`,
    ),
  };
};

export const calculateNextPosition = (
  elements: ExcalidrawElement[],
): { x: number; y: number } => {
  const shapes: Set<string> = new Set(shapeEnum.options);
  const nodes = elements.filter((el) => shapes.has(el.type) && !el.isDeleted);

  if (nodes.length === 0) {
    return { x: 100, y: 100 };
  }

  let maxY = -Infinity;
  let correspondingX = 100;

  for (const node of nodes) {
    const nodeY = node.y + node.height;
    if (nodeY > maxY) {
      maxY = nodeY;
      correspondingX = node.x;
    }
  }

  return { x: correspondingX, y: maxY + 50 };
};
