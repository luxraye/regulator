export default function PanelLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading adjudication shortlist">
      <div>
        <h1 className="text-2xl font-bold text-ceda-ink">Adjudication panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Loading ranked shortlist and evaluator scorecards…</p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-white p-6" />
        ))}
      </div>
    </div>
  );
}
