# Identity and Cryptographic Authentication

## What this is

UCMC uses a cryptographic actor model based on Ed25519 keypairs. Actor identity is bound to public keys, and protocol requests are authenticated by digital signatures instead of password-session tokens.

## Why it exists

The protocol is designed to make identity proofs and event authorship independently verifiable.

- **Non-repudiation:** verifiable signatures bind protocol actions to actors.
- **Audit integrity:** signed events can be validated without trusting a single runtime node.
- **No password database:** identity is key-based rather than password-table based.
- **Portability:** actor identity can be verified across environments that share protocol rules.

## Actor lifecycle

1. **Actor creation**
   - Client generates an Ed25519 keypair.
   - Actor ID is derived with:
     - `SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)`
   - Key material is encrypted client-side before local persistence.
2. **Session unlock**
   - Client decrypts key material locally and loads signing keys into runtime memory.
3. **Protocol actions**
   - State-changing operations use signed mutation envelopes.
   - Read operations use signed read headers.
4. **Session end**
   - Client clears in-memory signing material and local session state.

## Authentication paths

UCMC uses two signature paths with different canonical formats.

### Path A: Signed mutations

Used for state-changing protocol operations.

Canonical payload:

```json
{
  "d": "UCMC_AUTH_PAYLOAD_V4",
  "actorId": "<actor-id>",
  "targetId": "<target-id>",
  "signal": "<hex-signal>",
  "metadataHash": "<hash>",
  "contextHash": "<hash>",
  "idempotencyKey": "<idempotency-key>",
  "timestamp": "<unix-ms>"
}
```

Envelope and signing:

```json
{
  "d": "UCMC_VERIFY_V6",
  "p": "<stable-serialized-canonical-payload>"
}
```

The signed request body includes actor identity fields, signature, signal, metadata, timestamp, nonce, and proof material when required.

Server verification:

1. Validate request structure.
2. Rebuild canonical payload and envelope.
3. Verify Ed25519 signature.
4. Enforce replay protection.
5. Accept or reject transition before event ingestion.

### Path B: Signed reads

Used for read operations.

Client preimage:

`UCMC_READ_AUTH_V1:actorId:timestamp:nonce:path`

Client computes SHA-256 digest of the preimage, signs raw digest bytes with Ed25519, and sends:

- `x-actor-id`
- `x-public-key`
- `x-timestamp`
- `x-nonce`
- `x-signature`

Server verification:

1. Rebuild preimage from headers and request path.
2. Recompute SHA-256 digest.
3. Verify Ed25519 digest signature.
4. Claim nonce once and bind request to actor context.

### Critical difference

|  | Signed mutations | Signed reads |
|---|---|---|
| What is signed | Canonical payload wrapped in `UCMC_VERIFY_V6` | Raw SHA-256 digest of `UCMC_READ_AUTH_V1` preimage |
| Signature transport | Request body | Request headers |
| Replay token placement | Request payload | Request headers |

## Signing domain strings

### Core auth domains

| Domain | Purpose |
|---|---|
| `UCMC_ACTOR_ID_V3` | Actor ID derivation domain |
| `UCMC_VERIFY_V6` | Mutation signature envelope domain |
| `UCMC_AUTH_PAYLOAD_V4` | Canonical payload domain for mutations |
| `UCMC_READ_AUTH_V1` | Read preimage domain |
| `UCMC_METADATA_BIND_V2` | Metadata hash-binding domain |
| `UCMC_SIGNATURE_ID_V1` | Deterministic signature ID derivation |
| `UCMC_POW_V4` | Proof-of-work challenge domain |

### Feature-specific domains

| Domain | Purpose |
|---|---|
| `UCMC_GOVERNANCE_V2` | Governance vote signing |
| `UCMC_EMAIL_OTP_V1` | Email OTP generation |
| `UCMC_EMAIL_BIND_V1` | Email binding verification |
| `UCMC_ETH_BIND_V1` | Ethereum address binding |
| `UCMC_GDPR_VERIFY_V1` | GDPR export verification |
| `UCMC_DOC_DEDUP_V1` | KYC document deduplication |
| `UCMC_LISTING_UID_V1` | Listing unique ID generation |
| `UCMC_MSG_PLAIN_V1` | Message plaintext signing |
| `UCMC_RECOVERY_GUARDIAN_EMAIL_V1` | Guardian recovery verification |

Administrative, test-only, and internal platform domains are intentionally excluded from this public document.

## Replay protection

Replay protection combines:

- Nonce uniqueness checks
- Timestamp drift windows
- Idempotency controls for mutation flows

Exact operational thresholds are implementation-tuned and intentionally excluded.

## Signature failure handling

The protocol rejects invalid signatures and mismatched canonical payloads before state transition. UCMC intentionally avoids a server-side rekey backdoor endpoint; key rotation and recovery are handled through explicit protocol recovery mechanisms.

## Extending signing domains safely

When introducing a new signing domain:

1. Use a unique `UCMC_*` domain constant.
2. Version the domain explicitly (for example `_V1`, `_V2`).
3. Define canonical serialization deterministically.
4. Specify verification context and replay rules.
5. Document migration behavior before activation.