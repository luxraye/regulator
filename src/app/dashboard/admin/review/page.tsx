import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileText, Paperclip } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const instances = await prisma.instance.findMany({
    where: { status: "SUBMITTED" },
    select: {
      id: true,
      submittedAt: true,
      deadline: true,
      submissionCount: true,
      template: { select: { name: true, code: true } },
      innovator: { select: { organizationName: true } },
      _count: { select: { fields: true, files: true } },
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Review queue</h1>
        <p className="mt-1 text-muted-foreground">
          {instances.length === 0 ? "Nothing waiting." : `${instances.length} submission${instances.length === 1 ? "" : "s"} waiting, oldest first.`}
        </p>
      </div>

      {instances.length === 0 ? (
        <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
          <ClipboardCheck className="mx-auto mb-3 text-bocra-green" size={32} />
          <p className="font-medium text-bocra-navy">All caught up</p>
          <p className="text-sm text-muted-foreground">New submissions will appear here and in your notifications.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {instances.map((inst) => {
            const late = inst.submittedAt && inst.submittedAt > inst.deadline;
            return (
              <Link
                key={inst.id}
                href={`/dashboard/admin/instances/${inst.id}`}
                className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 transition-all hover:border-bocra-blue/40 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-bocra-navy">
                    {inst.template.name}
                    {inst.submissionCount > 1 && (
                      <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">Resubmission</span>
                    )}
                    {late && <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">Late</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {inst.innovator.organizationName} · <span className="font-mono">{inst.template.code}</span> · submitted{" "}
                    {inst.submittedAt ? timeAgo(inst.submittedAt) : "—"} ({formatDate(inst.submittedAt)})
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText size={13} /> {inst._count.fields} fields</span>
                  <span className="flex items-center gap-1"><Paperclip size={13} /> {inst._count.files} files</span>
                  <span className="flex items-center gap-1 font-medium text-bocra-blue">
                    Review <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
