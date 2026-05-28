# UCMC Protocol — Public Documentation

UCMC is a verified economic network using cryptographic identity, escrowed settlement, and event-sourced audit trails. This repository is the public protocol documentation, derived from the production system.

> **Note:** This documentation is generated and curated from the internal codebase. The implementation is not currently open source.

## Quick Links

- [Architecture Overview](architecture/overview.md) — System topology, component boundaries, design rationale
- [Cryptographic Identity & Signing](crypto/identity-and-signing.md) — Ed25519 model, signing domains, key derivation
- [Glossary](glossary.md) — Term definitions

### Protocol Flows

- [Marketplace Transaction](flows/marketplace-transaction.md) — Hire → escrow → delivery → finalization lifecycle
- [KYC](flows/kyc.md) — Identity verification flow
- [Disputes](flows/disputes.md) — Dispute resolution and arbitration
- [Withdrawals](flows/withdrawals.md) — Withdrawal processing
- [Onboarding](flows/onboarding.md) — Actor onboarding and identity setup

### API

- [API Overview](api/README.md) — Auth model, request/response envelopes, error codes
- [OpenAPI 3.1 Spec](api/openapi.yaml) — Full machine-readable API surface

### API & Events

- [Event Schemas](events/schemas.md) — Signal opcode catalog and payload structures
- [Verification Examples](verification/README.md) — TypeScript reference implementations for signing and verification

### SDK

- [TypeScript SDK](sdk/typescript/README.md) — Reference implementation for identity, signing, verification, and API client

### Reference

- [Threat Model](threat-model/README.md) — Adversary assumptions and trust boundaries

## License

This project is licensed under the [Apache License 2.0](LICENSE).