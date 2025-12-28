export default function CompareBatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Compare Batches</h1>
        <p className="mt-2 text-sm text-slate-600">
          Compare two batches to identify newly added reports, status changes, and revised targets.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-500">Comparison Summary</div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>18 newly added reports since last batch.</li>
          <li>12 reports moved to Approved.</li>
          <li>5 target dates revised.</li>
          <li>7 new overdue items.</li>
        </ul>
      </div>
    </div>
  );
}
