# Redactions: flows/withdrawals.md

## Source: ai-marketplace/docs/08-flow-withdrawals.md
## Sanitization run: 2026-05-28T11:00:00Z

| Section | Removed content (summary) | Reason |
|---------|---------------------------|--------|
| Overview | "Wise (wire transfer)" | Vendor name; replaced with "fiat payout" |
| Step 1 | "FIAT countries: Kenya, Nigeria, Ghana, South Africa" | Specific country/currency list; replaced with "fiat payouts to supported regions" |
| Step 1 | "Bank list: GET /api/payment/banks?country=<country> (Paystack API)" | Vendor name (Paystack) + internal route; replaced with description |
| Step 1 | "`submitSignal()`" function name | Internal function name |
| Step 2 | "`kyc_results.kyc_status = 'VERIFIED'` + no active `compliance_freezes`" | Internal table/column names; replaced with description |
| Step 2 | "`ingestPlatformEvent()`" function name | Internal function name |
| Step 3 | "`withdrawal_minimum_usd_minor` from `platform_config` (default 1000 = $10)" | Internal config key + literal dollar amount; replaced with "configurable governance minimum" |
| Step 3 | "`checkSanctions(actorId)`" function name | Internal function name |
| Step 3 | "`SANCTIONS_SCREENING_ENABLED=true`" env var name | Internal environment variable |
| Step 3 | "`WITHDRAWAL_TIMELOCK_HOURS = 24`" env var name | Internal env var; kept 24h as protocol invariant |
| Step 3 | "SERIALIZABLE transaction" | SQL isolation level detail; replaced with "atomically in a single transaction" |
| Step 3 | "`balances.free -= amount`, `balances.in_withdrawal += amount`, `INSERT withdrawal_requests`" | Internal SQL; replaced with description |
| Step 3 | "ON CONFLICT (request_trace_id) DO NOTHING" | SQL syntax; replaced with description |
| Step 4 | "`sweepWithdrawals()` function" | Internal function name |
| Step 4 | "WHERE status='TIMELOCKED' AND release_after < NOW()" | SQL clause; replaced with description |
| Step 4 | "`WITHDRAWAL_RELEASE_FAILED` audit" | Internal audit event name; replaced with description |
| Entire section | "High-value admin approval" full details — admin endpoints (`GET /api/admin/withdrawals/high-value`, `POST .../approve`, `POST .../reject`), `WITHDRAWAL_HIGH_VALUE_THRESHOLD` env var, literal "100000000" threshold | Admin endpoints + specific threshold; replaced with one-paragraph abstract |
| Entire section | "Threshold signing" full details — action types (APPROVE/REJECT/RELEASE_TIMELOCKED), `POST /signing/initiate`, `POST /signing/sign`, 128-char hex, `keyring.threshold ?? 3`, "THRESHOLD_CONFIG requires ALL", `commitWithdrawal()`, "15 minutes" TTL, "In-memory Map — lost on restart" | Implementation detail + weakness (in-memory storage lost on restart); replaced with one-paragraph abstract |
| Settlement | "Wise webhook: POST /payment/wise/webhook" | Vendor name (Wise) + endpoint path |
| Settlement | "HMAC-SHA256 via `X-Signature-SHA256`" header name | Specific webhook header; replaced with "HMAC-signed callback" |
| Settlement | "`outgoing_payment_sent`", "`cancelled`", "`funds_refunded`" event names | Vendor-specific webhook event names; replaced with "settlement success/failure" |
| Settlement | "`withdrawal_settlements.status`", "`withdrawal_requests.status`" column references | Internal column names; replaced with description |
| Settlement | "`onWithdrawalFailed()`" function name | Internal function name; replaced with "settlement failure events are surfaced for reconciliation" |
| Entire section | "Key database tables" — `balances`, `withdrawal_requests`, `withdrawal_settlements` column-level schemas | Internal column names; replaced with abstract "Balance Model" section |
| Entire section | "Deposit flow" full details — `paystackInit()`, Paystack popup, `POST /paystack/webhook`, `charge.success`, `HMAC-SHA512 via x-paystack-signature`, `POST /wallet/deposit/confirm` | Vendor name (Paystack) + internal endpoints + webhook details; replaced with one-line reference |
| Entire section | "Where to look in the code" | File:line reference section |
| Failure modes | "Where" column with file refs (`WalletPanel.tsx:270-369`, `wallet.ts:207-218`, `walletService.ts:142-148`, `signing.ts:83`, `payment.ts:744-870`, `admin.ts:866-895`, `002_schema.sql:379-387`, `004_layers_15.sql:204-215`) | File:line references; column dropped entirely |
| Throughout | "`balances.in_withdrawal`" column references | Internal column name; replaced with "pending-withdrawal balance portion" |

## Re-sync: 2026-07-10

Re-synced to reflect the native multi-currency ledger and the owned-session
settlement model. The "Balance Model" section now describes per-currency ledger
positions (conversion at settlement), and Step 7 notes settlement as an owned,
recoverable session with reconciliation. Maintained abstraction: ledger table
and column names, the session primitive's internals, payout-provider names, and
webhook/event names remain excluded.
