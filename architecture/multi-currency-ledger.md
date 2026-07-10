# Multi-Currency Settlement Ledger

## What this is

UCMC holds and moves value on a native, per-currency ledger. Each actor does
not have a single fungible balance; instead they hold **ledger positions**, one
per currency they have received. Value is held in the currency it arrived in,
and conversion happens only at settlement — never silently in the background.

This document describes the ledger as a system property. The fund-movement
lifecycles that operate on top of it are specified in
[flows/marketplace-transaction.md](../flows/marketplace-transaction.md) and
[flows/withdrawals.md](../flows/withdrawals.md).

## Why it exists

A single-balance model forces an implicit currency conversion at the moment
value enters the system, which hides exchange-rate decisions from the user and
makes the audit trail ambiguous about what was actually received. A per-currency
ledger keeps value in its original denomination, makes every conversion an
explicit, auditable step, and lets settlement decide the destination currency.

## Ledger positions

For each `(actor, currency)` pair, the ledger tracks the same three portions the
protocol uses everywhere value is held:

| Portion | Meaning |
|---|---|
| free | Available for spending, hiring, or withdrawal |
| in-escrow | Locked in active escrow contracts |
| in-withdrawal | Held during the withdrawal timelock |

All movements between portions are atomic within a single transaction, so value
can never be created, destroyed, or double-spent — it only moves between
portions of a position, or between positions at an explicit conversion.

## Invariants

- **Conservation.** Within a currency, the sum of the three portions changes
  only through a signed, audited protocol action. No endpoint transfers value
  directly between actors outside the escrow and withdrawal lifecycles.
- **Denomination integrity.** Value received in a currency is held in that
  currency. It is not implicitly converted on receipt.
- **Explicit conversion.** Any currency conversion is a discrete, recorded step
  at settlement time, not an ambient background operation.
- **Atomicity.** Portion changes and the records that justify them commit
  together, so a partially applied movement cannot be observed.

## Relationship to settlement

- **Escrow.** Locking, delivery, finalization, and dispute payouts move value
  between the `free` and `in-escrow` portions of the relevant currency position
  (see [marketplace transaction](../flows/marketplace-transaction.md) and
  [disputes](../flows/disputes.md)).
- **Withdrawal.** A withdrawal moves value from `free` to `in-withdrawal` under
  a timelock, and settlement releases it to an external destination. The
  destination currency is resolved at settlement, which is where any conversion
  is applied (see [withdrawals](../flows/withdrawals.md)).

## Auditability

Because every portion change is the result of a signed protocol signal appended
to the [audit chain](../events/schemas.md#audit-chain), the movement of value —
including the currency it was denominated in and any conversion at settlement —
is independently verifiable from the event history.

## See also

- [flows/withdrawals.md](../flows/withdrawals.md) — withdrawal & settlement lifecycle
- [flows/marketplace-transaction.md](../flows/marketplace-transaction.md) — escrow lifecycle
- [architecture/overview.md](./overview.md) — logical architecture
- [glossary.md](../glossary.md) — terminology
