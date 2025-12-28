import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Audit Report Monitoring Dashboard",
  description: "CAG HQ audit report monitoring dashboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="text-lg font-semibold">Audit Report Monitoring Dashboard</div>
              <nav className="flex gap-4 text-sm text-slate-600">
                <a className="hover:text-slate-900" href="/">
                  Dashboard
                </a>
                <a className="hover:text-slate-900" href="/upload">
                  Upload Dataset
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
