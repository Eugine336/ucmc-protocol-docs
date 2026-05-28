/**
 * Example 01 — Create an Actor
 *
 * Generates a new Ed25519 keypair and derives the UCMC actor ID.
 * The actor ID is SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex).
 *
 * @see crypto/identity-and-signing.md — actor identity model
 * @see sdk/typescript/src/identity.ts — implementation
 */

import { generateKeypair, deriveActorId, privateKeyToHex } from "../src/identity.js";
import { bytesToHex } from "@noble/hashes/utils";

async function main() {
  const keypair = await generateKeypair();

  const publicKeyHex = bytesToHex(keypair.publicKey);
  const privateKeyHex = privateKeyToHex(keypair.privateKey);
  const actorId = deriveActorId(keypair.publicKey);

  console.log("=== UCMC Actor Created ===");
  console.log(`Public key:  ${publicKeyHex}`);
  console.log(`Private key: ${privateKeyHex}`);
  console.log(`Actor ID:    ${actorId}`);
  console.log();
  console.log("The actor ID is deterministic:");
  console.log(`  SHA-256("UCMC_ACTOR_ID_V3:${publicKeyHex}")`);
  console.log(`  = ${actorId}`);
}

main().catch(console.error);
