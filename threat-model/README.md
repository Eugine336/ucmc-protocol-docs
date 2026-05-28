# UCMC Threat Model

UCMC is a verified economic network where every action — identity creation, transaction, dispute, withdrawal — is cryptographically signed and auditable. This document describes the threats the protocol defends against, those explicitly out of scope, and the defense layers that make the system resilient.

This is a living document. As the protocol evolves, so will the threat model.

## Threats in Scope

The following table enumerates the threat classes UCMC actively defends against, along with the primary defense mechanisms.

| Threat Class | How the Platform Resists It | Primary Defense Layers |
|---|---|---|
| **Account takeover** | Ed25519 keypair identity, passphrase-encrypted private key (AES-256-GCM), no session cookies or JWTs to steal | Identity, request integrity |
| **Replay attacks** | Per-request nonce + timestamp drift check (±60 s), SHA-256 replay key with in-memory deduplication, cache-backed nonce sets for privileged routes | Request integrity, edge |
| **Signature forgery** | Ed25519 verification with domain-separated canonical payloads (`UCMC_AUTH_PAYLOAD_V4`, `UCMC_VERIFY_V6`), public key pinned to actorId via SHA-256 derivation | Identity, request integrity |
| **Sybil / multi-accounting** | Device fingerprint hashing (5-component), fraud detection rules, proof-of-work on registration (16-bit SHA-256 difficulty) | Compliance, identity |
| **Self-dealing / wash trading** | Fraud detection rules, database-level constraint preventing self-transfers (`from_id ≠ to_id`) | Compliance, application |
| **Credential brute-force** | Progressive penalties (1 min → 10 min → 1 h → 24 h), per-IP and per-actor rate limiting, bot-detection middleware | Edge, application |
| **DDoS (application layer)** | Tiered rate-limit zones at the reverse proxy, application-level token-bucket per actor, edge DDoS protection, connection limiting per IP | Edge, application |
| **XSS / injection** | Content Security Policy (`script-src 'self'` + nonce, `frame-ancestors 'none'`), security headers, input sanitization per route, WAF rules at the reverse proxy | Edge, application |
| **Path traversal** | Reverse proxy blocks `../` and null-byte variants, storage provider resolves and verifies canonical path prefix | Edge, application |
| **Scanner / vulnerability probe** | User-agent blocklist, known-exploit path dropping (HTTP 444), direct-IP rejection | Edge |
| **MIME spoofing** | Server-side magic-byte verification per upload, MIME allowlist, file extension derived server-side (never from client) | Application |
| **Insider threat (admin)** | Threshold signatures for actor state mutations (multi-key Ed25519), admin nonce replay protection, audit trail for every action | Identity, audit |
| **Data breach (at-rest)** | Private keys encrypted AES-256-GCM (client: passphrase-derived key; server: HKDF-derived key), recovery shares encrypted AES-256-GCM, email addresses stored as SHA-256 hashes, PII encrypted before persistence | Identity, application |
| **GDPR right-to-erasure** | Full erasure pipeline: nullify PII → delete OAuth identities → delete keypairs → soft-delete payment methods → set actor status to `ERASED` | Compliance, application |

## Threats Out of Scope

The following threats are acknowledged but explicitly not defended against at the protocol level, along with the reasoning.

| Threat | Reasoning |
|---|---|
| Nation-state adversary with hardware access | Cost exceeds platform value; would require HSM-grade defense throughout |
| Supply-chain attacks via package dependencies | Mitigated by lockfile and CI, but no SBOM signing or dependency attestation |
| Side-channel on database host | Managed-infrastructure responsibility; not addressable at application layer |
| Social engineering against support team | No self-serve appeal portal exists yet; support is human-operated |
| Quantum computing | Ed25519 is not post-quantum; migration planned for future |

## Cryptographic Primitives

UCMC uses **Ed25519** for all actor identity and request signing, **SHA-256** for content hashing, actor ID derivation, and replay detection, **AES-256-GCM** for symmetric encryption of private keys and recovery shares, **PBKDF2** and **HKDF** for key derivation (client-side and server-side respectively), **Poseidon** for ZK-circuit-friendly hashing, and **Merkle trees** for audit trail integrity proofs. Domain-separated signing payloads (e.g., `UCMC_AUTH_PAYLOAD_V4`, `UCMC_VERIFY_V6`, `UCMC_POW_V4`) prevent cross-context signature reuse. For a detailed specification of the identity model, key lifecycle, and signing domains, see [crypto/identity-and-signing.md](../crypto/identity-and-signing.md).

## Defense Layers

UCMC's security architecture is organized into concentric defense layers:

1. **Edge** — Reverse proxy rate limiting, WAF rules, bot detection, DDoS mitigation, TLS termination, and scanner/probe rejection. Malicious requests are dropped before reaching the application.

2. **Application** — Input validation, MIME verification, CSP enforcement, per-actor token-bucket rate limiting, and signed-request verification. Every mutating request must carry a valid Ed25519 signature with a fresh nonce.

3. **Identity** — Cryptographic actor identity (Ed25519 keypair), domain-separated signing, threshold signatures for privileged operations, passphrase-encrypted key storage, and SHA-256 actor ID derivation. There are no bearer tokens — authentication is proof-of-private-key-possession on every request.

4. **Audit** — Every state mutation emits a signed, immutable event to the audit chain. Merkle proofs enable independent verification that the audit trail has not been tampered with. Compliance gates (KYC, sanctions screening) are enforced as prerequisites to financial operations.

## See Also

- [Architecture Overview](../architecture/overview.md) — system topology, service boundaries, and event-sourcing model
- [Identity and Signing Specification](../crypto/identity-and-signing.md) — Ed25519 actor model, key derivation, signing domains, and verification flow
- [Glossary](../glossary.md) — definitions of protocol terms used throughout this document
