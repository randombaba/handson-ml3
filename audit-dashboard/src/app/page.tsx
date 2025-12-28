"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const kpis = [
  { label: "Total Active Reports", value: 612 },
  { label: "Overdue", value: 74 },
  { label: "Due in 30 days", value: 45 },
  { label: "Approved (last batch)", value: 19 }
];

const wingSummary = [
  { wing: "Railway Audit", overdue: 12, dueSoon: 18 },
  { wing: "Defence", overdue: 9, dueSoon: 14 },
  { wing: "Commercial", overdue: 7, dueSoon: 10 },
  { wing: "Central Receipt", overdue: 20, dueSoon: 12 },
  { wing: "LGA", overdue: 26, dueSoon: 20 }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="text-sm text-slate-500">{kpi.label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{kpi.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Wing Overview</div>
              <p className="text-sm text-slate-500">
                Overdue and due-soon counts by functional wing
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wingSummary} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wing" tick={{ fontSize: 12 }} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="overdue" fill="#dc2626" name="Overdue" />
                <Bar dataKey="dueSoon" fill="#f59e0b" name="Due Soon" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Filters</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-200 px-3 py-2">Universe: STATE</div>
            <div className="rounded-lg border border-slate-200 px-3 py-2">AAP Year: 2024-25</div>
            <div className="rounded-lg border border-slate-200 px-3 py-2">Status: Overdue</div>
            <div className="rounded-lg border border-slate-200 px-3 py-2">As-on: July 2025</div>
          </div>
        </div>
      </section>
    </div>
  );
}
