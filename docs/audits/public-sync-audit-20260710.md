# Public Docs Sync Audit — 2026-07-10

## What this is

A read-first audit of the public UCMC protocol documentation, run before any
edits, to bring the published docs back in line with the current system
architecture. This repository is the **public face** of UCMC. It is
intentionally **not** a 1:1 mirror of the internal engineering documentation —
some internal material is team-only and is deliberately kept out of this
repository. This audit records what was reviewed, how each document was
classified, and the boundary decisions that governed the update.

The audit itself is public-safe: it describes architecture at the concept
level and does not enumerate internal-only documents, vendor names, container
identifiers, credentials, or internal hostnames.

## Method

1. **Phase 1 — Read.** Every Markdown document and every redaction sidecar was
   read cover-to-cover.
2. **Phase 2 — Reconcile.** The published prose was compared against the
   current system architecture. Only architectural facts that are appropriate
   for a public audience were carried across.
3. **Phase 3 — Classify.** Each document was labelled CURRENT / STALE /
   SUPERSEDED / OBSOLETE with a planned action.
4. **Phase 4 — Execute.** Stale docs rewritten in place; missing docs added;
   nothing required archiving.
5. **Phase 5 — Coherence.** Index, changelog, redaction sidecars, and
   cross-links reconciled.

## Boundary decisions (why some "changes" were deliberately not made)

This repo already sanitizes the internal system through a consistent lens:
vendors are described by category, runtime/container identifiers are removed,
and the frontend framework is left unnamed. The following updates were applied
only at the level this repository already documents:

| Internal fact | Public treatment | Rationale |
|---|---|---|
| Error-tracking vendor | Kept as "error tracking infrastructure" | The public docs never named a vendor; naming one now would regress the abstraction. |
| Frontend framework/version | Left unnamed; described behaviourally (client-rendered application, addressable workflow routes) | Consistent with the repo's existing framework abstraction. The relevant, public-safe change is the *navigation model* (see below), not the framework name. |
| Container / service identifiers | Described as logical services (API, workers, database, cache, secret store, edge) | Runtime identifiers are internal per the existing redaction policy. |
| Specific KYC / payment / payout vendors | Described by category ("KYC provider", "payout provider") | Matches existing vendor abstraction. |

## Architectural changes reflected (public-safe, concept level)

- **Design Constitution (five laws).** The platform now formalizes five
  architectural laws. Added as a public architecture document and referenced
  from the overview and whitepaper.
- **Owned, recoverable external workflows.** Third-party interactions
  (identity verification, deposits, payouts) are now modelled as sessions
  **owned by UCMC** with explicit resume / retry / cancel recovery paths, rather
  than hand-offs where control leaves the platform. This corrects prior prose
  that described provider steps as happening "entirely outside UCMC's control."
- **Native multi-currency ledger.** Balances are now per-currency ledger
  positions; value is held in the currency it was received in and converted only
  at settlement. Prior single-balance prose was generalized accordingly.
- **Navigation model.** Primary workflows are addressable destinations with
  their own routes and browser history (Law 1 / Law 3). The former "route-lite
  navigation" rationale was replaced.

## Information architecture assessment

The top-level layout (`architecture/`, `crypto/`, `events/`, `flows/`,
`threat-model/`, `verification/`, `sdk/`, `whitepaper/`, `api/`, `glossary.md`)
is coherent and navigable for an external reader, and the whitepaper is an
effective single entry point. Two gaps for a reader trying to *understand* or
*integrate with* the protocol:

1. No single statement of the platform's guiding architectural principles.
2. No description of how external providers are orchestrated (what an
   integrator/partner can rely on when a provider step is interrupted).
3. No description of the multi-currency settlement ledger as a system property.

All three are addressed by the new documents below.

## Document inventory & classification

Legend: **C** current · **S** stale (rewritten) · **SU** superseded · **O**
obsolete · **N** new.

| Path | Purpose (public audience) | Status | Action |
|---|---|---|---|
| `README.md` | Repository entry point & index | C→(index) | Add new docs to index; add Design Constitution reference |
| `whitepaper/README.md` | Self-contained technical introduction | S | Targeted edits: settlement (multi-currency), owned external workflows, constitution reference |
| `architecture/overview.md` | Logical architecture, request flow, rationale | S | Replace route-lite rationale; add constitution, external-workflow, ledger sections |
| `crypto/identity-and-signing.md` | Ed25519 actor model & signing domains | C | None |
| `events/schemas.md` | Signal opcode catalog & envelopes | C | None |
| `api/README.md` | API auth model, envelopes, error codes | C | None |
| `api/openapi.yaml` | OpenAPI 3.1 machine spec | C | None |
| `glossary.md` | Public protocol terminology | S | Generalize balance term; add ledger / external-workflow / constitution terms |
| `flows/marketplace-transaction.md` | Escrow lifecycle | C | None |
| `flows/kyc.md` | KYC verification flow | S | Add owned/recoverable session model; soften "outside UCMC's control" |
| `flows/withdrawals.md` | Withdrawal & settlement lifecycle | S | Multi-currency balance model; owned settlement session |
| `flows/onboarding.md` | Three-phase onboarding | S | Identity fields (display name / handle / legal name); KYC recovery reference |
| `flows/disputes.md` | Dispute resolution | C | None |
| `verification/README.md` | Reference crypto primitives | C | None |
| `sdk/typescript/README.md` | Reference SDK | C | None (SDK is reference code; balance helper left as-is) |
| `threat-model/README.md` | Threat classes & defenses | C | None |
| `CHANGELOG.md` | Version history | C→(entry) | Add Unreleased entry for this sync |
| `CONTRIBUTING.md` | Contribution guide | C | None |
| `SECURITY.md` | Disclosure policy | C | None |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 | C | None |
| `architecture/design-constitution.md` | The five architectural laws | N | Added |
| `architecture/external-workflow-sessions.md` | Owned, recoverable third-party integration pattern | N | Added |
| `architecture/multi-currency-ledger.md` | Native per-currency settlement ledger | N | Added |
| `*.redactions.md` (9 sidecars) | Public/private boundary logs | C→(re-sync note) | Dated re-sync note on materially edited docs |

## Archiving

**No documents required archiving.** Unlike the internal documentation set,
this public repository is already curated — it contains no session logs, bug
audits, feature-gap memos, or migration cutover notes. Every existing document
still serves a current public purpose. An `archive/` directory was therefore
not created.

## Summary counts

- Enumerated: **20** content documents (19 Markdown + `api/openapi.yaml`) plus
  **9** redaction sidecars and `LICENSE`.
- Current: **14** · Stale (rewritten): **6** · Superseded: **0** · Obsolete: **0**
- New: **3** (`architecture/design-constitution.md`,
  `architecture/external-workflow-sessions.md`,
  `architecture/multi-currency-ledger.md`)
- Archived: **0**
- Redaction sidecars updated with a dated re-sync note: **5**
