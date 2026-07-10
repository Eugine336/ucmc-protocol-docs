# Changelog

All notable changes to UCMC's public protocol documentation are recorded here.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Version numbers track the public documentation surface (not the underlying
implementation, which is not in this repository). A breaking change in this
context means a renamed signing domain, a renamed signal opcode, a removed
endpoint, or a redefined invariant — anything an integrator's existing client
would need to react to.

## [Unreleased]

### Added

- **Design Constitution.** `architecture/design-constitution.md` — the five
  architectural laws (Workflows Are Destinations; UCMC Owns The Journey; The
  Workspace Is The Application; The Platform Speaks With One Voice; One Mental
  Model), described at the architecture level.
- **External workflow sessions.** `architecture/external-workflow-sessions.md`
  — the owned, recoverable state-machine pattern for third-party integrations
  (identity verification, deposits, payouts), including the lifecycle and the
  resume / retry / cancel recovery guarantees.
- **Multi-currency ledger.** `architecture/multi-currency-ledger.md` — the
  native per-currency settlement ledger (per-currency positions, conservation
  and denomination-integrity invariants, conversion only at settlement).

### Changed

- **Architecture overview.** Replaced the "route-lite navigation" rationale
  with the workflow-as-destination model (Laws 1 & 3); added references to the
  Design Constitution, external workflow sessions, and the multi-currency
  ledger; noted that provider interactions are orchestrated as owned,
  recoverable sessions.
- **KYC flow.** Corrected the prior "entirely outside UCMC's control" framing —
  identity verification is now documented as an owned, recoverable session with
  resume / retry / cancel and background reconciliation.
- **Withdrawals flow.** Generalized the balance model to per-currency ledger
  positions; documented settlement as an owned, recoverable session with
  conversion applied at settlement.
- **Onboarding flow.** Documented the three distinct identity fields (public
  display name, unique `@handle`, private legal name) and their roles; noted
  KYC recovery during onboarding.
- **Whitepaper.** Updated the settlement lifecycle for the per-currency ledger
  and added the external-provider ownership property; referenced the new
  architecture documents.
- **Glossary.** Generalized `Balance Type` to a per-currency ledger position
  and added `Ledger Position`, `External Workflow Session`, `Design
  Constitution`, and `Semantic Object` entries.

### Notes

- These are documentation accuracy updates reflecting the current system
  architecture. No public signing domain, signal opcode, or endpoint changed;
  integrator clients require no changes. Vendor names, runtime/container
  identifiers, and the frontend framework remain abstracted per the
  repository's existing public/private boundary.

## [0.1.0] — 2026-05-28

Initial public publication. This release documents the UCMC protocol's public
surface derived from the production codebase. No prior public versions exist.

### Added

- **Foundation.** `README.md`, `LICENSE` (Apache-2.0), `SECURITY.md`,
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- **Architecture.** `architecture/overview.md` — system topology, request flow,
  signature verification flow, and design rationale, including a mermaid
  component diagram.
- **Cryptography.** `crypto/identity-and-signing.md` — the Ed25519 actor model,
  16 signing domain strings, canonical payload structure, and replay-protection
  scheme. `verification/README.md` — seven TypeScript primitives for actor
  derivation, signing, verification, OTP, document-hash integrity, and
  deterministic JSON.
- **Threat model.** `threat-model/README.md` — 14 in-scope threat classes,
  out-of-scope items, and the cryptographic primitive inventory.
- **Protocol flows.** `flows/marketplace-transaction.md`, `flows/kyc.md`,
  `flows/disputes.md`, `flows/withdrawals.md`, `flows/onboarding.md` — five
  end-to-end signed-event lifecycles with state machines, signal opcodes, and
  governance-controlled parameters.
- **Event schemas.** `events/schemas.md` — catalog of 22 public signal opcodes
  across identity, escrow, dispute, financial, KYC, and legal categories, plus
  the signing-domain reference table and the signed-mutation envelope spec.
- **API specification.** `api/openapi.yaml` — OpenAPI 3.1 spec with 138 paths
  across 144 operations and 13 tags. `api/README.md` — auth model, request and
  response envelopes, error codes, route groups, rate limits, idempotency.
  `api/openapi.redactions.md` — sidecar documenting the ~89 routes intentionally
  excluded (admin, internal, anti-abuse, vendor webhooks, privileged signing).
- **Reference SDK.** `sdk/typescript/` — a TypeScript SDK reference
  implementation: nine source modules (identity, signing, verification,
  canonical, signals, errors, types, client, index) plus six runnable examples
  covering actor creation, mutation signing, signed reads, a full marketplace
  flow, OTP verification, and document-hash verification. Apache-2.0.
- **Whitepaper.** `whitepaper/README.md` — a 5,210-word technical whitepaper
  with abstract, trust model, cryptographic foundations, protocol architecture,
  settlement lifecycle, governance model, adversarial analysis, comparison to
  prior art, open problems, and references.
- **Glossary.** `glossary.md` — terminology used throughout the public docs.
- **Redaction transparency.** A `.redactions.md` sidecar accompanies each
  document derived from internal source material, listing every removal and
  the reason (infrastructure identifier, vendor name, file reference,
  weakness disclosure, admin override mechanism, or operational warning).

### Security

- Every document in this release has been sanitized to remove infrastructure
  identifiers (VM names, port bindings, container names), vendor-specific
  identifiers (named payment, KYC, object-storage, edge, and observability
  providers), internal file and line references, application-version strings,
  override and emergency-action enumerations, anti-abuse heuristic names, and
  any "known issues" or "open questions" sections that would constitute
  weakness disclosure.
- Cryptographic signing-domain version strings (`UCMC_AUTH_PAYLOAD_V4`,
  `UCMC_VERIFY_V6`, `UCMC_ACTOR_ID_V3`, etc.) are kept verbatim because they
  are part of the public protocol.

### Notes

- This repository contains documentation only. The implementation is not
  currently open source.
- No independent security audit has been performed on the published material.
  Issues should be reported per `SECURITY.md`.

[Unreleased]: https://github.com/eugine336/ucmc-protocol-docs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/eugine336/ucmc-protocol-docs/releases/tag/v0.1.0
