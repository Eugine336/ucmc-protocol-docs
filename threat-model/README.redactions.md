# Redactions: threat-model/README.md

## Source: ai-marketplace/docs/SECURITY_ARCHITECTURE.md (§1 — Threat Model)
## Sanitization run: 2026-05-28T00:00:00Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Header | "Last updated: 2026-05-25, commit `f4ce073`" | Internal commit SHA |
| Header | "Audience: Engineers joining the team, security auditors, operational on-call responders" | Internal audience note |
| Header | "How to read this: Each section references specific files with `file:line` citations..." | Internal navigation instructions |
| Threats table | "§2, §3", "§4, §5", "§8, §3", "§7", "§6, §7", "§6", "§6, §10", "§10", "§4, §15", "§2, §11, §16", "§12" (all Primary layers column values) | Internal section references replaced with category names (identity, request integrity, compliance, edge, application, audit) |
| Threats table — Replay attacks | "50 K in-memory LRU" | Tuning knob (specific cache size) |
| Threats table — Replay attacks | "Redis-backed nonce sets for admin/internal routes" | Infrastructure detail (Redis) replaced with "cache-backed nonce sets for privileged routes" |
| Threats table — Sybil | "`SHARED_DEVICE` fraud rule" | Named fraud rule |
| Threats table — Sybil | "PoW on registration" detail preserved but exact tuning retained as protocol invariant (16-bit) | Kept — protocol invariant |
| Threats table — Self-dealing | "`SELF_DEALING` and `SYBIL_ATTESTATION` fraud rules" | Named fraud rules replaced with "fraud detection rules" |
| Threats table — Self-dealing | "`value_logs CHECK (from_id ≠ to_id)`" | Internal DB constraint syntax replaced with description |
| Threats table — Brute-force | "AbuseIPDB" | Vendor name replaced with "bot-detection middleware" |
| Threats table — DDoS | "Nginx rate-limit zones (30 / 200 / 10 req/min per tier)" | Vendor name (Nginx) + specific rate-limit numbers; replaced with "Tiered rate-limit zones at the reverse proxy" |
| Threats table — DDoS | "Express token-bucket per actor" | Framework name (Express) replaced with "application-level token-bucket" |
| Threats table — DDoS | "Cloudflare edge DDoS protection" | Vendor name replaced with "edge DDoS protection" |
| Threats table — DDoS | "connection limit (20 concurrent per IP)" | Specific connection limit number; replaced with "connection limiting per IP" |
| Threats table — XSS | "Helmet" | Library name |
| Threats table — XSS | "regex WAF rules in nginx" | Infrastructure detail replaced with "WAF rules at the reverse proxy" |
| Threats table — Path traversal | "Nginx blocks" | Vendor name replaced with "Reverse proxy blocks" |
| Threats table — Path traversal | "local storage provider" | Implementation detail replaced with "storage provider" |
| Threats table — Scanner | "16 tools" in user-agent blocklist | Specific count |
| Threats table — Scanner | "WordPress/PHP/dotfile path dropping" | Specific path patterns replaced with "known-exploit path dropping" |
| Threats table — Data breach | "client: PBKDF2-derived key" | Replaced with "passphrase-derived key" (less implementation-specific) |
| Threats table — GDPR | Specific pipeline steps preserved (protocol-level); no redactions needed | Kept as-is |
| Out of scope — Supply chain | "npm" | Package manager name replaced with "package dependencies" |
| Entire section | §2.1 Algorithm inventory table | Too implementation-specific; replaced with "Cryptographic Primitives" summary paragraph |
| Entire section | §2.2 Mermaid keypair lifecycle diagram | Implementation detail; crypto/identity-and-signing.md covers protocol level |
| Entire section | §2.3 Client-side encryption parameters (PBKDF2 iteration counts, salt lengths) | Tuning knobs; covered in Phase 1 crypto doc |
| Entire section | §2.4 Server-side encryption parameters | Tuning knobs; covered in Phase 1 crypto doc |
| Entire section | "Notable absences: No secp256k1..." | Implementation detail |
| Entire section | Table of Contents with § numbers | Internal navigation; document restructured as standalone |
| Entire section | All content after §1 "Explicitly out of scope" (implementation appendix) | Out of Phase 2 scope; contains operational details |
