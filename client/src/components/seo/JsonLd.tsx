import { Helmet } from "react-helmet-async";

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Summa AI",
        url: "https://summa-ai.app",
        logo: "https://summa-ai.app/og/summa-ai-og.png",
        description:
          "AI-powered learning companion that helps students and lifelong learners understand, retain, and master knowledge.",
        foundingDate: "2026",
        contactPoint: {
          "@type": "ContactPoint",
          email: "hello@summastudy.com.ng",
          contactType: "customer service",
        },
        sameAs: [],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Summa AI",
        url: "https://summa-ai.app",
        description:
          "AI study assistant that remembers what you learn, tracks knowledge gaps, and generates quizzes, flashcards, and study plans.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://summa-ai.app/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Summa AI",
        url: "https://summa-ai.app",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description:
          "AI-powered study assistant with persistent memory, knowledge graphs, quizzes, flashcards, study plans, and personalized learning.",
        offers: [
          {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            name: "Free",
          },
          {
            "@type": "Offer",
            price: "12",
            priceCurrency: "USD",
            name: "Pro",
            billingIncrement: "P1M",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1200",
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `https://summa-ai.app${item.url}`,
        })),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName = "Summa AI",
  image,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: `https://summa-ai.app${url}`,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
          "@type": "Organization",
          name: authorName,
          url: "https://summa-ai.app",
        },
        publisher: {
          "@type": "Organization",
          name: "Summa AI",
          url: "https://summa-ai.app",
          logo: {
            "@type": "ImageObject",
            url: "https://summa-ai.app/og/summa-ai-og.png",
          },
        },
        image: image
          ? `https://summa-ai.app${image}`
          : "https://summa-ai.app/og/summa-ai-og.png",
      }}
    />
  );
}

export function FAQJsonLd({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}
