'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import type { ProductFaqItem } from '@/lib/seo/product-faq'

export default function ProductFaqAccordion({ faqs }: { faqs: ProductFaqItem[] }) {
  if (!faqs.length) return null

  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-xl font-bold text-[#2a2a2a] mb-4">Preguntas frecuentes</h2>
      <Accordion.Root type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <Accordion.Item
            key={faq.question}
            value={`faq-${i}`}
            className="bg-white border border-[#e8ddd0] rounded-xl overflow-hidden"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-[#2a2a2a] hover:bg-[#f9f6f1] transition-colors group">
                {faq.question}
                <ChevronDown className="w-4 h-4 shrink-0 text-[#a08c7a] transition-transform group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-4 pb-4 text-sm text-[#6b5344] leading-relaxed data-[state=open]:animate-accordion-down">
              {faq.answer}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  )
}
