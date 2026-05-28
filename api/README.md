# API Overview

## Audience

This document describes the public surface of the UCMC API. It is for developers building clients, verifiers, or integrations. Implementation code is not in this repository.

---

## Auth Model

- Every actor is identified by an **Ed25519 public key**.
- The **actor ID** is derived deterministically: `SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)`.
- **Mutations** (state-changing requests) are signed in a body envelope using the `UCMC_AUTH_PAYLOAD_V4` canonical payload wrapped in a `UCMC_VERIFY_V6` verification envelope. See [verification/README.md](../verification/README.md) §3.
- **Reads** are signed via request headers using the `UCMC_READ_AUTH_V1` domain. See [verification/README.md](../verification/README.md) §5.
- The server **never sees the private key**. Authentication is entirely signature-based — there are no sessions, cookies, or bearer tokens.

See [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) for the full cryptographic model.

---

## Request Envelopes

### Mutation Envelope (POST / PUT)

All state-changing requests submit a signed JSON body:

```json
{
  "actorId": "<actor ID>",
  "publicKey": "<Ed25519 public key, hex>",
  "signature": "<Ed25519 signature, hex>",
  "signal": "<hex opcode>",
  "metadata": { },
  "timestamp": 1716900000000,
  "nonce": "<random hex>",
  "traceId": "<UUIDv4>",
  "idempotencyKey": "<client-generated key>",
  "proof": {
    "contextHash": "<SHA-256>",
    "proofHash": "<SHA-256>"
  }
}
```

See [events/schemas.md](../events/schemas.md) §4 for the full envelope specification and the signal opcode catalog.

### Read Envelope (GET)

Read requests authenticate via five signed headers:

| Header | Value |
|---|---|
| `x-actor-id` | Actor ID (hex) |
| `x-public-key` | Ed25519 public key (hex) |
| `x-timestamp` | Unix epoch milliseconds |
| `x-nonce` | Random hex string |
| `x-signature` | Signature over `SHA-256("UCMC_READ_AUTH_V1:" + actorId + ":" + timestamp + ":" + nonce + ":" + path)` |

---

## Response Envelope

All endpoints return a consistent JSON structure:

```json
{
  "ok": true,
  "data": { }
}
```

On failure:

```json
{
  "ok": false,
  "error": {
    "code": "replay_detected",
    "message": "Nonce has already been used"
  }
}
```

---

## Error Codes

Standard HTTP status codes are used:

| Status | Meaning |
|---|---|
| `400` | Validation failure (malformed payload, missing fields) |
| `401` | Authentication failure (invalid signature, unknown actor) |
| `403` | Forbidden (actor lacks required capability or compliance gate) |
| `409` | Conflict (idempotency key collision, state precondition failure) |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

The `error.code` field provides a machine-readable identifier. Common codes include:

- `replay_detected` — nonce reuse
- `timestamp_drift_exceeded` — request timestamp outside ±60s window
- `kyc_required` — action requires completed KYC verification
- `account_frozen` — actor account is under compliance hold
- `escrow_insufficient` — insufficient escrowed balance for the operation
- `signature_invalid` — Ed25519 signature verification failed

---

## Public API Surface

The API is organized into the following route groups. Specific endpoints, methods, and schemas will be documented in a forthcoming machine-readable specification (`api/openapi.yaml`).

| Group | Scope |
|---|---|
| **Identity** | Authentication, onboarding, KYC |
| **Profiles** | Actor profiles, portfolios, catalogue listings |
| **Discovery** | Marketplace search, matching |
| **Protocol primitives** | Challenges, control, capability, reads, value |
| **Content** | Delivery, analytics, storage, templates |
| **Disputes & support** | Dispute filing and resolution, support tickets |
| **Reputation** | Reviews, scoring |
| **Communication** | Messaging, notifications, server-sent event streams |
| **Financial** | Payments, wallet, tax |
| **Legal** | Legal document signing, compliance attestation |
| **Recovery** | Account recovery flows |
| **Audit** | Audit chain queries |

---

## Rate Limits

The API enforces per-actor and per-IP rate limits. Requests that exceed limits receive a `429` response with a `Retry-After` header. Specific thresholds are an operational concern and may change without notice.

---

## Idempotency

Every mutation accepts an `idempotencyKey` field. If a request is submitted with a key that has already been processed, the server returns the original response without re-executing the action. This enables safe retries on network failures.

---

## Next

The full machine-readable specification (`api/openapi.yaml`) is a forthcoming addition.

---

## See Also

- [verification/README.md](../verification/README.md) — TypeScript reference implementations for signing and verification
- [events/schemas.md](../events/schemas.md) — Signal opcode catalog and envelope specification
- [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) — Ed25519 signing model and domain separation
- [architecture/overview.md](../architecture/overview.md) — System topology and design rationale
