#!/usr/bin/env node
import { listTemplates } from "@iceberg/scaffolder";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

export function getTemplateManifest() {
  return {
    server: "iceberg-templates",
    mode: "stdio-read-only",
    tools: ["list_templates", "get_template_manifest"],
    templates: listTemplates()
  };
}

export function createTemplateMcpServer(): Server {
  const server = new Server(
    {
      name: "iceberg-templates",
      version: "0.1.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "list_templates",
        description: "List available Iceberg Agent Stack scaffold templates.",
        inputSchema: {
          type: "object",
          additionalProperties: false,
          properties: {}
        }
      },
      {
        name: "get_template_manifest",
        description: "Return the Iceberg template MCP manifest.",
        inputSchema: {
          type: "object",
          additionalProperties: false,
          properties: {}
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "list_templates") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(listTemplates(), null, 2)
          }
        ]
      };
    }

    if (request.params.name === "get_template_manifest") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(getTemplateManifest(), null, 2)
          }
        ]
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
}

export async function runStdioServer(): Promise<void> {
  const server = createTemplateMcpServer();
  await server.connect(new StdioServerTransport());
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  runStdioServer().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
