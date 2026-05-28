/**
 * Example 03 — Signed Read Request
 *
 * Builds signed-read headers for GET /wallet/balance/:actorId and
 * logs the 5 authentication headers.
 *
 * @see crypto/identity-and-signing.md — read authentication
 * @see sdk/typescript/src/signing.ts — signRead implementation
 */

import { generateKeypair, deriveActorId } from "../src/identity.js";
import { signRead } from "../src/signing.js";

async function main() {
  const keypair = await generateKeypair();
  const actorId = deriveActorId(keypair.publicKey);

  const path = `/api/wallet/balance/${actorId}`;
  const headers = await signRead({
    actorId,
    publicKey: keypair.publicKey,
    privateKey: keypair.privateKey,
    path,
  });

  console.log("=== Signed Read Headers ===");
  console.log(`GET ${path}`);
  console.log();
  for (const [key, value] of Object.entries(headers)) {
    console.log(`  ${key}: ${value}`);
  }
  console.log();
  console.log("The server reconstructs the same preimage and verifies the signature:");
  console.log(`  UCMC_READ_AUTH_V1:\${actorId}:\${timestamp}:\${nonce}:\${path}`);
}

main().catch(console.error);
