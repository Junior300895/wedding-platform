import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-amber-100 text-amber-700",
  default: "bg-neutral-100 text-neutral-700",
};

const labels: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publie",
  ARCHIVED: "Archive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? styles.default
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
