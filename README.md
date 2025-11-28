# @cmd8/excalidraw-mcp

Model Context Protocol (MCP) server for Excalidraw diagrams.

## 🛠️ Installation

### Requirements

- Node.js >= v18.0.0

<details>
<summary><b>Install in Cursor</b></summary>

Add to your Cursor MCP config (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "excalidraw": {
      "command": "npx",
      "args": ["-y", "@cmd8/excalidraw-mcp", "--diagram", "/path/to/diagram.excalidraw"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Code</b></summary>

```sh
claude mcp add excalidraw -- npx -y @cmd8/excalidraw-mcp --diagram /path/to/diagram.excalidraw
```

</details>

<details>
<summary><b>Install in Amp</b></summary>

```sh
amp mcp add excalidraw -- npx -y @cmd8/excalidraw-mcp --diagram /path/to/diagram.excalidraw
```

</details>

<details>
<summary><b>Install in VS Code</b></summary>

Add to your VS Code MCP settings:

```json
{
  "mcp": {
    "servers": {
      "excalidraw": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@cmd8/excalidraw-mcp", "--diagram", "/path/to/diagram.excalidraw"]
      }
    }
  }
}
```

</details>

<details>
<summary><b>Install in Windsurf</b></summary>

Add to your Windsurf MCP config:

```json
{
  "mcpServers": {
    "excalidraw": {
      "command": "npx",
      "args": ["-y", "@cmd8/excalidraw-mcp", "--diagram", "/path/to/diagram.excalidraw"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Desktop</b></summary>

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "excalidraw": {
      "command": "npx",
      "args": ["-y", "@cmd8/excalidraw-mcp", "--diagram", "/path/to/diagram.excalidraw"]
    }
  }
}
```

</details>

<details>
<summary><b>Install in OpenAI Codex</b></summary>

Add to your Codex MCP config:

```toml
[mcp_servers.excalidraw]
command = "npx"
args = ["-y", "@cmd8/excalidraw-mcp", "--diagram", "/path/to/diagram.excalidraw"]
```

</details>

## CLI Options

- `-d, --diagram` (required): Path to the Excalidraw diagram file

## 🔨 Available Tools

### `createNode`

Create a new node (shape with label) in the diagram. Returns the created node ID.

### `createEdge`

Create an arrow connecting two nodes. Nodes can be referenced by ID or by label text.

### `deleteElement`

Delete a node or edge from the diagram by ID or label.

### `getFullDiagramState`

Returns a markdown representation of the complete diagram, including nodes, relationships, labels, frames, and colors.

## License

MIT
