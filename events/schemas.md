# Event Schemas — Signal Opcode Catalog

## Overview

A **signal** is a 1-byte opcode that names the kind of protocol action an actor is performing. Signals are the atomic unit of state change in UCMC: every mutation request carries exactly one signal in its body, identifying the intent of the operation.

Signals travel inside a **signed mutation request** — a JSON envelope containing the actor's public key, an Ed25519 signature, the signal opcode, metadata, timestamps, a nonce, and a proof binding. The server verifies the signature before processing any signal. See [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) for the signing model and [glossary.md](../glossary.md) for foundational definitions.

Each signal operates within a **signing domain** — a string prefix that separates cryptographic contexts so that a signature valid in one domain cannot be replayed in another. The canonical mutation domain is `UCMC_AUTH_PAYLOAD_V4`, wrapped in the verification envelope `UCMC_VERIFY_V6`.

---

## Signing Domain Reference

| Domain | Purpose |
|---|---|
| `UCMC_ACTOR_ID_V3` | Derive actor ID from public key: `SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)` |
| `UCMC_AUTH_PAYLOAD_V4` | Canonical payload domain for signed mutations |
| `UCMC_VERIFY_V6` | Outer envelope for mutation signature verification |
| `UCMC_READ_AUTH_V1` | Preimage domain for signed read requests |
| `UCMC_METADATA_BIND_V2` | Metadata hash binding |
| `UCMC_SIGNATURE_ID_V1` | Deterministic signature ID derivation |
| `UCMC_POW_V4` | Proof-of-work challenge |
| `UCMC_GOVERNANCE_V2` | Governance vote signing |
| `UCMC_EMAIL_OTP_V1` | Email OTP hash: `SHA-256("UCMC_EMAIL_OTP_V1:" + actorId + ":" + otp)` |
| `UCMC_EMAIL_BIND_V1` | Email binding verification |
| `UCMC_ETH_BIND_V1` | Ethereum address binding |
| `UCMC_GDPR_VERIFY_V1` | GDPR data export verification |
| `UCMC_DOC_DEDUP_V1` | KYC document deduplication |
| `UCMC_LISTING_UID_V1` | Listing unique ID generation |
| `UCMC_MSG_PLAIN_V1` | Message plaintext signing |
| `UCMC_RECOVERY_GUARDIAN_EMAIL_V1` | Recovery guardian email verification |

---

## Signal Opcode Catalog

### Escrow & Contract Signals

| Opcode | Name | Description | Metadata | Related Flow |
|---|---|---|---|---|
| `0x53` | DEMAND / HIRE | Hire a seller; initiates escrow creation | `{ catalogue_id, catalogue_title, catalogue_price, delivery_days }` | [marketplace-transaction](../flows/marketplace-transaction.md) |
| `0x02` | LOCK | Lock funds in escrow | `{ contractId, amount }` | [marketplace-transaction](../flows/marketplace-transaction.md) |
| `0x04` | RELEASE / DELIVER | Seller marks work as delivered | `{ deliveryTraceId, mode (FILE/ACCESS/MANUAL), payload }` | [marketplace-transaction](../flows/marketplace-transaction.md) |
| `0x05` | FINALIZE | Contract complete; escrowed funds settle to seller | `{ deliveryTraceId }` | [marketplace-transaction](../flows/marketplace-transaction.md) |

### Identity & Actor Signals

| Opcode | Name | Description | Metadata | Related Flow |
|---|---|---|---|---|
| `0x61` | PROFILE_UPDATE | Update display name, bio, avatar, or role | `{ legal_name?, display_name?, bio?, avatar_url?, role? }` | [onboarding](../flows/onboarding.md) |
| `0x65` | DELIVERY_CONFIRM | Buyer confirms delivery received | `{ deliveryTraceId }` | [marketplace-transaction](../flows/marketplace-transaction.md) |
| `0x66` | REVIEW_SUBMIT | Submit a review after contract finalization | `{ finalizeTraceId, stars (1–5), body, positiveTags?, negativeTags? }` | [marketplace-transaction](../flows/marketplace-transaction.md) |
| `0x68` | EMAIL_BIND | Bind an email address to an actor identity | `{ email_hash }` | [onboarding](../flows/onboarding.md) |
| `0x69` | TERMS_ACCEPT | Accept the platform terms of service | `{ acceptedAt }` | [onboarding](../flows/onboarding.md) |

### Dispute Signals

| Opcode | Name | Description | Metadata | Related Flow |
|---|---|---|---|---|
| `0x10` | DISPUTE_OPEN | File a dispute against an active contract | `{ counterparty, escrowTraceId, reason (20–1500 chars) }` | [disputes](../flows/disputes.md) |
| `0x11` | DISPUTE_VOTE | Arbitrator casts a vote on a dispute | `{ disputeId, vote (BUYER/SELLER/SPLIT/CANCELLED), weight }` | [disputes](../flows/disputes.md) |
| `0x13` | DISPUTE_EVIDENCE | Submit supporting evidence for a dispute | `{ disputeId, content (10–5000 chars), fileKey? }` | [disputes](../flows/disputes.md) |

### Financial Signals

| Opcode | Name | Description | Metadata |
|---|---|---|---|
| `0x70` | WITHDRAWAL_REQUEST | Request a withdrawal of available balance | `{ amount, destination, destinationType (CRYPTO/FIAT), ...region-specific fields }` |
| `0x80` | DEPOSIT_INITIATE | Initiate a deposit into the platform wallet | `{ amount, currency, reference }` |
| `0x99` | PAYOUT_METHOD_SET | Save or update a payout method | `{ method_id, method_type }` |

### KYC & Compliance Signals

| Opcode | Name | Description | Metadata | Related Flow |
|---|---|---|---|---|
| `0x90` | KYC_START | Start identity verification (provider session created server-side) | `{ }` | [kyc](../flows/kyc.md) |
| `0x91` | KYC_VERIFIED | KYC verification succeeded | `{ verified_at }` | [kyc](../flows/kyc.md) |
| `0x92` | KYC_REJECTED | KYC verification rejected | `{ rejection_reason }` | [kyc](../flows/kyc.md) |

### Legal & Miscellaneous Signals

| Opcode | Name | Description | Metadata | Related Flow |
|---|---|---|---|---|
| `0x93` | LEGAL_SIGN | Sign a legal document (NDA, contract addendum) | `{ documentId, contentHash }` | — |
| `0x95` | ETH_BIND | Bind an Ethereum address to the actor identity | `{ address, signature }` | — |
| `0xa8` | ONBOARDING_COMPLETE | All onboarding steps finished | `{ }` | [onboarding](../flows/onboarding.md) |
| `0xa9` | TAX_PROFILE_SET | Save tax profile information | `{ country, entity_type, tax_id_hash }` | — |

---

## Request Envelope Shape

Every signed mutation is submitted as a JSON body with this structure:

```json
{
  "actorId": "<SHA-256 derived actor ID>",
  "publicKey": "<hex-encoded Ed25519 public key>",
  "signature": "<hex-encoded Ed25519 signature>",
  "signal": "<hex opcode, e.g. 0x53>",
  "metadata": { },
  "timestamp": 1716900000000,
  "nonce": "<random 32-char hex>",
  "traceId": "<UUIDv4 trace identifier>",
  "idempotencyKey": "<client-generated unique key>",
  "proof": {
    "contextHash": "<SHA-256 of context binding>",
    "proofHash": "<SHA-256 of proof payload>"
  }
}
```

Read requests use signed headers instead of a body envelope:

| Header | Value |
|---|---|
| `x-actor-id` | Actor ID (hex) |
| `x-public-key` | Ed25519 public key (hex) |
| `x-timestamp` | Unix epoch milliseconds |
| `x-nonce` | Random 32-char hex |
| `x-signature` | Ed25519 signature over `SHA-256("UCMC_READ_AUTH_V1:" + actorId + ":" + timestamp + ":" + nonce + ":" + path)` |

---

## Audit Chain

Every processed signal is appended to an append-only event ledger. This ledger is the foundation of the audit chain: a sequence of cryptographically linked events that provides a tamper-evident record of all protocol actions.

Each event entry captures the signal opcode, actor identity, timestamp, metadata hash, and the signature that authorized the action. The chain supports Merkle proof verification for selective disclosure and third-party audit. See [architecture/overview.md](../architecture/overview.md) for how the audit chain fits within the broader system design.

---

## See Also

- [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) — Ed25519 signing model, key derivation, domain separation
- [architecture/overview.md](../architecture/overview.md) — System topology and event-sourced design
- [glossary.md](../glossary.md) — Term definitions
- [flows/marketplace-transaction.md](../flows/marketplace-transaction.md) — Hire → escrow → delivery → finalization lifecycle
- [flows/kyc.md](../flows/kyc.md) — KYC verification flow
- [flows/disputes.md](../flows/disputes.md) — Dispute resolution and arbitration
- [flows/withdrawals.md](../flows/withdrawals.md) — Withdrawal processing
- [flows/onboarding.md](../flows/onboarding.md) — Actor onboarding and identity setup
