import { classificationBadgeMap, type Classification } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ClassificationBadge({
  classification,
}: {
  classification: Classification;
}) {
  const style = classificationBadgeMap[classification];
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        style.bg,
        style.text,
        style.border,
      )}
    >
      {classification}
    </span>
  );
}

