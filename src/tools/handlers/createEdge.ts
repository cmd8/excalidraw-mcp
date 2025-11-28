import { createEdgeElements } from '@/diagram/create';
import { resolveNodeByRole } from '@/diagram/query';
import type { ExcalidrawElement, ExcalidrawFile } from '@/diagram/types';
import type { EdgeStyle } from '@/tools/schemas';
import type { WriteHandlerResult } from './types';

interface CreateEdgeArgs {
  from: string;
  to: string;
  label?: string;
  style?: EdgeStyle;
}

export function createEdge(
  file: ExcalidrawFile,
  args: CreateEdgeArgs,
): WriteHandlerResult {
  const elements: ExcalidrawElement[] = Array.isArray(file.elements)
    ? file.elements
    : [];

  const fromResult = resolveNodeByRole(elements, args.from, 'source');
  if (!fromResult.ok) return { ok: false, error: fromResult.error };

  const toResult = resolveNodeByRole(elements, args.to, 'target');
  if (!toResult.ok) return { ok: false, error: toResult.error };

  const newElements = createEdgeElements(
    {
      fromNodeId: fromResult.node.id,
      toNodeId: toResult.node.id,
      label: args.label,
      style: args.style ?? 'solid',
    },
    elements,
  );

  return {
    ok: true,
    file: { ...file, elements: [...elements, ...newElements] },
    message: `Created edge with ID: ${newElements[0].id}`,
  };
}
