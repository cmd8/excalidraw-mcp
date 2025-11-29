import { createEdgeElements } from '@/diagram/create';
import { resolveNodeByRole } from '@/diagram/query';
import type { ExcalidrawFile } from '@/diagram/types';
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
  const elements = Array.isArray(file.elements) ? file.elements : [];

  const fromResult = resolveNodeByRole(elements, args.from, 'source');
  if (!fromResult.ok) return { ok: false, error: fromResult.error };

  const toResult = resolveNodeByRole(elements, args.to, 'target');
  if (!toResult.ok) return { ok: false, error: toResult.error };

  const result = createEdgeElements(
    {
      fromNodeId: fromResult.node.id,
      toNodeId: toResult.node.id,
      label: args.label,
      style: args.style ?? 'solid',
    },
    elements,
  );

  if (!result.ok) return { ok: false, error: result.error };

  return {
    ok: true,
    file: { ...file, elements: [...elements, ...result.elements] },
    message: `Created edge with ID: ${result.elements[0].id}`,
  };
}
