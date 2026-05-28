# @ucmc/sdk — TypeScript Reference Implementation

> **Status:** Reference implementation — illustrative, not published to npm.
> Mirror this code into your project, or use as the basis for an official SDK
> once UCMC begins distributing one.

## Install

This package depends on the [noble](https://paulmillr.com/noble/) cryptography libraries:

```bash
# Add @noble/ed25519 and @noble/hashes to your project
npm install @noble/ed25519 @noble/hashes

# Then copy the contents of src/ into your codebase,
# or import from this repo directly.
```

## Quickstart

```typescript
import { generateKeypair, deriveActorId } from "./src/identity.js";
import { buildCanonical, signMutation } from "./src/signing.js";
import { Signals } from "./src/signals.js";

// 1. Generate a keypair and derive the actor ID
const keypair = await generateKeypair();
const actorId = deriveActorId(keypair.publicKey);

// 2. Build a canonical payload for a marketplace hire
const canonical = buildCanonical({
  actorId,
  signal: Signals.DEMAND,
  metadata: { targetId: "...", catalogueId: "cat_001", price: "50000", deliveryDays: 7 },
  contextHash: "0".repeat(64),
  idempotencyKey: crypto.randomUUID(),
});

// 3. Sign the mutation
const envelope = await signMutation({
  canonical,
  privateKey: keypair.privateKey,
  publicKey: keypair.publicKey,
  metadata: canonical,
});

// envelope is the JSON body to POST to /api/control
```

## Modules

| Module | Exports | Purpose |
|---|---|---|
| `identity` | `generateKeypair`, `deriveActorId`, `keypairFromHex`, `publicKeyHex` | Ed25519 keypair + actor ID derivation |
| `signing` | `buildCanonical`, `signMutation`, `signRead` | Construct + sign requests |
| `verify` | `verifyMutation`, `verifyRead`, `verifyOtp`, `verifyDocumentHash` | Independent verification |
| `canonical` | `stableStringify` | RFC-8785-style deterministic JSON |
| `client` | `UcmcClient` | High-level HTTP client |
| `errors` | `UcmcApiError`, `fromResponseError`, typed error classes | Error handling |
| `signals` | `Signals`, `Domains` | Protocol constants (22 opcodes, 16 signing domains) |
| `types` | all shared types | TypeScript type surface |

## API Surface

### Identity

| Function | Description |
|---|---|
| `generateKeypair()` | Generate a new Ed25519 keypair |
| `deriveActorId(publicKey)` | Derive actor ID via `SHA-256("UCMC_ACTOR_ID_V3:" + pubHex)` |
| `keypairFromHex(privateKeyHex)` | Restore a keypair from a hex-encoded private key |
| `publicKeyHex(keypair)` | Get hex-encoded public key |
| `privateKeyToHex(privateKey)` | Encode private key as hex for storage |

### Signing

| Function | Description |
|---|---|
| `buildCanonical(input)` | Build canonical UCMC_AUTH_PAYLOAD_V4 payload |
| `signMutation(opts)` | Sign with UCMC_VERIFY_V6 envelope → `SignedMutationEnvelope` |
| `signRead(opts)` | Build signed-read headers for GET requests |

### Verification

| Function | Description |
|---|---|
| `verifyMutation(opts)` | Verify a signed mutation (drift + metadata hash + Ed25519) |
| `verifyRead(opts)` | Verify signed-read headers against a path |
| `verifyOtp(opts)` | Verify an email OTP with constant-time comparison |
| `verifyDocumentHash(content, hash)` | Verify document content integrity |

### Client

| Method | Signal | Description |
|---|---|---|
| `signedMutation(signal, metadata)` | any | Generic signed POST |
| `signedGet(path)` | — | Generic signed GET |
| `hireSeller(opts)` | `0x53` | Lock escrow and create contract |
| `confirmDelivery(traceId)` | `0x65` | Confirm delivery, release escrow |
| `submitReview(opts)` | `0x66` | Submit cryptographically signed review |
| `openDispute(opts)` | `0x10` | Open a dispute |
| `startKyc()` | `0x90` | Initiate KYC verification |
| `acceptTerms()` | `0x69` | Accept platform terms |
| `bindEmail(email)` | `0x68` | Bind email to actor identity |
| `requestWithdrawal(opts)` | `0x70` | Request withdrawal from free balance |
| `getBalance()` | — | Get wallet balance |
| `getKycStatus()` | — | Get KYC verification status |
| `searchMarketplace(query)` | — | Search marketplace listings |
| `getOnboardingStatus()` | — | Get onboarding progress |

## Examples

| File | Description |
|---|---|
| `examples/01-create-actor.ts` | Generate keypair, derive actor ID |
| `examples/02-sign-mutation.ts` | Build and sign a marketplace hire (0x53) |
| `examples/03-signed-read.ts` | Build signed-read headers for a balance query |
| `examples/04-marketplace-flow.ts` | End-to-end buyer journey (search → hire → deliver → review) |
| `examples/05-verify-otp.ts` | Server-side OTP verification |
| `examples/06-verify-document-hash.ts` | Independent document integrity verification |

## Dependencies

- **@noble/ed25519** (^2.1.0) — Ed25519 signatures (async API)
- **@noble/hashes** (^1.4.0) — SHA-256

No Node.js-specific imports. Uses `crypto.getRandomValues` and `TextEncoder`
which are available in all modern runtimes (browsers, Deno, Bun, Node 18+).

## License

Apache-2.0

## See Also

- [Verification Examples](../../verification/README.md) — bare cryptographic primitives
- [Event Schemas](../../events/schemas.md) — signal opcode catalog
- [OpenAPI Spec](../../api/openapi.yaml) — full API surface
- [Identity & Signing](../../crypto/identity-and-signing.md) — authoritative protocol description
