import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SummaryBar } from "@/components/layout/SummaryBar";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Sidebar />
        <div className="lg:pl-60">
          <Topbar />
          <SummaryBar />
          <main className="px-4 sm:px-5 py-5 sm:py-6 max-w-[1400px] mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
