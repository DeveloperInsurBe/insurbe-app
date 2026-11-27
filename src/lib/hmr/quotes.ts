/**
 * HanseMerkur (HMR) live prices for incoming travel health insurance, through
 * the OBS REST API (POST /v1/offers). Phase 1: prices only – nothing is
 * booked or stored; "Choose" still opens HanseMerkur's own booking page.
 *
 * Settings (.env / Vercel): HMR_API_ENABLED=true, HMR_REST_BASE_URL,
 * HMR_USERNAME, HMR_PASSWORD, HMR_API_KEY, HMR_REQUESTOR_ID, HMR_TERMINAL_ID
 * (agency / partner id), HMR_API_TIMEOUT_MS.
 */

export const hmrQuotesEnabled = () => process.env.HMR_API_ENABLED === "true";

/** Reasons for the stay, as HanseMerkur names them, with our labels. */
export const HMR_REASONS = [
  { value: "STUDENT_PRIVATE", label: "Student" },
  { value: "STUDENT_GOVERNMENT", label: "Student with a government scholarship" },
  { value: "SCIENCE", label: "Researcher / scientist" },
  { value: "BUSINESS", label: "Business / work" },
  { value: "VACATION", label: "Visit / holiday" },
  { value: "PUPIL", label: "School pupil" },
  { value: "SEASONAL_WORKER", label: "Seasonal worker" },
] as const;
export type HmrReason = (typeof HMR_REASONS)[number]["value"];
const isReason = (value: unknown): value is HmrReason => HMR_REASONS.some((reason) => reason.value === value);

export type QuoteInput = {
  birthDate: string; // YYYY-MM-DD
  arrivalDate: string;
  startDate: string;
  endDate: string;
  countryOfResidence: string; // ISO 3166-1 alpha-2
  reason: HmrReason;
};

export type QuoteDocument = { type: string; label: string; url: string };

export type QuoteProduct = {
  insuranceCompany: string;
  productId: number;
  productInstanceId: string;
  title: string;
  premium: number;
  currency: string;
  contractBegin: string;
  contractEnd: string;
  coverage: string[];
  documents: QuoteDocument[];
  /** Add-on packages can't be booked on their own */
  addOn: boolean;
  /** Our product page this belongs to (for the booking link), if known */
  slug: "young-travel" | "foreign-guests" | "visa-travel" | null;
};

export class QuoteError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

/** Checks what the visitor typed. Throws QuoteError with a message to show. */
export function validateQuoteInput(input: Record<string, unknown>): QuoteInput {
  const text = (key: string) => (typeof input[key] === "string" ? (input[key] as string).trim() : "");
  const value = {
    birthDate: text("birthDate"),
    arrivalDate: text("arrivalDate"),
    startDate: text("startDate"),
    endDate: text("endDate"),
    countryOfResidence: text("countryOfResidence").toUpperCase(),
    reason: text("reason"),
  };
  for (const key of ["birthDate", "arrivalDate", "startDate", "endDate"] as const) {
    if (!DATE.test(value[key])) throw new QuoteError("Please fill in all dates.");
  }
  if (value.birthDate >= today() || value.birthDate < "1920-01-01") throw new QuoteError("Please check the date of birth.");
  if (value.startDate < today()) throw new QuoteError("The cover can't start in the past.");
  if (value.endDate <= value.startDate) throw new QuoteError("The end date must be after the start date.");
  if (value.endDate > addDays(value.startDate, 5 * 365 + 1)) throw new QuoteError("The cover can last at most 5 years.");
  if (!/^[A-Z]{2}$/.test(value.countryOfResidence)) throw new QuoteError("Please choose the country you live in.");
  if (!isReason(value.reason)) throw new QuoteError("Please choose the reason for your stay.");
  return value as QuoteInput;
}

const iso = (date: string) => `${date}T00:00:00Z`;

const DOCUMENT_LABELS: Record<string, string> = {
  IPID: "Product information (IPID)",
  AVB: "Insurance terms",
  LEISTB: "Benefits overview",
  VI: "Consumer information",
};

/** Which of our three product pages a HanseMerkur product title belongs to. */
function slugFor(title: string): QuoteProduct["slug"] {
  if (/\bvisa\b/i.test(title)) return "visa-travel";
  if (/\(YT In/i.test(title) || /young/i.test(title)) return "young-travel";
  if (/\bAG(L|\s|\))/i.test(title) || /foreign guests/i.test(title)) return "foreign-guests";
  return null;
}

type RawOffer = {
  insuranceCompany?: string;
  products?: {
    productId?: number;
    productInstanceId?: string;
    title?: string;
    contractBegin?: string;
    contractEnd?: string;
    productTotalPremium?: { amount?: string; currency?: string };
    coverageData?: { title?: string }[];
    documents?: { documentType?: string; url?: string }[];
  }[];
};

/** Live prices from HanseMerkur for one insured person. */
export async function fetchQuotes(input: QuoteInput): Promise<QuoteProduct[]> {
  const baseUrl = process.env.HMR_REST_BASE_URL || "https://api-test.hmrv.de/rest";
  const { HMR_USERNAME, HMR_PASSWORD, HMR_API_KEY, HMR_REQUESTOR_ID, HMR_TERMINAL_ID } = process.env;
  if (!HMR_USERNAME || !HMR_PASSWORD || !HMR_API_KEY || !HMR_REQUESTOR_ID || !HMR_TERMINAL_ID) {
    throw new QuoteError("Prices are not available right now.", 503);
  }

  const body = {
    metadata: { requestorId: HMR_REQUESTOR_ID, partnerId: HMR_TERMINAL_ID },
    coveredEvent: {
      bookingConfirmationDate: new Date().toISOString(),
      eventStartDate: iso(input.startDate),
      eventEndDate: iso(input.endDate),
      arrivalDate: iso(input.arrivalDate),
      destinationCountries: ["DE"],
    },
    insuredPersons: [
      {
        insuredPersonId: 1,
        ageGroup: "ADULT",
        birthDate: iso(input.birthDate),
        countryOfResidence: input.countryOfResidence,
        travelReason: input.reason,
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v1/offers?locale=en`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${HMR_USERNAME}:${HMR_PASSWORD}`).toString("base64")}`,
        "X-API-Key": HMR_API_KEY,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(Number(process.env.HMR_API_TIMEOUT_MS) || 20000),
    });
  } catch (error) {
    console.error("HMR OFFERS REQUEST FAILED:", (error as Error).message);
    throw new QuoteError("HanseMerkur is not reachable right now. Please try again in a moment.", 503);
  }

  const data = (await response.json().catch(() => null)) as
    | { offers?: RawOffer[]; messages?: { messageCode?: string; message?: string }[]; fields?: { field?: string; message?: string }[]; requestId?: string }
    | null;

  if (!response.ok || !data?.offers) {
    const code = data?.messages?.[0]?.messageCode;
    console.error("HMR OFFERS ERROR:", response.status, code, data?.messages?.[0]?.message ?? data?.fields?.[0]?.message, data?.requestId);
    if (code === "7039") throw new QuoteError("There is no HanseMerkur offer for these details. Please check the dates and your reason for the stay.");
    if (response.status === 400 && data?.fields?.length) throw new QuoteError("Please check your details and try again.");
    throw new QuoteError("Prices are not available right now. Please try again in a moment.", 502);
  }

  return data.offers
    .flatMap((offer) =>
      (offer.products ?? []).map((product): QuoteProduct => {
        const title = product.title ?? "HanseMerkur insurance";
        return {
          insuranceCompany: offer.insuranceCompany ?? "HMR",
          productId: product.productId ?? 0,
          productInstanceId: product.productInstanceId ?? "",
          title,
          premium: Number(product.productTotalPremium?.amount ?? 0),
          currency: product.productTotalPremium?.currency ?? "EUR",
          contractBegin: product.contractBegin ?? "",
          contractEnd: product.contractEnd ?? "",
          coverage: (product.coverageData ?? []).map((item) => item.title ?? "").filter(Boolean),
          documents: (product.documents ?? [])
            .filter((document) => document.url && /^https:\/\/[a-z0-9.-]+\.hmrv\.de\//i.test(document.url))
            .map((document) => ({
              type: document.documentType ?? "",
              label: DOCUMENT_LABELS[document.documentType ?? ""] ?? "Document",
              url: document.url as string,
            })),
          addOn: /additional package/i.test(title),
          slug: slugFor(title),
        };
      }),
    )
    .sort((a, b) => Number(a.addOn) - Number(b.addOn) || a.premium - b.premium);
}
