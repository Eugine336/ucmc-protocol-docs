/**
 * Ed25519 identity management for UCMC actors.
 *
 * Handles keypair generation, actor ID derivation, and key serialization.
 * Actor IDs are deterministically derived from public keys via
 * `SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)`.
 *
 * @see crypto/identity-and-signing.md — actor identity model
 */

import * as ed25519 from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { Domains } from "./signals.js";
import type { ActorId, PublicKeyHex, PrivateKeyHex } from "./types.js";

/** An Ed25519 keypair (raw bytes). */
export interface Keypair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

/** Generate a new Ed25519 keypair. */
export async function generateKeypair(): Promise<Keypair> {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  return { publicKey, privateKey };
}

/**
 * Derive the canonical actor ID from a public key.
 *
 * The actor ID is `SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)` — a
 * deterministic, collision-resistant identifier that binds an actor to
 * their Ed25519 key material.
 */
export function deriveActorId(publicKey: Uint8Array | PublicKeyHex): ActorId {
  const pubHex =
    typeof publicKey === "string" ? publicKey : bytesToHex(publicKey);
  const preimage = new TextEncoder().encode(`${Domains.ACTOR_ID}:${pubHex}`);
  return bytesToHex(sha256(preimage));
}

/**
 * Encode a private key as hex for storage.
 *
 * Production implementations should layer AES-256-GCM encryption under
 * a PBKDF2-derived key. See crypto/identity-and-signing.md for details.
 */
export function privateKeyToHex(privateKey: Uint8Array): PrivateKeyHex {
  return bytesToHex(privateKey);
}

/** Restore a keypair from a hex-encoded private key. */
export async function keypairFromHex(
  privateKeyHex: PrivateKeyHex,
): Promise<Keypair> {
  const privateKey = hexToBytes(privateKeyHex);
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  return { publicKey, privateKey };
}

/** Get the hex-encoded public key from a keypair. */
export function publicKeyHex(keypair: Keypair): PublicKeyHex {
  return bytesToHex(keypair.publicKey);
}
