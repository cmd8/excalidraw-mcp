import { deleteElementById } from '@/diagram/delete';
import { resolveNode } from '@/diagram/query';
import type { ExcalidrawFile } from '@/diagram/types';
import type { WriteHandlerResult } from './types';

interface DeleteElementArgs {
  id: string;
}

export function deleteElement(
  file: ExcalidrawFile,
  args: DeleteElementArgs,
): WriteHandlerResult {
  const elements = Array.isArray(file.elements) ? file.elements : [];

  const result = resolveNode(elements, args.id);
  if (!result.ok) return { ok: false, error: result.error };

  const updatedElements = deleteElementById(elements, result.node.id);

  return {
    ok: true,
    file: { ...file, elements: updatedElements },
    message: `Deleted element: ${result.node.id}`,
  };
}
