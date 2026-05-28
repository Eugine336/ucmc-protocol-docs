# Redactions: glossary.md

## Source: ai-marketplace/docs/24-glossary.md
## Sanitization run: 2026-05-28T09:27:49Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Entries | Admin/internal entries removed (`Admin key`, `Internal key`, `Universal Actor View`, `ComplianceContext`, moderation and internal route terms) | Restricted/internal control surface |
| Entries | Vendor- and platform-specific entries removed (`Paystack`, `Shufti Pro`, `DigitalOcean Spaces`, `OpenBao`, RUM vendor references) | Vendor abstraction and operational minimization |
| Entries | Implementation utility terms removed (`ok()/fail()`, `schema_migrations`, framework/runtime-only concepts) | Non-protocol implementation detail |
| Entries | Internal table references (`actor_admin_roles`, `compliance_freezes`) removed | Sensitive schema internals |
| Entry citations | All `Ref:` file-path and line references removed | Internal code structure disclosure |
| Signing domains table | Legacy/internal rows removed (`UCMC_GOVERNANCE_V1`, `UCMC_AUTOMATION_ASSISTANT_V2`, `UCMC_VERIFY_V9_ALIGNED`, `UCMC_VERIFY_V4`, `UCMC_AUTH_PAYLOAD_V2`, `UCMC_SECRET_V1`) | Legacy or internal-only scope |
| Signing domains table | "Defined in" column removed | Internal source-map disclosure |
| Signal tables | Compliance/platform signals table (`0x9b`–`0xa9`) removed | Compliance internals and enforcement surface |
| Threshold signing categories | Entire override/emergency/stub action category section removed | Privileged override and emergency mechanism exposure |
| Misc sections | Dormant/unactivated feature notes removed | Internal roadmap/weakness disclosure |