export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading programme overview">
      <div>
        <h1 className="text-2xl font-bold text-ceda-ink">Programme overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Loading live screening and evaluation metrics…</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-white p-4" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-white p-6" />
    </div>
  );
}
