import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { actionLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Hidden from innovators so evaluator identities and blind-review steps stay private. */
const HIDDEN = ["CONFLICT_DECLARED", "NO_CONFLICT_DECLARED", "FILE_DOWNLOADED", "EVALUATION_SUBMITTED"];

export default async function ActivityPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const entries = await prisma.auditLog.findMany({
    where: { instance: { innovatorId: user.id }, action: { notIn: HIDDEN } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { instance: { select: { id: true, title: true, referenceCode: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-ink">Activity</h1>
        <p className="mt-1 text-muted-foreground">A timeline of everything that has happened to your applications.</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-5">
        {entries.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No activity yet.</p>
        ) : (
          <ol className="relative ml-2 border-l border-border">
            {entries.map((e) => (
              <li key={e.id} className="mb-5 ml-5 last:mb-0">
                <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-ceda-orange" />
                <p className="text-sm font-medium text-ceda-ink">{actionLabel(e.action)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.createdAt, true)}
                  {e.instance && (
                    <>
                      {" · "}
                      <Link href={`/dashboard/innovator/instance-runner/${e.instance.id}`} className="text-ceda-orange hover:underline">
                        {e.instance.referenceCode} {e.instance.title}
                      </Link>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
