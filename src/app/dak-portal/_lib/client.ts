import type { DakListRow } from "@/lib/dak/cases";
import type { DakCaseDetail, DakDocumentDto } from "@/lib/dak/detail";

export type { DakCaseDetail, DakDocumentDto, DakListRow };

export const API = "/api/dak-portal";
export const BASE = "/dak-portal";

export const applicationHref = (id: string) => `${BASE}/applications/${encodeURIComponent(id)}`;
export const documentHref = (id: string, download = false) => `${API}/documents/${id}${download ? "?download=1" : ""}`;

/** fetch + JSON with the API's { error } message on failure. */
export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const response = await fetch(`${API}${path}`, {
    ...rest,
    headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  if (response.status === 401) {
    window.location.href = `${BASE}/login`;
    throw new Error("Your session has ended. Please sign in again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data as T;
}

/* -------------------------------------------------------------------------- */
/*                                 FORMATTING                                 */
/* -------------------------------------------------------------------------- */

const TZ = "Europe/Berlin";
const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ });
const longDateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: TZ });
const timeFormat = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const zoneFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, timeZoneName: "short" });

/** "YYYY-MM-DD" date-only values are shown as written, without time zone shifts. */
const toDate = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value));

const valid = (value?: string | null): value is string => !!value && !Number.isNaN(toDate(value).getTime());

/** 20. Aug. 2026 */
export const fmtDate = (value?: string | null) => (valid(value) ? dateFormat.format(toDate(value)) : "—");

/** 20. August 2026 */
export const fmtLongDate = (value?: string | null) => (valid(value) ? longDateFormat.format(toDate(value)) : "—");

/** 20. Aug. 2026, 15:00 CEST */
export function fmtDateTime(value?: string | null) {
  if (!valid(value)) return "—";
  const date = new Date(value);
  const zone = zoneFormat.formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? "";
  return `${dateFormat.format(date)}, ${timeFormat.format(date)} ${zone}`.trim();
}

/** 5m ago, 3h ago, 2d ago */
export function fmtAgo(value: string, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const fileKind = (mimeType: string) =>
  mimeType === "application/pdf" ? "PDF" : mimeType.startsWith("image/") ? mimeType.slice(6).toUpperCase() : "File";

/** Day key for grouping, e.g. "20. Aug. 2026". */
export const dayKey = (value: string) => fmtDate(value);

export const todayInput = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/*                                REMEMBER ME                                 */
/* -------------------------------------------------------------------------- */

const REMEMBER_KEY = "dak-portal-remember";
/** Cookie without expiry: the browser drops it when it is closed. */
const BROWSER_SESSION_COOKIE = "dak_portal_browser_session";

/** Stored at sign-in. Without "remember me" the reviewer is signed out once the browser was closed. */
export function saveRememberChoice(remember: boolean) {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  } catch {
    // storage unavailable: the reviewer simply stays signed in
  }
  document.cookie = `${BROWSER_SESSION_COOKIE}=1; path=/dak-portal; SameSite=Lax`;
}

/** True when the reviewer did not tick "remember me" and the browser has been closed since. */
export function browserSessionEnded() {
  let remember: string | null;
  try {
    remember = localStorage.getItem(REMEMBER_KEY);
  } catch {
    return false;
  }
  if (remember !== "0") return false;
  return !document.cookie.split("; ").some((cookie) => cookie.startsWith(`${BROWSER_SESSION_COOKIE}=`));
}

/* -------------------------------------------------------------------------- */
/*                                  UPLOADS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Uploads a file straight to storage (no server size limit) and returns its
 * path; the caller then registers it on the application.
 */
export async function uploadToApplication(applicationId: string, file: File) {
  const { storagePath, uploadUrl } = await api<{ storagePath: string; uploadUrl: string }>(
    `/applications/${encodeURIComponent(applicationId)}/uploads`,
    { method: "POST", json: { name: file.name, type: file.type, size: file.size } },
  );
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type, "x-upsert": "false" },
    body: file,
  });
  if (!response.ok) throw new Error("The file upload failed. Please try again.");
  return { storagePath, name: file.name };
}
