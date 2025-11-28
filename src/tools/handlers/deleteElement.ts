import { findNodeByLabel } from '@/diagram/create';
import type {
  ExcalidrawElement,
  ExcalidrawFile,
  WriteResult,
} from '@/diagram/types';

interface DeleteElementArgs {
  id: string;
}

export function deleteElement(
  file: ExcalidrawFile,
  args: DeleteElementArgs,
): WriteResult {
  const elements: ExcalidrawElement[] = Array.isArray(file.elements)
    ? file.elements
    : [];

  let targetElement: ExcalidrawElement | undefined = elements.find(
    (el) => el.id === args.id,
  );
  if (!targetElement) {
    const result = findNodeByLabel(elements, args.id);
    if (result.status === 'ambiguous') {
      const options = result.matches
        .map((m) => `  - "${m.label}" (ID: ${m.id})`)
        .join('\n');
      return {
        ok: false,
        error: `Error: Multiple nodes found with label "${args.id}". Use ID instead:\n${options}`,
      };
    }
    if (result.status === 'found') {
      targetElement = result.node;
    }
  }

  if (!targetElement) {
    return {
      ok: false,
      error: `Error: Could not find element "${args.id}"`,
    };
  }

  const targetId = targetElement.id;

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
