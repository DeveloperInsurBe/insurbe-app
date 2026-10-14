/**
 * HanseMerkur incoming / visa insurance products.
 *
 * Booking runs on HanseMerkur's own secure booking pages (secure.hmrv.de),
 * pre-configured for InsurBe's agency number (adnr). Facts below are taken
 * from those booking pages - keep them in sync if HanseMerkur changes them.
 */

export const HMR_AGENCY_NUMBER = "4989521";

export type HmrLocale = "en_GB" | "de_DE";

export type HmrProductSlug = "young-travel" | "foreign-guests" | "visa-travel";

export type HmrProduct = {
  slug: HmrProductSlug;
  /** HanseMerkur booking configuration id (baid). */
  baid: number;
  name: string;
  shortName: string;
  tagline: string;
  bestFor: string;
  maxDuration: string;
  coverageArea: string;
  ageInfo: string;
  highlights: string[];
  goodToKnow: string[];
  accent: "violet" | "sky" | "emerald";
};

export const HMR_PRODUCTS: HmrProduct[] = [
  {
    slug: "young-travel",
    baid: 277,
    name: "Young Travel Incoming",
    shortName: "Young Travel",
    tagline: "Travel health insurance for young people staying in Germany.",
    bestFor: "Students, au pairs, interns and young travellers",
    maxDuration: "Up to 5 years",
    coverageArea: "Germany",
    ageInfo: "Designed for young people",
    highlights: [
      "Cover for stays in Germany of up to 5 years",
      "Can be taken out at any time during your stay",
      "No waiting period if you apply within 31 days of arrival",
      "Renewal possible after previous insurance",
    ],
    goodToKnow: [
      "Must cover the whole remaining period of your stay in Germany.",
      "A 31-day waiting period applies if you apply later than 31 days after arrival (not for accidents or acute emergencies).",
      "Max. 5 years of foreign travel insurance in total, including earlier policies with other insurers.",
    ],
    accent: "violet",
  },
  {
    slug: "foreign-guests",
    baid: 280,
    name: "Travel Insurance for Foreign Guests",
    shortName: "Foreign Guests (AGL)",
    tagline: "Health cover for guests from abroad during a temporary stay in Germany.",
    bestFor: "Visitors, guest researchers, family visits and longer stays",
    maxDuration: "Up to 5 years",
    coverageArea: "Germany",
    ageInfo: "For guests staying temporarily in Germany",
    highlights: [
      "Cover for stays in Germany of up to 5 years",
      "Can be taken out at any time during your stay",
      "No waiting period if you apply within 31 days of arrival",
      "Renewal possible after previous insurance",
    ],
    goodToKnow: [
      "For a temporary stay only – not if you plan to live in Germany permanently.",
      "A 31-day waiting period applies if you apply later than 31 days after arrival (not for accidents or acute emergencies).",
      "Max. 5 years of foreign travel insurance in total, including earlier policies with other insurers.",
    ],
    accent: "sky",
  },
  {
    slug: "visa-travel",
    baid: 282,
    name: "Visa Travel Insurance",
    shortName: "Visa Travel",
    tagline: "Visa-ready travel health cover for Germany and the Schengen area.",
    bestFor: "Visa applicants, tourists and business visitors",
    maxDuration: "Up to 1 year",
    coverageArea: "Germany, Schengen area, Andorra, Monaco, San Marino, Vatican City",
    ageInfo: "Ages up to and including 75",
    highlights: [
      "For people who need a visa for their stay",
      "Valid in Germany and the whole Schengen area",
      "Cover for stays of up to 1 year",
      "Optional add-ons: accident, liability, emergency and baggage",
    ],
    goodToKnow: [
      "Must be taken out before you enter the Schengen area, for your entire stay.",
      "Cover starts on your date of entry.",
      "For foreign nationals with a permanent residence abroad.",
    ],
    accent: "emerald",
  },
];

export const getHmrProduct = (slug: string) => HMR_PRODUCTS.find((product) => product.slug === slug);

/** HanseMerkur booking link for a product, configured for InsurBe's agency number. */
export const hmrBookingUrl = (product: HmrProduct, locale: HmrLocale = "en_GB") =>
  `https://secure.hmrv.de/rvw-ba/initBa.jsp?baid=${product.baid}&wt=POPUP&locale=${locale}&adnr=${HMR_AGENCY_NUMBER}`;

export const ACCENT_STYLES: Record<
  HmrProduct["accent"],
  { badge: string; ring: string; gradient: string; dot: string; soft: string }
> = {
  violet: {
    badge: "bg-violet-100 text-violet-700",
    ring: "ring-violet-500",
    gradient: "from-violet-500 to-fuchsia-500",
    dot: "bg-violet-500",
    soft: "bg-violet-50",
  },
  sky: {
    badge: "bg-sky-100 text-sky-700",
    ring: "ring-sky-500",
    gradient: "from-sky-500 to-indigo-500",
    dot: "bg-sky-500",
    soft: "bg-sky-50",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50",
  },
};
