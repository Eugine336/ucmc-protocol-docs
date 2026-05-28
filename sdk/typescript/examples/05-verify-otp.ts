/**
 * Example 05 — Verify an Email OTP (server-side)
 *
 * Given a stored OTP hash and an actor's submitted 6-digit code,
 * verifies the code using HMAC-style domain separation and
 * constant-time comparison.
 *
 * The OTP hash is: SHA-256("UCMC_EMAIL_OTP_V1:<actorId>:<code>")
 *
 * @see crypto/identity-and-signing.md — OTP verification
 * @see sdk/typescript/src/verify.ts — verifyOtp implementation
 */

import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { verifyOtp } from "../src/verify.js";
import { Domains } from "../src/signals.js";
import { deriveActorId, generateKeypair } from "../src/identity.js";

async function main() {
  const keypair = await generateKeypair();
  const actorId = deriveActorId(keypair.publicKey);
  const correctCode = "482917";

  const storedHash = bytesToHex(
    sha256(
      new TextEncoder().encode(
        `${Domains.EMAIL_OTP}:${actorId}:${correctCode}`,
      ),
    ),
  );

  console.log("=== OTP Verification (Server-Side) ===");
  console.log(`Actor ID:     ${actorId}`);
  console.log(`Stored hash:  ${storedHash}`);
  console.log();

  const validResult = verifyOtp({
    actorId,
    submitted: correctCode,
    storedHashHex: storedHash,
  });
  console.log(`Correct code (${correctCode}): ${validResult ? "PASS" : "FAIL"}`);

  const invalidResult = verifyOtp({
    actorId,
    submitted: "000000",
    storedHashHex: storedHash,
  });
  console.log(`Wrong code   (000000): ${invalidResult ? "PASS" : "FAIL"}`);
}

main().catch(console.error);
