import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CallCard } from "@/components/ideas/call-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Open calls · CEDA Innovation Portal" };

export default async function PublicCallsPage() {
  const now = new Date();
  const [open, closed] = await Promise.all([
    prisma.template.findMany({ where: { status: "OPEN", opensAt: { lte: now }, closesAt: { gte: now } }, orderBy: { closesAt: "asc" } }),
    prisma.template.findMany({ where: { OR: [{ status: "CLOSED" }, { closesAt: { lt: now } }] }, orderBy: { closesAt: "desc" }, take: 3 }),
  ]);
  return (
    <div className="bg-ceda-sand">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ceda-ink">Open calls</h1>
        <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">
          Pick the call that matches your sector and how far along you are. You can apply once to each call.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {open.map((c) => (
            <CallCard
              key={c.id}
              call={c}
              action={
                <Link href={`/calls/${c.code}`} className="inline-flex items-center gap-1 rounded-lg bg-ceda-orange px-4 py-2 text-sm font-medium text-white hover:bg-ceda-orange/90">
                  Details and how to apply <ArrowRight size={14} />
                </Link>
              }
            />
          ))}
        </div>
        {closed.length > 0 && (
          <>
            <h2 className="mb-4 mt-12 text-xl font-semibold text-ceda-ink">Recently closed</h2>
            <div className="grid grid-cols-1 gap-6 opacity-80 md:grid-cols-2 lg:grid-cols-3">
              {closed.map((c) => <CallCard key={c.id} call={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
