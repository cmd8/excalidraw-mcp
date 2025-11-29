import fs from 'node:fs/promises';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import type { ExcalidrawFile } from '@/diagram/types';
import type { ReadHandlerResult, WriteHandlerResult } from './handlers/types';

async function loadDiagram(path: string): Promise<ExcalidrawFile> {
  const content = await fs.readFile(path, 'utf8');
  const parsed: ExcalidrawFile = JSON.parse(content);
  return parsed;
}

async function saveDiagram(path: string, file: ExcalidrawFile): Promise<void> {
  await fs.writeFile(path, JSON.stringify(file, null, 2), 'utf8');
}

export async function withDiagramRead(
  path: string,
  handler: (file: ExcalidrawFile) => ReadHandlerResult,
): Promise<CallToolResult> {
  const file = await loadDiagram(path);
  const result = handler(file);
  if (result.ok) {
    return { content: [{ type: 'text', text: result.message }] };
  }
  return { content: [{ type: 'text', text: result.error }], isError: true };
}

export async function withDiagramWrite(
  path: string,
  handler: (file: ExcalidrawFile) => WriteHandlerResult,
): Promise<CallToolResult> {
  const file = await loadDiagram(path);
  const result = handler(file);
  if (result.ok) {
    await saveDiagram(path, result.file);
    return { content: [{ type: 'text', text: result.message }] };
  }
  return { content: [{ type: 'text', text: result.error }], isError: true };
}
