import { cn } from "@/lib/utils";
import { complaintStatusMeta, instanceStatusMeta } from "@/lib/labels";

export function StatusBadge({
  status,
  kind = "instance",
  className,
}: {
  status: string;
  kind?: "instance" | "complaint";
  className?: string;
}) {
  const map = kind === "complaint" ? complaintStatusMeta : instanceStatusMeta;
  const meta = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  );
}
