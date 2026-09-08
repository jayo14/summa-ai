import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQJsonLd } from "./JsonLd";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
}

export function FAQSection({ items, title = "Frequently Asked Questions" }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <FAQJsonLd items={items} />
      <section aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream-soft mb-8"
        >
          {title}
        </h2>
        <div className="space-y-3" role="list">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-mist-green dark:border-[#2A3838] rounded-xl overflow-hidden bg-white dark:bg-[#1C2323]"
                role="listitem"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-sm font-semibold text-ink dark:text-cream-soft pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-grey-green dark:text-[#8FA29B] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    className="px-4 pb-4 text-sm text-grey-green dark:text-[#8FA29B] leading-relaxed"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
