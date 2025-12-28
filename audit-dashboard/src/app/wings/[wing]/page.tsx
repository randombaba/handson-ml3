import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wing Overview"
};

export default function WingPage({ params }: { params: { wing: string } }) {
  const wingName = decodeURIComponent(params.wing);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{wingName} - Summary</h1>
        <p className="mt-2 text-sm text-slate-600">
          Drill down by state/domain with overdue highlights and recent status changes.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-500">Summary Table</div>
        <div className="mt-4 grid gap-3">
          {[
            { label: "Customs", overdue: 8, dueSoon: 4 },
            { label: "Direct Taxes", overdue: 5, dueSoon: 3 },
            { label: "GST", overdue: 7, dueSoon: 6 }
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span>{row.label}</span>
              <span className="text-slate-500">
                Overdue {row.overdue} · Due soon {row.dueSoon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
