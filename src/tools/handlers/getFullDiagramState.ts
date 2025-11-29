import { formatDiagramMarkdown } from '@/diagram/format';
import { parseDiagram } from '@/diagram/parse';
import type { ExcalidrawFile } from '@/diagram/types';
import type { ReadHandlerResult } from './types';

export function getFullDiagramState(file: ExcalidrawFile): ReadHandlerResult {
  const diagram = parseDiagram(file);
  const message = formatDiagramMarkdown(diagram);
  return { ok: true, message };
}
