# UCMC Protocol — API Documentation

This directory contains the machine-readable API specification and reference documentation for the UCMC protocol's public HTTP surface.

## Overview

The UCMC API uses a cryptographic authentication model where every actor is identified by an Ed25519 public key. There are two authentication modes:

### Signed mutations (writes)

State-changing operations use a **signed body envelope**. The request body contains:

| Field | Type | Description |
|-------|------|-------------|
| `actorId` | hex string (64 chars) | SHA-256 of the actor's public key |
| `publicKey` | hex string (64 chars) | Ed25519 public key |
| `signature` | hex string (128 chars) | Ed25519 signature over the canonical payload |
| `signal` | hex opcode (e.g. `0x53`) | Determines the mutation type |
| `metadata` | object | Signal-specific payload |
| `timestamp` | integer | Milliseconds since Unix epoch |
| `nonce` | string | One-time value for replay protection |
| `idempotencyKey` | string | Client-generated idempotency key |
| `proof` | object | Optional contextHash and proofHash |

The universal mutation endpoint is `POST /control`. The `signal` opcode determines which action is performed.

### Signed reads (queries)

Read operations use **signed headers**:

| Header | Description |
|--------|-------------|
| `x-actor-id` | Actor ID (hex) |
| `x-public-key` | Ed25519 public key (hex) |
| `x-timestamp` | Milliseconds since epoch |
| `x-nonce` | One-time nonce |
| `x-signature` | Signature over the canonical header string |

### Error envelope

All error responses follow a standard shape:

```json
{
  "ok": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable message"
  }
}
```

Common error codes:

| Code | HTTP | Meaning |
|------|------|---------|
| `timestamp_drift_exceeded` | 400 | Request timestamp outside acceptable window |
| `unauthorized` | 401 | Missing or invalid signature |
| `forbidden` | 403 | Authenticated but lacks permission |
| `replay_detected` | 409 | Nonce already consumed |
| `idempotency_conflict` | 409 | Different mutation committed with same idempotency key |
| `rate_limited` | 429 | Too many requests |
| `signature_invalid` | 401 | Signature verification failed |

## Route groups

The API surface is organized into the following groups:

| Tag | Prefix(es) | Description |
|-----|-----------|-------------|
| identity | `/auth`, `/onboarding`, `/kyc` | Authentication, onboarding, identity verification |
| profiles | `/profile`, `/portfolio`, `/listing` | Profiles, portfolios, catalogue, listings |
| discovery | `/marketplace`, `/match` | Marketplace search, matching engine |
| protocol | `/challenge`, `/control`, `/capability`, `/read`, `/value` | Core protocol primitives |
| content | `/delivery`, `/analytics`, `/storage`, `/templates` | Delivery, analytics, file storage, templates |
| disputes | `/dispute`, `/support` | Dispute resolution, support tickets |
| reputation | `/reputation` | Reviews and reputation scores |
| communication | `/messaging`, `/notification`, `/stream`, `/events` | Messaging, notifications, SSE streams |
| financial | `/payment`, `/wallet`, `/tax` | Payments, wallet, withdrawals, tax |
| legal | `/legal`, `/compliance` | Legal documents, GDPR, compliance |
| recovery | `/recovery` | Account recovery via guardian |
| audit | `/audit` | Audit trail access and verification |
| governance | `/governance` | Protocol governance, proposals, voting |

## Machine-readable spec

The full OpenAPI 3.1 specification is at [`api/openapi.yaml`](./openapi.yaml). It documents every public endpoint with request/response schemas, auth requirements, and error envelopes.

## See also

- [api/openapi.yaml](./openapi.yaml) — OpenAPI 3.1 machine-readable specification
- [verification/README.md](../verification/README.md) — Code examples for signing and verifying requests
- [events/schemas.md](../events/schemas.md) — Signal opcode catalog and payload shapes
- [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) — Ed25519 identity model and signing domains
- [architecture/overview.md](../architecture/overview.md) — System architecture overview
