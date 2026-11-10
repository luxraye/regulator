import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-ceda-sand px-4 py-16 text-center">
      <div className="max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <LogoMark className="mx-auto mb-4 h-10 w-10" />
        <p className="text-xs font-semibold uppercase tracking-widest text-ceda-orange">404 · Page not found</p>
        <h1 className="mt-2 text-2xl font-bold text-ceda-ink">We couldn&apos;t find that page</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page or application link may have moved, or the address may have a typo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-lg bg-ceda-ink px-4 py-2 text-sm font-medium text-white hover:bg-ceda-ink/90 transition-colors">
            Back to home
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ceda-ink hover:bg-ceda-sand transition-colors">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
