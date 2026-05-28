# UCMC Protocol

> A protocol for verified economic exchange between strangers — cryptographic
> identity, signed events, escrowed settlement, auditable lifecycle.

UCMC ("Universal Commerce & Marketplace Core") is a server-mediated
protocol that gives users economic exchange with the integrity properties
usually associated with distributed ledgers — without a blockchain, a token,
or a global consensus protocol. Every actor is identified by an Ed25519
keypair, every state-changing action is signed, and settlement is constrained
to a documented state machine that even the operator cannot bypass.

---

## 📄 Start here

**[Read the technical whitepaper →](./whitepaper/README.md)**

The whitepaper (≈5,200 words, 10 sections) is the single best starting point.
It covers the trust model, cryptographic foundations, protocol architecture,
settlement lifecycle, governance, and adversarial analysis — and links into
the rest of the documentation as you go deeper.

If you only have ten minutes, read just the Abstract, Section 2 (Trust model),
and Section 7 (Adversarial analysis).

---

## 📚 Specifications

Authoritative documents for the protocol. The whitepaper references these.

| Doc | What it covers |
|---|---|
| [architecture/overview.md](./architecture/overview.md) | System topology, request flow, design rationale |
| [crypto/identity-and-signing.md](./crypto/identity-and-signing.md) | Ed25519 actor model, signing domains, replay protection |
| [threat-model/README.md](./threat-model/README.md) | 14 in-scope threat classes, defenses, out-of-scope items |
| [events/schemas.md](./events/schemas.md) | 22 signal opcodes, 16 signing domains, request envelope |
| [api/openapi.yaml](./api/openapi.yaml) | OpenAPI 3.1 spec — 138 paths, 144 operations |
| [api/README.md](./api/README.md) | API auth model, envelopes, error codes |
| [glossary.md](./glossary.md) | Public protocol terminology |

## 🔄 Protocol flows

End-to-end signed-event lifecycles.

| Flow | Signal opcodes |
|---|---|
| [Marketplace transaction](./flows/marketplace-transaction.md) | `0x53` → `0x02` → `0x04` → `0x65` → `0x05` → `0x66` |
| [KYC verification](./flows/kyc.md) | `0x90` → `0x91` / `0x92` |
| [Disputes](./flows/disputes.md) | `0x10` → `0x13` → `0x11` |
| [Withdrawals](./flows/withdrawals.md) | `0x70` |
| [Onboarding](./flows/onboarding.md) | `0x69` → `0x68` → `0x61` → `0x93` → `0xa8` |

## 🛠 Reference code

| Resource | What it is |
|---|---|
| [verification/README.md](./verification/README.md) | Seven TypeScript primitives (sign, verify, OTP, doc-hash) |
| [sdk/typescript/](./sdk/typescript/) | Reference SDK implementation — 9 modules, 6 worked examples |

## 📜 Project

| File | Purpose |
|---|---|
| [LICENSE](./LICENSE) | Apache-2.0 |
| [SECURITY.md](./SECURITY.md) | Responsible disclosure policy |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute (docs only) |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Contributor Covenant 2.1 |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## Status

This repository contains documentation only. The implementation is not
currently open source.

No independent security audit has yet been performed on the published
material. Issues should be reported per [SECURITY.md](./SECURITY.md).

The protocol is in active development. Breaking changes between minor
versions are possible until v1.0.

## License

Apache License 2.0 — see [LICENSE](./LICENSE).

© 2026 UCMC
