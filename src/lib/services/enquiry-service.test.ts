import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeAndSaveEnquiry } from "@/lib/services/enquiry-service";

const requestOpenRouterCompletion = vi.hoisted(() => vi.fn());

vi.mock("@/lib/ai/openrouter", () => ({
  requestOpenRouterCompletion,
}));

function createFakeSupabase() {
  return {
    from: (table: string) => {
      if (table === "enquiries") {
        return {
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "enq_1",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...payload,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      throw new Error("Unexpected table in test");
    },
  };
}

describe("analyzeAndSaveEnquiry", () => {
  beforeEach(() => {
    requestOpenRouterCompletion.mockReset();
  });

  it("persists validated AI output", async () => {
    requestOpenRouterCompletion.mockResolvedValue({
      content: JSON.stringify({
        classification: "New Client",
        confidence: 0.92,
        urgency: "Medium",
        summary: "Client requests pricing and onboarding details.",
        recommended_action: "Route to sales onboarding team for follow-up.",
        suggested_response: "Thank you for your enquiry. We will contact you shortly.",
      }),
      raw: { id: "test" },
    });

    const result = await analyzeAndSaveEnquiry({
      supabase: createFakeSupabase() as never,
      userId: "user_1",
      input: {
        clientName: "John",
        clientEmail: "john@example.com",
        enquiryText: "Need pricing for strata services and onboarding.",
      },
      settings: {
        defaultModel: "openai/gpt-4o-mini",
        temperature: 0.2,
        maxTokens: 650,
      },
    });

    expect(result.classification).toBe("New Client");
    expect(result.manual_review).toBe(false);
    expect(result.model_used).toBe("openai/gpt-4o-mini");
  });

  it("falls back when AI output is invalid json", async () => {
    requestOpenRouterCompletion.mockResolvedValue({
      content: "not json",
      raw: { id: "test" },
    });

    const result = await analyzeAndSaveEnquiry({
      supabase: createFakeSupabase() as never,
      userId: "user_1",
      input: {
        enquiryText: "Need help please.",
      },
      settings: {
        defaultModel: "openai/gpt-4o-mini",
        temperature: 0.2,
        maxTokens: 650,
      },
    });

    expect(result.classification).toBe("Other");
    expect(result.manual_review).toBe(true);
  });

  it("falls back when OpenRouter request fails", async () => {
    requestOpenRouterCompletion.mockRejectedValue(new Error("network down"));

    const result = await analyzeAndSaveEnquiry({
      supabase: createFakeSupabase() as never,
      userId: "user_1",
      input: {
        enquiryText: "Need details",
      },
      settings: {
        defaultModel: "openai/gpt-4o-mini",
        temperature: 0.2,
        maxTokens: 650,
      },
    });

    expect(result.classification).toBe("Other");
    expect(result.confidence).toBeLessThan(0.5);
  });
});

