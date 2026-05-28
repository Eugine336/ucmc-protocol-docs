/**
 * Verification helpers for the UCMC protocol.
 *
 * Used by verifiers (independent auditors, counterparties, or the platform
 * itself) to validate signed mutations, signed reads, OTPs, and document
 * content hashes.
 *
 * @see crypto/identity-and-signing.md — verification specification
 * @see verification/README.md — worked TypeScript examples
 */

import * as ed25519 from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { Domains } from "./signals.js";
import { stableStringify } from "./canonical.js";
import type { CanonicalPayload } from "./signing.js";

/** Result of a verification operation. */
export interface VerifyResult {
  ok: boolean;
  reason?: "timestamp_drift" | "signature_invalid" | "metadata_mismatch";
}

/** Verify a signed mutation envelope. */
export async function verifyMutation(opts: {
  canonical: CanonicalPayload;
  signatureHex: string;
  publicKey: Uint8Array;
  metadata: Record<string, unknown>;
  driftMs?: number;
}): Promise<VerifyResult> {
  const drift = opts.driftMs ?? 60_000;
  if (Math.abs(Date.now() - opts.canonical.timestamp) > drift) {
    return { ok: false, reason: "timestamp_drift" };
  }

  const expectedMetaHash = bytesToHex(
    sha256(new TextEncoder().encode(stableStringify(opts.metadata))),
  );
  if (expectedMetaHash !== opts.canonical.metadataHash) {
    return { ok: false, reason: "metadata_mismatch" };
  }

  const envelope = {
    d: Domains.VERIFY_ENVELOPE,
    p: stableStringify(opts.canonical),
  };
  const message = new TextEncoder().encode(stableStringify(envelope));
  const isValid = await ed25519.verifyAsync(
    hexToBytes(opts.signatureHex),
    message,
    opts.publicKey,
  );
  return isValid ? { ok: true } : { ok: false, reason: "signature_invalid" };
}

/** Verify signed-read headers against a request path. */
export async function verifyRead(opts: {
  headers: {
    "x-actor-id": string;
    "x-public-key": string;
    "x-timestamp": string;
    "x-nonce": string;
    "x-signature": string;
  };
  path: string;
  driftMs?: number;
}): Promise<VerifyResult> {
  const ts = Number(opts.headers["x-timestamp"]);
  const drift = opts.driftMs ?? 60_000;
  if (Math.abs(Date.now() - ts) > drift) {
    return { ok: false, reason: "timestamp_drift" };
  }

  const preimage = `${Domains.READ_AUTH}:${opts.headers["x-actor-id"]}:${ts}:${opts.headers["x-nonce"]}:${opts.path}`;
  const digest = sha256(new TextEncoder().encode(preimage));
  const isValid = await ed25519.verifyAsync(
    hexToBytes(opts.headers["x-signature"]),
    digest,
    hexToBytes(opts.headers["x-public-key"]),
  );
  return isValid ? { ok: true } : { ok: false, reason: "signature_invalid" };
}

/** Verify an email OTP server-side using constant-time comparison. */
export function verifyOtp(opts: {
  actorId: string;
  submitted: string;
  storedHashHex: string;
}): boolean {
  const computed = sha256(
    new TextEncoder().encode(
      `${Domains.EMAIL_OTP}:${opts.actorId}:${opts.submitted}`,
    ),
  );
  const stored = hexToBytes(opts.storedHashHex);
  if (computed.length !== stored.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed[i]! ^ stored[i]!;
  return diff === 0;
}

/** Verify a legal document content hash. */
export function verifyDocumentHash(
  content: string,
  expectedHashHex: string,
): boolean {
  const actual = bytesToHex(sha256(new TextEncoder().encode(content)));
  return actual === expectedHashHex;
}
