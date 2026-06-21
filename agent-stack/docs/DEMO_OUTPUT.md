# Demo output vs smoke test output

M5 keeps two kinds of scaffold output on purpose. They serve different audiences and must not be confused.

## `npm run smoke` — CI-safe, ephemeral

The smoke script (`scripts/smoke-test.sh`) writes all generated files under **`/tmp`**:

- `/tmp/agent-stack-smoke` — approved scaffold + handover from `demo/sample-brief.md`
- `/tmp/agent-stack-parse.json` — parse JSON
- `/tmp/agent-stack-dry-run.txt` — dry-run transcript

Nothing under `/tmp` is committed. CI and local smoke runs stay isolated, reproducible, and safe to run repeatedly without dirtying the repo.

```bash
npm run build
LLM_PROVIDER=mock npm run smoke
```

## `demo/output/` — committed reviewer artefacts

`demo/output/` is the **checked-in example** of an approved `api-integration-core` scaffold. Reviewers can browse the tree, diff against `demo/expected-tree.txt`, and read `demo/screenshots/` CLI transcripts without running the CLI.

This directory is **not** updated by `npm run smoke`.

## Regenerating `demo/output/` locally

When templates or the demo brief change, refresh the committed example deliberately:

```bash
npm run build
rm -rf demo/output
LLM_PROVIDER=mock npm run scaffold -- generate \
  --brief demo/sample-brief.md \
  --template api-integration-core \
  --out demo/output \
  --approve
LLM_PROVIDER=mock npm run scaffold -- handover \
  --brief demo/sample-brief.md \
  --template api-integration-core \
  --out demo/output \
  --approve
```

Then verify the tree matches expectations (`demo/expected-tree.txt`), update screenshots if the CLI output changed, and commit `demo/output/` only after human review.
