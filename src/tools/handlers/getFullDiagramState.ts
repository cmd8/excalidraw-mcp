import { formatDiagramMarkdown } from '@/diagram/format';
import { parseDiagram } from '@/diagram/parse';
import type { ExcalidrawFile, ReadResult } from '@/diagram/types';

export function getFullDiagramState(file: ExcalidrawFile): ReadResult {
  const diagram = parseDiagram(file);
  const message = formatDiagramMarkdown(diagram);
  return { ok: true, message };
}
