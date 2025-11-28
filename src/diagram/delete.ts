import type { ExcalidrawElement } from './types';

export function deleteElementById(
  elements: ExcalidrawElement[],
  targetId: string,
): ExcalidrawElement[] {
  return elements.map((el) => {
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
}
