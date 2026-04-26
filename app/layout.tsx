import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SummaryBar } from "@/components/layout/SummaryBar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OSPAT Insights Concept",
  description:
    "Concept dashboard for workforce readiness assessments. Demo data only — not affiliated with any product.",
};

/** Inline script run before first paint to prevent flash of wrong theme */
const themeScript = `(function(){try{var t=localStorage.getItem('ospat-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Sidebar />
          <div className="lg:pl-64">
            <Topbar />
            <SummaryBar />
            <main className="px-4 sm:px-5 py-5 sm:py-6 max-w-[1400px] mx-auto animate-fade-in">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

