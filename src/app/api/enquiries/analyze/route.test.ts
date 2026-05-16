import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/enquiries/analyze/route";

const getAuthenticatedUserOrNull = vi.hoisted(() => vi.fn());
const getOrCreateUserModelSettings = vi.hoisted(() => vi.fn());
const analyzeAndSaveEnquiry = vi.hoisted(() => vi.fn());
const getServerEnv = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/auth", () => ({
  getAuthenticatedUserOrNull,
}));

vi.mock("@/lib/services/enquiry-service", () => ({
  getOrCreateUserModelSettings,
  analyzeAndSaveEnquiry,
}));

vi.mock("@/lib/env", () => ({
  getServerEnv,
}));

describe("POST /api/enquiries/analyze", () => {
  it("returns 401 when user is not authenticated", async () => {
    getAuthenticatedUserOrNull.mockResolvedValue({
      user: null,
      supabase: {},
    });

    const response = await POST(
      new Request("http://localhost/api/enquiries/analyze", {
        method: "POST",
        body: JSON.stringify({ enquiryText: "hello there" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns analysis payload when request succeeds", async () => {
    getAuthenticatedUserOrNull.mockResolvedValue({
      user: { id: "user_1" },
      supabase: {},
    });
    getServerEnv.mockReturnValue({
      openRouterDefaultModel: "openai/gpt-4o-mini",
    });
    getOrCreateUserModelSettings.mockResolvedValue({
      defaultModel: "openai/gpt-4o-mini",
      temperature: 0.2,
      maxTokens: 600,
    });
    analyzeAndSaveEnquiry.mockResolvedValue({
      id: "enq_1",
      classification: "General Question",
      confidence: 0.8,
      urgency: "Low",
    });

    const response = await POST(
      new Request("http://localhost/api/enquiries/analyze", {
        method: "POST",
        body: JSON.stringify({ enquiryText: "How does onboarding work?" }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.id).toBe("enq_1");
  });

  it("returns 400 on service validation errors", async () => {
    getAuthenticatedUserOrNull.mockResolvedValue({
      user: { id: "user_1" },
      supabase: {},
    });
    getServerEnv.mockReturnValue({
      openRouterDefaultModel: "openai/gpt-4o-mini",
    });
    getOrCreateUserModelSettings.mockResolvedValue({
      defaultModel: "openai/gpt-4o-mini",
      temperature: 0.2,
      maxTokens: 600,
    });
    analyzeAndSaveEnquiry.mockRejectedValue(new Error("Please provide more detail."));

    const response = await POST(
      new Request("http://localhost/api/enquiries/analyze", {
        method: "POST",
        body: JSON.stringify({ enquiryText: "hi" }),
      }),
    );

    expect(response.status).toBe(400);
  });
});

