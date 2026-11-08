import { cn } from "@/lib/utils";
import { instanceStatusMeta } from "@/lib/labels";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = instanceStatusMeta[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", meta.className, className)}>
      {meta.label}
    </span>
  );
}
