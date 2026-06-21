import { listTemplates } from "@iceberg/scaffolder";

export function getTemplateManifest() {
  return {
    server: "iceberg-templates",
    mode: "poc-read-only",
    tools: ["list_templates", "get_template_manifest"],
    templates: listTemplates()
  };
}
