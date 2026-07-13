import type { Metadata } from "next";
import { Lexend_Deca, Merriweather } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
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
      <body className={`${lexendDeca.variable} ${merriweather.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
