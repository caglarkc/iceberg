import type { EvidenceEntry, HandoverDoc, Mission, ReadinessScore, Submission } from "@iceberg/shared";

export function handoverToMarkdown(params: {
  mission: Mission;
  handover: HandoverDoc;
  evidence: EvidenceEntry[];
  submission?: Submission;
  readiness: ReadinessScore;
}): string {
  const { mission, handover, readiness } = params;
  return [
    `# ${mission.title} Handover`,
    "",
    "## Project Summary",
    handover.projectSummary,
    "",
    "## Architecture Overview",
    handover.architectureOverview,
    "",
    "## Setup Instructions",
    list(handover.setupInstructions),
    "",
    "## Environment Variables",
    list(handover.environmentVariables),
    "",
    "## API Endpoint Summary",
    list(handover.apiEndpointSummary),
    "",
    "## Readiness",
    `Score: ${readiness.totalScore}/100 (${readiness.label})`,
    "",
    "## Known Issues / Limitations",
    list(handover.knownIssues),
    "",
    "## Test Plan Checklist",
    list(handover.testPlanChecklist),
    "",
    "## Production Integration Checklist",
    list(handover.productionIntegrationChecklist),
    "",
    "## Evidence / Source Bibliography",
    list([...handover.evidenceBibliography, ...params.evidence.map((item) => `${item.claim} — ${item.sourceTitle ?? item.sourceType}`)]),
    "",
    "## Submission",
    params.submission ? `Repo: ${params.submission.repoUrl}\nDemo: ${params.submission.demoUrl}` : "No submission yet.",
    ""
  ].join("\n");
}

function list(items: string[]): string {
  return items.length === 0 ? "- None" : items.map((item) => `- ${item}`).join("\n");
}
