/**
 * Example 06 — Verify a Document Content Hash
 *
 * Independent verifier example: given a legal document's text and its
 * claimed content hash, verify the integrity of the document.
 *
 * @see crypto/identity-and-signing.md — document hashing
 * @see sdk/typescript/src/verify.ts — verifyDocumentHash implementation
 */

import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { verifyDocumentHash } from "../src/verify.js";

function main() {
  const documentContent = [
    "UCMC Service Agreement — Version 2026.1",
    "",
    "1. The Buyer agrees to fund escrow before work begins.",
    "2. The Seller agrees to deliver within the contracted timeframe.",
    "3. Disputes are resolved via the UCMC arbitration protocol.",
    "4. All actions are cryptographically signed and immutable.",
  ].join("\n");

  const contentHash = bytesToHex(
    sha256(new TextEncoder().encode(documentContent)),
  );

  console.log("=== Document Hash Verification ===");
  console.log(`Content hash: ${contentHash}`);
  console.log();

  const isValid = verifyDocumentHash(documentContent, contentHash);
  console.log(`Original document:  ${isValid ? "VALID" : "INVALID"}`);

  const tampered = documentContent.replace("Version 2026.1", "Version 2026.2");
  const isTampered = verifyDocumentHash(tampered, contentHash);
  console.log(`Tampered document:  ${isTampered ? "VALID" : "INVALID"}`);
}

main();
