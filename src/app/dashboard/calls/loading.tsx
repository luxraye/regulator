export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ceda-navy">Calls &amp; scoring rubrics</h1>
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-ceda-navy/10" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-white p-5" />
        ))}
      </div>
    </div>
  );
}
