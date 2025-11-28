import { resolveNode } from '@/diagram/query';
import type { ExcalidrawElement, ExcalidrawFile } from '@/diagram/types';
import type { WriteHandlerResult } from './types';

interface DeleteElementArgs {
  id: string;
}

export function deleteElement(
  file: ExcalidrawFile,
  args: DeleteElementArgs,
): WriteHandlerResult {
  const elements: ExcalidrawElement[] = Array.isArray(file.elements)
    ? file.elements
    : [];

  const result = resolveNode(elements, args.id);
  if (!result.ok) return { ok: false, error: result.error };

  const targetId = result.node.id;

  const updatedElements = elements.map((el) => {
    if (el.id === targetId || el.containerId === targetId) {
      return { ...el, isDeleted: true };
    }
    if (Array.isArray(el.boundElements)) {
      return {
        ...el,
        boundElements: el.boundElements.filter(
          (bound) => bound.id !== targetId,
        ),
      };
    }
    return el;
  });

  return {
    ok: true,
    file: { ...file, elements: updatedElements },
    message: `Deleted element: ${targetId}`,
  };
}
