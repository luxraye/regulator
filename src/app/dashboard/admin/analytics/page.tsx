import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "./analytics-charts";
import { instanceStatusMeta, scaleLabels, typeLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const instances = await prisma.instance.findMany({
    select: { status: true, template: { select: { scale: true, dataType: true } } },
  });

  const statusCounts = instances.reduce((acc, i) => {
    const label = instanceStatusMeta[i.status]?.label ?? i.status;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const scaleCounts = instances.reduce((acc, i) => {
    const label = `Scale ${scaleLabels[i.template.scale] ?? i.template.scale}`;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = instances.reduce((acc, i) => {
    const t = typeLabels[i.template.dataType];
    const label = t ? `${t.full.split(" (")[0]} (${t.short})` : i.template.dataType;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Compliance overview across all licensees
        </p>
      </div>
      <AnalyticsCharts
        statusData={Object.entries(statusCounts).map(([name, value]) => ({ name, value }))}
        scaleData={Object.entries(scaleCounts).map(([name, value]) => ({ name, value }))}
        typeData={Object.entries(typeCounts).map(([name, value]) => ({ name, value }))}
        totalInstances={instances.length}
      />
    </div>
  );
}
