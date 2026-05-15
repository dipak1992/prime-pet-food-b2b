"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  heading?: string;
}

export default function FAQAccordion({ faqs, heading = "Frequently asked questions" }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl">
      {heading && (
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#111827]">{heading}</h2>
      )}
      <div
        className="divide-y divide-[#e7e4dc] rounded-2xl border border-[#e7e4dc] bg-white"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        {faqs.map((faq, index) => (
          <div
            key={index}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span className="text-sm font-semibold text-[#111827]" itemProp="name">
                {faq.question}
              </span>
              <span className="mt-0.5 shrink-0 text-[#6b7280]">
                {openIndex === index ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
            {openIndex === index && (
              <div
                className="px-5 pb-4"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p className="text-sm leading-6 text-[#4b5563]" itemProp="text">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
