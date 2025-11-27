#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: publish-mcp.sh <version>"
  exit 1
fi

echo "Publishing version $VERSION to MCP Registry..."

# Update server.json with new version
jq --arg v "$VERSION" '.version = $v | .packages[0].version = $v' server.json > tmp && mv tmp server.json

# Download mcp-publisher
curl -L "https://github.com/modelcontextprotocol/registry/releases/download/v1.3.3/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher

# Login and publish
./mcp-publisher login github-oidc
./mcp-publisher publish

echo "Published to MCP Registry"
