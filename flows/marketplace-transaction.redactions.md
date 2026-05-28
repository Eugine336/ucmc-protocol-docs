# Redactions: flows/marketplace-transaction.md

## Source: ai-marketplace/docs/05-flow-marketplace-transaction.md
## Sanitization run: 2026-05-28T10:00:00Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Prerequisites | "`actor_can_list()` gate in `backend/db/init/016b_onboarding_gates.sql:225`" | File:line reference |
| Step 1 | "300ms debounce" — kept as useful UX detail | Kept |
| Step 1 | "`matchActorsZK()`" function name | Internal function name |
| Step 3 | "up to 10M attempts" for PoW mining | Tuning knob |
| Step 3 | "`POST /control` → verify signature + POW → `ingestPlatformEvent()` → writes to `state_logs`, `control_logs`, `idempotency` tables" | Internal function name and table names replaced with description |
| Step 3 | "notification 'Escrow hiring flow initiated'" | Internal notification text |
| Step 4 | "`deliveries` table" | Internal table name; replaced with "delivery record" |
| Step 5 | "S3 key" in FILE delivery mode | Infrastructure vendor reference; replaced with "object storage" |
| Step 5 | "`auto_release_at` set per governance parameter `escrow_auto_release_days`" | Internal parameter name; replaced with description |
| Step 6 | "`confirmed_at`" column name | Internal column name |
| Step 7 | "`value_logs` table" | Internal table name; replaced with "value log entry" |
| Step 7 | "Entry in `value_logs` table records the transfer" | Replaced with "A value log entry records the transfer" |
| Step 8 | "`reputation_summary` table refreshed (`total_reviews`, `star_sum`, `completed_count`)" | Internal table name; kept field names as they describe the public protocol |
| Step 8 | "DB unique on `finalize_trace_id, reviewer_id`" | Internal constraint syntax; replaced with description |
| Entire section | "Open questions / known issues" (end of source) | Lists weaknesses about KYC enforcement gaps and skippable seller steps |
| Entire section | All "Reference" columns with file:line citations throughout source | File:line references |
| Throughout | References to `MarketplacePanel.tsx`, `ProfileView.tsx` | Frontend filename references |
| Throughout | References to `marketplace.ts`, `walletService.ts`, `delivery.ts`, `reputation.ts` | Backend filename references |
| Throughout | Reference to `016b_onboarding_gates.sql:225` | Database initialization file reference |
| Throughout | "`MAX_EXEC_MS = 2000`" | Specific timeout tuning knob |
| Sequence diagram | Converted ASCII art to mermaid format | Reformatted for public readability |
