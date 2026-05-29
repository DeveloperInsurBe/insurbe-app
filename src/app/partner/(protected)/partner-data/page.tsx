"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Edit3,
  Landmark,
  MapPin,
  Save,
  User,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  position: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  email: string;
  companyName: string;
  companyDescription: string;
  addressType: "german" | "overseas";
  streetName: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  careOfAddress: string;
  country: string;
  accountHolder: string;
  recipientStreet: string;
  recipientZip: string;
  recipientCity: string;
  recipientCountry: string;
  iban: string;
  bicSwift: string;
  currency: string;
  additionalInfo: string;
}

type ValidationErrors = Partial<Record<keyof FormData, string>>;

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  title: "Mr",
  position: "",
  firstName: "",
  lastName: "",
  countryCode: "+91",
  phone: "",
  email: "",
  companyName: "",
  companyDescription: "",
  addressType: "overseas",
  streetName: "",
  streetNumber: "",
  postalCode: "",
  city: "",
  careOfAddress: "",
  country: "",
  accountHolder: "",
  recipientStreet: "",
  recipientZip: "",
  recipientCity: "",
  recipientCountry: "",
  iban: "",
  bicSwift: "",
  currency: "EUR",
  additionalInfo: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{6,15}$/;
const IBAN_RE = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/;
const BIC_RE = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const POSTAL_RE = /^[A-Z0-9\s\-]{3,12}$/i;

function validateField(name: keyof FormData, value: string): string {
  switch (name) {
    case "firstName":
    case "lastName":
      if (!value.trim()) return "This field is required.";
      if (value.trim().length < 2) return "Must be at least 2 characters.";
      return "";
    case "email":
      if (!value.trim()) return "Email is required.";
      if (!EMAIL_RE.test(value)) return "Enter a valid email address.";
      return "";
    case "phone":
      if (!value.trim()) return "Phone number is required.";
      if (!PHONE_RE.test(value)) return "Enter a valid phone number (6–15 digits).";
      return "";
    case "companyName":
      if (!value.trim()) return "Company name is required.";
      return "";
    case "postalCode":
      if (value && !POSTAL_RE.test(value)) return "Enter a valid postal code.";
      return "";
    case "iban":
      if (value && !IBAN_RE.test(value.replace(/\s/g, "").toUpperCase()))
        return "Enter a valid IBAN.";
      return "";
    case "bicSwift":
      if (value && !BIC_RE.test(value.toUpperCase()))
        return "Enter a valid BIC/SWIFT code.";
      return "";
    default:
      return "";
  }
}

const REQUIRED_FIELDS: (keyof FormData)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "companyName",
];

// ─── PhoneInput ───────────────────────────────────────────────────────────────

function PhoneInput({
  countries,
  countriesLoading,
  countryCode,
  phone,
  editMode,
  error,
  onChange,
  onBlur,
}: {
  countries: Country[];
  countriesLoading: boolean;
  countryCode: string;
  phone: string;
  editMode: boolean;
  error?: string;
  onChange: (field: "countryCode" | "phone", value: string) => void;
  onBlur: (field: "phone") => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-detect country code from typed digits
  useEffect(() => {
    if (!phone || countries.length === 0) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 2) return;
    const sorted = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const match = sorted.find((c) => digits.startsWith(c.dialCode.replace("+", "")));
    if (match && match.dialCode !== countryCode) {
      onChange("countryCode", match.dialCode);
    }
  }, [phone, countries]);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const selected = countries.find((c) => c.dialCode === countryCode);
  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
        Phone Number
      </label>

      <div className="relative" ref={dropdownRef}>
        {/* Combined input pill */}
        <div
          className={[
            "flex h-14 rounded-2xl border overflow-visible transition-all",
            error
              ? "border-red-400 focus-within:ring-4 focus-within:ring-red-400/10"
              : "border-gray-200 focus-within:border-[#820ad1] focus-within:ring-4 focus-within:ring-[#820ad1]/10",
            !editMode ? "bg-gray-50" : "bg-white",
          ].join(" ")}
        >
          {/* Flag + dial code trigger */}
          <button
            type="button"
            disabled={!editMode || countriesLoading}
            onClick={() => editMode && setOpen((o) => !o)}
            className={[
              "flex items-center gap-1.5 pl-3 pr-2 border-r shrink-0 transition-colors rounded-l-2xl select-none",
              error ? "border-red-300" : "border-gray-200",
              !editMode
                ? "text-gray-400 cursor-not-allowed bg-gray-50"
                : "text-gray-700 hover:bg-[#820ad1]/5 cursor-pointer",
            ].join(" ")}
          >
            {countriesLoading ? (
              <span className="text-gray-400 text-xs w-16 text-center">Loading...</span>
            ) : (
              <>
                <span className="text-xl leading-none">{selected?.flag ?? "🌐"}</span>
                <span className="text-xs font-semibold text-gray-600 min-w-[34px] text-center">
                  {countryCode}
                </span>
                <svg
                  className={"w-3 h-3 text-gray-400 transition-transform duration-200 " + (open ? "rotate-180" : "")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>

          {/* Phone number input */}
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            onBlur={() => onBlur("phone")}
            disabled={!editMode}
            placeholder="9876543210"
            className="flex-1 h-full px-4 bg-transparent outline-none text-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed placeholder-gray-400 text-sm"
          />
        </div>

        {/* Dropdown */}
        {open && editMode && (
          <div className="absolute z-50 mt-2 w-72 rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/80 overflow-hidden">
            <div className="p-2.5 border-b border-gray-100">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#820ad1] focus:ring-2 focus:ring-[#820ad1]/10"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400 text-center">No results</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange("countryCode", c.dialCode);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={[
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#820ad1]/5",
                        c.dialCode === countryCode
                          ? "bg-[#f8f1ff] font-semibold text-[#820ad1]"
                          : "text-gray-700",
                      ].join(" ")}
                    >
                      <span className="text-lg leading-none w-6 shrink-0">{c.flag}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-xs text-gray-400 shrink-0 tabular-nums">{c.dialCode}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center shrink-0">
        <Icon className="text-[#820ad1]" size={26} />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">{title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"flex flex-col gap-1.5 " + className}>
      <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
        {label}
      </label>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PartnerDataPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  // Fetch countries
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag");
        const data = await res.json();
        const mapped: Country[] = data
          .map((c: any) => ({
            name: c.name.common,
            code: c.cca2,
            dialCode:
              c.idd?.root && c.idd?.suffixes?.length === 1
                ? c.idd.root + c.idd.suffixes[0]
                : c.idd?.root ?? "",
            flag: c.flag ?? "",
          }))
          .filter((c: Country) => c.dialCode)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(mapped);
      } catch {
        // fallback to free text
      } finally {
        setCountriesLoading(false);
      }
    }
    fetchCountries();
  }, []);

  // Load profile
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch("/api/partner/get-profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.profile) setFormData((prev) => ({ ...prev, ...data.profile }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function validateAll(): ValidationErrors {
    const newErrors: ValidationErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      const err = validateField(field, String(formData[field] ?? ""));
      if (err) newErrors[field] = err;
    });
    (["postalCode", "iban", "bicSwift"] as (keyof FormData)[]).forEach((field) => {
      const val = String(formData[field] ?? "");
      if (val) {
        const err = validateField(field, val);
        if (err) newErrors[field] = err;
      }
    });
    return newErrors;
  }

  async function handleSave() {
    const allErrors = validateAll();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const allTouched = REQUIRED_FIELDS.reduce(
        (acc, f) => ({ ...acc, [f]: true }),
        {} as typeof touched
      );
      setTouched((prev) => ({ ...prev, ...allTouched }));
      return;
    }
    try {
      setSaving(true);

      const savePromise = fetch("/api/partner/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to save profile");
        return result;
      });

      const toastId = toast.loading("Saving partner profile...");
      const result = await savePromise;
      toast.success("Partner profile saved successfully", { id: toastId });

      if (!result.mailSent) {
        toast.message("Profile saved, but acknowledgement email was not sent.");
      }

      setEditMode(false);
      setTouched({});
      setErrors({});
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (touched[name as keyof FormData]) {
        const err = validateField(name as keyof FormData, value);
        setErrors((prev) => ({ ...prev, [name]: err }));
      }
    },
    [touched]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const err = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    },
    []
  );

  function inputProps(name: keyof FormData, extra?: React.InputHTMLAttributes<HTMLInputElement>) {
    return {
      name,
      value: String(formData[name] ?? ""),
      onChange: handleChange,
      onBlur: handleBlur,
      disabled: !editMode,
      ...extra,
    };
  }

  function selectProps(name: keyof FormData) {
    return {
      name,
      value: String(formData[name] ?? ""),
      onChange: handleChange,
      onBlur: handleBlur,
      disabled: !editMode,
    };
  }

  function inputCls(name?: keyof FormData) {
    const hasErr = name && touched[name] && errors[name];
    return [
      "w-full h-14 rounded-2xl border px-4 text-gray-900 outline-none transition-all",
      "focus:ring-4 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
      hasErr
        ? "border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-400/10"
        : "border-gray-200 bg-white focus:border-[#820ad1] focus:ring-[#820ad1]/10",
    ].join(" ");
  }

  const selectCls = (name?: keyof FormData) => inputCls(name) + " cursor-pointer appearance-none";

  const hasErrors = Object.values(errors).some(Boolean);
  const countryNames = countries.map((c) => c.name);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 rounded-full border-4 border-[#820ad1]/20 border-t-[#820ad1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* BREADCRUMB */}
      <div className="text-sm text-gray-500">
        Your Profile / <span className="font-semibold text-black">Partner Data</span>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 sm:p-6 md:p-8 shadow-[0_12px_40px_rgba(130,10,209,0.08)]">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#820ad1]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 md:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
              Partner Account
            </div>
            <h1 className="mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[#111827]">
              Partner Data
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-[#667085] leading-relaxed">
              Manage your company information, address and payout details.
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
            {editMode && hasErrors && (
              <span className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                <AlertCircle size={14} />
                Please fix validation errors before saving.
              </span>
            )}
            <button
              onClick={() => (editMode ? handleSave() : setEditMode(true))}
              disabled={saving}
              className="h-14 w-full sm:w-auto px-7 cursor-pointer rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#9f3cff] text-white font-semibold flex items-center justify-center gap-3 shadow-xl shadow-[#820ad1]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {editMode ? <Save size={20} /> : <Edit3 size={20} />}
              {saving ? "Saving..." : editMode ? "Save Information" : "Edit Information"}
            </button>
          </div>
        </div>
      </div>

      {/* PARTNER INFORMATION */}
      <div className="rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-visible">
        <SectionHeader
          icon={User}
          title="Partner Information"
          subtitle="Basic company and contact details."
        />
        <div className="p-4 sm:p-6 md:p-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          <Field label="Title">
            <select {...selectProps("title")} className={selectCls()}>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
            </select>
          </Field>

          <Field label="Position">
            <input
              type="text"
              {...inputProps("position", { placeholder: "Account Manager" })}
              className={inputCls()}
            />
          </Field>

          <Field label="Company Name" error={touched.companyName ? errors.companyName : ""}>
            <input
              type="text"
              {...inputProps("companyName", { placeholder: "Company Name" })}
              className={inputCls("companyName")}
            />
          </Field>

          <Field label="First Name" error={touched.firstName ? errors.firstName : ""}>
            <input
              type="text"
              {...inputProps("firstName", { placeholder: "First Name" })}
              className={inputCls("firstName")}
            />
          </Field>

          <Field label="Last Name" error={touched.lastName ? errors.lastName : ""}>
            <input
              type="text"
              {...inputProps("lastName", { placeholder: "Last Name" })}
              className={inputCls("lastName")}
            />
          </Field>

          <Field label="Email" error={touched.email ? errors.email : ""}>
            <input
              type="email"
              {...inputProps("email", { placeholder: "name@company.com" })}
              className={inputCls("email")}
            />
          </Field>

          {/* Phone — fused flag + dial code + number */}
          <div className="md:col-span-2 xl:col-span-3 md:max-w-sm">
            <PhoneInput
              countries={countries}
              countriesLoading={countriesLoading}
              countryCode={formData.countryCode}
              phone={formData.phone}
              editMode={editMode}
              error={touched.phone ? errors.phone : ""}
              onChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              onBlur={(field) => {
                setTouched((prev) => ({ ...prev, [field]: true }));
                setErrors((prev) => ({
                  ...prev,
                  [field]: validateField(field, String(formData[field] ?? "")),
                }));
              }}
            />
          </div>

          {/* Company Description */}
          <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-[2px] uppercase text-gray-600 block">
              Company Description
            </label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              disabled={!editMode}
              placeholder="Tell us about your company..."
              rows={5}
              className="w-full rounded-3xl border border-gray-200 bg-white p-5 text-gray-900 outline-none transition-all focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
            />
          </div>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader
          icon={MapPin}
          title="Address"
          subtitle="Manage address and location details."
        />
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-8">
            {(["german", "overseas"] as const).map((type) => (
              <label key={type} className="flex items-center gap-3 font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value={type}
                  checked={formData.addressType === type}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-5 h-5 accent-[#820ad1]"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Street Name">
              <input
                type="text"
                {...inputProps("streetName", { placeholder: "Street Name" })}
                className={inputCls()}
              />
            </Field>

            <Field label="Street Number">
              <input
                type="text"
                {...inputProps("streetNumber", { placeholder: "Street Number" })}
                className={inputCls()}
              />
            </Field>

            <Field label="Postal Code" error={touched.postalCode ? errors.postalCode : ""}>
              <input
                type="text"
                {...inputProps("postalCode", { placeholder: "Postal Code" })}
                className={inputCls("postalCode")}
              />
            </Field>

            <Field label="City">
              <input
                type="text"
                {...inputProps("city", { placeholder: "City" })}
                className={inputCls()}
              />
            </Field>

            <Field label="Care of Address">
              <input
                type="text"
                {...inputProps("careOfAddress", { placeholder: "Care of Address" })}
                className={inputCls()}
              />
            </Field>

            <Field label="Country">
              {countriesLoading ? (
                <div className={inputCls() + " flex items-center text-gray-400 text-sm"}>
                  Loading countries...
                </div>
              ) : countryNames.length > 0 ? (
                <select {...selectProps("country")} className={selectCls()}>
                  <option value="">Select Country</option>
                  {countryNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  {...inputProps("country", { placeholder: "Country" })}
                  className={inputCls()}
                />
              )}
            </Field>
          </div>
        </div>
      </div>

      {/* BANK DETAILS */}
      <div className="rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden mb-10">
        <SectionHeader
          icon={Landmark}
          title="Bank Details"
          subtitle="Payout and banking information."
        />
        <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recipient Details</h3>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              <Field label="Account Holder">
                <input
                  type="text"
                  {...inputProps("accountHolder", { placeholder: "Account Holder" })}
                  className={inputCls()}
                />
              </Field>

              <Field label="Recipient Street">
                <input
                  type="text"
                  {...inputProps("recipientStreet", { placeholder: "Recipient Street Address" })}
                  className={inputCls()}
                />
              </Field>

              <Field label="Recipient Zip Code">
                <input
                  type="text"
                  {...inputProps("recipientZip", { placeholder: "Recipient Zip Code" })}
                  className={inputCls()}
                />
              </Field>

              <Field label="Recipient City">
                <input
                  type="text"
                  {...inputProps("recipientCity", { placeholder: "Recipient City" })}
                  className={inputCls()}
                />
              </Field>

              <Field label="Recipient Country">
                {countriesLoading ? (
                  <div className={inputCls() + " flex items-center text-gray-400 text-sm"}>
                    Loading...
                  </div>
                ) : countryNames.length > 0 ? (
                  <select {...selectProps("recipientCountry")} className={selectCls()}>
                    <option value="">Select Country</option>
                    {countryNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    {...inputProps("recipientCountry", { placeholder: "Recipient Country" })}
                    className={inputCls()}
                  />
                )}
              </Field>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Account Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="IBAN / Account Number" error={touched.iban ? errors.iban : ""}>
                <input
                  type="text"
                  {...inputProps("iban", { placeholder: "DE89 3704 0044 0532 0130 00" })}
                  className={inputCls("iban")}
                  onChange={(e) => {
                    const synth = { ...e, target: { ...e.target, value: e.target.value.toUpperCase() } };
                    handleChange(synth as any);
                  }}
                />
              </Field>

              <Field label="BIC / Swift Code" error={touched.bicSwift ? errors.bicSwift : ""}>
                <input
                  type="text"
                  {...inputProps("bicSwift", { placeholder: "COBADEFFXXX" })}
                  className={inputCls("bicSwift")}
                  onChange={(e) => {
                    const synth = { ...e, target: { ...e.target, value: e.target.value.toUpperCase() } };
                    handleChange(synth as any);
                  }}
                />
              </Field>

              <Field label="Currency">
                <select {...selectProps("currency")} className={selectCls()}>
                  {["EUR", "USD", "GBP", "INR", "CHF", "JPY", "AUD", "CAD"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Additional Information">
                <input
                  type="text"
                  {...inputProps("additionalInfo", { placeholder: "Additional Information" })}
                  className={inputCls()}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* PARTNER PROGRAM PLAN */}
      <div className="rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden mb-10 p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl font-black text-gray-900">Partner Program Plan</h1>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-gray-700 border border-purple-100 py-2 px-4 rounded-xl">
        <p className="text-gray-600">Public Health Insurance (DAK) </p><p className="font-medium text-gray-800">EUR 30</p>

        </div>
      </div>
    </div>
  );
}
