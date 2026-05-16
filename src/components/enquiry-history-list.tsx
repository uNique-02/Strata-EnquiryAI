import Link from "next/link";
import type { EnquiryRow } from "@/lib/types";
import { ClassificationBadge } from "@/components/tag-badge";
import type { Classification } from "@/lib/constants";

export function EnquiryHistoryList({ enquiries }: { enquiries: EnquiryRow[] }) {
  if (enquiries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No enquiries yet. Submit one from the assistant page to build history cards.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {enquiries.map((item) => (
        <Link
          key={item.id}
          href={`/?enquiryId=${item.id}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow"
        >
          <div className="flex items-start justify-between gap-2">
            <ClassificationBadge classification={item.classification as Classification} />
            <span className="text-xs text-slate-500">
              {new Date(item.created_at).toLocaleString()}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">
            {item.client_name ?? "Unnamed Client"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{item.client_email ?? "No email supplied"}</p>
          <p className="mt-3 line-clamp-3 text-sm text-slate-700">{item.enquiry_text}</p>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
              Confidence {Math.round(item.confidence * 100)}%
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
              Urgency {item.urgency}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
