import type { Metadata } from "next";
import { Figtree, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Summa AI — Smarter Learning, Streamlined Success",
  description:
    "Summa AI is an adaptive learning companion that remembers your knowledge, gaps, exams, and goals — and teaches at your level.",
  keywords: ["Summa AI", "AI tutor", "adaptive learning", "study companion", "exam prep"],
  authors: [{ name: "Summa AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${figtree.variable} ${instrumentSerif.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
