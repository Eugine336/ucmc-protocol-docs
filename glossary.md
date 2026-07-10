# Glossary

## Core protocol terms

### Actor
A protocol participant represented by a cryptographic identity.

### Actor Category
A classification of actor role in the protocol (for example, buyer, seller, verifier, or operator role classes defined by policy).

### Actor State
The lifecycle status of an actor identity within onboarding, verification, and recovery workflows.

### Actor ID (Entity ID)
A deterministic identifier derived from actor key material. In UCMC, actor ID derivation uses:

`SHA-256("UCMC_ACTOR_ID_V3:" + publicKeyHex)`

### Audit Chain
An append-only event history used to verify who performed which state transition and in what order.

### Event Sourcing
A state model where current state is derived from ordered domain events rather than only mutable snapshots.

### Trust Kernel
The verification boundary that validates signatures, replay protections, and policy preconditions before state transitions commit.

### Verification
Protocol checks that prove request authenticity, payload integrity, and policy conformance before acceptance.

### Signal
A typed protocol operation code identifying a state transition request.

### Signing Domain
A versioned domain string used to separate cryptographic signing contexts and prevent cross-context replay.

### Signed Fetch
A signed mutation request path where canonical payload and envelope are signed and sent in the request body.

### Signed Get
A signed read request path where a preimage digest is signed and sent in request headers.

### Signed Post
A signed POST variant using read-auth style header signatures for read-like operations.

### Nonce
A single-use random value used to prevent replay of previously valid requests.

### Replay Protection
Controls (nonce uniqueness, timestamp drift checks, idempotency) that prevent reusing old signatures.

### Ed25519
A public-key signature scheme used for actor authentication and request signing.

### Keyring
The actor's managed key set used for signing, verification, and authorized rotation/recovery flows.

### Merkle Proof
A proof that a record is included in a Merkle tree without revealing the full dataset.

### Poseidon Hash
A hash primitive commonly used in zero-knowledge systems for circuit-efficient hashing.

### ZK (Zero-Knowledge)
Proof techniques that allow verification of a statement without revealing all underlying private inputs.

### POW (Proof of Work)
A challenge mechanism used as an anti-abuse control in selected protocol flows.

### Quorum
The minimum approval threshold required for multi-party governance or authorization actions.

### Threshold Signing
A signing model where multiple authorized parties jointly satisfy signing policy thresholds.

### Governance
The policy and decision process for protocol parameter changes and controlled feature activation.

### UCMC
The protocol and system model documented in this repository.

### Design Constitution
The five architectural laws that govern UCMC — Workflows Are Destinations, UCMC Owns The Journey, The Workspace Is The Application, The Platform Speaks With One Voice, and One Mental Model. See [architecture/design-constitution.md](architecture/design-constitution.md).

### External Workflow Session
A recoverable state machine, owned by UCMC, that orchestrates a third-party provider interaction (identity verification, deposit, payout). It tracks authoritative state and guarantees resume / retry / cancel recovery paths so a provider step is never a dead end. See [architecture/external-workflow-sessions.md](architecture/external-workflow-sessions.md).

### Semantic Object
An entity with its own identity and lifecycle — for example a product, wallet, escrow, organization, contract, message, or order. Only semantic objects receive visual containment (cards, borders); pages, dashboards, and navigation do not.

## Compliance, identity, and settlement terms

### AML
Anti-Money Laundering policy controls applied during compliance workflows.

### KYC
Know Your Customer identity verification workflow integrated into actor lifecycle checks.

### Compliance Gates
Policy checkpoints that must pass before specific actions (for example, settlement or high-risk operations) proceed.

### Escrow
A temporary locked-funds state used to enforce conditional settlement between counterparties.

### Balance Type
Portion of a per-currency ledger position:

- `FREE`
- `IN_ESCROW`
- `IN_WITHDRAWAL`

### Ledger Position
An actor's holding in a single currency, tracked as `FREE` / `IN_ESCROW` / `IN_WITHDRAWAL` portions. Actors hold one position per currency received rather than a single fungible balance; value is held in the currency it arrived in and converted only at settlement. See [architecture/multi-currency-ledger.md](architecture/multi-currency-ledger.md).

### Delivery Mode
The fulfillment method for a transaction (for example, digital, service, or hybrid fulfillment classes).

### Delivery Status
State-machine status for fulfillment progress from acceptance to completion.

### Dispute Outcome
Final decision category assigned to a dispute after adjudication.

### Dispute Status
Lifecycle stage of dispute handling from open through resolution.

### Legal Jurisdiction
A policy label indicating governing legal context applied to a transaction or agreement.

### Listing Status
Lifecycle status of a marketplace listing.

### Listing Type
Category of listing behavior and settlement expectations.

### Recovery Status
Lifecycle status of account or key recovery procedures.

### Withdrawal Status
Lifecycle status of payout and withdrawal processing.

## Signing domains

| Domain | Purpose |
|---|---|
| `UCMC_AUTH_PAYLOAD_V4` | Canonical payload domain for signed mutations |
| `UCMC_READ_AUTH_V1` | Preimage domain for signed reads |
| `UCMC_VERIFY_V6` | Mutation signature envelope domain |
| `UCMC_GOVERNANCE_V2` | Governance vote signing domain |
| `UCMC_METADATA_BIND_V2` | Metadata hash binding domain |
| `UCMC_CHALLENGE_ID_V4` | Challenge identifier derivation domain |
| `UCMC_CHALLENGE_HASH_V4` | Challenge hash derivation domain |
| `UCMC_CHALLENGE_META_V1` | Challenge metadata binding domain |
| `UCMC_CHALLENGE_SESSION_V4` | Challenge session binding domain |
| `UCMC_CHALLENGE_SEED_V4` | Challenge seed derivation domain |

## Signal opcode ranges

The public protocol exposes the following stable opcode ranges:

| Range | Category | Notes |
|---|---|---|
| `0x00`–`0x20` | System signals | Core protocol and platform system operations |
| `0x31`–`0x71` | Actor signals | Actor-driven marketplace and settlement actions |
| `0x90`–`0x9a` | KYC and identity signals | Identity and verification lifecycle actions |

Example: signal `0x53` is used in escrow initiation flows.

## Governance parameters

| Parameter | Description | Default behavior |
|---|---|---|
| Quorum threshold | Minimum weighted approvals for governance execution | Protocol baseline policy at activation |
| Voting window | Duration in which votes are accepted | Protocol baseline policy at activation |
| Execution delay | Delay between approval and execution | Protocol baseline policy at activation |
| Challenge window | Time window to challenge a governance action | Protocol baseline policy at activation |

## Automation definitions

| Definition | Meaning |
|---|---|
| Policy automation | Deterministic rules that enforce governance-approved constraints |
| Settlement automation | Deterministic execution of escrow and payout transitions after prerequisites pass |
| Compliance automation | Deterministic checks that gate sensitive transitions |
| Notification automation | Event-driven publication of protocol-visible state updates |