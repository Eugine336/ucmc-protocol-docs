# Verification Examples

TypeScript reference implementations for core UCMC cryptographic operations. These examples are for developers building clients, verifiers, or integrations against the protocol.

## Cryptographic Primitives

UCMC uses the following primitives:

- **Ed25519** — all actor signatures (mutations and reads)
- **SHA-256** — actor ID derivation, content hashes, OTP hashes, domain-separated preimages
- **AES-256-GCM** — client-side encryption of private key material at rest
- **PBKDF2 / HKDF** — key stretching and derivation from passphrases
- **Poseidon** — arithmetic-friendly hash for zero-knowledge circuits
- **Merkle trees** — audit chain integrity and selective disclosure proofs

See [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) for the full cryptographic model.

---

## 1. Deriving an Actor ID

An actor ID is a deterministic derivation from the actor's Ed25519 public key, scoped by the `UCMC_ACTOR_ID_V3` signing domain.

```typescript
import { createHash } from "node:crypto";

function deriveActorId(publicKeyHex: string): string {
  return createHash("sha256")
    .update(`UCMC_ACTOR_ID_V3:${publicKeyHex}`)
    .digest("hex");
}
```

---

## 2. Building a Canonical Payload

Every mutation is signed over a canonical payload that binds the actor, signal, metadata hash, and timing information into a single deterministic structure.

The payload uses the `UCMC_AUTH_PAYLOAD_V4` signing domain. A **deterministic JSON serializer** (`stableStringify`) is required — see §9 for implementation notes.

```typescript
type CanonicalPayload = {
  d: "UCMC_AUTH_PAYLOAD_V4";
  actorId: string;
  targetId: string;
  signal: string;            // hex opcode, e.g. "0x53"
  metadataHash: string;      // SHA-256(stableStringify(metadata))
  contextHash: string;
  idempotencyKey: string;
  timestamp: number;
};

function buildCanonical(
  payload: Omit<CanonicalPayload, "d">
): CanonicalPayload {
  return { d: "UCMC_AUTH_PAYLOAD_V4", ...payload };
}
```

---

## 3. Signing a Mutation

The canonical payload is wrapped in a `UCMC_VERIFY_V6` verification envelope before signing. This two-layer structure separates the payload domain from the verification domain.

```typescript
import { sign as edSign } from "@noble/ed25519";

// stableStringify: deterministic JSON serializer (see §9)

async function signMutation(
  canonical: CanonicalPayload,
  privateKey: Uint8Array
): Promise<{ signature: string; envelope: { d: string; p: string } }> {
  const envelope = {
    d: "UCMC_VERIFY_V6",
    p: stableStringify(canonical),
  };
  const message = new TextEncoder().encode(stableStringify(envelope));
  const sig = await edSign(message, privateKey);
  return { signature: Buffer.from(sig).toString("hex"), envelope };
}
```

---

## 4. Verifying a Mutation Signature

Verification rebuilds the envelope from the canonical payload and checks the Ed25519 signature. Timestamp drift is enforced before cryptographic verification.

```typescript
import { verify as edVerify } from "@noble/ed25519";

async function verifyMutation(
  canonical: CanonicalPayload,
  signatureHex: string,
  publicKey: Uint8Array
): Promise<boolean> {
  // Reject if timestamp drift exceeds ±60 seconds
  if (Math.abs(Date.now() - canonical.timestamp) > 60_000) return false;

  // Rebuild the verification envelope
  const envelope = {
    d: "UCMC_VERIFY_V6",
    p: stableStringify(canonical),
  };
  const message = new TextEncoder().encode(stableStringify(envelope));
  return edVerify(Buffer.from(signatureHex, "hex"), message, publicKey);
}
```

---

## 5. Signing a Read Request

Read requests are authenticated via signed HTTP headers rather than a body envelope. The signature covers a preimage scoped by `UCMC_READ_AUTH_V1`.

```typescript
import { sign as edSign } from "@noble/ed25519";
import { createHash, randomBytes } from "node:crypto";

async function signRead(
  actorId: string,
  publicKeyHex: string,
  privateKey: Uint8Array,
  path: string
): Promise<{ headers: Record<string, string> }> {
  const timestamp = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const preimage = `UCMC_READ_AUTH_V1:${actorId}:${timestamp}:${nonce}:${path}`;
  const digest = createHash("sha256").update(preimage).digest();
  const sig = await edSign(digest, privateKey);
  return {
    headers: {
      "x-actor-id": actorId,
      "x-public-key": publicKeyHex,
      "x-timestamp": timestamp,
      "x-nonce": nonce,
      "x-signature": Buffer.from(sig).toString("hex"),
    },
  };
}
```

---

## 6. Verifying an Email OTP

Email OTPs are verified by comparing the submitted OTP hash against the stored hash. The hash is domain-separated by `UCMC_EMAIL_OTP_V1` and bound to the actor ID.

```typescript
import { createHash, timingSafeEqual } from "node:crypto";

function verifyOtp(
  actorId: string,
  submitted: string,
  storedHashHex: string
): boolean {
  const computed = createHash("sha256")
    .update(`UCMC_EMAIL_OTP_V1:${actorId}:${submitted}`)
    .digest();
  const stored = Buffer.from(storedHashHex, "hex");
  return (
    computed.length === stored.length && timingSafeEqual(computed, stored)
  );
}
```

---

## 7. Verifying a Document Content Hash

Legal documents and content payloads carry a SHA-256 content hash for integrity verification.

```typescript
import { createHash } from "node:crypto";

function verifyDocumentHash(
  content: string,
  expectedHashHex: string
): boolean {
  const actual = createHash("sha256").update(content, "utf8").digest("hex");
  return actual === expectedHashHex;
}
```

---

## 8. Replay Protection

The protocol enforces three layers of replay protection:

- **Nonce uniqueness** — each actor's nonces are tracked in a bounded window; reused nonces are rejected.
- **Timestamp drift** — requests with timestamps more than ±60 seconds from server time are rejected before signature verification.
- **Idempotency key** — duplicate idempotency keys return the original response without re-executing the mutation.

---

## 9. Deterministic JSON Serialization

Production verifiers must use a deterministic serializer (RFC 8785 JSON Canonicalization Scheme or equivalent). The critical property: identical logical objects must always produce identical byte sequences, regardless of key insertion order.

Reference implementation:

```typescript
function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) =>
      JSON.stringify(k) +
      ":" +
      stableStringify((obj as Record<string, unknown>)[k])
  );
  return "{" + pairs.join(",") + "}";
}
```

This implementation sorts object keys lexicographically and recurses into nested structures. It does not handle edge cases like `undefined` values, `BigInt`, or circular references — production implementations should account for these.

---

## See Also

- [crypto/identity-and-signing.md](../crypto/identity-and-signing.md) — Full cryptographic specification
- [events/schemas.md](../events/schemas.md) — Signal opcode catalog and request envelope shape
- [flows/onboarding.md](../flows/onboarding.md) — Actor identity creation and onboarding
- [flows/marketplace-transaction.md](../flows/marketplace-transaction.md) — Escrow lifecycle (HIRE → LOCK → DELIVER → FINALIZE)
