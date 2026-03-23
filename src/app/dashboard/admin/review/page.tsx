import { prisma } from "@/lib/prisma";
import { ReviewClient } from "./review-client";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const instances = await prisma.instance.findMany({
    where: { status: "SUBMITTED" },
    include: { template: true, licensee: true, fields: true, files: true },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Review Queue</h1>
        <p className="text-muted-foreground mt-1">
          {instances.length} submissions awaiting review
        </p>
      </div>
      <ReviewClient instances={JSON.parse(JSON.stringify(instances))} />
    </div>
  );
}
