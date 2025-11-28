import { shapeEnum } from '@/tools/schemas';
import type { ExcalidrawElement } from './types';

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
      typeof el.text === 'string' &&
      el.text.trim().toLowerCase() === normalized &&
      typeof el.containerId === 'string',
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

export const calculateNextPosition = (
  elements: ExcalidrawElement[],
): { x: number; y: number } => {
  const shapes: Set<string> = new Set(shapeEnum.options);
  const nodes = elements.filter(
    (el) => typeof el.type === 'string' && shapes.has(el.type) && !el.isDeleted,
  );

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
