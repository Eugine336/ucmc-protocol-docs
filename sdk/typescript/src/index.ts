/**
 * Public API surface of the @ucmc/sdk package.
 *
 * Re-exports all modules so consumers can import from the package root:
 * ```typescript
 * import { generateKeypair, UcmcClient, Signals } from "@ucmc/sdk";
 * ```
 */

export * from "./identity.js";
export * from "./signing.js";
export * from "./verify.js";
export * from "./canonical.js";
export * from "./client.js";
export * from "./errors.js";
export * from "./signals.js";
export * from "./types.js";
