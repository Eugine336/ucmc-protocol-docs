# Design Constitution

## What this is

UCMC is organized around five architectural laws. They are not cosmetic style
rules — they are load-bearing principles that shape how the protocol surface,
the application, external integrations, localization, and product positioning
are built. This document states them at the level relevant to an external
reader, integrator, or partner. The implementation details behind each law live
in the flow and architecture specifications elsewhere in this repository.

The mental model, in one sentence: **UCMC is the trust layer for digital
commerce, and every capability is a service built on that trust layer.**

---

## Law 1 — Workflows Are Destinations

Every significant workflow is a first-class destination within the application,
not a transient overlay. Reading a legal agreement, completing identity
verification, creating an escrow, opening a dispute, managing a wallet, or
onboarding each owns the workspace while it is active. These workflows have
dedicated routes, browser history, navigation state, and recovery paths, and
they are designed to work on any device.

Lightweight, momentary interactions — confirmations, renames, filters, quick
edits, single-option pickers — remain in dialogs and drawers. A dialog is never
a container for a complete multi-step workflow.

**Why it matters to integrators.** Protocol state transitions are explicit and
addressable. A workflow's state can be linked to, resumed, and reasoned about,
rather than being hidden inside ephemeral UI state.

## Law 2 — UCMC Owns The Journey

UCMC never hands the user off to a third party and hopes they come back. Every
external provider — identity verification, payments, payouts, on-chain bridges,
document signing — is an implementation detail that UCMC orchestrates. From the
user's perspective, they are always using UCMC.

Each external interaction is modelled as a **recoverable state machine owned by
UCMC**: the platform creates the session, launches the provider, tracks the
authoritative state, and remains responsible for every outcome — success,
failure, cancellation, timeout, popup blocking, network loss, tab closure, or
provider outage. When the user returns, UCMC determines the true state and
presents the correct next action: continue, resume, retry, restart, or exit.
There are no dead ends and no permanent "pending" states with no available
action.

This principle is realized by the
[ExternalWorkflowSession](./external-workflow-sessions.md) primitive.

## Law 3 — The Workspace Is The Application

The application is one continuous surface, not a set of pages placed inside
decorative frames. Navigation, headers, search, dashboards, messaging, and
workflows all belong to the same workspace. Visual hierarchy comes from spacing,
typography, alignment, and information architecture — not from wrapping whole
pages in cards.

Cards, borders, and elevation are reserved for **semantic objects**: entities
with their own identity and lifecycle — products, storefronts, wallets, escrows,
organizations, contracts, proposals, messages, notifications, transactions,
identities, documents, payment methods, orders. Pages, dashboards, search, and
navigation are not semantic objects and are not framed as such.

The workspace adapts structurally to each device — full-surface on mobile with
safe-area awareness, restructured (not stretched) on tablets, and expanded into
multiple panes on desktop — rather than shrinking a single fixed layout.

## Law 4 — The Platform Speaks With One Voice

UCMC behaves as one coherent product regardless of language or module. When a
user selects a language, the **entire** interface renders in that language;
mixed-language screens are treated as defects. The only intentional exceptions
are brand names, proper nouns, legal entity names, technical identifiers, and
user-generated content.

Consistency extends beyond translation: terminology, navigation patterns,
workflow patterns, component behaviour, and recovery behaviour are uniform
across the platform. Every user-facing string originates from a single
internationalization system.

## Law 5 — One Mental Model

Every capability reinforces a single idea rather than introducing a competing
narrative:

> **UCMC is the trust layer for digital commerce.**

Buying products, selling services, hiring professionals, operating
organizations, managing escrow, verifying identities, resolving disputes,
processing settlements, developer APIs, governance, and compliance are all
services running on that trust layer. Future capabilities should be immediately
understandable as additional services on the same layer, not as separate
products.

---

## How the laws relate to the rest of this repository

- Law 1 and Law 3 shape the application surface and are visible in how the
  [protocol flows](../flows/) are structured as end-to-end lifecycles.
- Law 2 is implemented by the
  [ExternalWorkflowSession](./external-workflow-sessions.md) pattern and is
  reflected in the [KYC](../flows/kyc.md) and [withdrawal](../flows/withdrawals.md)
  flows.
- Law 5 frames the whole system; the [whitepaper](../whitepaper/README.md) and
  [architecture overview](./overview.md) elaborate the trust-layer model.

## See also

- [architecture/overview.md](./overview.md) — logical architecture and request flow
- [architecture/external-workflow-sessions.md](./external-workflow-sessions.md) — owned, recoverable integrations
- [architecture/multi-currency-ledger.md](./multi-currency-ledger.md) — native settlement ledger
- [whitepaper/README.md](../whitepaper/README.md) — technical introduction
