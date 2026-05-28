/**
 * Example 04 — Full Marketplace Flow
 *
 * Demonstrates the end-to-end buyer journey using the UcmcClient:
 *   search → hire → poll for delivery → confirm delivery → submit review
 *
 * This example is illustrative — it uses a mock base URL and logs
 * what each step would do. In production, each step hits the real API.
 *
 * @see flows/marketplace-transaction.md — full lifecycle
 * @see sdk/typescript/src/client.ts — client implementation
 */

import { generateKeypair } from "../src/identity.js";
import { UcmcClient } from "../src/client.js";

async function main() {
  const keypair = await generateKeypair();

  const client = new UcmcClient({
    baseUrl: "https://api.example.test",
    keypair,
  });

  console.log("=== Marketplace Flow (Illustrative) ===");
  console.log(`Actor ID: ${client.actorId}`);
  console.log();

  console.log("Step 1: Search marketplace");
  console.log("  client.searchMarketplace('typescript development')");
  console.log("  → Returns matching listings with seller profiles");
  console.log();

  console.log("Step 2: Hire seller (signal 0x53 — DEMAND)");
  console.log("  client.hireSeller({");
  console.log('    targetId: "<seller-actor-id>",');
  console.log('    catalogueId: "cat_typescript_dev",');
  console.log('    price: "150000",');
  console.log("    deliveryDays: 14,");
  console.log("  })");
  console.log("  → Locks escrow, creates contract, returns traceId");
  console.log();

  console.log("Step 3: Poll for delivery");
  console.log("  (Seller delivers via /api/delivery, buyer gets notified)");
  console.log();

  console.log("Step 4: Confirm delivery (signal 0x65)");
  console.log('  client.confirmDelivery("<delivery-trace-id>")');
  console.log("  → Releases escrow to seller");
  console.log();

  console.log("Step 5: Submit review (signal 0x66)");
  console.log("  client.submitReview({");
  console.log('    finalizeTraceId: "<finalize-trace-id>",');
  console.log("    stars: 5,");
  console.log('    body: "Excellent TypeScript work, delivered ahead of schedule.",');
  console.log('    positiveTags: ["communication", "quality"],');
  console.log("  })");
  console.log("  → Review is cryptographically signed and immutable");
  console.log();

  console.log("Flow complete. All 5 steps produce signed audit trail events.");
}

main().catch(console.error);
