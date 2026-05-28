/**
 * High-level HTTP client for the UCMC API.
 *
 * Wraps the most common operations from the protocol flows:
 * onboarding, marketplace transactions, escrow, disputes, and wallets.
 * Uses the signing module for automatic request authentication.
 *
 * For endpoints not covered by named methods, use the generic
 * `signedMutation()` and `signedGet()` methods.
 *
 * @see api/openapi.yaml — full API surface (138 paths)
 * @see flows/ — protocol flow documentation
 */

import { bytesToHex } from "@noble/hashes/utils";
import { Signals } from "./signals.js";
import { buildCanonical, signMutation, signRead } from "./signing.js";
import { deriveActorId, type Keypair } from "./identity.js";
import { fromResponseError, type UcmcApiError } from "./errors.js";
import type {
  ActorId,
  ApiResponse,
  Balance,
  SignalOpcode,
  KycStatus,
  MoneyMinor,
} from "./types.js";

/** Configuration for the UCMC client. */
export interface UcmcClientOptions {
  /** Base URL of the UCMC API (e.g. `https://api.ucmccore.tech`). */
  baseUrl: string;
  /** The actor's Ed25519 keypair. */
  keypair: Keypair;
}

/** High-level client for the UCMC API. */
export class UcmcClient {
  /** The actor ID derived from the keypair's public key. */
  readonly actorId: ActorId;

  private readonly baseUrl: string;
  private readonly keypair: Keypair;

  constructor(opts: UcmcClientOptions) {
    this.actorId = deriveActorId(opts.keypair.publicKey);
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
    this.keypair = opts.keypair;
  }

  /**
   * Send a generic signed mutation (POST) to any endpoint.
   *
   * This is the low-level primitive — named methods below delegate here.
   */
  async signedMutation<T = unknown>(
    signal: SignalOpcode,
    metadata: Record<string, unknown>,
    opts?: { path?: string; contextHash?: string },
  ): Promise<T> {
    const idempotencyKey = crypto.randomUUID();
    const contextHash =
      opts?.contextHash ?? "0".repeat(64);
    const canonical = buildCanonical({
      actorId: this.actorId,
      signal,
      metadata,
      contextHash,
      idempotencyKey,
    });
    const envelope = await signMutation({
      canonical,
      privateKey: this.keypair.privateKey,
      publicKey: this.keypair.publicKey,
      metadata,
    });
    const path = opts?.path ?? "/api/control";
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    });
    return this.handleResponse<T>(res);
  }

  /** Send a generic signed GET request to any endpoint. */
  async signedGet<T = unknown>(path: string): Promise<T> {
    const headers = await signRead({
      actorId: this.actorId,
      publicKey: this.keypair.publicKey,
      privateKey: this.keypair.privateKey,
      path,
    });
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: headers as unknown as Record<string, string>,
    });
    return this.handleResponse<T>(res);
  }

  /** Get the actor's wallet balance. */
  async getBalance(): Promise<Balance> {
    return this.signedGet<Balance>(
      `/api/wallet/balance/${this.actorId}`,
    );
  }

  /** Request a withdrawal from the actor's free balance. */
  async requestWithdrawal(opts: {
    amount: MoneyMinor;
    destination: string;
    destinationType: string;
  }): Promise<unknown> {
    return this.signedMutation(Signals.WITHDRAWAL_REQUEST, opts, {
      path: "/api/wallet/withdraw",
    });
  }

  /** Initiate KYC verification. */
  async startKyc(): Promise<unknown> {
    return this.signedMutation(Signals.KYC_START, {}, {
      path: "/api/kyc/start",
    });
  }

  /** Get the actor's current KYC status. */
  async getKycStatus(): Promise<{ status: KycStatus }> {
    return this.signedGet<{ status: KycStatus }>(
      `/api/kyc/status/${this.actorId}`,
    );
  }

  /** Accept platform terms of service. */
  async acceptTerms(): Promise<unknown> {
    return this.signedMutation(Signals.TERMS_ACCEPT, {}, {
      path: "/api/onboarding/terms",
    });
  }

  /** Bind an email address to the actor identity. */
  async bindEmail(email: string): Promise<unknown> {
    return this.signedMutation(Signals.EMAIL_BIND, { email }, {
      path: "/api/onboarding/bind-email",
    });
  }

  /** Search the marketplace for listings. */
  async searchMarketplace(
    query: string,
  ): Promise<unknown> {
    return this.signedGet(`/api/marketplace/search?q=${encodeURIComponent(query)}`);
  }

  /** Hire a seller — locks escrow and creates a contract (signal 0x53). */
  async hireSeller(opts: {
    targetId: ActorId;
    catalogueId: string;
    price: MoneyMinor;
    deliveryDays: number;
  }): Promise<unknown> {
    return this.signedMutation(Signals.DEMAND, opts);
  }

  /** Confirm delivery of a marketplace contract (signal 0x65). */
  async confirmDelivery(deliveryTraceId: string): Promise<unknown> {
    return this.signedMutation(Signals.DELIVERY_CONFIRM, {
      deliveryTraceId,
    });
  }

  /** Submit a review after contract finalization (signal 0x66). */
  async submitReview(opts: {
    finalizeTraceId: string;
    stars: number;
    body: string;
    positiveTags?: string[];
    negativeTags?: string[];
  }): Promise<unknown> {
    return this.signedMutation(Signals.REVIEW_SUBMIT, opts);
  }

  /** Open a dispute against a counterparty (signal 0x10). */
  async openDispute(opts: {
    counterparty: ActorId;
    escrowTraceId: string;
    reason: string;
  }): Promise<unknown> {
    return this.signedMutation(Signals.DISPUTE_OPEN, opts, {
      path: "/api/dispute/open",
    });
  }

  /** Get the actor's onboarding status. */
  async getOnboardingStatus(): Promise<unknown> {
    return this.signedGet(`/api/onboarding/status/${this.actorId}`);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    const body = (await res.json()) as ApiResponse<T>;
    if (!res.ok || !body.ok) {
      throw fromResponseError(body, res.status);
    }
    return body.data as T;
  }
}
