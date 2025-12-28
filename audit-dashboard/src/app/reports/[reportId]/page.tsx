import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Detail"
};

export default function ReportDetail({ params }: { params: { reportId: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Report {params.reportId}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Status timeline, metadata, and attachment history for this audit report.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-500">Status Timeline</div>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            <div>
              <div className="font-medium">Submitted to CAG Sectt</div>
              <div className="text-slate-500">Observed on 30.06.2025</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
            <div>
              <div className="font-medium">Under finalization</div>
              <div className="text-slate-500">Observed on 30.05.2025</div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
