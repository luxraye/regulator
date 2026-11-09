export default function ReportsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading programme reports">
      <div>
        <h1 className="text-2xl font-bold text-ceda-navy">Programme reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Loading district, gender and sector participation breakdowns…</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-white p-4" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-white p-6" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-white p-6" />
      </div>
    </div>
  );
}
