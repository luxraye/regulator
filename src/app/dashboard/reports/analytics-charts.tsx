"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Datum { name: string; value: number }

// One hue for magnitude; CEDA orange. Text stays in neutral ink.
const BAR = "#d94914";
const GRID = "#E5E7EB";
const INK = "#6B7280";

export function ReportCharts({
  funnel, byCall, bySector, byDistrict, byGender, byAge, byWeek,
}: {
  funnel: Datum[]; byCall: Datum[]; bySector: Datum[]; byDistrict: Datum[]; byGender: Datum[]; byAge: Datum[]; byWeek: { week: string; value: number }[];
}) {
  const top = Math.max(1, funnel[0]?.value ?? 1);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card title="Outcome funnel" sub="How many ideas reach each stage">
        <div className="space-y-3 pt-2">
          {funnel.map((f, i) => (
            <div key={f.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{f.name}</span>
                <span className="font-semibold text-ceda-ink">
                  {f.value}
                  {i > 0 && <span className="ml-1 text-xs font-normal text-muted-foreground">({Math.round((f.value / top) * 100)}%)</span>}
                </span>
              </div>
              <div className="h-3 rounded-full bg-ceda-sand">
                <div className="h-3 rounded-full bg-ceda-orange" style={{ width: `${(f.value / top) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Submissions per week" sub="Week starting">
        <Bars data={byWeek.map((w) => ({ name: w.week.slice(5), value: w.value }))} />
      </Card>
      <Card title="Ideas by sector"><HBars data={bySector} /></Card>
      <Card title="Ideas by call"><HBars data={byCall} /></Card>
      <Card title="Ideas by district" sub="Top 10"><HBars data={byDistrict} /></Card>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card title="By gender"><HBars data={byGender} small /></Card>
        <Card title="By age"><HBars data={byAge} small /></Card>
      </div>
    </div>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-semibold text-ceda-ink">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bars({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -20, right: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: INK }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: INK }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgba(217,73,20,0.06)" }} formatter={(v) => [v, "Ideas"]} />
        <Bar dataKey="value" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HBars({ data, small }: { data: Datum[]; small?: boolean }) {
  const h = Math.max(small ? 90 : 120, data.length * 30 + 10);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={small ? 80 : 170} tick={{ fontSize: 11, fill: INK }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgba(217,73,20,0.06)" }} formatter={(v) => [v, "Ideas"]} />
        <Bar dataKey="value" fill={BAR} radius={[0, 4, 4, 0]} barSize={16} label={{ position: "right", fontSize: 11, fill: INK }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
