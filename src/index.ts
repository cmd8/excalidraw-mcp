#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';

import {
  type ColorPreset,
  type CreateNodeOptions,
  calculateNextPosition,
  createEdgeElements,
  createNodeElements,
  findNodeByLabel,
} from './diagram/create.js';
import { formatDiagramMarkdown } from './diagram/format.js';
import { parseDiagram } from './diagram/parse.js';
import type { ShapeType } from './diagram/types.js';

const shapeEnum = z.enum(['rectangle', 'ellipse', 'diamond']);
const colorEnum = z.enum([
  'transparent',
  'light-blue',
  'light-green',
  'light-yellow',
  'light-red',
  'light-orange',
  'light-purple',
  'blue',
  'green',
  'yellow',
  'red',
  'orange',
  'purple',
]);
const edgeStyleEnum = z.enum(['solid', 'dashed']);

const argv = yargs(hideBin(process.argv))
  .option('diagram', {
    alias: 'd',
    type: 'string',
    description: 'Path to the Excalidraw diagram file.',
    demandOption: true,
  })
  .strict()
  .check((args: { diagram?: unknown }) => {
    if (typeof args.diagram !== 'string' || args.diagram.trim().length === 0) {
      throw new Error('Diagram path is required. Pass with -d <path> or --diagram <path>.');
    }
    return true;
  })
  .parseSync();

const diagramPath = path.resolve(process.cwd(), (argv.diagram as string).trim());

const server = new McpServer({ name: 'excalidraw-mcp', version: '0.1.0' });

server.registerTool(
  'getFullDiagramState',
  {
    description:
      'Return a markdown representation of the complete diagram, including nodes, relationships, labels, frames, and colors.',
  },
  async (): Promise<CallToolResult> => {
    const fileContent = await fs.readFile(diagramPath, 'utf8');
    const parsed = JSON.parse(fileContent);

    const diagram = parseDiagram(parsed);
    const markdown = formatDiagramMarkdown(diagram);

    return { content: [{ type: 'text', text: markdown }] };
  },
);

server.registerTool(
  'createNode',
  {
    description:
      'Create a new node (shape with label) in the diagram. Returns the created node ID.',
    inputSchema: {
      label: z.string().describe('The text label for the node. Supports multiple lines with \\n.'),
      shape: shapeEnum.optional().describe('The shape of the node. Defaults to rectangle.'),
      color: colorEnum.optional().describe('Color preset for the node. Defaults to light-blue.'),
      link: z.string().optional().describe('Optional URL to link the node to (e.g., file://, https://).'),
      x: z.number().optional().describe('X coordinate. If not provided, auto-positions below last node.'),
      y: z.number().optional().describe('Y coordinate. If not provided, auto-positions below last node.'),
      width: z.number().optional().describe('Node width. If not provided, auto-sizes based on label.'),
      height: z.number().optional().describe('Node height. If not provided, auto-sizes based on label.'),
    },
  },
  async (args): Promise<CallToolResult> => {
    const fileContent = await fs.readFile(diagramPath, 'utf8');
    const parsed = JSON.parse(fileContent);

    const elements = Array.isArray(parsed.elements) ? parsed.elements : [];

    const options: CreateNodeOptions = {
      label: args.label,
      shape: (args.shape as ShapeType) ?? 'rectangle',
      color: (args.color as ColorPreset) ?? 'light-blue',
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
    const nodeId = newElements[0].id as string;

    parsed.elements = [...elements, ...newElements];

    await fs.writeFile(diagramPath, JSON.stringify(parsed, null, 2), 'utf8');

    return {
      content: [{ type: 'text', text: `Created node with ID: ${nodeId}` }],
    };
  },
);

server.registerTool(
  'createEdge',
  {
    description:
      'Create an arrow connecting two nodes. Nodes can be referenced by ID or by label text.',
    inputSchema: {
      from: z.string().describe('The source node ID or label text.'),
      to: z.string().describe('The target node ID or label text.'),
      label: z.string().optional().describe('Optional label text for the edge.'),
      style: edgeStyleEnum.optional().describe('Line style. Defaults to solid.'),
    },
  },
  async (args): Promise<CallToolResult> => {
    const fileContent = await fs.readFile(diagramPath, 'utf8');
    const parsed = JSON.parse(fileContent);

    const elements = Array.isArray(parsed.elements) ? parsed.elements : [];

    const fromInput = args.from;
    const toInput = args.to;

    let fromNode = elements.find((el: Record<string, unknown>) => el.id === fromInput);
    if (!fromNode) {
      const result = findNodeByLabel(elements, fromInput);
      if (result.status === 'ambiguous') {
        const options = result.matches.map((m) => `  - "${m.label}" (ID: ${m.id})`).join('\n');
        return {
          content: [{ type: 'text', text: `Error: Multiple nodes found with label "${fromInput}". Use ID instead:\n${options}` }],
          isError: true,
        };
      }
      if (result.status === 'found') {
        fromNode = result.node;
      }
    }

    let toNode = elements.find((el: Record<string, unknown>) => el.id === toInput);
    if (!toNode) {
      const result = findNodeByLabel(elements, toInput);
      if (result.status === 'ambiguous') {
        const options = result.matches.map((m) => `  - "${m.label}" (ID: ${m.id})`).join('\n');
        return {
          content: [{ type: 'text', text: `Error: Multiple nodes found with label "${toInput}". Use ID instead:\n${options}` }],
          isError: true,
        };
      }
      if (result.status === 'found') {
        toNode = result.node;
      }
    }

    if (!fromNode) {
      return {
        content: [{ type: 'text', text: `Error: Could not find source node "${fromInput}"` }],
        isError: true,
      };
    }

    if (!toNode) {
      return {
        content: [{ type: 'text', text: `Error: Could not find target node "${toInput}"` }],
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
  },
);

server.registerTool(
  'deleteElement',
  {
    description: 'Delete a node or edge from the diagram by ID or label.',
    inputSchema: {
      id: z.string().describe('The element ID or label text to delete.'),
    },
  },
  async (args): Promise<CallToolResult> => {
    const fileContent = await fs.readFile(diagramPath, 'utf8');
    const parsed = JSON.parse(fileContent);

    const elements: Record<string, unknown>[] = Array.isArray(parsed.elements)
      ? parsed.elements
      : [];

    const idInput = args.id;

    let targetElement = elements.find((el) => el.id === idInput);
    if (!targetElement) {
      const result = findNodeByLabel(elements, idInput);
      if (result.status === 'ambiguous') {
        const options = result.matches.map((m) => `  - "${m.label}" (ID: ${m.id})`).join('\n');
        return {
          content: [{ type: 'text', text: `Error: Multiple nodes found with label "${idInput}". Use ID instead:\n${options}` }],
          isError: true,
        };
      }
      if (result.status === 'found') {
        targetElement = result.node;
      }
    }

    if (!targetElement) {
      return {
        content: [{ type: 'text', text: `Error: Could not find element "${idInput}"` }],
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
  },
);

const main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Excalidraw MCP Server running on stdio');
};

main().catch((error) => {
  console.error('excalidraw-mcp server failed to start', error);
  process.exit(1);
});
