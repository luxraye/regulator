import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "./analytics-charts";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const instances = await prisma.instance.findMany({
    include: { template: true, licensee: true },
  });

  const statusCounts = instances.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const scaleCounts = instances.reduce((acc, i) => {
    const label = i.template.scale === "SCALE_1" ? "Large (Scale 1)" :
                  i.template.scale === "SCALE_2" ? "Medium (Scale 2)" : "Small (Scale 3)";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = instances.reduce((acc, i) => {
    const label = i.template.dataType === "TYPE_A" ? "Financial (A)" :
                  i.template.dataType === "TYPE_B" ? "Technical (B)" : "Public Service (C)";
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
