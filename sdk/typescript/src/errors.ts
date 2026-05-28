/**
 * Typed error classes for common UCMC API error codes.
 *
 * The API returns errors in a standard envelope:
 * `{ ok: false, error: { code: string, message: string } }`
 *
 * These classes map known error codes to typed exceptions for
 * ergonomic error handling in client code.
 *
 * @see api/README.md — error envelope specification
 */

/** Base error class for all UCMC API errors. */
export class UcmcApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "UcmcApiError";
  }
}

/** The server detected a replayed request (duplicate nonce). */
export class ReplayDetectedError extends UcmcApiError {
  constructor() {
    super("replay_detected", "Request replay detected", 409);
  }
}

/** Request timestamp is outside the acceptable drift window. */
export class TimestampDriftError extends UcmcApiError {
  constructor() {
    super(
      "timestamp_drift_exceeded",
      "Request timestamp drift exceeds tolerance",
      400,
    );
  }
}

/** Ed25519 signature did not verify against the payload. */
export class SignatureInvalidError extends UcmcApiError {
  constructor() {
    super("signature_invalid", "Ed25519 signature did not verify", 403);
  }
}

/** The requested action requires a completed KYC verification. */
export class KycRequiredError extends UcmcApiError {
  constructor() {
    super("kyc_required", "Action requires KYC verification", 403);
  }
}

/** The actor's account is under a compliance freeze. */
export class AccountFrozenError extends UcmcApiError {
  constructor() {
    super("account_frozen", "Account is under a compliance freeze", 403);
  }
}

/** The idempotency key has already been used for a different request. */
export class IdempotencyConflictError extends UcmcApiError {
  constructor() {
    super("idempotency_conflict", "Idempotency key collision", 409);
  }
}

/** Map an API error response body to a typed error. */
export function fromResponseError(
  body: { error?: { code: string; message: string } },
  status: number,
): UcmcApiError {
  const code = body.error?.code ?? "unknown_error";
  const msg = body.error?.message ?? "Unknown error";
  switch (code) {
    case "replay_detected":
      return new ReplayDetectedError();
    case "timestamp_drift_exceeded":
      return new TimestampDriftError();
    case "signature_invalid":
      return new SignatureInvalidError();
    case "kyc_required":
      return new KycRequiredError();
    case "account_frozen":
      return new AccountFrozenError();
    case "idempotency_conflict":
      return new IdempotencyConflictError();
    default:
      return new UcmcApiError(code, msg, status);
  }
}
