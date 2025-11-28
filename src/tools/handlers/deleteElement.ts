import fs from 'node:fs/promises';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { findNodeByLabel } from '../../diagram/create';

interface DeleteElementArgs {
  id: string;
}

export async function deleteElement(diagramPath: string, args: DeleteElementArgs): Promise<CallToolResult> {
  const fileContent = await fs.readFile(diagramPath, 'utf8');
  const parsed = JSON.parse(fileContent);

  const elements: Record<string, unknown>[] = Array.isArray(parsed.elements)
    ? parsed.elements
    : [];

  let targetElement = elements.find((el) => el.id === args.id);
  if (!targetElement) {
    const result = findNodeByLabel(elements, args.id);
    if (result.status === 'ambiguous') {
      const options = result.matches.map((m) => `  - "${m.label}" (ID: ${m.id})`).join('\n');
      return {
        content: [{ type: 'text', text: `Error: Multiple nodes found with label "${args.id}". Use ID instead:\n${options}` }],
        isError: true,
      };
    }
    if (result.status === 'found') {
      targetElement = result.node;
    }
  }

  if (!targetElement) {
    return {
      content: [{ type: 'text', text: `Error: Could not find element "${args.id}"` }],
      isError: true,
    };
  }

  const targetId = targetElement.id as string;

  for (const el of elements) {
    if (el.id === targetId || el.containerId === targetId) {
      el.isDeleted = true;
    }
  }

  for (const el of elements) {
    if (Array.isArray(el.boundElements)) {
      el.boundElements = (el.boundElements as { id: string; type: string }[]).filter(
        (bound) => bound.id !== targetId,
      );
    }
  }

  await fs.writeFile(diagramPath, JSON.stringify(parsed, null, 2), 'utf8');

  return {
    content: [{ type: 'text', text: `Deleted element: ${targetId}` }],
  };
}
