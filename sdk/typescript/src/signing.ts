/**
 * Mutation and read-request signing for the UCMC protocol.
 *
 * Mutations are signed using the UCMC_VERIFY_V6 envelope wrapping a
 * canonical UCMC_AUTH_PAYLOAD_V4 payload. Read requests use signed
 * headers with the UCMC_READ_AUTH_V1 domain.
 *
 * @see crypto/identity-and-signing.md — signing specification
 * @see verification/README.md — worked TypeScript examples
 */

import * as ed25519 from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { Domains } from "./signals.js";
import { stableStringify } from "./canonical.js";
import type {
  ActorId,
  PublicKeyHex,
  SignedMutationEnvelope,
  SignalOpcode,
  IdempotencyKey,
  Timestamp,
  Nonce,
} from "./types.js";

/** The canonical payload structure bound by UCMC_AUTH_PAYLOAD_V4. */
export interface CanonicalPayload {
  d: typeof Domains.AUTH_PAYLOAD;
  actorId: ActorId;
  targetId?: ActorId;
  signal: SignalOpcode;
  metadataHash: string;
  contextHash: string;
  idempotencyKey: IdempotencyKey;
  timestamp: Timestamp;
}

/** Build a canonical payload from request metadata. */
export function buildCanonical(input: {
  actorId: ActorId;
  targetId?: ActorId;
  signal: SignalOpcode;
  metadata: Record<string, unknown>;
  contextHash: string;
  idempotencyKey: IdempotencyKey;
  timestamp?: Timestamp;
}): CanonicalPayload {
  const metadataHash = bytesToHex(
    sha256(new TextEncoder().encode(stableStringify(input.metadata))),
  );
  return {
    d: Domains.AUTH_PAYLOAD,
    actorId: input.actorId,
    targetId: input.targetId,
    signal: input.signal,
    metadataHash,
    contextHash: input.contextHash,
    idempotencyKey: input.idempotencyKey,
    timestamp: input.timestamp ?? Date.now(),
  };
}

/** Sign a canonical payload with the UCMC_VERIFY_V6 envelope. */
export async function signMutation(opts: {
  canonical: CanonicalPayload;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  metadata: Record<string, unknown>;
  nonce?: Nonce;
}): Promise<SignedMutationEnvelope> {
  const envelope = {
    d: Domains.VERIFY_ENVELOPE,
    p: stableStringify(opts.canonical),
  };
  const message = new TextEncoder().encode(stableStringify(envelope));
  const sig = await ed25519.signAsync(message, opts.privateKey);
  return {
    actorId: opts.canonical.actorId,
    publicKey: bytesToHex(opts.publicKey),
    signature: bytesToHex(sig),
    signal: opts.canonical.signal,
    metadata: opts.metadata,
    timestamp: opts.canonical.timestamp,
    nonce:
      opts.nonce ??
      bytesToHex(crypto.getRandomValues(new Uint8Array(16))),
    idempotencyKey: opts.canonical.idempotencyKey,
  };
}

/** The five signed-read headers required for authenticated GET requests. */
export interface SignedReadHeaders {
  "x-actor-id": ActorId;
  "x-public-key": PublicKeyHex;
  "x-timestamp": string;
  "x-nonce": Nonce;
  "x-signature": string;
}

/** Build signed-read headers for a GET request. */
export async function signRead(opts: {
  actorId: ActorId;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  path: string;
}): Promise<SignedReadHeaders> {
  const timestamp = Date.now().toString();
  const nonce = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const preimage = `${Domains.READ_AUTH}:${opts.actorId}:${timestamp}:${nonce}:${opts.path}`;
  const digest = sha256(new TextEncoder().encode(preimage));
  const sig = await ed25519.signAsync(digest, opts.privateKey);
  return {
    "x-actor-id": opts.actorId,
    "x-public-key": bytesToHex(opts.publicKey),
    "x-timestamp": timestamp,
    "x-nonce": nonce,
    "x-signature": bytesToHex(sig),
  };
}
