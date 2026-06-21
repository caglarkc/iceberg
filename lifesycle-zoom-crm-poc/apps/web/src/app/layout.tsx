import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifesycle Mock CRM — Zoom Flow POC",
  description: "M3 Lifesycle Zoom Meeting Flow demonstration"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                LS
              </div>
              <div>
                <p className="text-sm font-semibold">Lifesycle Mock CRM</p>
                <p className="text-xs text-slate-500">Zoom Meeting Flow POC (M3)</p>
              </div>
            </div>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="text-slate-600 hover:text-brand-600">
                Contacts
              </a>
              <a href="/settings" className="text-slate-600 hover:text-brand-600">
                Settings
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
