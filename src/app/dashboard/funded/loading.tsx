export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ceda-navy">Funded innovators showcase</h1>
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-ceda-navy/10" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-white p-4" />
        ))}
      </div>
    </div>
  );
}
