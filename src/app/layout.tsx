import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

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
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
