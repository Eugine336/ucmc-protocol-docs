# Redactions: crypto/identity-and-signing.md

## Source: ai-marketplace/docs/03-identity-and-crypto-auth.md
## Sanitization run: 2026-05-28T09:27:49Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Actor lifecycle | File and line citations (frontend/backend/control paths and `#L...` markers) removed | Internal code structure disclosure |
| Actor lifecycle | localStorage key names (`ucmc_identity_v8`, related key naming patterns) removed | Client implementation fingerprinting |
| Actor lifecycle | PBKDF2 iteration count and browser-storage implementation specifics removed | Security tuning and implementation detail |
| Actor lifecycle | Exact session TTL numeric value removed | Operational tuning detail |
| OAuth users | Backend-managed key custody details, key transport, and storage table internals removed | Sensitive implementation path |
| Signed mutations | Exact body-size and timestamp numeric thresholds removed | Operational tuning detail |
| Signed mutations | Internal function names and component names abstracted | Internal module exposure |
| Signing domains | Admin/test/internal domain constants removed (`UCMC_ADMIN_ACTION_V1`, `UCMC_TEST_ACTOR_V1`, `UCMC_SECRET_V1`, internal platform domains, internal route domains) | Restricted/internal protocol surface |
| Offline guard system | Entire section removed | Client-side defensive implementation detail |
| Signature failure handler | Function references removed; only protocol-level no-backdoor design principle retained | Remove code-level pointers |
| Failure modes | Entire operational-debugging section removed | Attack-surface and incident-detail minimization |
| Where to look in code | Entire section removed | Internal code navigation data |
| Open questions / known issues | Entire section removed | Explicit weakness disclosure |