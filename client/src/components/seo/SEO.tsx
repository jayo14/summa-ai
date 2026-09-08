import { Helmet } from "react-helmet-async";
import { SITE } from "@/data/seo/site";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];
}

const PROD_URL = SITE.url;

export function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  noindex = false,
  nofollow = false,
  keywords,
}: SEOProps) {
  const fullTitle = title
    ? title.includes("|") || title.includes("—")
      ? title
      : `${title} | ${SITE.name}`
    : `${SITE.tagline} | ${SITE.name}`;

  const fullDescription = description || SITE.description;
  const fullUrl = canonical ? `${PROD_URL}${canonical}` : PROD_URL;
  const fullImage = ogImage?.startsWith("http")
    ? ogImage
    : `${PROD_URL}${ogImage || SITE.ogImage}`;
  const robotsContent = [
    noindex ? "noindex" : "index",
    nofollow ? "nofollow" : "follow",
  ].join(", ");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={SITE.locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      {SITE.twitterHandle && (
        <meta name="twitter:site" content={SITE.twitterHandle} />
      )}

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      {/* Theme */}
      <meta name="theme-color" content="#003F3F" />
    </Helmet>
  );
}
