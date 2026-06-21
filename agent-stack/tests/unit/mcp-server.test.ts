import { describe, expect, it } from "vitest";
import { createTemplateMcpServer, getTemplateManifest } from "@iceberg/mcp-server";

describe("MCP server", () => {
  it("exposes a read-only template manifest", () => {
    const manifest = getTemplateManifest();

    expect(manifest.mode).toBe("stdio-read-only");
    expect(manifest.tools).toContain("list_templates");
    expect(manifest.templates.map((template) => template.id)).toContain("api-integration-core");
  });

  it("creates an MCP server instance", () => {
    expect(createTemplateMcpServer()).toBeTruthy();
  });
});
