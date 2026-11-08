import Link from "next/link";
import { BadgeCheck, ShieldX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { codeMatches } from "@/lib/certificate";
import { formatDate, formatPula } from "@/lib/utils";
import { sectorName } from "@/lib/labels";

export const metadata = { title: "Check a certificate · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({ params }: { params: { ref: string; code: string } }) {
  const inst = await prisma.instance.findUnique({
    where: { referenceCode: params.ref },
    select: {
      referenceCode: true, title: true, status: true, awardAmount: true, reviewedAt: true,
      template: { select: { name: true, dataType: true } },
      innovator: { select: { organizationName: true } },
    },
  });
  const genuine =
    !!inst && inst.status === "AWARDED" &&
    codeMatches({ referenceCode: inst.referenceCode, awardAmount: inst.awardAmount, reviewedAt: inst.reviewedAt, organizationName: inst.innovator.organizationName }, params.code);

  return (
    <div className="bg-ceda-light/60 px-4 py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        {genuine && inst ? (
          <>
            <BadgeCheck className="mx-auto mb-3 h-12 w-12 text-ceda-green" />
            <h1 className="text-2xl font-bold text-ceda-navy">This certificate is genuine</h1>
            <p className="mt-2 text-sm text-muted-foreground">CEDA issued it, and the details below match our records.</p>
            <dl className="mt-6 space-y-2 text-left text-sm">
              {[
                ["Company", inst.innovator.organizationName ?? "Youth-owned company"],
                ["Idea", inst.title],
                ["Call", inst.template.name],
                ["Sector", sectorName(inst.template.dataType)],
                ["Award", formatPula(inst.awardAmount)],
                ["Awarded on", formatDate(inst.reviewedAt)],
                ["Reference", inst.referenceCode],
                ["Certificate code", params.code.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-1.5 last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium text-ceda-navy">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <>
            <ShieldX className="mx-auto mb-3 h-12 w-12 text-red-600" />
            <h1 className="text-2xl font-bold text-ceda-navy">We can&apos;t confirm this certificate</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The reference or code doesn&apos;t match an award in our records. It may have been typed wrongly or changed. Contact CEDA before relying on it.
            </p>
          </>
        )}
        <Link href="/funded" className="mt-6 inline-block text-sm font-medium text-ceda-blue hover:underline">See all funded innovators</Link>
      </div>
    </div>
  );
}
