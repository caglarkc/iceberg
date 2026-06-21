# Test Plan

## Automated Gate

Run before every phase commit:

```bash
LLM_PROVIDER=mock npm run lint
LLM_PROVIDER=mock npm run typecheck
LLM_PROVIDER=mock npm run test -- --coverage
```

## Manual Demo Scenarios

| ID | Scenario | Expected |
| --- | --- | --- |
| T01 | Health check | `GET /api/health` returns `{ status: "ok" }` |
| T02 | Intern calls mission generator | API returns `403` |
| T03 | Admin generates mission | Valid mission draft returned and AI run logged |
| T04 | Admin saves mission | Mission appears in list |
| T05 | Evidence claim is empty | API returns `400` |
| T06 | Intern adds evidence | Evidence appears with reliability label |
| T07 | Intern submits incomplete checklist | Submission accepted with warning |
| T08 | Mentor generates AI review | Review is `pending` and hidden from intern |
| T09 | Mentor edits and publishes review | Intern can read published review |
| T10 | Readiness score | Score changes with checklist, evidence, review and approval status |
| T11 | Handover generator | Markdown contains setup, env, API, known issues and production checklist |
| T12 | AI audit | Admin can inspect all AI runs and artifacts |

## CI Policy

GitHub Actions runs `lint`, `typecheck`, and `test -- --coverage` with `LLM_PROVIDER=mock`. Live LLM credentials are not required in CI.
