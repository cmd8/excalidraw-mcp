import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { createEdge } from './handlers/createEdge';
import { createNode } from './handlers/createNode';
import { deleteElement } from './handlers/deleteElement';
import { getFullDiagramState } from './handlers/getFullDiagramState';
import { colorEnum, edgeStyleEnum, shapeEnum } from './schemas';

export function registerAllTools(server: McpServer, diagramPath: string) {
  server.registerTool(
    'getFullDiagramState',
    {
      description:
        'Return a markdown representation of the complete diagram, including nodes, relationships, labels, frames, and colors.',
    },
    () => getFullDiagramState(diagramPath),
  );

  server.registerTool(
    'createNode',
    {
      description:
        'Create a new node (shape with label) in the diagram. Returns the created node ID.',
      inputSchema: {
        label: z
          .string()
          .describe(
            'The text label for the node. Supports multiple lines with \\n.',
          ),
        shape: shapeEnum
          .optional()
          .describe('The shape of the node. Defaults to rectangle.'),
        color: colorEnum
          .optional()
          .describe('Color preset for the node. Defaults to light-blue.'),
        link: z
          .string()
          .optional()
          .describe(
            'Optional URL to link the node to (e.g., file://, https://).',
          ),
        x: z
          .number()
          .optional()
          .describe(
            'X coordinate. If not provided, auto-positions below last node.',
          ),
        y: z
          .number()
          .optional()
          .describe(
            'Y coordinate. If not provided, auto-positions below last node.',
          ),
        width: z
          .number()
          .optional()
          .describe('Node width. If not provided, auto-sizes based on label.'),
        height: z
          .number()
          .optional()
          .describe('Node height. If not provided, auto-sizes based on label.'),
      },
    },
    (args) => createNode(diagramPath, args),
  );

  server.registerTool(
    'createEdge',
    {
      description:
        'Create an arrow connecting two nodes. Nodes can be referenced by ID or by label text.',
      inputSchema: {
        from: z.string().describe('The source node ID or label text.'),
        to: z.string().describe('The target node ID or label text.'),
        label: z
          .string()
          .optional()
          .describe('Optional label text for the edge.'),
        style: edgeStyleEnum
          .optional()
          .describe('Line style. Defaults to solid.'),
      },
    },
    (args) => createEdge(diagramPath, args),
  );

  server.registerTool(
    'deleteElement',
    {
      description: 'Delete a node or edge from the diagram by ID or label.',
      inputSchema: {
        id: z.string().describe('The element ID or label text to delete.'),
      },
    },
    (args) => deleteElement(diagramPath, args),
  );
}
