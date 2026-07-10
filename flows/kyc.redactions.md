# Redactions: flows/kyc.md

## Source: ai-marketplace/docs/06-flow-kyc.md
## Sanitization run: 2026-05-28T10:00:00Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Step 1 | "`signedFetch('/kyc/start', { signal: '0x90' })`" | Internal function name |
| Step 2 | "Redis-backed" rate limit | Infrastructure vendor; replaced with "cache" |
| Step 2 | "`KYC_PROVIDER` env: sumsub (default), stripe, shufti, stub (test)" | Internal configuration and provider names |
| Step 2 | "`INSERT INTO kyc_sessions (actor_id, session_id, provider, sdk_url, status = 'PENDING')`" | SQL statement; replaced with description |
| Step 4 | "Shufti Pro" named explicitly in webhook signature section | Vendor name; abstracted to provider-agnostic scheme table |
| Step 4 | "Sumsub" named explicitly in webhook signature section | Vendor name; abstracted to "HMAC" scheme |
| Step 4 | "Stripe Identity" named explicitly in webhook signature section | Vendor name; abstracted to "Time-prefixed HMAC" scheme |
| Step 4 | "`KYC_SECRET_KEY`", "`KYC_WEBHOOK_SECRET`", "`STRIPE_KYC_WEBHOOK_SECRET`" env var names | Internal secret names |
| Step 4 | Actor ID extraction format "`SP::<actorId>::<timestamp>::<random4>` (Shufti style)" | Vendor-specific session format |
| Step 5 | "`kyc_results.document_hash` unique index" | Internal index name; replaced with description |
| Step 5 | "`kyc_results SET kyc_status, verified_at/rejected_at, rejection_reason, provider_ref`" | SQL column names; replaced with description |
| Step 5 | "stderr log + alert with severity `critical`" | Implementation detail; replaced with "critical-severity alert" |
| Step 6 | "`ComplianceContext` polls `GET /kyc/status/:actorId`" | Internal component name; replaced with "frontend" |
| Entire section | "Admin KYC queue" full details | Admin operations; replaced with single sentence noting existence |
| Entire section | "Key database tables" full definitions | Implementation detail; replaced with summary of table purposes |
| Entire section | "Where to look in the code" | File:line reference section |
| Throughout | References to `backend/services/kyc/*` files | File:line references |
| Failure modes | Kept error codes and recovery actions; stripped file:line refs | Reformatted as clean table |
| Webhook section | Specific header names (`req.headers['signature']`, `req.headers['x-payload-digest']`, `req.headers['stripe-signature']`) | Provider-specific header names; abstracted to scheme description |

## Re-sync: 2026-07-10

Re-synced to reflect the owned, recoverable external-workflow model. Step 3's
"entirely outside UCMC's control" framing was replaced with the owned-session
description, and a "Workflow Session & Recovery" section was added. Maintained
abstraction: the session primitive is described at the architecture level only;
internal adapter/registry class names, provider names, the session table and
column names, feature-flag names, and reconciliation-worker internals remain
excluded.
