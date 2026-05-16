export const CLASSIFICATIONS = [
  "New Client",
  "Support Request",
  "Complaint",
  "Maintenance Issue",
  "Billing / Invoice Question",
  "General Question",
  "Urgent / Emergency",
  "Other",
] as const;

export const URGENCY_LEVELS = ["Low", "Medium", "High"] as const;

export type Classification = (typeof CLASSIFICATIONS)[number];
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const PROMPT_VERSION = "v1.0.0";
export const FALLBACK_CONFIDENCE = 0.35;
export const MANUAL_REVIEW_THRESHOLD = 0.5;

export const classificationBadgeMap: Record<
  Classification,
  { bg: string; text: string; border: string }
> = {
  "New Client": {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "Support Request": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Complaint: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  "Maintenance Issue": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  "Billing / Invoice Question": {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  "General Question": {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  "Urgent / Emergency": {
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  Other: {
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    border: "border-zinc-200",
  },
};

