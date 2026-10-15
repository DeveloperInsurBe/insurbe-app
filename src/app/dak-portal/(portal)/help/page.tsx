"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, LifeBuoy, Mail, SearchX, ShieldCheck } from "lucide-react";

import { EmptyState, FadeIn, PageHeader, Panel, SearchInput } from "../../_components/ui";

// No design screenshot exists for this page yet - general portal help only.
const FAQS = [
  {
    q: "How do I review a new application?",
    a: "Open Applications, select a registration to see its details, documents and history. Status changes are recorded automatically in the Activity Log.",
  },
  {
    q: "What does “Info Required” mean?",
    a: "Additional information or documents were requested from the customer. The application waits until the customer responds; it then shows as “Responded”.",
  },
  {
    q: "Where can I find uploaded documents?",
    a: "All files are listed under Documents with their source (customer or InsurBe generated), virus scan result and review state.",
  },
  {
    q: "Can I export data?",
    a: "Yes. Applications and the Activity Log can be exported as CSV using the export button at the top of each page.",
  },
  {
    q: "Is there a quick way to find an applicant?",
    a: "Press Ctrl + K (or ⌘ + K on Mac) anywhere in the portal to search pages, applicants and application IDs.",
  },
  {
    q: "How do I change my email address?",
    a: "Email changes require InsurBe administrator support. Please contact us using the details on this page.",
  },
];

export default function DakHelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((faq) => !q || faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      <PageHeader title="Help & Support" subtitle="Answers to common questions and how to reach the InsurBe team" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <Panel title="Frequently asked questions">
            <div className="border-b border-slate-100 p-4">
              <SearchInput value={query} onChange={setQuery} placeholder="Search help articles…" />
            </div>
            {faqs.length === 0 ? (
              <EmptyState icon={<SearchX className="h-6 w-6" />} title="No matching answers" text="Contact support and we'll help you directly." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {faqs.map((faq, index) => {
                  const isOpen = open === index;
                  return (
                    <li key={faq.q}>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50/70"
                      >
                        {faq.q}
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isOpen ? "bg-violet-50 text-violet-700" : "text-slate-400"
                          }`}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-sm leading-6 text-slate-600">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </FadeIn>

        <div className="space-y-4">
          <FadeIn index={1}>
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2e1065] via-[#5b21b6] to-[#8b2be2] p-6 text-white shadow-lg shadow-violet-900/20">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-fuchsia-400/30 blur-2xl" aria-hidden />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <LifeBuoy className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="relative mt-5 text-lg font-semibold">Contact InsurBe support</h2>
              <p className="relative mt-1 text-sm text-violet-100/90">
                Questions about an application, access or the portal? Our team is happy to help.
              </p>
              <a
                href="mailto:support@insurbe.com?subject=DAK%20Provider%20Portal"
                className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-50"
              >
                <Mail className="h-4 w-4" aria-hidden /> support@insurbe.com
              </a>
            </section>
          </FadeIn>

          {[
            { icon: BookOpen, title: "Portal guide", text: "Statuses, review steps and how the DAK queue works." },
            { icon: ShieldCheck, title: "Data protection", text: "All data is transferred over TLS. Access is limited to issued DAK credentials." },
          ].map(({ icon: Icon, title, text }, index) => (
            <FadeIn key={title} index={2 + index}>
              <div className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium text-slate-900">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{text}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </>
  );
}
