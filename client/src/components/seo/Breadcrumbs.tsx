import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { BreadcrumbJsonLd } from "./JsonLd";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ label: "Home", href: "/" }, ...items];

  const jsonLdItems = allItems.map((item) => ({
    name: item.label,
    url: item.href || "/",
  }));

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center flex-wrap gap-1 text-xs text-grey-green dark:text-[#8FA29B]">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight
                    size={12}
                    className="text-grey-green/40 dark:text-[#8FA29B]/40"
                    aria-hidden="true"
                  />
                )}
                {isLast || !item.href ? (
                  <span
                    className="text-ink dark:text-cream-soft font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-teal-dark dark:hover:text-accent-lime transition-colors focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime rounded"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
