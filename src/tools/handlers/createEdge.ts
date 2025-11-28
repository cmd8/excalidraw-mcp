import { createEdgeElements } from '@/diagram/create';
import { findNodeByLabel } from '@/diagram/query';
import type { ExcalidrawElement, ExcalidrawFile } from '@/diagram/types';
import type { WriteHandlerResult } from './types';
import type { EdgeStyle } from '@/tools/schemas';

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

  let fromNode = elements.find((el) => el.id === args.from);
  if (!fromNode) {
    const result = findNodeByLabel(elements, args.from);
    if (result.status === 'ambiguous') {
      const options = result.matches
        .map((m) => `  - "${m.label}" (ID: ${m.id})`)
        .join('\n');
      return {
        ok: false,
        error: `Error: Multiple nodes found with label "${args.from}". Use ID instead:\n${options}`,
      };
    }
    if (result.status === 'found') {
      fromNode = result.node;
    }
  }

  let toNode = elements.find((el) => el.id === args.to);
  if (!toNode) {
    const result = findNodeByLabel(elements, args.to);
    if (result.status === 'ambiguous') {
      const options = result.matches
        .map((m) => `  - "${m.label}" (ID: ${m.id})`)
        .join('\n');
      return {
        ok: false,
        error: `Error: Multiple nodes found with label "${args.to}". Use ID instead:\n${options}`,
      };
    }
    if (result.status === 'found') {
      toNode = result.node;
    }
  }

  if (!fromNode) {
    return {
      ok: false,
      error: `Error: Could not find source node "${args.from}"`,
    };
  }

  if (!toNode) {
    return {
      ok: false,
      error: `Error: Could not find target node "${args.to}"`,
    };
  }

  const newElements = createEdgeElements(
    {
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
      label: args.label,
      style: args.style ?? 'solid',
    },
    elements,
  );

  const edgeId = newElements[0].id;

  return {
    ok: true,
    file: { ...file, elements: [...elements, ...newElements] },
    message: `Created edge with ID: ${edgeId}`,
  };
}
