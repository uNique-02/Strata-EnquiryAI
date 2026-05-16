import { describe, expect, it } from "vitest";
import { aiResponseSchema, fallbackAiResponse, parseAiJson } from "@/lib/validation";

describe("parseAiJson", () => {
  it("parses raw json", () => {
    const output = parseAiJson('{"classification":"Other","confidence":0.2}');
    expect(output).toEqual({ classification: "Other", confidence: 0.2 });
  });

  it("parses json wrapped in markdown fences", () => {
    const output = parseAiJson(
      "```json\n{\"classification\":\"Other\",\"confidence\":0.2}\n```",
    );
    expect(output).toEqual({ classification: "Other", confidence: 0.2 });
  });
});

describe("fallbackAiResponse", () => {
  it("returns low confidence fallback for short enquiry", () => {
    const result = fallbackAiResponse("Need help");
    expect(result.classification).toBe("Other");
    expect(result.confidence).toBeLessThanOrEqual(0.45);
    expect(result.urgency).toBe("Low");
  });
});

describe("aiResponseSchema", () => {
  it("rejects invalid classification", () => {
    const parsed = aiResponseSchema.safeParse({
      classification: "Random",
      confidence: 0.9,
      urgency: "Medium",
      summary: "Valid enough summary here.",
      recommended_action: "Do something useful with this enquiry.",
      suggested_response: "Thanks for reaching out. We will respond soon.",
    });

    expect(parsed.success).toBe(false);
  });
});

