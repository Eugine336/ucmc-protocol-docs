# Redactions: flows/onboarding.md

## Source: ai-marketplace/docs/09-flow-onboarding.md
## Sanitization run: 2026-05-28T11:00:00Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Phase routing | "`if (loading) → LoadingScreen`", "`if (!identity || needsUnlock) → Onboarding`", etc. — code block | Implementation code; replaced with mermaid flowchart |
| Phase routing | "`isOnboardingDone(actorId)` checks sessionStorage" | Internal function + storage key; replaced with description |
| Phase routing | "`ucmc_welcome_dismissed`" sessionStorage key | localStorage/sessionStorage key |
| Phase 0 | "Google, GitHub, Discord" OAuth providers | Specific provider names; replaced with "supported OAuth providers" |
| Wizard table | "API call" column entirely (route paths: `/onboarding/terms`, `/onboarding/bind-email`, etc.) | Internal route paths |
| Wizard table | "Complete when" column technical details (e.g. "200 response", "Valid email + 200", "OTP matches hash", "≥2 name parts + avatar") | Implementation-specific completion conditions; replaced with high-level outcomes |
| Step progression | `deriveStep()` function code block | Internal function; replaced with mermaid flowchart |
| Post-KYC derivation | `derivePostKycStep()` function code block | Internal function; replaced with mermaid flowchart |
| Terms acceptance | "INSERT INTO entities" | Internal SQL |
| Terms acceptance | "Schedules onboarding email drip (fire-and-forget)" | Implementation detail |
| Email binding | "`EMAIL_OTP_TTL_MS`" env var name | Internal environment variable |
| Email verification | "`crypto.timingSafeEqual`" | Library-specific function; replaced with "constant-time comparison" |
| Email verification | "DELETE ... RETURNING" SQL pattern | Internal SQL; replaced with "atomically consumes" |
| Email verification | "`notification_preferences.email_verified = TRUE`" | Internal column reference |
| Email verification | "`maybeEmitOnboardingComplete()`" function name | Internal function name |
| Entire section | "Backend onboarding endpoints" route table (6 rows with HTTP methods + paths) | Internal route paths; replaced with one-line abstract |
| Entire section | "Onboarding service — status aggregation" with 10-parallel-queries table | Implementation detail; replaced with one-paragraph abstract |
| Entire section | "`completed` field computation" code block with hybrid logic (`coreComplete`, `sellerComplete`, `computedComplete`) | Implementation detail; replaced with one-line abstract |
| Entire section | "Welcome card / 'Complete your profile'" | UI implementation detail + localStorage key |
| Entire section | "KYC reminder banner" (`showKycReminder`, sessionStorage) | UI implementation detail |
| Entire section | "Compliance context integration" (polling intervals, event triggers) | Frontend state management implementation |
| Legal gate | "GET /api/legal/pending/:actorId", "GET /api/legal/document/:id", "POST /api/legal/sign" route paths | Internal route paths; replaced with abstract description |
| Legal gate | "SHA-256 hash recomputed in-browser" | Implementation detail; kept integrity-check concept, dropped "in-browser" |
| Entire section | "Key database tables" — `onboarding`, `email_verification_otps`, `actor_onboarding_state` VIEW, `actor_can_list()` function | Internal table schemas + SQL view + function; replaced with abstract paragraph |
| Entire section | "Where to look in the code" | File:line reference section |
| Entire section | "Open questions / known issues" — TWO weakness disclosures: (1) service-vs-SQL-view inconsistency in `completed` definition, (2) seller steps 7–10 skippable allowing premature completion | Weakness disclosure |
| Throughout | File:line refs: `App.tsx:206-330`, `Onboarding.tsx:270-301`, `OnboardingWizard.tsx:332-356`, `LegalGate.tsx:128-137`, `complianceContext.tsx:90-91`, `complianceContext.tsx:225-235`, `onboarding.ts:224-281`, `onboardingService.ts:212-312`, `015b_onboarding_fixes.sql:54-77`, `016b_onboarding_gates.sql:110-203`, `016b_onboarding_gates.sql:225-233`, `002_schema.sql:414-428` | File:line references |
| Throughout | `[unverified ...]` markers | Unverified internal notes |
| Throughout | `ucmc_identity_v*` localStorage key references | localStorage key names |
