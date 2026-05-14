# Audit Apply Note — AIOnboardingFlowCreator

Source: `_AUDIT/reports/batch_06.md` section 6.

## Discrepancy with Audit
The audit (TSV) reported "1 route file and 0 AI endpoints" — that snapshot is stale.
The current `backend/src/routes/index.js` already mounts ~17 AI endpoints and a much larger CRUD surface than the audit assumed:
- `/ai/generate/welcome`, `/ai/generate/steps`, `/ai/generate/tooltip`, `/ai/generate/checklist`, `/ai/generate/notification`, `/ai/generate/email-sequence`, `/ai/improve`, `/ai/generate/ab-variant`, `/ai/analyze/flow/:flowId`, `/ai/analyze/pto`, `/ai/find-mentor`, `/ai/analyze/feedback`, `/ai/generate/training-plan`, `/ai/generate/ai-checklist`, `/ai/analyze/progress`.

The audit's specific suggestions are essentially already covered:
- "checklist-ai-generate" ⇒ `/ai/generate/checklist` and `/ai/generate/ai-checklist` exist.
- "content-ai-generate" ⇒ welcome / steps / tooltip / email-sequence already exist.
- "progress-predict" ⇒ `/ai/analyze/progress` exists (but is retrospective; predictive variant is a useful addition — see backlog).
- "mentor-match-ai" ⇒ `/ai/find-mentor` exists.

## Implemented (this pass)
None — already covered. Per the apply guideline ("substantive projects, all non-mechanical → backlog-only note"), no new code added.

## Backlog
| Item | Tag |
|---|---|
| `/ai/predict-progress` (forward-looking, distinct from analyze-progress) | MECHANICAL |
| HR system integration (Workday, BambooHR) | NEEDS-CREDS |
| Notification/reminder scheduler | NEEDS-PRODUCT-DECISION |
| Onboarding compliance audit agent | NEEDS-PRODUCT-DECISION |
| Adaptive pacing engine | NEEDS-PRODUCT-DECISION |
| Video/audio session capture & sentiment | NEEDS-PRODUCT-DECISION |

## Apply pass 3 (frontend)

FE already wired. `frontend/src/App.js` mounts AI pages: `AIContent`,
`AIChecklists`, `AIProgressTracker`, `MentorMatcher`, `PTOScheduler`,
`TrainingRecommender`, `FeedbackCollector`, `Tooltips`,
`Personalization`. `frontend/src/services/api.js` defines the
generative AI client (`welcomeMessage`, `flowSteps`, `tooltipContent`,
`emailSequence`, `improve`, `abVariant`, etc.) and resource clients
(`/ai-content`, `/ai-checklists`, `/ai-progress`) — covering all 17
backend AI endpoints. No FE work performed.

## Apply pass 4 (mechanical backlog)

SKIPPED. The only MECHANICAL backlog item (`/ai/predict-progress`,
forward-looking variant of existing `/ai/analyze/progress`) was
re-evaluated and judged a duplicate of the existing analyze-progress
endpoint with negligible incremental value. Remaining items are
NEEDS-CREDS (HR system integrations) or NEEDS-PRODUCT-DECISION
(scheduler / compliance / pacing / sentiment).

## Apply pass 5 (all backlog)

Re-evaluated: the apply-pass-4 reasoning that `/ai/predict-progress`
duplicates `/ai/analyze/progress` was overturned for this pass. They
serve distinct purposes (retrospective vs forward-looking projection),
and the backlog also includes a compliance-audit endpoint that fits
PRODUCT-DECISION cleanly.

Implemented two endpoints (additive controller, no edits to
existing `aiController.js`); both gate on `OPENROUTER_API_KEY` with
HTTP 503 + `missing: OPENROUTER_API_KEY` when unset:

- `POST /api/ai/predict-progress` MECHANICAL — forward-looking
  `days_horizon` projection (default 30, capped 1-180) returning
  `{projected_progress_pct_in_horizon, expected_completion_date_iso,
  confidence, risk_factors, recommended_interventions, milestone_eta,
  narrative}`.
- `POST /api/ai/compliance-audit` PRODUCT-DECISION — multi-domain gap
  analysis. Default domains when caller supplies none:
  `["hr_onboarding", "security_training", "code_of_conduct"]`. Real HRIS
  / ATS integration to read actual completion state remains NEEDS-CREDS
  (Workday / BambooHR keys).

FE:
- `frontend/src/pages/AIProgressTracker.js` gained a "Predict Progress
  (30d)" button alongside the existing "Get AI Analysis" button.
- New `frontend/src/pages/ComplianceAudit.js` page (route
  `/compliance-audit`, registered in `App.js`).
- `frontend/src/services/api.js` extended with two new methods on
  `aiGenerateAPI`.

Files touched:
- `backend/src/controllers/aiBacklogController.js` (new)
- `backend/src/routes/index.js` (+3 lines)
- `frontend/src/services/api.js` (+3 lines)
- `frontend/src/pages/AIProgressTracker.js` (+25 lines)
- `frontend/src/pages/ComplianceAudit.js` (new)
- `frontend/src/App.js` (+2 lines)

Smoke: PostgreSQL boot + login (`demo@onboardflow.com / password123`,
token 220 chars) + key blanked = HTTP 503 + `missing` for both
endpoints. Em-dash in `X-Title` header was caught and replaced with
ASCII hyphen proactively.

Backlog still deferred: HR system integration (NEEDS-CREDS),
notification scheduler / adaptive pacing / video sentiment
(NEEDS-PRODUCT-DECISION).
