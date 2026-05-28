# Redactions: flows/disputes.md

## Source: ai-marketplace/docs/07-flow-disputes.md
## Sanitization run: 2026-05-28T10:30:00Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Prerequisites | "`actor_roles`" table name | Internal table reference |
| Sequence diagram | Converted ASCII art to mermaid format; removed "Admin (if no quorum)" as explicit lane | Admin endpoint detail; replaced with abstract "escalated for admin resolution" note |
| Filing | "`signedFetch('/dispute/open')`" | Internal function name |
| Filing | "`evidence_closes_at` set based on..." | Internal column name; replaced with "evidence submission window" |
| Evidence | "FileUpload component → POST /storage/upload-url → XHR PUT to DigitalOcean Spaces → returns fileKey" | Vendor name (DigitalOcean Spaces) + frontend component name; replaced with "platform's storage service to object storage" |
| Evidence | "`signedFetch('/dispute/evidence', { disputeId, content, fileKey })`" | Internal function call |
| Evidence | "ON CONFLICT (trace_id) DO NOTHING" | SQL syntax; replaced with description |
| Evidence | "`onDisputeEvidenceSubmitted()`" | Internal function name |
| Voting | "`actor_roles`" table reference | Internal table name |
| Voting | "`signedFetch('/dispute/vote', { disputeId, vote, weight })`" | Internal function call |
| Voting | "`dispute_votes.weight`" column reference | Internal column name |
| Voting | "DB constraint UNIQUE (dispute_id, arbitrator_id)" | SQL constraint syntax; replaced with description |
| Voting | "`checkAndResolve()`" function name | Internal function name |
| Resolution | "`disputeService.resolveDispute()` updates DB + notifications, but does NOT release escrow funds" | Known gap disclosure — reveals that quorum-resolved disputes leave funds frozen until admin acts |
| Resolution | "`POST /api/admin/disputes/resolve` — this is the only path that calls `releaseEscrow()`" | Admin endpoint and implementation detail |
| Resolution | "HTTP 207 + `DISPUTE_WALLET_RELEASE_FAILED` audit log" | Operational partial-failure detail |
| Resolution | "`releaseEscrow()`" function name | Internal function name; replaced with description |
| Settlement | "BigInt division" — kept as protocol detail | Kept |
| Governance table | "Source" column with file:line refs (`028_governance_marketplace.sql:84`, etc.) | File:line references; column dropped entirely |
| Entire section | "Key database tables" with column-level schema (`disputes`, `dispute_evidence`, `dispute_votes`) | Internal column names; replaced with abstract paragraph |
| Entire section | "Where to look in the code" (file:line listing) | File:line reference section |
| Entire section | "Open questions / known issues" — disclosed quorum→frozen-funds gap and unimplemented CANCELLED transition | Weakness disclosure |
| Failure modes | "Where" column with file:line refs (`DisputePanel.tsx:380-519`, `dispute.ts:120-152`, `disputeService.ts:163-191`, `admin.ts:1010-1130`, `002_schema.sql:233-255`) | File:line references; column dropped entirely |
| Failure modes | Rows referencing admin/audit-log internals | Admin operational details |
| Throughout | `[unverified ...]` marker | Unverified internal note |
