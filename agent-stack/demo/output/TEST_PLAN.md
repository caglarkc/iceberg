# TEST_PLAN

## Automated
- Unit: parser and service helpers
- API: happy path plus one error path per public endpoint
- Integration: one end-to-end mock flow
- CI: `npm run lint && npm run typecheck && npm run test -- --coverage`

## Manual Demo
- Parse the mission brief and confirm structured JSON.
- Run scaffold in dry-run mode and confirm no files are written.
- Run scaffold with human approval and inspect generated tree.
- Confirm `.env.example` contains names only, no secret values.

## Security
- Secret files such as `.env`, private keys, and credentials are not read by the agent.
- Generated output must be reviewed by a human before merge.
