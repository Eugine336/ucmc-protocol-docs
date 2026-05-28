# Redactions: openapi.yaml

## Source: ai-marketplace/backend/routes/*.ts (48 route files)
## Sanitization run: 2026-05-28T12:00:00Z

This document lists every route excluded from `api/openapi.yaml` and the reason for exclusion. Routes are grouped by category.

---

## Admin-only (privileged)

These routes require admin or internal role and expose privileged operations.

| Route file | Excluded paths | Reason |
|------------|---------------|--------|
| admin.ts | All 40+ paths under `/admin/*` | Full admin panel: actor management, compliance overrides, fund operations, system configuration |
| portfolio.ts | `/portfolio/admin/*` | Admin portfolio review and moderation |
| support.ts | `/support/admin/*` | Admin ticket queue, assignment, escalation |
| tax.ts | `/tax/admin/*` | Admin tax review and override |
| automation.ts | All paths under `/automation/*` | Internal automation triggers and scheduling |
| governance.ts | `/governance/admin/history`, `/governance/admin/override` | Admin governance override and history inspection |

## Internal / operational

These routes are used for internal service-to-service communication, monitoring, or operational tooling.

| Route file | Excluded paths | Reason |
|------------|---------------|--------|
| internal.ts | All paths under `/internal/*` | Internal event dispatch and service communication |
| network.ts | `/network/cluster`, `/network/state` | Cluster topology and network state (infrastructure) |
| transport.ts | `/transport/stats` | Transport layer statistics (infrastructure) |
| trust.ts | `/trust/status` | Trust kernel status (internal orchestration) |
| security.ts | `/security/rotate-secret`, `/security/scan-secrets`, `/security/rotation-log` | Secret rotation and scanning (operational security) |
| monitor.ts | `/monitor/status`, `/monitor/workers`, `/monitor/alert`, `/monitor/alerts/test` | System monitoring and alerting (operational) |
| apm.ts | `/apm/metrics`, `/apm/summary`, `/apm/slow-queries`, `/apm/uptime`, `/apm/response-times` | Application performance monitoring (operational) |
| analytics.ts | Internal analytics aggregation paths | Internal analytics pipelines |

## Anti-abuse

These routes contain fraud detection, moderation, and abuse prevention logic.

| Route file | Excluded paths | Reason |
|------------|---------------|--------|
| moderation.ts | All paths under `/moderation/*` | Content moderation queue, actions, bulk operations |
| fraud.ts | All paths under `/fraud/*` | Fraud detection heuristics, scoring, flagging |
| payment.ts | `/payment/sanctions/:actorId` | Sanctions screening (anti-abuse) |

## Privileged signing

These routes manage threshold signing operations that must remain internal.

| Route file | Excluded paths | Reason |
|------------|---------------|--------|
| signing.ts | All paths under `/signing/*` | Threshold signing coordination, key shares, ceremony management |

## Vendor webhooks (inbound from external providers)

These routes receive callbacks from third-party providers and expose vendor integration details.

| Route file | Excluded paths | Reason |
|------------|---------------|--------|
| kyc.ts | `/kyc/webhook` | Inbound webhook from KYC provider |
| payment.ts | `/payment/stripe/webhook` | Inbound webhook from payments provider |
| payment.ts | `/payment/paystack/webhook` | Inbound webhook from payments provider |
| payment.ts | `/payment/wise/webhook` | Inbound webhook from payments provider |
| email.ts | `/email/webhook` | Inbound webhook from email provider |

## Privileged compliance operations

These routes perform compliance actions that require elevated permissions.

| Route file | Excluded paths | Reason |
|------------|---------------|--------|
| compliance.ts | `/compliance/freeze/:actorId` | Privileged account freeze action |
| compliance.ts | `/compliance/unfreeze/:actorId` | Privileged account unfreeze action |
| legal.ts | `/legal/publish` | Internal legal document publishing |
| legal.ts | `/legal/jurisdiction` | Internal jurisdiction configuration |

---

## Summary

| Category | Routes excluded |
|----------|----------------|
| Admin-only | ~50 |
| Internal / operational | ~15 |
| Anti-abuse | ~10 |
| Privileged signing | ~5 |
| Vendor webhooks | 5 |
| Privileged compliance | 4 |
| **Total excluded** | **~89** |
| **Total included in spec** | **~135** |

## Sanitization notes

Within the included routes, the following sanitization was applied:

- **Vendor abstraction**: The path `/payment/paystack/verify` is included but its description abstracts the provider as "payments provider" — no vendor name appears in the operationId or description text.
- **No file:line references**: No source code file paths or line numbers appear anywhere in the spec.
- **No infrastructure identifiers**: No container names, VM instances, localhost ports, or env vars.
- **No internal version strings**: Only cryptographic signing-domain versions (UCMC_AUTH_PAYLOAD_V4, etc.) are referenced.
