# UCMC Protocol — Technical Whitepaper

**Version:** 0.1
**Status:** Draft — derived from the public protocol documentation in this repository
**License:** Apache-2.0

> This document is a self-contained technical introduction to UCMC for researchers,
> auditors, and serious integrators. It synthesizes material from the rest of this
> repository; each section links to the authoritative specification.

## Abstract

UCMC is a protocol for verified economic exchange between strangers. It replaces session-based authentication and server-authoritative record-keeping with a model where every participant holds an Ed25519 keypair, every state-changing action is cryptographically signed, funds move only through escrowed settlement with time-locked finality, and the full history of protocol actions forms an independently verifiable audit trail. The protocol defines 22 signal opcodes across identity, settlement, disputes, finance, compliance, and governance, all authenticated through 16 domain-separated signing contexts. This paper describes the trust model underlying these design choices, the cryptographic foundations they rest on, the protocol architecture that implements them, and the adversarial assumptions that bound the system's guarantees. It is intended for an audience that will read skeptically and verify claims against the specifications published alongside it.

## Table of Contents

- [1. Introduction](#1-introduction)
- [2. Trust Model & Design Principles](#2-trust-model--design-principles)
- [3. Cryptographic Foundations](#3-cryptographic-foundations)
- [4. Protocol Architecture](#4-protocol-architecture)
- [5. Settlement Lifecycle](#5-settlement-lifecycle)
- [6. Governance Model](#6-governance-model)
- [7. Adversarial Analysis](#7-adversarial-analysis)
- [8. Comparison to Prior Art](#8-comparison-to-prior-art)
- [9. Open Problems & Future Work](#9-open-problems--future-work)
- [10. References](#10-references)

---

## 1. Introduction

Most platforms for economic exchange between strangers — freelance marketplaces, service directories, peer-to-peer commerce systems — share a common architectural assumption: the platform operator is the ultimate authority over identity, balances, transaction records, and dispute outcomes. Users authenticate with passwords or OAuth tokens, the server maintains mutable database rows representing account state, and the operator can unilaterally edit balances, freeze accounts, resolve disputes, or delete records. Users have no independent mechanism to verify that the history of their own transactions has not been altered after the fact.

This arrangement has practical consequences. A database compromise can expose or corrupt the entire transaction history. An insider with administrative access can silently modify account balances or dispute outcomes. A platform migration can lose data in ways that are undetectable to users. And users who disagree with a platform decision have no evidence they can present to a third party — the only record of what happened lives inside the operator's database.

UCMC takes a different approach, organized around four principles:

**Identity must be cryptographic, not session-based.** Each participant — called an *actor* — holds an Ed25519 keypair. Their identity within the protocol is derived deterministically from their public key. No password database exists for an attacker to steal. No session token exists for a compromised server to forge. An actor's identity is a mathematical fact, not a database row.

**Every state-changing action must be signed.** When an actor hires a seller, confirms delivery, opens a dispute, or requests a withdrawal, they sign the request with their private key. The server verifies the signature before processing. The signed request is appended to an audit trail. This means the history of protocol actions is independently verifiable: anyone with access to the audit trail and the actors' public keys can confirm that each action was authorized by the actor who claims to have performed it.

**Settlement must be escrowed and time-locked.** Funds move through a state machine with defined transitions: free balance to escrow, escrow to delivery confirmation, delivery to finalization. Neither the buyer nor the seller can extract value outside this lifecycle. A 14-day auto-release protects sellers against unresponsive buyers. Disputes freeze the escrow and route to arbitration (`flows/marketplace-transaction.md`, `flows/withdrawals.md`).

**The platform's privileged operations must be constrained and visible.** Administrative actions that affect actor state require threshold signatures from multiple authorized keys. These actions are logged to the same audit trail as user actions. The operator cannot silently alter protocol state (`threat-model/README.md`).

This paper covers the trust model that formalizes these principles, the cryptographic primitives that implement them, the protocol architecture that organizes them into a working system, the settlement lifecycle that governs fund movement, the governance model that controls protocol parameters, and the adversarial analysis that identifies what the system does and does not defend against.

---

## 2. Trust Model & Design Principles

The trust model defines precisely what each participant is trusted to do, and what they are not trusted to do.

**Actors** hold their Ed25519 private keys exclusively. The server never receives, stores, or processes private key material. An actor's identity within the protocol is their *actor ID*, computed as `SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)` — a deterministic derivation from the public key that binds identity to key material without revealing the key itself (`crypto/identity-and-signing.md`).

**The server** is trusted for three things: availability (keeping the API online), ordering (determining the sequence in which events are processed), and storage (persisting the event history). The server is *not* trusted for integrity of past events — every event carries the originating actor's signature, so retroactive alteration would require forging that signature. The server is *not* trusted for identity — actor IDs are derived from public keys, not assigned by the server.

This trust boundary means a compromised server cannot forge past actions, impersonate actors, or silently rewrite the audit trail. It can, however, refuse to process new requests (denial of service) or attempt to reorder pending events. The former is an availability concern addressed at the infrastructure layer; the latter is constrained by timestamp-drift enforcement and nonce uniqueness checks (`threat-model/README.md`).

Five design principles follow from this trust model:

**Domain separation.** Every signing context has its own domain string. Mutation requests use `UCMC_AUTH_PAYLOAD_V4` as the payload domain and `UCMC_VERIFY_V6` as the verification envelope domain. Read requests use `UCMC_READ_AUTH_V1`. Governance votes use `UCMC_GOVERNANCE_V2`. Email OTP verification uses `UCMC_EMAIL_OTP_V1`. In total, the protocol defines 16 domain strings, each scoping a distinct cryptographic context (`events/schemas.md`). A signature produced for one domain cannot be replayed in another — the domain string is part of the signed preimage.

**Canonical encoding.** Signed payloads use deterministic JSON serialization — object keys are sorted lexicographically and whitespace is normalized — so that identical logical objects always produce identical byte sequences. This eliminates a class of ambiguity attacks where a semantically identical payload could produce different hashes depending on serialization order (`verification/README.md`).

**Replay protection.** Every mutation carries a per-request nonce, a millisecond-precision timestamp, and an idempotency key. The server rejects requests with timestamps more than ±60 seconds from server time, rejects previously-seen nonces, and returns the original response for duplicate idempotency keys without re-executing the mutation (`crypto/identity-and-signing.md`).

**Least authority for the operator.** Actions that traditional platforms perform freely — modifying balances, force-resolving disputes, accessing user data — are constrained behind threshold-signed administrative actions, time-locks, and audit trails. The threat model documents this under the "Insider threat (admin)" class: actor state mutations by administrators require multi-key Ed25519 signatures, and every administrative action is recorded in the same audit chain as user actions (`threat-model/README.md`).

**Distinct signing schemes for reads and writes.** Mutation requests carry a signed body envelope containing the canonical payload, signal opcode, metadata, and proof bindings. Read requests carry signed HTTP headers over a preimage that includes the request path. The two schemes have different security properties — mutations bind the full payload to the signature; reads bind only the actor, timing, and resource path — and separating them prevents a signed read from being reinterpreted as a signed write (`crypto/identity-and-signing.md`).

The practical consequence for users: their identity persists across server compromises, their past actions cannot be retroactively forged by anyone (including the operator), and their funds cannot be unilaterally moved outside the protocol's defined settlement lifecycle.

---

## 3. Cryptographic Foundations

The protocol rests on a small set of standard cryptographic primitives, each chosen for a specific role.

**Ed25519** provides all actor signatures — both mutation envelopes and read-request headers. Ed25519 is a deterministic signature scheme over the Edwards curve Curve25519, producing 64-byte signatures from 32-byte private keys and 32-byte public keys. Its properties relevant to UCMC are: deterministic signatures (no per-signature randomness to leak), compact key and signature sizes, resistance to known-key attacks, and extensive third-party auditing. The protocol uses the `@noble/ed25519` implementation, which exposes an async API compatible with browser, Node.js, Deno, and Bun runtimes (`sdk/typescript/README.md`). Ed25519 is not post-quantum — the threat model lists quantum computing as an explicit out-of-scope threat, with migration planned for future work (`threat-model/README.md`).

**SHA-256** serves multiple roles: actor ID derivation (`SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)`), metadata hash computation, content integrity verification for legal documents and deliverables, email OTP hashing (`SHA-256("UCMC_EMAIL_OTP_V1:" + actorId + ":" + otp)`), document deduplication hashing (`SHA-256("UCMC_DOC_DEDUP_V1:" + documentNumber)`), and replay-key derivation. Each use is domain-separated by a distinct prefix string, preventing preimage collisions across contexts (`verification/README.md`, `flows/kyc.md`).

**AES-256-GCM** encrypts private key material at rest on both the client side (where the wrapping key is derived from a user passphrase via PBKDF2) and the server side (where the wrapping key is derived via HKDF). Recovery shares — fragments of key material distributed to guardians — are also encrypted with AES-256-GCM before storage (`crypto/identity-and-signing.md`, `threat-model/README.md`).

**Constant-time comparisons** are enforced wherever secret-dependent values are compared: OTP verification uses Node.js `timingSafeEqual`, webhook signature verification across all supported KYC provider schemes uses constant-time comparison, and signature verification itself is inherently constant-time in the Ed25519 implementation (`verification/README.md`, `flows/kyc.md`).

**Poseidon** is an arithmetic-friendly hash function used in zero-knowledge circuits. It appears in the protocol's ZK subsystem for circuit-efficient hashing where SHA-256's binary-arithmetic structure would be prohibitively expensive in a constraint system (`glossary.md`).

**Proof of work** gates account creation against Sybil attacks. The `UCMC_POW_V4` domain defines a SHA-256-based challenge requiring 16 leading zero bits — a difficulty calibrated to impose a meaningful cost on automated account creation without significantly burdening legitimate users (`threat-model/README.md`, `flows/marketplace-transaction.md`).

**Merkle trees** underpin audit trail integrity. Each event in the audit chain is a leaf; Merkle proofs allow selective disclosure (proving a specific event exists in the chain without revealing the full history) and third-party audit (verifying that the chain has not been tampered with) (`glossary.md`, `events/schemas.md`).

To make these primitives concrete, consider how a single mutation request flows through the signing pipeline. An actor wants to hire a seller (signal `0x53`). The client builds a canonical payload object containing the `UCMC_AUTH_PAYLOAD_V4` domain string, the actor ID, the target seller's actor ID, the signal opcode, a SHA-256 hash of the signal metadata, a context hash, an idempotency key, and the current timestamp. This object is serialized deterministically (sorted keys, no whitespace variance). The serialized payload is then wrapped in a verification envelope: `{ d: "UCMC_VERIFY_V6", p: <serialized payload> }`. The envelope is itself serialized deterministically. The actor signs the serialized envelope bytes with their Ed25519 private key. The resulting signature, along with the actor's public key and the original payload fields, is submitted to the server. The server reconstructs the same canonical payload from the submitted fields, wraps it in the same envelope structure, serializes it identically, and verifies the signature. If the signature is valid, the timestamp is within ±60 seconds of server time, and the nonce has not been seen before, the mutation is accepted and appended to the audit chain (`verification/README.md`, `events/schemas.md`).

---

## 4. Protocol Architecture

The protocol is organized into four layers, each with a distinct responsibility.

**Identity layer.** Actors generate Ed25519 keypairs client-side. The actor ID is derived from the public key via the `UCMC_ACTOR_ID_V3` domain. Key material is encrypted at rest using AES-256-GCM with a passphrase-derived wrapping key. Recovery is handled through a guardian model — encrypted key shares distributed to trusted contacts — rather than server-side key escrow. The server never holds private keys (`crypto/identity-and-signing.md`).

**Mutation layer.** All state-changing operations are submitted as signed mutations to the universal endpoint `POST /control`. The request body carries an `actorId`, `publicKey`, `signature`, `signal` opcode, `metadata` object, `timestamp`, `nonce`, `idempotencyKey`, and optional `proof` binding. The `signal` field is a 1-byte hex opcode that selects the operation. The protocol defines 22 public signal opcodes organized into six categories: escrow and contract signals (`0x53` DEMAND, `0x02` LOCK, `0x04` RELEASE, `0x05` FINALIZE), identity and actor signals (`0x61` PROFILE_UPDATE, `0x65` DELIVERY_CONFIRM, `0x66` REVIEW_SUBMIT, `0x68` EMAIL_BIND, `0x69` TERMS_ACCEPT), dispute signals (`0x10` DISPUTE_OPEN, `0x11` DISPUTE_VOTE, `0x13` DISPUTE_EVIDENCE), financial signals (`0x70` WITHDRAWAL_REQUEST, `0x80` DEPOSIT_INITIATE, `0x99` PAYOUT_METHOD_SET), KYC and compliance signals (`0x90` KYC_START, `0x91` KYC_VERIFIED, `0x92` KYC_REJECTED), and legal signals (`0x93` LEGAL_SIGN, `0x95` ETH_BIND, `0xa8` ONBOARDING_COMPLETE, `0xa9` TAX_PROFILE_SET). The full catalog with metadata shapes is in `events/schemas.md`.

**Read layer.** Read operations use a separate header-based signing scheme. The client computes a SHA-256 digest of the preimage `UCMC_READ_AUTH_V1:actorId:timestamp:nonce:path`, signs the digest with Ed25519, and sends the signature along with actor identity and timing headers. The server reconstructs the preimage from the request headers and path, recomputes the digest, and verifies the signature. This scheme authenticates reads without requiring a body envelope, and binds the signature to the specific resource path being requested (`crypto/identity-and-signing.md`, `api/README.md`).

**Audit layer.** Every processed signal is appended to an append-only event ledger. Each event entry captures the signal opcode, actor identity, timestamp, metadata hash, and the signature that authorized the action. The chain supports Merkle proof verification for selective disclosure and third-party audit. Because every event carries the originating actor's Ed25519 signature, the audit trail is independently verifiable — a third party can confirm that each action was authorized by the claimed actor without trusting the server's assertions (`events/schemas.md`, `architecture/overview.md`).

The system topology reflects these layers. An edge CDN and WAF terminate TLS and filter malicious traffic. Behind it, an API gateway routes requests to the protocol API service, which handles signature verification, replay protection, and signal dispatch. Background workers handle asynchronous operations: settlement sweeps, webhook processing, notification delivery. A primary database stores event history and derived state. A cache layer handles nonce deduplication and rate limiting. A secret store manages server-side encryption keys. An EVM bridge provides optional on-chain anchoring (`architecture/overview.md`).

The full API surface exposes 144 operations across 138 paths, organized into 13 route groups: identity, profiles, discovery, protocol, content, disputes, reputation, communication, financial, legal, recovery, audit, and governance. The complete machine-readable specification is published as an OpenAPI 3.1 document (`api/openapi.yaml`).

Integrators can interact with the protocol through raw HTTP requests following the signing conventions documented in `api/README.md`, or through the reference TypeScript SDK, which provides typed wrappers for identity management, signing, verification, and a high-level HTTP client with methods for each major protocol operation (`sdk/typescript/README.md`).

---

## 5. Settlement Lifecycle

Fund movement in UCMC follows a state machine with defined transitions. No API endpoint permits direct balance transfer between actors — funds can only move through the escrow and withdrawal lifecycles described here.

The protocol maintains three balance portions per actor: `free` (available for spending, hiring, or withdrawal), `in_escrow` (locked in active contracts), and `in_withdrawal` (held during the 24-hour withdrawal timelock). All balance mutations are atomic — funds move between portions within a single database transaction to prevent double-spend (`flows/withdrawals.md`).

**Escrow lifecycle.** A buyer initiates a contract by sending signal `0x53` (DEMAND) targeting a seller's actor ID and specifying a catalogue item, price, and delivery timeline. This signal is signed with the buyer's Ed25519 key and accompanied by a proof-of-work nonce. On acceptance, signal `0x02` (LOCK) atomically moves the specified amount from the buyer's `free` balance to `in_escrow`. The seller delivers by submitting signal `0x04` (RELEASE) with a delivery payload specifying the mode — `FILE` (uploaded to object storage), `ACCESS` (encrypted content with an ephemeral key), or `MANUAL` (out-of-band delivery). The buyer confirms receipt with signal `0x65` (CONFIRM). Finalization via signal `0x05` (FINALIZE) settles the escrow — funds move from `in_escrow` to the seller's `free` balance. After finalization, either party may submit a review with signal `0x66` (REVIEW), carrying a star rating (1–5) and text body (`flows/marketplace-transaction.md`).

**Auto-release.** If the buyer does not confirm delivery within the governance-configured auto-release period (default 14 days, configurable between 3 and 60 days), funds are released automatically to the seller. This protects sellers against buyers who abandon transactions after receiving delivery (`flows/marketplace-transaction.md`, `flows/disputes.md`).

**Dispute interception.** Either party to an active escrow can file a dispute by sending signal `0x10` (DISPUTE_OPEN), which freezes the escrow and opens an evidence submission window. The default evidence window is 72 hours, configurable between 12 and 336 hours via governance. During this window, both parties can submit text evidence (10–5,000 characters) and file attachments via signal `0x13` (DISPUTE_EVIDENCE). Arbitrators — actors holding the `ARBITRATOR` role — cast weighted votes via signal `0x11` (DISPUTE_VOTE), choosing from four outcomes: `BUYER` (full refund), `SELLER` (full release), `SPLIT` (equal division), or `CANCELLED` (return to originator). If any outcome reaches ≥66% of total weighted votes, the dispute auto-resolves and funds are distributed accordingly. Disputes that do not reach quorum are escalated for administrative resolution (`flows/disputes.md`).

**Withdrawal lifecycle.** An actor requests a withdrawal by sending signal `0x70` (WITHDRAWAL_REQUEST), specifying an amount, destination type (`CRYPTO` or `FIAT`), and destination details. The backend validates KYC status, enforces a governance-controlled minimum amount, and runs sanctions screening. On acceptance, the requested amount is atomically moved from `free` to `in_withdrawal` and a 24-hour timelock begins. After the timelock expires, a periodic sweep releases the funds for settlement via the configured payout provider. Withdrawals above a high-value threshold require administrative approval before release. Very-high-value withdrawals can require N-of-M threshold signatures from a multi-key keyring. Settlement outcomes are confirmed via HMAC-signed webhook callbacks from the payout provider (`flows/withdrawals.md`).

The invariant across both lifecycles is that **funds cannot move outside the state machine**. There is no "transfer balance directly" capability in the protocol. Every fund movement is the result of a signed signal processed through the settlement or withdrawal pipeline, logged to the audit chain, and subject to replay protection.

---

## 6. Governance Model

Protocol parameters fall into two categories: hard-coded invariants and governance-controlled parameters.

**Hard-coded invariants** are properties of the protocol that cannot be changed without a protocol upgrade — a coordinated change to client and server software. These include the Ed25519 algorithm choice, the signing domain strings and their version numbers (e.g., `UCMC_AUTH_PAYLOAD_V4`, `UCMC_VERIFY_V6`), the signal opcode definitions and their semantic meanings, the ±60-second timestamp drift bound, the canonical payload serialization format, and the actor ID derivation formula. Changing any of these would invalidate existing signatures or alter the meaning of recorded events.

**Governance-controlled parameters** are operational values that can be adjusted through the governance process without breaking protocol compatibility. Documented examples include: the dispute arbitration quorum (default 3 votes, range 1–15), the dispute evidence window (default 72 hours, range 12–336 hours), the escrow auto-release period (default 14 days, range 3–60 days), the withdrawal minimum amount, and the withdrawal timelock duration (`flows/disputes.md`, `flows/withdrawals.md`).

Governance actions are themselves signed protocol events. The `UCMC_GOVERNANCE_V2` domain provides the signing context for governance votes, and governance signals are recorded in the audit chain alongside all other protocol events (`events/schemas.md`). This means governance changes are observable — there is no off-protocol path for the operator to silently change parameters.

High-impact administrative actions — those affecting actor state, fund movement, or protocol parameters — are gated behind threshold signatures. The threat model documents this under the "Insider threat (admin)" class: administrative mutations require multi-key Ed25519 signatures, preventing any single administrator from unilaterally modifying system state. The specific set of actions requiring threshold authorization is an operational detail intentionally excluded from the public documentation, but the mechanism itself — N-of-M multi-key Ed25519 signatures with bounded TTL and per-action nonces — is a core protocol property (`threat-model/README.md`).

---

## 7. Adversarial Analysis

The threat model published in `threat-model/README.md` enumerates 14 threat classes that the protocol actively defends against, organized by attack surface, plus 5 threat classes that are explicitly acknowledged but out of scope. This section narrates each in-scope threat, its defense, and its residual risk.

**Account takeover.** In a conventional platform, account takeover means stealing a password or session token. UCMC eliminates both attack vectors: identity is an Ed25519 keypair, not a username/password pair, and there are no session cookies or JWTs to intercept. The private key is encrypted at rest using AES-256-GCM with a passphrase-derived wrapping key. An attacker would need to compromise both the encrypted key material and the passphrase. Residual risk: if a user loses their passphrase and has not configured recovery guardians, their identity is unrecoverable.

**Replay attacks.** Every mutation carries a random nonce, a millisecond timestamp, and an idempotency key. The server rejects requests whose timestamp differs from server time by more than ±60 seconds, rejects nonces it has seen before (tracked in a cache-backed deduplication set), and returns the cached original response for repeated idempotency keys. Residual risk: nonce deduplication depends on the cache layer's availability; a cache failure could theoretically allow a replay within the 60-second drift window.

**Signature forgery.** Ed25519 signatures are computed over domain-separated canonical payloads. The actor ID is pinned to the public key via SHA-256 derivation, preventing an attacker from substituting a different key for the same actor ID. The canonical serialization (sorted keys, deterministic JSON) eliminates ambiguity in what was signed. Residual risk: dependent on the mathematical hardness of the discrete logarithm problem on Curve25519.

**Sybil attacks and multi-accounting.** Account creation requires proof-of-work (16-bit SHA-256 difficulty under `UCMC_POW_V4`), which raises the cost of automated account farming. Device fingerprint hashing (a 5-component composite) detects when the same device creates multiple accounts. Residual risk: a determined attacker with many devices can still create multiple identities; PoW difficulty is a tuning knob, not a hard barrier.

**Self-dealing and wash trading.** A database-level constraint prevents self-transfers (`from_id ≠ to_id`), and fraud detection rules flag patterns consistent with self-dealing. Residual risk: colluding accounts controlled by the same person are difficult to detect if they use separate devices and keys.

**Credential brute-force.** Progressive penalties escalate lockout duration on repeated failures (1 minute, 10 minutes, 1 hour, 24 hours). Per-IP and per-actor rate limiting constrain the throughput of brute-force attempts. Bot-detection middleware provides an additional layer. Residual risk: distributed brute-force across many IPs can partially circumvent per-IP limits.

**DDoS at the application layer.** Defense is layered: the edge CDN/WAF provides DDoS mitigation and connection limiting per IP, the reverse proxy enforces tiered rate-limit zones, and the application layer maintains a per-actor token-bucket rate limiter. Residual risk: sufficiently large volumetric attacks may degrade the edge layer itself, which is outside the application's control.

**XSS and injection.** Content Security Policy headers restrict script sources to `self` with nonce-based exceptions, and `frame-ancestors 'none'` prevents clickjacking. Input sanitization is applied per route. WAF rules at the reverse proxy drop known injection payloads. Residual risk: zero-day browser vulnerabilities or CSP bypasses.

**Path traversal.** The reverse proxy blocks `../` sequences and null-byte variants before requests reach the application. The storage layer resolves and verifies canonical path prefixes, ensuring uploaded file paths cannot escape their designated storage boundary. Residual risk: novel encoding bypasses not covered by current rules.

**Scanner and vulnerability probes.** User-agent blocklists drop requests from known scanning tools. Known-exploit paths (e.g., common CMS attack URLs) return HTTP 444 (connection dropped without response). Direct-IP requests (bypassing the CDN hostname) are rejected. Residual risk: custom scanners that rotate user agents and use the CDN hostname are not blocked by these rules.

**MIME spoofing.** File uploads undergo server-side magic-byte verification against a MIME allowlist. The file extension is derived server-side from the verified MIME type, never from the client-supplied filename. Residual risk: polyglot files that pass magic-byte checks but contain executable content for specific parsers.

**Insider threat (admin).** Administrative mutations to actor state require threshold signatures — N-of-M Ed25519 signatures from a multi-key keyring. Admin nonces have their own replay protection. Every administrative action is recorded in the audit chain with the same integrity guarantees as user actions. Residual risk: collusion among a sufficient number of key holders to reach the threshold.

**Data breach (at-rest).** Private keys are encrypted with AES-256-GCM on both client (passphrase-derived key via PBKDF2) and server (HKDF-derived key). Recovery shares are encrypted with AES-256-GCM. Email addresses are stored as SHA-256 hashes for lookup; the plaintext form is encrypted before persistence and used only for dispatch. Personally identifiable information is encrypted before storage. Residual risk: compromise of the server-side HKDF root key would expose server-encrypted material.

**GDPR right-to-erasure.** A full erasure pipeline nullifies PII, deletes OAuth identities and keypairs, soft-deletes payment methods, and sets the actor status to `ERASED`. This preserves the audit chain's structural integrity (signed events remain, but the actor's identity is no longer linked to personal data) while satisfying the right to erasure. Residual risk: the audit chain retains signed events by design — erasure removes PII but not the cryptographic evidence that actions occurred.

**Explicit non-goals.** The threat model acknowledges five threat classes as out of scope: nation-state adversaries with hardware access (cost exceeds platform value), supply-chain attacks via package dependencies (mitigated by lockfile and CI but no SBOM signing), side-channel attacks on managed database hosts (a managed-infrastructure responsibility), social engineering against the support team (no self-serve appeal portal exists yet), and quantum computing (Ed25519 is not post-quantum; migration is planned) (`threat-model/README.md`).

---

## 8. Comparison to Prior Art

UCMC's design draws on ideas from several categories of prior systems, while differing from each in important ways.

**Centralized escrow platforms.** Traditional freelance and commerce marketplaces — to the authors' knowledge — typically authenticate users with password-derived sessions or OAuth tokens, maintain server-authoritative balance records, and resolve disputes through operator-controlled processes. The operator has full discretion to modify records, freeze accounts, or reverse transactions. UCMC differs by binding each action to a cryptographic signature, making the transaction history independently verifiable, and constraining fund movement to a defined state machine. The operator cannot move funds outside the escrow or withdrawal lifecycle, and cannot forge an actor's signature on a past action. The trade-off is complexity: integrators must implement client-side signing rather than simple API-key authentication.

**End-to-end cryptographic systems.** UCMC's domain-separation discipline is conceptually similar to the approach used by Signal Protocol, which separates key agreement, ratcheting, and message encryption into distinct cryptographic contexts to prevent cross-protocol attacks. UCMC applies the same principle to economic operations: the 16 signing domains ensure that a signature valid for a mutation cannot be reinterpreted as a governance vote, a read authorization, or an OTP verification. The fundamental difference is that UCMC is a server-mediated economic protocol, not a peer-to-peer messaging protocol. The server is a necessary participant — it processes signals, maintains state, and mediates settlement — but its authority over identity and past events is constrained by the cryptographic guarantees described above.

**Append-only transparency systems.** UCMC's audit chain shares structural similarities with Certificate Transparency logs and systems like OpenTimestamps: events are appended to an ordered, Merkle-tree-backed ledger, and inclusion proofs allow third parties to verify that specific events exist in the chain without downloading the full history. The difference is scope: Certificate Transparency logs certificate issuance events across the entire web PKI, while UCMC's audit chain is scoped to a specific economic protocol's events. UCMC does not currently publish its Merkle tree root to an external anchoring service, though the architecture documents this as a future direction (`architecture/overview.md`).

**Important clarification: UCMC is not a blockchain.** It does not have a consensus protocol, a distributed ledger, a native token, miners, validators, or globally-distributed consensus. It is a protocol layer on top of conventional infrastructure (a database, a cache, an API server) that achieves a subset of blockchain-like guarantees — audit integrity, non-repudiation, no server-forged history — without requiring the operational overhead, latency, or energy costs of distributed consensus. The trade-off is that the server remains a single point of trust for availability and ordering, even though it is not trusted for integrity or identity.

---

## 9. Open Problems & Future Work

Several significant areas remain unresolved or unspecified. Honesty about these limitations is part of the protocol's maturity.

**Post-quantum migration.** Ed25519 relies on the hardness of the discrete logarithm problem on elliptic curves, which a sufficiently large quantum computer could solve using Shor's algorithm. The threat model acknowledges this explicitly. A migration path — likely hybrid signatures combining Ed25519 with a post-quantum scheme such as ML-DSA (Dilithium) — is planned but not yet specified. The protocol's domain-separation and versioning conventions (e.g., `UCMC_VERIFY_V6` could become `UCMC_VERIFY_V7` with a PQ scheme) are designed to accommodate such a transition without invalidating the existing audit trail.

**Decentralization.** UCMC is currently server-mediated: a single operator runs the API, stores the event history, and mediates settlement. A more decentralized variant — multiple operator nodes federated under a common protocol, with cross-operator event verification — is a natural extension but is not specified. The cryptographic foundations (actor-held keys, signed events, Merkle proofs) are compatible with federation, but the ordering and availability guarantees would need to be rearchitected.

**On-chain anchoring.** Periodically publishing the audit chain's Merkle root hash to a public blockchain would allow third parties to verify that the operator has not retroactively pruned or altered history. The architecture overview mentions an EVM bridge component (`architecture/overview.md`), but the anchoring protocol is not yet specified. This would provide a stronger guarantee than the current model, where audit integrity depends on the operator preserving the full chain.

**Formal verification.** The core signing logic — canonical payload construction, envelope wrapping, signature verification, replay protection — is small and deterministic enough to admit formal verification. Model-checking the request canonicalization for ambiguity, the replay protection for completeness, and the balance state machine for conservation (funds cannot be created or destroyed, only moved between portions) would strengthen confidence in the protocol's correctness. This work has not been done.

**Public testnet.** A sandbox environment where integrators can test against the protocol without affecting production — using test accounts, simulated escrow, and non-production credentials — is not yet operational. The API surface and SDK are documented, but external developers cannot currently verify their integrations against a running instance.

**Independent security audit.** No published third-party audit report exists. The threat model is internally authored; an external review by a qualified cryptographic or application-security auditor is the next milestone for establishing independent confidence in the protocol's security properties.

---

## 10. References

### In-repo specifications

- [architecture/overview.md](../architecture/overview.md) — System topology, component boundaries, request flow, and design rationale
- [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) — Ed25519 actor model, key derivation, signing domains, and verification flow
- [threat-model/README.md](../threat-model/README.md) — 14 in-scope threat classes, 5 out-of-scope threats, cryptographic primitives, and defense layers
- [events/schemas.md](../events/schemas.md) — 22-opcode signal catalog, 16 signing domains, and request envelope specification
- [verification/README.md](../verification/README.md) — TypeScript reference implementations for 7 cryptographic primitives
- [api/README.md](../api/README.md) — Authentication model, request/response envelopes, error codes, rate limits, and idempotency
- [api/openapi.yaml](../api/openapi.yaml) — OpenAPI 3.1 machine-readable specification: 138 paths, 144 operations, 13 tags
- [flows/marketplace-transaction.md](../flows/marketplace-transaction.md) — Escrow lifecycle: hire, lock, deliver, confirm, finalize, review
- [flows/kyc.md](../flows/kyc.md) — KYC verification flow: session creation, provider integration, webhook processing, sanctions screening
- [flows/disputes.md](../flows/disputes.md) — Dispute resolution: filing, evidence, arbitration, quorum, fund release
- [flows/withdrawals.md](../flows/withdrawals.md) — Withdrawal lifecycle: request, timelock, sweep, settlement
- [flows/onboarding.md](../flows/onboarding.md) — Three-phase onboarding: identity, wizard (10 steps), legal gate
- [glossary.md](../glossary.md) — Protocol terminology and signing domain reference
- [sdk/typescript/README.md](../sdk/typescript/README.md) — TypeScript reference SDK: identity, signing, verification, and HTTP client

### External references

- RFC 8032 — Edwards-Curve Digital Signature Algorithm (Ed25519)
- RFC 8785 — JSON Canonicalization Scheme (JCS)
- FIPS 180-4 — Secure Hash Standard (SHA-256)
- NIST SP 800-38D — Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (AES-GCM)
- RFC 8018 — PKCS #5: Password-Based Cryptography Specification Version 2.1 (PBKDF2)
- Apache License, Version 2.0 — https://www.apache.org/licenses/LICENSE-2.0
