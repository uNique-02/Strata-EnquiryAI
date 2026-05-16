import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnquiryHistoryList } from "@/components/enquiry-history-list";

describe("EnquiryHistoryList", () => {
  it("renders cards with links to main page enquiryId", () => {
    render(
      <EnquiryHistoryList
        enquiries={[
          {
            id: "enq_123",
            user_id: "user_1",
            client_name: "John",
            client_email: "john@example.com",
            enquiry_text: "Need help with billing for this month.",
            classification: "Billing / Invoice Question",
            confidence: 0.84,
            urgency: "Medium",
            summary: "Billing question",
            recommended_action: "Route to billing team.",
            suggested_response: "Thanks, we will review your invoice.",
            manual_review: false,
            model_used: "openai/gpt-4o-mini",
            prompt_version: "v1",
            raw_ai_json: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]}
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/?enquiryId=enq_123");
    expect(screen.getByText("Billing / Invoice Question")).toBeInTheDocument();
  });
});

