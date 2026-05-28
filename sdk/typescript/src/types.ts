/**
 * Shared type definitions for the UCMC protocol SDK.
 *
 * These types model the core protocol surface: actor identities, signed
 * envelopes, signal opcodes, API responses, and domain-specific status enums.
 *
 * @see crypto/identity-and-signing.md — authoritative protocol description
 * @see events/schemas.md — signal opcode catalog
 * @see api/openapi.yaml — full API surface
 */

/** 64-character hex-encoded SHA-256 hash of `UCMC_ACTOR_ID_V3:<publicKeyHex>`. */
export type ActorId = string;

/** 64-character hex-encoded Ed25519 public key. */
export type PublicKeyHex = string;

/** 64-character hex-encoded Ed25519 private key. */
export type PrivateKeyHex = string;

/** 128-character hex-encoded Ed25519 signature. */
export type SignatureHex = string;

/** Protocol signal opcode (e.g. `"0x53"`). */
export type SignalOpcode = string;

/** Hex-encoded random nonce for replay protection. */
export type Nonce = string;

/** Milliseconds since Unix epoch. */
export type Timestamp = number;

/** Distributed trace identifier. */
export type TraceId = string;

/** Client-generated idempotency key (UUID v4 recommended). */
export type IdempotencyKey = string;

/** Monetary amount in minor units, represented as a string to avoid precision loss. */
export type MoneyMinor = string;

/** Signed mutation envelope — the standard POST body for state-changing requests. */
export interface SignedMutationEnvelope {
  actorId: ActorId;
  publicKey: PublicKeyHex;
  signature: SignatureHex;
  signal: SignalOpcode;
  metadata: Record<string, unknown>;
  timestamp: Timestamp;
  nonce: Nonce;
  traceId?: TraceId;
  idempotencyKey: IdempotencyKey;
  proof?: { contextHash: string; proofHash: string };
}

/** Standard API response wrapper. */
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

/** KYC verification status. */
export type KycStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | "SANCTIONS_HIT";

/** Withdrawal lifecycle status. */
export type WithdrawalStatus =
  | "PENDING"
  | "TIMELOCKED"
  | "RELEASED"
  | "CANCELLED";

/** Withdrawal settlement status (provider-side). */
export type WithdrawalSettlementStatus =
  | "SUBMITTED"
  | "SETTLED"
  | "FAILED";

/** Dispute lifecycle status. */
export type DisputeStatus =
  | "OPEN"
  | "EVIDENCE"
  | "VOTING"
  | "RESOLVED"
  | "CANCELLED";

/** Dispute resolution outcome. */
export type DisputeOutcome =
  | "BUYER"
  | "SELLER"
  | "SPLIT"
  | "CANCELLED";

/** Delivery mode for marketplace transactions. */
export type DeliveryMode = "FILE" | "ACCESS" | "MANUAL";

/** Actor marketplace role. */
export type ActorRole = "BUYER" | "SELLER" | "BOTH";

/** Actor wallet balance breakdown. */
export interface Balance {
  free: MoneyMinor;
  in_escrow: MoneyMinor;
  in_withdrawal: MoneyMinor;
}

/** Escrow lifecycle status. */
export type EscrowStatus =
  | "LOCKED"
  | "RELEASED"
  | "FINALIZED"
  | "DISPUTED"
  | "CANCELLED";

/** Marketplace listing status. */
export type ListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "REMOVED";

/** Onboarding step status. */
export type OnboardingStepStatus = "PENDING" | "COMPLETE" | "SKIPPED";
