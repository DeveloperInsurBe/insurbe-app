/**
 * TK NEW MEMBERSHIP API (v3) - HTTP CLIENT (server only: uses TK credentials)
 *
 * Flow (api-docs-3-0-1):
 *   1. POST /neuaufnahmeantrag/getApiAccessToken -> JWT + cookies (30 min)
 *   2. POST /neuaufnahmeantrag/v3/einreichen     -> antragId or validation messages
 *   3. POST /neuaufnahmeantrag/v3/status         -> membership / commission status
 *
 * TK_API_ENV=production switches to the live endpoint; anything else uses
 * staging, where applications are validated but never processed by TK.
 */

const TK_BASE_URL = "https://www.tk.de/service/rest/public";

const TOKEN_URL = `${TK_BASE_URL}/neuaufnahmeantrag/getApiAccessToken`;

const TK_TIMEOUT_MS = 30000;

// TK requires a User-Agent on every request.
const USER_AGENT = "Mozilla/5.0 (compatible; InsurBe/1.0; +https://insurbe.com)";

// Refresh a little before TK's 30 minute expiry.
const TOKEN_TTL_MS = 25 * 60 * 1000;

export type TkEnvironment = "staging" | "production";

export const getTkEnvironment = (): TkEnvironment =>
  process.env.TK_API_ENV === "production" ? "production" : "staging";

const operationUrl = (operation: "einreichen" | "status") =>
  getTkEnvironment() === "production"
    ? `${TK_BASE_URL}/neuaufnahmeantrag/v3/${operation}`
    : `${TK_BASE_URL}/staging/neuaufnahmeantrag/v3/${operation}`;

/** TK partner id credited for applications (metaDaten.vermittler). */
export const getTkVermittler = () => process.env.TK_VERMITTLER_ID || process.env.TK_USER_ID || "";

export class TkApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = "TkApiError";
  }
}

export type TkMessage = { code: string; message: string };

export type TkSubmitResult =
  | { ok: true; antragId: string; status: number; raw: unknown }
  | { ok: false; status: number; messages: TkMessage[]; raw: unknown };

export type TkAttachment = {
  /** PASSBILD = photo for the health card, DOKUMENT = everything else. */
  kind: "PASSBILD" | "DOKUMENT";
  filename: string;
  contentType: string;
  data: Buffer;
};

/* -------------------------------------------------------------------------- */
/*                                   TOKEN                                    */
/* -------------------------------------------------------------------------- */

type TkSession = { token: string; cookie: string; expiresAt: number };

let cachedSession: TkSession | null = null;

const getSession = async (forceRefresh = false): Promise<TkSession> => {
  if (!forceRefresh && cachedSession && cachedSession.expiresAt > Date.now()) {
    return cachedSession;
  }

  const userId = process.env.TK_USER_ID;
  const password = process.env.TK_PASSWORD;

  if (!userId || !password) {
    throw new TkApiError("TK_USER_ID / TK_PASSWORD are not configured", null);
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/plain",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({ userId, password }),
    cache: "no-store",
    signal: AbortSignal.timeout(TK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new TkApiError(`TK token request failed (${response.status})`, response.status);
  }

  const token = (await response.text()).trim();

  // Forward every cookie TK sets (nsj + session cookies) to avoid
  // server-hopping and token signature issues.
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .filter(Boolean)
    .join("; ");

  if (!token || !cookie.includes("nsj=")) {
    throw new TkApiError("TK token response is missing the token or nsj cookie", response.status);
  }

  cachedSession = { token, cookie, expiresAt: Date.now() + TOKEN_TTL_MS };

  return cachedSession;
};

const authHeaders = (session: TkSession) => ({
  Authorization: `Bearer ${session.token}`,
  Cookie: session.cookie,
  Accept: "application/json",
  "User-Agent": USER_AGENT,
});

type TkJson = {
  antragId?: string | null;
  messages?: { code?: unknown; message?: unknown }[] | null;
  statusResponse?: TkStatusEntry[];
};

const parseJson = (text: string): TkJson | null => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                                 EINREICHEN                                 */
/* -------------------------------------------------------------------------- */

const buildMultipart = (payload: unknown, attachments: TkAttachment[]) => {
  const boundary = `----InsurBeTk${Date.now()}${Math.random().toString(16).slice(2)}`;

  const parts = [
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="neuaufnahme"\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${JSON.stringify(payload)}\r\n`,
  ];

  for (const file of attachments) {
    const filename = file.filename.replace(/["\r\n]/g, "_");

    parts.push(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${file.kind}"; filename="${filename}"\r\n` +
        `Content-Transfer-Encoding: BASE64\r\n` +
        `Content-Type: ${file.contentType}\r\n\r\n` +
        `${file.data.toString("base64")}\r\n`,
    );
  }

  parts.push(`--${boundary}--\r\n`);

  return { boundary, body: Buffer.from(parts.join(""), "utf8") };
};

export const submitTkMembership = async (
  payload: unknown,
  attachments: TkAttachment[],
): Promise<TkSubmitResult> => {
  const { boundary, body } = buildMultipart(payload, attachments);

  const send = async (session: TkSession) =>
    fetch(operationUrl("einreichen"), {
      method: "POST",
      headers: {
        ...authHeaders(session),
        "Content-Type": `multipart/mixed; boundary=${boundary}`,
        "Content-Length": String(body.length),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(TK_TIMEOUT_MS * 2),
    });

  let response = await send(await getSession());

  // Cached token may have been invalidated on TK's side; retry once.
  if (response.status === 401) {
    response = await send(await getSession(true));
  }

  const text = await response.text();
  const json = parseJson(text);

  if (response.ok && json?.antragId) {
    return { ok: true, antragId: String(json.antragId), status: response.status, raw: json };
  }

  if (response.status === 400 && Array.isArray(json?.messages)) {
    return {
      ok: false,
      status: 400,
      messages: json.messages.map((item) => ({
        code: String(item?.code ?? ""),
        message: String(item?.message ?? ""),
      })),
      raw: json,
    };
  }

  // 401/403/5xx/HTML error pages: TK is unavailable, not a data problem.
  throw new TkApiError(
    `TK einreichen failed (${response.status}): ${text.trim().startsWith("<") ? "HTML error page" : text.slice(0, 300)}`,
    response.status,
  );
};

/* -------------------------------------------------------------------------- */
/*                                   STATUS                                   */
/* -------------------------------------------------------------------------- */

export type TkStatusEntry = {
  antragId: string;
  mitgliedsStatus: string;
  verguetungsStatus: string;
  aktionen: { aktion: string; erstellDatum: string }[];
};

export const getTkMembershipStatus = async (antragIds: string[]): Promise<TkStatusEntry[]> => {
  const ids = antragIds.filter(Boolean).slice(0, 10);
  if (!ids.length) return [];

  const session = await getSession();

  const response = await fetch(operationUrl("status"), {
    method: "POST",
    headers: { ...authHeaders(session), "Content-Type": "application/json" },
    body: JSON.stringify({ antragIds: ids }),
    cache: "no-store",
    signal: AbortSignal.timeout(TK_TIMEOUT_MS),
  });

  const json = parseJson(await response.text());

  if (!response.ok || !Array.isArray(json?.statusResponse)) {
    throw new TkApiError(`TK status failed (${response.status})`, response.status);
  }

  return json.statusResponse;
};
