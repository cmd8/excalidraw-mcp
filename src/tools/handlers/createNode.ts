import {
  type CreateNodeOptions,
  calculateNextPosition,
  createNodeElements,
} from '@/diagram/create';
import type { ExcalidrawFile, WriteResult } from '@/diagram/types';
import type { ColorPreset, ShapeType } from '@/tools/schemas';

interface CreateNodeArgs {
  label: string;
  shape?: ShapeType;
  color?: ColorPreset;
  link?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function createNode(
  file: ExcalidrawFile,
  args: CreateNodeArgs,
): WriteResult {
  const elements = Array.isArray(file.elements) ? file.elements : [];

  const options: CreateNodeOptions = {
    label: args.label,
    shape: args.shape ?? 'rectangle',
    color: args.color ?? 'light-blue',
    link: args.link,
    width: args.width,
    height: args.height,
  };

  if (typeof args.x === 'number' && typeof args.y === 'number') {
    options.x = args.x;
    options.y = args.y;
  } else {
    const pos = calculateNextPosition(elements);
    options.x = pos.x;
    options.y = pos.y;
  }

  const newElements = createNodeElements(options);
  const nodeId = newElements[0].id;

  return {
    ok: true,
    file: { ...file, elements: [...elements, ...newElements] },
    message: `Created node with ID: ${nodeId}`,
  };
}
