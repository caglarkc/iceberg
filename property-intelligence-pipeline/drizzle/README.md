# Drizzle / Postgres (Faz 2)

POC runtime uses **in-memory `PipStore`**. This folder defines the target PostgreSQL schema for production handover.

| File | Purpose |
|------|---------|
| `0001_initial.sql` | DDL applied by `docker-compose.yml` postgres init |

```bash
docker compose up -d postgres
# Postgres on localhost:5433 — user pip / password pip / db property_intelligence
```

Wire `DATABASE_URL` and replace `PipStore` with Drizzle repository in Faz 2.
