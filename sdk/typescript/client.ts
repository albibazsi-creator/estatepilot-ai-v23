export type EstatePilotClientOptions = {
  baseUrl: string;
  apiKey: string;
};

export class EstatePilotClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options: EstatePilotClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(init?.headers ?? {})
      }
    });
    if (!res.ok) throw new Error(`EstatePilot API error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  listPartnerListings() {
    return this.request<{ ok: true; data: unknown[] }>("/api/partner/listings");
  }

  createPartnerLead(payload: { listingSlug: string; name: string; email?: string; phone?: string; gdprConsent: boolean; message?: string }) {
    return this.request("/api/partner/leads", { method: "POST", body: JSON.stringify(payload) });
  }

  requestPrivacyExport(payload: { requesterEmail: string; requesterName?: string }) {
    return this.request("/api/privacy/dsar", { method: "POST", body: JSON.stringify({ ...payload, requestType: "export" }) });
  }
}
