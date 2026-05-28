/**
 * Example 02 — Sign a Mutation
 *
 * Builds a canonical payload for a marketplace hire (signal 0x53),
 * signs it with the UCMC_VERIFY_V6 envelope, and logs the full body
 * that would be POSTed to /api/control.
 *
 * @see crypto/identity-and-signing.md — signing specification
 * @see flows/marketplace-transaction.md — hire flow
 * @see sdk/typescript/src/signing.ts — implementation
 */

import { generateKeypair, deriveActorId } from "../src/identity.js";
import { buildCanonical, signMutation } from "../src/signing.js";
import { Signals } from "../src/signals.js";

async function main() {
  const keypair = await generateKeypair();
  const actorId = deriveActorId(keypair.publicKey);

  const metadata = {
    targetId: "a".repeat(64),
    catalogueId: "cat_001",
    price: "50000",
    deliveryDays: 7,
  };

  const canonical = buildCanonical({
    actorId,
    signal: Signals.DEMAND,
    metadata,
    contextHash: "0".repeat(64),
    idempotencyKey: crypto.randomUUID(),
  });

  const envelope = await signMutation({
    canonical,
    privateKey: keypair.privateKey,
    publicKey: keypair.publicKey,
    metadata,
  });

  console.log("=== Signed Mutation Envelope ===");
  console.log(JSON.stringify(envelope, null, 2));
  console.log();
  console.log("This body would be POSTed to /api/control");
  console.log(`Signal: ${Signals.DEMAND} (DEMAND / hire)`);
}

main().catch(console.error);
