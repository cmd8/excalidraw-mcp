import fs from 'node:fs/promises';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { createEdgeElements, findNodeByLabel } from '../../diagram/create.js';

interface CreateEdgeArgs {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export async function createEdge(diagramPath: string, args: CreateEdgeArgs): Promise<CallToolResult> {
  const fileContent = await fs.readFile(diagramPath, 'utf8');
  const parsed = JSON.parse(fileContent);

  const elements = Array.isArray(parsed.elements) ? parsed.elements : [];

  let fromNode = elements.find((el: Record<string, unknown>) => el.id === args.from);
  if (!fromNode) {
    const result = findNodeByLabel(elements, args.from);
    if (result.status === 'ambiguous') {
      const options = result.matches.map((m) => `  - "${m.label}" (ID: ${m.id})`).join('\n');
      return {
        content: [{ type: 'text', text: `Error: Multiple nodes found with label "${args.from}". Use ID instead:\n${options}` }],
        isError: true,
      };
    }
    if (result.status === 'found') {
      fromNode = result.node;
    }
  }

  let toNode = elements.find((el: Record<string, unknown>) => el.id === args.to);
  if (!toNode) {
    const result = findNodeByLabel(elements, args.to);
    if (result.status === 'ambiguous') {
      const options = result.matches.map((m) => `  - "${m.label}" (ID: ${m.id})`).join('\n');
      return {
        content: [{ type: 'text', text: `Error: Multiple nodes found with label "${args.to}". Use ID instead:\n${options}` }],
        isError: true,
      };
    }
    if (result.status === 'found') {
      toNode = result.node;
    }
  }

  if (!fromNode) {
    return {
      content: [{ type: 'text', text: `Error: Could not find source node "${args.from}"` }],
      isError: true,
    };
  }

  if (!toNode) {
    return {
      content: [{ type: 'text', text: `Error: Could not find target node "${args.to}"` }],
      isError: true,
    };
  }

  const newElements = createEdgeElements(
    {
      fromNodeId: fromNode.id as string,
      toNodeId: toNode.id as string,
      label: args.label,
      style: args.style ?? 'solid',
    },
    elements,
  );

  const edgeId = newElements[0].id as string;

  parsed.elements = [...elements, ...newElements];

  await fs.writeFile(diagramPath, JSON.stringify(parsed, null, 2), 'utf8');

  return {
    content: [{ type: 'text', text: `Created edge with ID: ${edgeId}` }],
  };
}
