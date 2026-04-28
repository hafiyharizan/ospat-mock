"use client";

import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex h-dvh overflow-hidden" style={{ background: "var(--bg)" }}>
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
