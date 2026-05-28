/**
 * Protocol signal opcodes and signing domain constants.
 *
 * Signal opcodes identify the type of state-changing operation in a
 * signed mutation envelope. Signing domains are prefixed to preimages
 * to prevent cross-context signature reuse.
 *
 * @see events/schemas.md — signal opcode catalog with payload shapes
 * @see crypto/identity-and-signing.md — signing domain specification
 */

/** All public signal opcodes. */
export const Signals = {
  // Identity & actor
  PROFILE_UPDATE: "0x61",
  DELIVERY_CONFIRM: "0x65",
  REVIEW_SUBMIT: "0x66",
  EMAIL_BIND: "0x68",
  TERMS_ACCEPT: "0x69",

  // Escrow & contract
  LOCK: "0x02",
  RELEASE: "0x04",
  FINALIZE: "0x05",
  DEMAND: "0x53",

  // Disputes
  DISPUTE_OPEN: "0x10",
  DISPUTE_VOTE: "0x11",
  DISPUTE_EVIDENCE: "0x13",

  // Financial
  WITHDRAWAL_REQUEST: "0x70",
  DEPOSIT_INITIATE: "0x80",
  PAYOUT_METHOD_SET: "0x99",

  // KYC & compliance
  KYC_START: "0x90",
  KYC_VERIFIED: "0x91",
  KYC_REJECTED: "0x92",

  // Legal & misc
  LEGAL_SIGN: "0x93",
  ETH_BIND: "0x95",
  ONBOARDING_COMPLETE: "0xa8",
  TAX_PROFILE_SET: "0xa9",
} as const;

/** Signal name union (keys of the Signals object). */
export type SignalName = keyof typeof Signals;

/** Signing domain prefixes for all UCMC signature contexts. */
export const Domains = {
  ACTOR_ID: "UCMC_ACTOR_ID_V3",
  AUTH_PAYLOAD: "UCMC_AUTH_PAYLOAD_V4",
  VERIFY_ENVELOPE: "UCMC_VERIFY_V6",
  READ_AUTH: "UCMC_READ_AUTH_V1",
  METADATA_BIND: "UCMC_METADATA_BIND_V2",
  SIGNATURE_ID: "UCMC_SIGNATURE_ID_V1",
  POW: "UCMC_POW_V4",
  GOVERNANCE: "UCMC_GOVERNANCE_V2",
  EMAIL_OTP: "UCMC_EMAIL_OTP_V1",
  EMAIL_BIND: "UCMC_EMAIL_BIND_V1",
  ETH_BIND: "UCMC_ETH_BIND_V1",
  GDPR_VERIFY: "UCMC_GDPR_VERIFY_V1",
  DOC_DEDUP: "UCMC_DOC_DEDUP_V1",
  LISTING_UID: "UCMC_LISTING_UID_V1",
  MSG_PLAIN: "UCMC_MSG_PLAIN_V1",
  RECOVERY_GUARDIAN_EMAIL: "UCMC_RECOVERY_GUARDIAN_EMAIL_V1",
} as const;

/** Domain name union (keys of the Domains object). */
export type DomainName = keyof typeof Domains;
