# Demo Script

1. Show `demo/sample-brief.md`.
2. Run `npm run scaffold -- parse --brief demo/sample-brief.md`.
3. Run `npm run scaffold -- generate --brief demo/sample-brief.md --template api-integration-core --dry-run`.
4. Explain that dry-run wrote nothing.
5. Run `npm run scaffold -- generate --brief demo/sample-brief.md --template api-integration-core --out demo/output --approve`.
6. Run `npm run scaffold -- handover --brief demo/sample-brief.md --template api-integration-core --out demo/output --approve`.
7. Open `.ai-metadata.json`, `README.md`, `TEST_PLAN.md`, and `HANDOVER.md`.
8. Show `demo/screenshots/` transcripts as backup artefacts.
9. Close with: AI accelerates, humans approve and own the result.
