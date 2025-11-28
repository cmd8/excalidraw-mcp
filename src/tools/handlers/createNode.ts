import fs from 'node:fs/promises';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import {
  type ColorPreset,
  type CreateNodeOptions,
  calculateNextPosition,
  createNodeElements,
} from '../../diagram/create';
import type { ShapeType } from '../../diagram/types';

const shapes = new Set<string>(['rectangle', 'ellipse', 'diamond']);
const colors = new Set<string>([
  'transparent', 'light-blue', 'light-green', 'light-yellow', 'light-red',
  'light-orange', 'light-purple', 'blue', 'green', 'yellow', 'red', 'orange', 'purple',
]);

const isShapeType = (v: unknown): v is ShapeType => typeof v === 'string' && shapes.has(v);
const isColorPreset = (v: unknown): v is ColorPreset => typeof v === 'string' && colors.has(v);

interface CreateNodeArgs {
  label: string;
  shape?: string;
  color?: string;
  link?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export async function createNode(diagramPath: string, args: CreateNodeArgs): Promise<CallToolResult> {
  const fileContent = await fs.readFile(diagramPath, 'utf8');
  const parsed = JSON.parse(fileContent);

  const elements = Array.isArray(parsed.elements) ? parsed.elements : [];

  const options: CreateNodeOptions = {
    label: args.label,
    shape: isShapeType(args.shape) ? args.shape : 'rectangle',
    color: isColorPreset(args.color) ? args.color : 'light-blue',
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

  parsed.elements = [...elements, ...newElements];

  await fs.writeFile(diagramPath, JSON.stringify(parsed, null, 2), 'utf8');

  return {
    content: [{ type: 'text', text: `Created node with ID: ${nodeId}` }],
  };
}
