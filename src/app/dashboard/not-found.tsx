import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ceda-blue/10 text-ceda-blue">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-ceda-navy">Item not found in dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This application, call, or page does not exist or you may not have access to it with your current role.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="rounded-lg bg-ceda-navy px-4 py-2 text-sm font-medium text-white hover:bg-ceda-navy/90">
            Dashboard home
          </Link>
          <Link href="/calls" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ceda-navy hover:bg-ceda-light">
            Browse open calls
          </Link>
        </div>
      </div>
    </div>
  );
}
