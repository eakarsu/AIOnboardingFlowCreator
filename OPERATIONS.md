# Governed onboarding operations

## Intended use and limits

The governed API records role profiles, measurable goals, owned work, assessments, feedback, appeals, progress, and outcome evidence. It supports HR and learning staff; it must not make employment decisions. Recommendations expose reason codes and require independent approval. Cohort validity, accessibility, bias, progression, edge cases, and outcome claims must be reviewed before release.

## Data and integrations

Every request is tenant-scoped by signed JWT claims, provenance-bound, idempotent, and audit logged. LMS, HRIS, ATS, calendar, catalog, communications, and webhook actions enter an outbox only after approval. Workers retry with bounded backoff and dead-letter after five failures; reconciliation and deletion receipts remain mandatory. Credentials are represented only by secret references.

## Deploy, rollback, and recovery

Run `./start.sh check`, back up PostgreSQL, then run `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`. Deploy API before enabling clients. Roll back application code without dropping additive governance tables; restore a verified backup only for data recovery. Replay only failed outbox entries with their original request hash. Rotate JWT and provider credentials through the secret manager, restart services, and invalidate old tokens.

Retention is bounded by the submitted consent policy. Erasure changes to `erased` only after every provider deletion receipt is delivered; audit metadata remains non-sensitive and append-only. Alert on approval conflicts, dead letters, stale reassessments, bias/accessibility regressions, and failed erasure.
