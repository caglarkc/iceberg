# Governance

## Rules
- GOVERNANCE-001: AI output is never merged without human review.
- GOVERNANCE-002: Production branches are not written by the agent.
- GOVERNANCE-003: Secret files such as `.env`, credentials files, and private keys are not accepted as brief input.
- GOVERNANCE-004: Generated scaffolds include `.ai-metadata.json`.
- GOVERNANCE-005: Dry-run is the default demo posture.
- GOVERNANCE-006: File writes require `--approve`.
- GOVERNANCE-007: `.env.example` contains names and placeholders only.
- GOVERNANCE-008: The known-wrong M5 brief is disclosed with an assumption-based banner.

## Secret Handling
The agent may emit variable names such as `GEMINI_API_KEY`, `OPENAI_API_KEY`, and `API_CLIENT_SECRET`. It must not read, print, or persist real values.
