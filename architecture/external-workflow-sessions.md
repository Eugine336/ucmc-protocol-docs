# External Workflow Sessions

## What this is

Some protocol actions require a third-party provider to perform a specialized
task: verifying a government ID, collecting a card payment, sending a payout to
a bank or wallet, or confirming an on-chain transfer. UCMC treats every such
interaction as an **external workflow session** — a recoverable state machine
that UCMC owns from beginning to end. Control may temporarily leave UCMC to let
a provider do its job, but ownership of the user's journey never does.

This is the concrete realization of [Design Law 2 — UCMC Owns The
Journey](./design-constitution.md#law-2--ucmc-owns-the-journey).

## Why it exists

External providers fail in ways a naïve "redirect and wait for a callback"
integration does not anticipate: the user's browser blocks a popup, a redirect
never returns, a tab is closed mid-flow, the network drops, a webhook is
delayed, or the provider has an outage. A success-first integration leaves the
user stranded — most visibly as a workflow stuck in "pending" with no way
forward.

UCMC is instead **recovery-first**: it assumes any external step can be
interrupted at any moment, and guarantees that a return to the application
always yields a clear next action.

## The session model

Every external workflow is represented by a session with an observable
lifecycle. Regardless of which provider participates, the session exposes a
uniform shape:

| Property | Meaning |
|---|---|
| `kind` | The workflow type (for example, identity verification, a deposit, a payout). |
| `state` | Where the session is in its lifecycle (created, launched, pending, needs-action, completed, failed, cancelled, expired). |
| launch mode | How the provider is presented — redirect, popup-with-fallback, or inline. |
| recovery affordances | Which of resume / retry / cancel are currently valid. |
| authoritative status | UCMC's own record of truth, independent of whether the provider returned control. |

The lifecycle is deliberately simple: a session is **created** by UCMC,
**launched** to the provider, observed while **pending**, and resolves to a
**terminal** state (completed, cancelled, failed, or expired). Non-terminal
sessions are always recoverable.

```
created ──► launched ──► pending ──┬──► completed
                                   ├──► needs_action ──► (resume / retry)
                                   ├──► failed        ──► (retry / restart)
                                   ├──► cancelled
                                   └──► expired       ──► (restart)
```

## Recovery guarantees

- **Resume.** If a session is still in progress, the user can re-enter it from
  any surface — a page reload, a different device, or a return visit — because
  the authoritative state lives with UCMC, not in transient client state.
- **Retry.** If a provider step failed, the user can start a fresh attempt
  without being blocked by the failed one.
- **Cancel.** A pending session can always be abandoned cleanly, releasing the
  user to try again or leave.
- **Reconciliation.** A background process periodically re-checks non-terminal
  sessions against provider truth, so a missed or delayed callback is
  self-healing rather than a permanent stall.

Recovery actions are idempotent: repeating them does not create duplicate work
or double-charge/double-settle a financial operation.

## Surfacing recovery to the user

Two complementary surfaces make in-flight workflows visible:

- A **per-workflow** control on the relevant page (for example, the identity
  verification page) that shows the current state and the valid recovery
  actions.
- An **application-level** indicator that surfaces any unfinished workflow the
  actor has, so a session started on one surface can be resumed from anywhere.

Both read from UCMC's authoritative session state, so refreshing the page or
switching devices never loses the recovery path.

## What integrators and partners can rely on

- A provider interaction never becomes a dead end. There is always a defined
  next action.
- The authoritative status of a workflow is queryable from UCMC and does not
  depend on the provider successfully redirecting the user back.
- New provider categories are added behind the same session model, so the
  recovery semantics above are uniform across identity, deposits, payouts, and
  future integrations.

## Where this appears in the flows

- [KYC verification](../flows/kyc.md) — identity verification is an owned,
  recoverable session.
- [Withdrawals](../flows/withdrawals.md) — payout settlement is tracked as an
  owned session with reconciliation.

## See also

- [architecture/design-constitution.md](./design-constitution.md) — the five laws
- [architecture/overview.md](./overview.md) — logical architecture
- [architecture/multi-currency-ledger.md](./multi-currency-ledger.md) — settlement ledger
