# Redactions: architecture/overview.md

## Source: ai-marketplace/docs/02-architecture-overview.md
## Sanitization run: 2026-05-28T09:27:49Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| System topology | `instance-20260517-014534` | Infrastructure identifier |
| System topology | Explicit localhost bindings (`127.0.0.1:3001`, `127.0.0.1:3002`, `127.0.0.1:5000`, `127.0.0.1:8200`) and agent port references | Operational network details |
| System topology | `Cloudflare`, `Paystack`, `Shufti Pro`, `DigitalOcean Spaces`, `Datadog`, `OpenBao`, `HCP Vault` replaced by category terms | Vendor abstraction |
| Docker Compose services | Entire service inventory, image names, container names, bridge network, profiles, and volume mappings removed | Deployment implementation details |
| Docker Compose services | Container identifiers (`ucmc_backend`, `ucmc_worker`, `ucmc_frontend`, `ucmc_admin`, `ucmc_postgres`, `ucmc_redis`, `ucmc_openbao`, `ucmc_datadog`) removed | Internal runtime identifiers |
| Frontend breakdown | Admin panel internals section removed | Restricted surface internals |
| Frontend breakdown | Warning text such as "Never expose port 3002 publicly" removed | Operational security hint |
| Entry-point chain | File-level bootstrap chain and module filenames removed or abstracted | Internal code structure |
| Middleware stack | Strict mount-order specifics and implementation-level parser details reduced to conceptual lifecycle | Implementation detail reduction |
| Route registry | `Operational` and `Privileged` rows removed (`/internal`, `/security`, `/monitor`, `/trust`, `/signing`, `/admin`) | Internal/admin attack surface |
| Database layer | Pool sizes, timeouts, concurrency limits, retry codes, and replica env-var specifics removed | Tuning knobs and operational internals |
| External services | Provider-specific subsections replaced with category-level paragraph | Vendor and integration minimization |
| Request journey | Concrete proxy chain details reduced to logical edge/gateway path | Deployment abstraction |
| Request journey | Exact body-size and timestamp numeric thresholds removed | Operational tuning details |
| Environment variable manifest | Entire section removed (keys for payments, KYC, storage, observability, secrets infrastructure) | Secret and infrastructure exposure risk |