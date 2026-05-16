import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/public/analyze/route";

const getServerEnv = vi.hoisted(() => vi.fn());
const analyzeEnquiry = vi.hoisted(() => vi.fn());

vi.mock("@/lib/env", () => ({
  getServerEnv,
}));

vi.mock("@/lib/services/enquiry-service", () => ({
  analyzeEnquiry,
}));

describe("POST /api/public/analyze", () => {
  it("returns 401 when api key is missing", async () => {
    getServerEnv.mockReturnValue({
      publicApiKey: "test_key",
      openRouterDefaultModel: "openai/gpt-4o-mini",
    });

    const response = await POST(
      new Request("http://localhost/api/public/analyze", {
        method: "POST",
        body: JSON.stringify({ enquiryText: "Need pricing details for a building." }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns analysis payload with valid key", async () => {
    getServerEnv.mockReturnValue({
      publicApiKey: "test_key",
      openRouterDefaultModel: "openai/gpt-4o-mini",
    });
    analyzeEnquiry.mockResolvedValue({
      classification: "New Client",
      confidence: 0.92,
      urgency: "Medium",
      summary: "Potential new client.",
      recommended_action: "Route to onboarding.",
      suggested_response: "Thanks, our team will contact you shortly.",
      manual_review: false,
      model_used: "openai/gpt-4o-mini",
      prompt_version: "v1.0.0",
      raw_ai_json: null,
    });

    const response = await POST(
      new Request("http://localhost/api/public/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": "test_key",
        },
        body: JSON.stringify({ enquiryText: "Need pricing details for a building." }),
      }),
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.classification).toBe("New Client");
    expect(payload.source).toBe("public_api");
  });
});

