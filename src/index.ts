#!/usr/bin/env node
import path from 'node:path';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { registerAllTools } from './tools/index';

const argv = yargs(hideBin(process.argv))
  .option('diagram', {
    alias: 'd',
    type: 'string',
    description: 'Path to the Excalidraw diagram file.',
    demandOption: true,
  })
  .strict()
  .check((args) => {
    if (typeof args.diagram !== 'string' || args.diagram.trim().length === 0) {
      throw new Error(
        'Diagram path is required. Pass with -d <path> or --diagram <path>.',
      );
    }
    return true;
  })
  .parseSync();

const diagramPath = path.resolve(process.cwd(), argv.diagram.trim());

const server = new McpServer({ name: 'excalidraw-mcp', version: '0.1.0' });

registerAllTools(server, diagramPath);

const main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Excalidraw MCP Server running on stdio');
};

main().catch((error) => {
  console.error('excalidraw-mcp server failed to start', error);
  process.exit(1);
});
