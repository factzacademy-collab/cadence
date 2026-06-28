import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { FAQS } from "@/lib/data/mock";

export function Faq() {
  return (
    <section
      id="resources"
      aria-labelledby="faq-heading"
      className="py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Questions, answered
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Everything you need to know before you start. Still curious?{" "}
            <a
              href="#cta"
              className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Reach out to our team.
            </a>
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
