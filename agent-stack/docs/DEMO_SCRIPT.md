# Demo Script

1. Show `demo/sample-brief.md`.
2. Run `iceberg-agent parse --brief demo/sample-brief.md`.
3. Run `iceberg-agent generate --brief demo/sample-brief.md --template api-integration-core --dry-run`.
4. Explain that dry-run wrote nothing.
5. Run `iceberg-agent generate --brief demo/sample-brief.md --template api-integration-core --out worktrees/demo-run-001 --approve`.
6. Run `iceberg-agent handover --brief demo/sample-brief.md --template api-integration-core --out worktrees/demo-run-001 --approve`.
7. Open `.ai-metadata.json`, `README.md`, `TEST_PLAN.md`, and `HANDOVER.md`.
8. Close with: AI accelerates, humans approve and own the result.
