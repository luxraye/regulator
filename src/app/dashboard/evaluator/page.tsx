import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, ClipboardList, Clock, UserX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { sectorName } from "@/lib/labels";
import { cn, formatDate, relativeDeadline } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EvaluatorHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const evals = await prisma.evaluation.findMany({
    where: { evaluatorId: user.id },
    orderBy: [{ submittedAt: { sort: "desc", nulls: "first" } }, { dueAt: "asc" }],
    include: { instance: { select: { referenceCode: true, title: true, status: true, template: { select: { name: true, dataType: true } } } } },
  });

  const todo = evals.filter((e) => !e.submittedAt && e.conflict !== true && e.instance.status === "UNDER_REVIEW");
  const done = evals.filter((e) => e.submittedAt);
  const stepped = evals.filter((e) => e.conflict === true);
  const avg = done.length ? Math.round(done.reduce((a, e) => a + (e.total ?? 0), 0) / done.length) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-navy">My assignments</h1>
        <p className="mt-1 text-muted-foreground">
          Declare any conflict first, then score each idea against the call&apos;s criteria. You see the idea, not the applicant&apos;s personal details.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={<Clock />} label="To score" value={todo.length} tone="text-amber-600 bg-amber-100" />
        <Tile icon={<CheckCircle2 />} label="Submitted" value={done.length} tone="text-ceda-green bg-ceda-green/10" />
        <Tile icon={<UserX />} label="Stepped aside" value={stepped.length} tone="text-gray-600 bg-gray-100" />
        <Tile icon={<ClipboardList />} label="My average score" value={avg ?? "—"} tone="text-ceda-blue bg-ceda-blue/10" />
      </div>

      <div className="space-y-6">
        <Group title="To score" empty="Nothing waiting. CEDA will notify you when an idea is assigned." items={todo} />
        <Group title="Submitted" items={done} />
        {stepped.length > 0 && <Group title="Stepped aside (conflict declared)" items={stepped} />}
      </div>
    </div>
  );
}

type Ev = Awaited<ReturnType<typeof prisma.evaluation.findMany>>[number] & {
  instance: { referenceCode: string; title: string; status: string; template: { name: string; dataType: string } };
};

function Group({ title, items, empty }: { title: string; items: Ev[]; empty?: string }) {
  return (
    <section className="rounded-xl border border-border bg-white">
      <h2 className="border-b border-border px-5 py-3 font-semibold text-ceda-navy">
        {title} <span className="font-normal text-muted-foreground">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">{empty ?? "None."}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((e) => {
            const due = relativeDeadline(e.dueAt);
            const state = e.submittedAt
              ? { text: `Scored ${e.total}/100`, cls: "bg-green-100 text-green-700" }
              : e.conflict === true
                ? { text: "Conflict declared", cls: "bg-gray-100 text-gray-600" }
                : e.conflict === null
                  ? { text: "Declare conflict", cls: "bg-amber-100 text-amber-800" }
                  : { text: "In progress", cls: "bg-blue-100 text-blue-700" };
            return (
              <li key={e.id}>
                <Link href={`/dashboard/evaluator/${e.id}`} className="group flex items-center justify-between gap-3 px-5 py-4 hover:bg-ceda-light/60">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.instance.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{e.instance.referenceCode}</span> · {sectorName(e.instance.template.dataType)}
                      {!e.submittedAt && e.conflict !== true && (
                        <span className={cn(" ml-1", due.overdue ? "text-red-600" : due.soon ? "text-amber-700" : "")}> · due {formatDate(e.dueAt)} ({due.text})</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", state.cls)}>{state.text}</span>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Tile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tone}`}>{icon}</div>
      <p className="text-2xl font-bold text-ceda-navy">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
