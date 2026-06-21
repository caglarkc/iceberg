# Technical Proposal

## Data Model

Core tables are captured in `drizzle/0001_initial.sql`: users, missions, evidence entries, submissions, AI runs, AI artifacts, AI reviews, readiness scores and handover packages.

## API

The API is Express + TypeScript and exposes mission, evidence, submission, AI review, readiness, dashboard, handover and audit endpoints under `/api`.

## Permissions

POC permissions use `x-user-role`. Production should replace this with Iceberg X auth and RBAC.

## Integration Points

- Iceberg X mission sync through a future `IcebergXAdapter`.
- PostgreSQL persistence through Drizzle repository implementation.
- LLM provider integration through `LlmService`.

## Risks

- AI hallucination is mitigated by Zod validation, evidence vault and human review status.
- Live provider outage is mitigated by `LLM_PROVIDER=mock` for demo fallback.
- Production data safety is protected by keeping M1 standalone.
