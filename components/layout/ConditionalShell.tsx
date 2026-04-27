"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const NO_SHELL_PREFIXES = ["/worker", "/select-role"];
const NO_SHELL_EXACT = ["/"];

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalized = pathname.replace(/^\/ospat-mock(?=\/|$)/, "") || "/";

  const noShell =
    NO_SHELL_EXACT.includes(normalized) ||
    NO_SHELL_PREFIXES.some((p) => normalized.startsWith(p));

  if (noShell) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
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
