"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, LifeBuoy, Mail, SearchX, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { api, fmtDateTime } from "../../_lib/client";
import { Button, EmptyState, FadeIn, FormField, inputClass, PageHeader, Panel, SearchInput } from "../../_components/ui";

type Ticket = { id: string; subject: string; message: string; status: string; createdAt: string };

const FAQS = [
  {
    q: "How do I review a new application?",
    a: "Open Applications and select a registration. Click “Start Review”, check the details and documents, then request information, approve, cancel or mark it as not eligible. Every step is recorded in the Activity Log.",
  },
  {
    q: "What does “Info Required” mean?",
    a: "You requested information or documents from the customer. They receive an email; once they respond, the application shows as “Responded” and you can continue the review.",
  },
  {
    q: "What happens after I approve an application?",
    a: "The application becomes “Approved”. Confirm the insurance allocation (membership number, start date and confirmation letter) to make it “Active”. Only then is the customer notified. Active applications can no longer be changed.",
  },
  {
    q: "Where can I find uploaded documents?",
    a: "Each application has a Documents tab, and all files are listed under Documents with their source (customer, InsurBe generated or DAK upload) and review state.",
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
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const loadTickets = useCallback(() => {
    api<{ tickets: Ticket[] }>("/support")
      .then((data) => setTickets(data.tickets))
      .catch(() => undefined);
  }, []);

  useEffect(loadTickets, [loadTickets]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const result = await api<{ emailSent: boolean }>("/support", { method: "POST", json: { subject, message } });
      toast.success("Message sent to InsurBe support");
      if (!result.emailSent) toast.warning("Your message was saved, but the notification email could not be sent.");
      setSubject("");
      setMessage("");
      loadTickets();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  };

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

          <Panel title="Message InsurBe support" padded className="mt-6">
            <form onSubmit={send} className="space-y-5">
              <FormField id="dak-support-subject" label="Subject" required>
                <input
                  id="dak-support-subject"
                  required
                  maxLength={200}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Question about application IB-DAK-040"
                  className={`${inputClass} h-11`}
                />
              </FormField>
              <FormField id="dak-support-message" label="Message" required hint="Our team replies to your email address.">
                <textarea
                  id="dak-support-message"
                  required
                  maxLength={5000}
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="How can we help?"
                  className={`${inputClass} py-3`}
                />
              </FormField>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={sending}>
                  {!sending && <Send className="h-4 w-4" aria-hidden />} Send message
                </Button>
              </div>
            </form>
          </Panel>

          {tickets.length > 0 && (
            <Panel title="Your messages" className="mt-6">
              <ul className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <li key={ticket.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{ticket.subject}</p>
                      <span className="text-xs text-slate-400">{fmtDateTime(ticket.createdAt)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-slate-600">{ticket.message}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
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
            { icon: ShieldCheck, title: "Data protection", text: "All data is transferred over TLS. Access is limited to accounts issued by InsurBe." },
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
