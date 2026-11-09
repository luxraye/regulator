import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";

export const metadata = { title: "Check a certificate · CEDA Innovation Portal" };

// Lets anyone check a certificate by typing its reference and code,
// for people who have the printed certificate but can't scan the QR code.
export default function VerifyLookupPage({ searchParams }: { searchParams: { ref?: string; code?: string } }) {
  const ref = searchParams.ref?.trim().toUpperCase();
  const code = searchParams.code?.trim().toUpperCase();
  if (ref && code) redirect(`/verify/${encodeURIComponent(ref)}/${encodeURIComponent(code)}`);

  return (
    <div className="bg-ceda-sand/60 px-4 py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 shadow-sm">
        <BadgeCheck className="mx-auto mb-3 h-12 w-12 text-ceda-orange" />
        <h1 className="text-center text-2xl font-bold text-ceda-ink">Check a certificate</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Scan the QR code on a CEDA award certificate, or type the reference and certificate code printed on it.
        </p>
        <form method="get" action="/verify" className="mt-6 space-y-4">
          <div>
            <label htmlFor="ref" className="mb-1 block text-sm font-medium text-ceda-ink">Reference</label>
            <input id="ref" name="ref" required defaultValue={ref} placeholder="CEDA-26-XXXX"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ceda-orange" />
          </div>
          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium text-ceda-ink">Certificate code</label>
            <input id="code" name="code" required defaultValue={code} placeholder="XXXX-XXXX-XXXX"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ceda-orange" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-ceda-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Check certificate
          </button>
        </form>
      </div>
    </div>
  );
}
