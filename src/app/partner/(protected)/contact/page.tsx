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
      <div className="text-sm text-gray-500">
        Support / <span className="font-semibold text-black">Contact</span>
      </div>

      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 sm:p-6 md:p-8 shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#820ad1]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
            Partner Support
          </div>
          <h1 className="mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[#111827]">
            Submit a Request
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-[#667085] leading-relaxed">
            Share your question or support request. Our partner team will get
            back to you shortly.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            Request Details
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Fill all required fields to submit your request.
          </p>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
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
                className="w-full h-14 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none transition-all bg-white focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
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
              <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
                Your Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="name@company.com"
                className="w-full h-14 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none transition-all bg-white focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
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
            <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Enter request subject"
              className="w-full h-14 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none transition-all bg-white focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
            {errors.subject && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <AlertCircle size={12} />
                {errors.subject}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Please enter your request. Our Partner Manager will get back to you soon."
              rows={6}
              className="w-full rounded-3xl border border-gray-200 bg-white p-5 text-gray-900 outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 resize-none"
            />
            {errors.description && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <AlertCircle size={12} />
                {errors.description}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
              File Upload
            </label>
            <label className="cursor-pointer rounded-2xl border border-dashed border-[#c8a4ee] bg-[#fbf7ff] px-4 py-5 flex items-center gap-3 text-sm text-gray-700 hover:bg-[#f8f1ff] transition-colors">
              <UploadCloud size={18} className="text-[#820ad1]" />
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

          <div className="space-y-3 rounded-2xl border border-[#f3e8ff] bg-[#faf7ff] p-4">
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
            className="h-14 w-full sm:w-auto px-7 cursor-pointer rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#9f3cff] text-white font-semibold inline-flex items-center justify-center gap-3 shadow-xl shadow-[#820ad1]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send size={18} />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
