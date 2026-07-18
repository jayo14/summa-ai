import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://summa-ai.com";

export const metadata: Metadata = {
  title: {
    default: "Summa AI — Smarter Learning, Streamlined Success",
    template: "%s | Summa AI",
  },
  description:
    "Summa AI is an adaptive learning companion that remembers your knowledge, gaps, exams, and goals — and teaches at your level.",
  keywords: [
    "Summa AI", "AI tutor", "adaptive learning", "study companion", "exam prep",
    "AI study assistant", "personalized learning", "knowledge graph", "student AI",
    "memory-augmented learning", "Cognee", "AI that remembers",
  ],
  authors: [{ name: "Summa AI Team", url: baseUrl }],
  creator: "Summa AI",
  publisher: "Summa AI",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Summa AI",
    title: "Summa AI — The Learning Companion That Never Forgets",
    description:
      "Summa AI remembers what you know, what you missed, when your exams are due, and how you learn best — then shapes every session around you.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Summa AI — Adaptive Learning Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Summa AI — Smarter Learning, Streamlined Success",
    description:
      "AI that remembers what you know and teaches at your level. Persistent memory, adaptive study plans, and progress tracking.",
    images: ["/og-image.png"],
    creator: "@summa_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: baseUrl,
  },
  appleWebApp: {
    capable: true,
    title: "Summa AI",
    statusBarStyle: "black-translucent",
  },
  category: "education",
  classification: "EdTech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || "http://localhost:8000"} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Summa AI",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              description:
                "An adaptive learning companion that remembers your knowledge, gaps, exams, and goals — and teaches at your level.",
              url: baseUrl,
              author: { "@type": "Organization", name: "Summa AI Team" },
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </head>
      <body className={`${lexendDeca.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
