# TEST_PLAN

## Automated
- Parser accepts valid markdown and emits structured JSON.
- Parser rejects incomplete briefs with clear validation errors.
- Scaffolder renders the `api-integration-core` golden tree.
- Scaffolder blocks disk writes unless `--approve` is present.
- CLI dry-run prints a tree and writes no files.
- Handover generator emits `README.md`, `TEST_PLAN.md`, `HANDOVER.md`, and `.env.example`.
- Mock LLM returns deterministic template suggestions.

## CI Command
```bash
LLM_PROVIDER=mock npm run lint && npm run typecheck && npm run test -- --coverage
```

## Manual Demo
1. Open `demo/sample-brief.md`.
2. Run `iceberg-agent parse --brief demo/sample-brief.md`.
3. Run `iceberg-agent generate --brief demo/sample-brief.md --template api-integration-core --dry-run`.
4. Run with `--approve --out worktrees/demo-run-001`.
5. Run `iceberg-agent handover --brief demo/sample-brief.md --out worktrees/demo-run-001 --approve`.
6. Inspect `.ai-metadata.json` and confirm human review is required.

## Security
- Confirm `.env` and private key paths are rejected as brief inputs.
- Confirm no real API key value appears in generated output.
