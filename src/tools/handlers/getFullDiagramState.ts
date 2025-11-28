import fs from 'node:fs/promises';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { formatDiagramMarkdown } from '@/diagram/format';
import { parseDiagram } from '@/diagram/parse';

export async function getFullDiagramState(
  diagramPath: string,
): Promise<CallToolResult> {
  const fileContent = await fs.readFile(diagramPath, 'utf8');
  const parsed = JSON.parse(fileContent);

  const diagram = parseDiagram(parsed);
  const markdown = formatDiagramMarkdown(diagram);

  return { content: [{ type: 'text', text: markdown }] };
}
