import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { PublicReceiptVerifier } from "./receipt-verifier";

export const metadata = { title: "Verification & Integrity · CEDA Innovation Portal" };

// Lets anyone check a certificate or verify a signed submission receipt with sealed Faithfulness Report
export default function VerifyLookupPage({
  searchParams,
}: {
  searchParams: { ref?: string; code?: string; tab?: string };
}) {
  const ref = searchParams.ref?.trim().toUpperCase();
  const code = searchParams.code?.trim().toUpperCase();
  if (ref && code) redirect(`/verify/${encodeURIComponent(ref)}/${encodeURIComponent(code)}`);

  return (
    <div className="bg-ceda-sand/60 px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Certificate Verification Card */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <BadgeCheck className="mx-auto mb-3 h-12 w-12 text-ceda-orange" />
          <h1 className="text-center text-2xl font-bold text-ceda-ink">Check an Award Certificate</h1>
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
              Check Certificate
            </button>
          </form>
        </div>

        {/* Submission Receipt & Faithfulness Verifier */}
        <PublicReceiptVerifier />
      </div>
    </div>
  );
}
