import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalShell } from "@/components/layout/ConditionalShell";

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem("shift-theme");
    const mode = stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
    const resolved = mode === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.classList.remove("dark");
  }
})();
`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SHIFT+ | NexCorp",
  description:
    "NexCorp SHIFT+ — Safety & Human Impairment Fitness Tracking. Fitness-for-work signals, personal-band monitoring, and supervisor routing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
