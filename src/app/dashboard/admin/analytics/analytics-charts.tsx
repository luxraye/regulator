"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#003366", "#0066CC", "#28A745", "#FFC107", "#FF6B35", "#ef4444", "#6b7280"];

interface ChartData {
  name: string;
  value: number;
}

export function AnalyticsCharts({
  statusData,
  scaleData,
  typeData,
  totalInstances,
}: {
  statusData: ChartData[];
  scaleData: ChartData[];
  typeData: ChartData[];
  totalInstances: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <p className="text-3xl font-bold text-bocra-navy">{totalInstances}</p>
          <p className="text-sm text-muted-foreground">Total Instances</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <p className="text-3xl font-bold text-bocra-green">
            {statusData.find((d) => d.name === "APPROVED")?.value || 0}
          </p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <p className="text-3xl font-bold text-bocra-orange">
            {(statusData.find((d) => d.name === "FLAGGED")?.value || 0) +
              (statusData.find((d) => d.name === "REJECTED")?.value || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Flagged / Rejected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-bocra-navy mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#003366" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-bocra-navy mb-4">By Classification Scale</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scaleData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {scaleData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 lg:col-span-2">
          <h3 className="font-semibold text-bocra-navy mb-4">By Data Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {typeData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
