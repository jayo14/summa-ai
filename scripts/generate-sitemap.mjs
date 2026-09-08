/**
 * Build-time sitemap generator for Summa AI.
 * Run: node scripts/generate-sitemap.mjs
 * Generates: public/sitemap.xml
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "../client/public");
const SITE_URL = "https://summa-ai.app";

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/features", changefreq: "monthly", priority: "0.9" },
  { path: "/features/ai-study-assistant", changefreq: "monthly", priority: "0.8" },
  { path: "/features/ai-quiz-generator", changefreq: "monthly", priority: "0.8" },
  { path: "/features/ai-flashcards", changefreq: "monthly", priority: "0.8" },
  { path: "/features/study-planner", changefreq: "monthly", priority: "0.8" },
  { path: "/features/knowledge-graph", changefreq: "monthly", priority: "0.8" },
  { path: "/features/knowledge-gap-analysis", changefreq: "monthly", priority: "0.8" },
  { path: "/features/persistent-ai-memory", changefreq: "monthly", priority: "0.8" },
  { path: "/features/exam-prep", changefreq: "monthly", priority: "0.8" },
  { path: "/use-cases", changefreq: "monthly", priority: "0.9" },
  { path: "/use-cases/college-students", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/university-students", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/computer-science-students", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/exam-preparation", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases/self-learners", changefreq: "monthly", priority: "0.7" },
  { path: "/compare", changefreq: "monthly", priority: "0.8" },
  { path: "/compare/summa-ai-vs-chatgpt", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

const BLOG_ROUTES = [
  { slug: "how-to-study-with-ai", date: "2026-01-15" },
  { slug: "active-recall-with-ai", date: "2026-01-22" },
  { slug: "ai-flashcards-from-notes", date: "2026-02-01" },
  { slug: "find-knowledge-gaps-before-exam", date: "2026-02-08" },
  { slug: "ai-exam-preparation", date: "2026-02-15" },
  { slug: "best-ai-study-tools", date: "2026-02-22" },
  { slug: "chatgpt-vs-ai-study-assistants", date: "2026-03-01" },
  { slug: "spaced-repetition-improves-memory", date: "2026-03-08" },
  { slug: "active-recall-vs-passive-reading", date: "2026-03-15" },
  { slug: "build-study-plan-with-ai", date: "2026-03-22" },
  { slug: "study-computer-science-effectively", date: "2026-04-01" },
  { slug: "turn-lecture-notes-into-questions", date: "2026-04-08" },
  { slug: "stop-forgetting-what-you-study", date: "2026-04-15" },
  { slug: "ai-study-assistant-vs-chatbot", date: "2026-04-22" },
  { slug: "ai-study-tools-nigerian-students", date: "2026-05-01" },
];

function generateSitemap() {
  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const route of STATIC_ROUTES) {
    xml += `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  }

  for (const blog of BLOG_ROUTES) {
    xml += `  <url>
    <loc>${SITE_URL}/blog/${blog.slug}</loc>
    <lastmod>${blog.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  xml += `</urlset>`;

  writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), xml, "utf-8");
  console.log(`Sitemap generated: ${PUBLIC_DIR}/sitemap.xml`);
  console.log(`Total URLs: ${STATIC_ROUTES.length + BLOG_ROUTES.length}`);
}

generateSitemap();
