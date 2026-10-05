"use client";

import { type ReactNode, useId, useRef } from "react";
import { AlertCircle, CheckCircle, FileText, UploadCloud, X } from "lucide-react";

import countriesData from "@/lib/countriesData.json";

/**
 * Small form building blocks for the TK API application form.
 * Styling follows the existing insuranceSignupFlow form.
 */

const inputClass = (error?: string) =>
  `w-full border-2 rounded-lg px-4 py-3 bg-white text-gray-900 transition-all focus:outline-none focus:ring-2 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
  }`;

export const COUNTRIES = (countriesData as { name: { common: string }; cca2: string }[])
  .map((country) => ({ code: country.cca2, name: country.name.common }))
  .filter((country) => /^[A-Z]{2}$/.test(country.code));

export const countryName = (code: string) => COUNTRIES.find((country) => country.code === code)?.name || code;

export function FieldError({ id, error }: { id?: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

type BaseProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block font-medium text-gray-800">
      {label}
      {required && <span className="text-purple-600"> *</span>}
    </label>
  );
}

export function TextField({
  name,
  label,
  error,
  hint,
  required,
  className = "",
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  maxLength,
  inputMode,
  autoComplete,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div className={className} data-field={name}>
      <Label htmlFor={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(error)}
      />
      {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function DateField({
  min,
  max,
  ...props
}: BaseProps & { value: string; onChange: (value: string) => void; min?: string; max?: string }) {
  const id = useId();
  return (
    <div className={props.className} data-field={props.name}>
      <Label htmlFor={id} label={props.label} required={props.required} />
      <input
        id={id}
        type="date"
        value={props.value}
        min={min}
        max={max}
        onChange={(event) => props.onChange(event.target.value)}
        aria-invalid={!!props.error}
        className={inputClass(props.error)}
      />
      {props.hint && !props.error && <p className="mt-1.5 text-sm text-gray-500">{props.hint}</p>}
      <FieldError error={props.error} />
    </div>
  );
}

export function SelectField({
  options,
  placeholder = "Please select",
  ...props
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className={props.className} data-field={props.name}>
      <Label htmlFor={id} label={props.label} required={props.required} />
      <select
        id={id}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        aria-invalid={!!props.error}
        className={inputClass(props.error)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {props.hint && !props.error && <p className="mt-1.5 text-sm text-gray-500">{props.hint}</p>}
      <FieldError error={props.error} />
    </div>
  );
}

export function CountryField(props: BaseProps & { value: string; onChange: (value: string) => void }) {
  return (
    <SelectField
      {...props}
      placeholder="Select a country"
      options={COUNTRIES.map((country) => ({ value: country.code, label: country.name }))}
    />
  );
}

export function ChoiceField<T extends string>({
  options,
  value,
  onChange,
  ...props
}: BaseProps & {
  value: T | "";
  onChange: (value: T) => void;
  options: { value: T; label: string; description?: string }[];
}) {
  return (
    <fieldset className={props.className} data-field={props.name}>
      <legend className="mb-2 block font-medium text-gray-800">
        {props.label}
        {props.required && <span className="text-purple-600"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`rounded-lg border-2 px-4 py-2 text-left text-sm font-medium transition-all ${
                selected
                  ? "border-transparent bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                  : props.error
                    ? "border-red-300 hover:border-purple-300"
                    : "border-gray-300 hover:border-purple-300 hover:shadow-sm"
              }`}
            >
              <span className="block">{option.label}</span>
              {option.description && (
                <span className={`block text-xs font-normal ${selected ? "text-purple-100" : "text-gray-500"}`}>
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {props.hint && !props.error && <p className="mt-1.5 text-sm text-gray-500">{props.hint}</p>}
      <FieldError error={props.error} />
    </fieldset>
  );
}

export function YesNoField({
  value,
  onChange,
  ...props
}: BaseProps & { value: boolean | null; onChange: (value: boolean) => void }) {
  return (
    <ChoiceField
      {...props}
      value={value === true ? "yes" : value === false ? "no" : ""}
      onChange={(choice) => onChange(choice === "yes")}
      options={[
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ]}
    />
  );
}

export function CheckboxField({
  name,
  checked,
  onChange,
  error,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div data-field={name}>
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
          checked ? "border-purple-300 bg-purple-50" : error ? "border-red-300" : "border-gray-200 hover:border-purple-200"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-purple-600"
        />
        <span className="text-sm leading-relaxed text-gray-700">{children}</span>
      </label>
      <FieldError error={error} />
    </div>
  );
}

export function FileField({
  name,
  label,
  description,
  accept,
  files,
  multiple = false,
  required,
  error,
  onAdd,
  onRemove,
}: {
  name: string;
  label: string;
  description: string;
  accept: string;
  files: File[];
  multiple?: boolean;
  required?: boolean;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const hasFile = files.length > 0;

  return (
    <div data-field={name}>
      <div
        className={`rounded-2xl border-2 border-dashed p-5 transition-all ${
          error ? "border-red-300 bg-red-50/40" : hasFile ? "border-green-300 bg-green-50/50" : "border-gray-300 hover:border-purple-300"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {hasFile && !multiple ? (
              <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-green-600" aria-hidden />
            ) : (
              <UploadCloud className="mt-0.5 h-6 w-6 shrink-0 text-purple-600" aria-hidden />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {label}
                {required && <span className="text-purple-600"> *</span>}
              </p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <label
            htmlFor={id}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 hover:border-purple-400"
          >
            {hasFile && !multiple ? "Replace" : multiple ? "Add files" : "Choose file"}
          </label>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(event) => {
              const picked = Array.from(event.target.files || []);
              if (picked.length) onAdd(picked);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
        </div>

        {hasFile && (
          <ul className="mt-4 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FieldError error={error} />
    </div>
  );
}

export function Section({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <div className={`${title || description ? "mt-4 " : ""}grid grid-cols-1 gap-5 sm:grid-cols-2`}>{children}</div>
    </section>
  );
}

/** Full-width wrapper inside a two column Section grid. */
export function Full({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}
