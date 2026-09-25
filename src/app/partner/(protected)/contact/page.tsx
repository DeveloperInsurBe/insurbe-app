"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Send, UploadCloud } from "lucide-react";
import Link from "next/link";

type Category =
  | "General Questions"
  | "Request for a Webinar"
  | "Request for a Landing Page";

type FormState = {
  category: Category | "";
  email: string;
  subject: string;
  description: string;
  consent: boolean;
  files: File[];
};

type FormErrors = Partial<Record<keyof Omit<FormState, "files">, string>> & {
  files?: string;
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const INITIAL_FORM: FormState = {
  category: "",
  email: "",
  subject: "",
  description: "",
  consent: false,
  files: [],
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.category) errors.category = "Please select a category.";

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Please enter a valid email.";
  }

  if (!form.subject.trim()) errors.subject = "Subject is required.";

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  } else if (form.description.trim().length < 10) {
    errors.description = "Please enter at least 10 characters.";
  }

  if (!form.consent) {
    errors.consent = "Please accept the communication consent.";
  }

  for (const file of form.files) {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      errors.files = "Only PDF, JPG, PNG, WEBP, DOC and DOCX files are allowed.";
      break;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.files = `Each file must be under ${MAX_FILE_SIZE_MB} MB.`;
      break;
    }
  }

  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileListText = useMemo(() => {
    if (form.files.length === 0) return "No file selected";
    if (form.files.length === 1) return form.files[0].name;
    return `${form.files.length} files selected`;
  }, [form.files]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const payload = new FormData();
      payload.append("category", form.category);
      payload.append("email", form.email.trim());
      payload.append("subject", form.subject.trim());
      payload.append("description", form.description.trim());
      payload.append("consent", String(form.consent));

      for (const file of form.files) {
        payload.append("files", file);
      }

      const submitPromise = fetch("/api/partner/contact-request", {
        method: "POST",
        body: payload,
      }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to submit request.");
        }
        return result;
      });

      await toast.promise(submitPromise, {
        loading: "Submitting your request...",
        success: "Your request has been submitted successfully.",
        error: (err) =>
          err instanceof Error
            ? err.message
            : "Something went wrong while submitting the form.",
      });

      setForm(INITIAL_FORM);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="modal-item-in text-sm text-gray-500">
        Support / <span className="font-semibold text-black">Contact</span>
      </div>

      <section className="modal-panel-in relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] px-5 py-5 sm:px-7 sm:py-6 md:px-9 md:py-7 text-[#111827] shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        {/* animated background shapes */}
        <div className="modal-float pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#820ad1]/10 blur-2xl" />
        <div
          className="modal-float pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#a855f7]/15 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle, #820ad1 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative z-10 max-w-2xl">
          <div
            className="modal-item-in inline-flex items-center gap-2.5 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[2px] text-[#820ad1]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Partner Support
          </div>
          <h1
            className="modal-item-in mt-2 md:mt-2.5 text-xl sm:text-2xl md:text-[26px] font-extrabold leading-tight tracking-tight text-[#111827]"
            style={{ animationDelay: "200ms" }}
          >
            Submit a Request
          </h1>
          <p
            className="modal-item-in mt-1 md:mt-1.5 max-w-xl text-[13px] md:text-sm text-[#667085] leading-relaxed"
            style={{ animationDelay: "280ms" }}
          >
            Share your question or support request. Our partner team will get
            back to you shortly.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="modal-item-in rounded-[24px] md:rounded-[32px] bg-white border border-[#f0e6fb] shadow-[0_10px_35px_rgba(130,10,209,0.06)] overflow-hidden"
        style={{ animationDelay: "200ms" }}
      >
        <div className="p-4 sm:p-6 md:p-8 border-b border-[#f4ecfc] flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-12 h-12 shrink-0">
            <span className="modal-ring absolute inset-0 rounded-2xl bg-[#820ad1]/20" />
            <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-lg shadow-[#820ad1]/25">
              <Send size={22} />
            </span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827]">
              Request Details
            </h2>
            <p className="text-[#667085] mt-1 text-[13px] md:text-sm">
              Fill all required fields to submit your request.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-[2px] uppercase text-[#820ad1] block">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value as FormState["category"],
                  }))
                }
                className="w-full h-14 rounded-2xl border border-[#efe3fb] px-4 text-gray-900 outline-none transition-all bg-white hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              >
                <option value="">Please Select</option>
                <option value="General Questions">General Questions</option>
                <option value="Request for a Webinar">
                  Request for a Webinar
                </option>
                <option value="Request for a Landing Page">
                  Request for a Landing Page
                </option>
              </select>
              {errors.category && (
                <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle size={12} />
                  {errors.category}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-[2px] uppercase text-[#820ad1] block">
                Your Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="name@company.com"
                className="w-full h-14 rounded-2xl border border-[#efe3fb] px-4 text-gray-900 outline-none transition-all bg-white hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
              />
              {errors.email && (
                <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle size={12} />
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-[2px] uppercase text-[#820ad1] block">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Enter request subject"
              className="w-full h-14 rounded-2xl border border-[#efe3fb] px-4 text-gray-900 outline-none transition-all bg-white hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
            {errors.subject && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <AlertCircle size={12} />
                {errors.subject}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-[2px] uppercase text-[#820ad1] block">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Please enter your request. Our Partner Manager will get back to you soon."
              rows={6}
              className="w-full rounded-3xl border border-[#efe3fb] bg-white p-5 text-gray-900 outline-none transition-all hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 resize-none"
            />
            {errors.description && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <AlertCircle size={12} />
                {errors.description}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-[2px] uppercase text-[#820ad1] block">
              File Upload
            </label>
            <label className="group cursor-pointer rounded-2xl border border-dashed border-[#d8b4fe] bg-[#fbf7ff] px-4 py-5 flex items-center gap-3 text-sm text-gray-700 transition-all duration-300 hover:border-[#820ad1] hover:bg-gradient-to-r hover:from-[#faf7ff] hover:to-[#f3e8ff]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e9d7ff] bg-white text-[#820ad1] transition-colors duration-300 group-hover:border-transparent group-hover:bg-[#820ad1] group-hover:text-white">
                <UploadCloud size={18} />
              </span>
              <span className="font-medium">Choose Files</span>
              <span className="text-gray-500 truncate">{fileListText}</span>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    files: Array.from(e.target.files ?? []),
                  }))
                }
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              />
            </label>
            <p className="text-xs text-gray-500">
              Accepted: PDF, JPG, PNG, WEBP, DOC, DOCX. Max {MAX_FILE_SIZE_MB}{" "}
              MB each.
            </p>
            {errors.files && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <AlertCircle size={12} />
                {errors.files}
              </span>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-[#efe3fb] bg-gradient-to-r from-[#faf7ff] to-[#f3e8ff] p-4">
            <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, consent: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 accent-[#820ad1]"
              />
              <span>
                I agree to receive communications from InsurBe. I understand I
                can unsubscribe any time.
              </span>
            </label>

            <p className="text-sm text-gray-600 leading-relaxed">
              By submitting, you agree to our{" "}
              <Link href="/termscondition" className="text-[#820ad1] underline">
                General Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacypolicy" className="text-[#820ad1] underline">
                Privacy Policy
              </Link>
              .
            </p>
            {errors.consent && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <AlertCircle size={12} />
                {errors.consent}
              </span>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group h-12 md:h-14 w-full sm:w-auto px-5 md:px-7 cursor-pointer rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] text-white text-sm md:text-base font-semibold inline-flex items-center justify-center gap-3 shadow-xl shadow-[#820ad1]/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820ad1]/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
