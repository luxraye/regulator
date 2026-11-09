import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { certificateCode, verifyPath } from "@/lib/certificate";
import { formatDate, formatPula } from "@/lib/utils";
import { sectorName, stageName } from "@/lib/labels";
import { Logo } from "@/components/brand/logo";
import { QrToPath } from "@/components/funded/qr-to-path";
import { PrintButton } from "@/components/funded/print-button";
import { setShowcase } from "../actions";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const inst = await prisma.instance.findFirst({
    where: { id: params.id, innovatorId: user.id, status: "AWARDED" },
    select: {
      id: true, referenceCode: true, title: true, awardAmount: true, reviewedAt: true, showcase: true,
      template: { select: { name: true, dataType: true, scale: true } },
      innovator: { select: { name: true, organizationName: true } },
    },
  });
  if (!inst) notFound();
  const code = certificateCode({ referenceCode: inst.referenceCode, awardAmount: inst.awardAmount, reviewedAt: inst.reviewedAt, organizationName: inst.innovator.organizationName });
  const path = verifyPath(inst.referenceCode, code);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/innovator/instances" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ceda-navy">
          <ArrowLeft className="h-4 w-4" /> My ideas
        </Link>
        <PrintButton />
      </div>

      {/* The certificate */}
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="h-2 bg-gradient-to-r from-ceda-navy via-ceda-blue to-ceda-amber" />
        <div className="relative px-5 py-8 sm:px-14 sm:py-14">
          <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-ceda-navy/10 sm:inset-4" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-2">
            <Logo />
            <p className="font-mono text-xs text-muted-foreground">{inst.referenceCode}</p>
          </div>
          <p className="relative mt-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ceda-blue sm:mt-10 sm:tracking-[0.25em]">Certificate of award</p>
          <p className="relative mt-4 text-center text-sm text-muted-foreground">This certifies that</p>
          <h1 className="relative mt-2 break-words text-center text-2xl font-bold text-ceda-navy sm:text-4xl">{inst.innovator.organizationName ?? inst.innovator.name}</h1>
          <p className="relative mt-1 text-center text-sm text-muted-foreground">represented by {inst.innovator.name}</p>
          <p className="relative mx-auto mt-6 max-w-xl text-center leading-relaxed text-slate-700">
            was awarded <strong className="text-ceda-navy">{formatPula(inst.awardAmount)}</strong> under the <strong className="text-ceda-navy">{inst.template.name}</strong> call
            for the idea <strong className="text-ceda-navy">&ldquo;{inst.title}&rdquo;</strong>, after independent blind scoring and a decision by the CEDA adjudication panel.
          </p>
          <div className="relative mt-8 grid gap-6 sm:mt-10 sm:grid-cols-[1fr_auto] sm:items-end">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between sm:contents"><dt className="text-muted-foreground">Sector</dt><dd className="font-medium text-ceda-navy">{sectorName(inst.template.dataType)}</dd></div>
              <div className="flex justify-between sm:contents"><dt className="text-muted-foreground">Stage</dt><dd className="font-medium text-ceda-navy">{stageName(inst.template.scale)}</dd></div>
              <div className="flex justify-between sm:contents"><dt className="text-muted-foreground">Awarded on</dt><dd className="font-medium text-ceda-navy">{formatDate(inst.reviewedAt)}</dd></div>
              <div className="flex justify-between sm:contents"><dt className="text-muted-foreground">Certificate code</dt><dd className="font-mono font-medium text-ceda-navy">{code}</dd></div>
            </dl>
            <div className="text-center">
              <QrToPath path={path} className="mx-auto h-24 w-24" />
              <p className="mt-1 text-[11px] text-muted-foreground">Scan to check it&apos;s genuine</p>
            </div>
          </div>
          <p className="relative mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
            Citizen Entrepreneurial Development Agency · Youth Innovation Challenge 2026
          </p>
        </div>
      </div>

      {/* Showcase choice */}
      <form action={setShowcase} className="mx-auto max-w-3xl rounded-xl border border-border bg-white p-5 print:hidden">
        <input type="hidden" name="id" value={inst.id} />
        <p className="font-semibold text-ceda-navy">Funded innovators page</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose whether CEDA lists your company, idea title, district and award on the public <Link href="/funded" className="text-ceda-blue hover:underline">Funded innovators</Link> page.
          Your application itself is never shown. You can change this at any time.
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" name="showcase" defaultChecked={inst.showcase} className="h-4 w-4" /> List my award publicly
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button className="rounded-lg bg-ceda-blue px-4 py-2 text-sm font-medium text-white hover:bg-ceda-blue/90">Save choice</button>
          {searchParams.saved && <span className="text-sm text-emerald-700">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
