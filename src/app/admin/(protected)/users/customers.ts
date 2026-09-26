import { prisma } from "@/lib/prisma";
import { periodRange, type Period } from "../partners/publicInsurance";

export type CustomerSource = "direct" | "partner" | "agent";

export type CustomerKind = "TK" | "DAK" | "private";

export type CustomerApplication = {
  id: string;
  ref: string;
  kind: CustomerKind;
  product: string;
  status: string;
  createdAt: Date | null;
  source: CustomerSource;
  referrer: string | null;
};

export type Customer = {
  email: string;
  name: string;
  phone: string;
  city: string;
  country: string;
  nationality: string;
  dob: string;
  hasAccount: boolean;
  source: CustomerSource;
  referrer: string | null;
  latestAt: Date | null;
  counts: Record<CustomerKind, number>;
  applications: CustomerApplication[];
};

type Personal = Record<string, unknown>;

const text = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";

const toSource = (value: string | null | undefined): CustomerSource =>
  value === "partner" || value === "agent" ? value : "direct";

/**
 * One entry per customer email, combining private applications
 * (Application) and TK/DAK submissions (InsuranceApplication).
 * TK/DAK also write a "Public Health Insurance" Application row,
 * which is skipped here so they are not counted twice.
 */
export async function getCustomers(period: Period): Promise<Customer[]> {
  const range = periodRange(period);
  const createdAt = range ? { createdAt: range } : {};

  const [applications, insuranceApps] = await Promise.all([
    prisma.application.findMany({
      where: {
        status: { notIn: ["incomplete", "client_profile"] },
        OR: [
          { product: null },
          { product: { not: "Public Health Insurance" } },
        ],
        ...createdAt,
      },
      select: {
        id: true,
        orderId: true,
        userId: true,
        status: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        product: true,
        source: true,
        partnerId: true,
        personalDetails: true,
      },
    }),
    prisma.insuranceApplication.findMany({
      where: {
        provider: { in: ["TK", "DAK"] },
        ...createdAt,
      },
      select: {
        id: true,
        applicationNumber: true,
        provider: true,
        status: true,
        createdAt: true,
        payload: true,
        partnerId: true,
        source: true,
      },
    }),
  ]);

  /**
   * RESOLVE USER IDS AND REFERRER NAMES
   */
  const userIds = [
    ...new Set(
      applications
        .map((app) => app.userId)
        .filter((id): id is string => !!id && !id.includes("@")),
    ),
  ];

  const referrerIds = [
    ...new Set(
      [...applications, ...insuranceApps]
        .map((app) => app.partnerId)
        .filter((id): id is string => !!id),
    ),
  ];

  const [idUsers, referrers] = await Promise.all([
    userIds.length
      ? prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [],
    referrerIds.length
      ? prisma.user.findMany({
          where: {
            OR: [
              { role: "partner", partnerId: { in: referrerIds } },
              { role: "agent", id: { in: referrerIds } },
            ],
          },
          select: {
            id: true,
            role: true,
            partnerId: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        })
      : [],
  ]);

  const emailById = new Map(idUsers.map((user) => [user.id, user.email]));

  const referrerName = new Map<string, string>();

  for (const user of referrers) {
    const name =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.companyName ||
      user.email;
    const key = user.role === "agent" ? user.id : user.partnerId;

    if (key) referrerName.set(`${user.role}:${key}`, name);
  }

  const referrerFor = (source: CustomerSource, partnerId: string | null) =>
    source === "direct" || !partnerId
      ? null
      : referrerName.get(`${source}:${partnerId}`) || partnerId;

  /**
   * NORMALISED ENTRIES
   */
  type Entry = {
    email: string;
    personal: {
      name: string;
      phone: string;
      city: string;
      country: string;
      nationality: string;
      dob: string;
    };
    application: CustomerApplication;
  };

  const entries: Entry[] = [];

  for (const app of applications) {
    const personal = (app.personalDetails as Personal | null) ?? {};
    const email = (
      text(personal.email) ||
      (app.userId?.includes("@") ? app.userId : emailById.get(app.userId ?? "")) ||
      ""
    ).toLowerCase();

    if (!email) continue;

    const source = toSource(app.source);

    entries.push({
      email,
      personal: {
        name:
          `${app.firstName || text(personal.firstName)} ${app.lastName || text(personal.lastName)}`.trim(),
        phone: text(personal.phone),
        city: text(personal.city),
        country: text(personal.country),
        nationality: text(personal.nationality),
        dob: text(personal.dob),
      },
      application: {
        id: app.id,
        ref: app.orderId,
        kind: "private",
        product: app.product || "Private insurance",
        status: app.status,
        createdAt: app.createdAt,
        source,
        referrer: referrerFor(source, app.partnerId),
      },
    });
  }

  for (const app of insuranceApps) {
    const payload = (app.payload as { personal?: Personal; selectPlan?: Personal } | null) ?? {};
    const personal = payload.personal ?? {};
    const email = text(personal.email).toLowerCase();

    if (!email) continue;

    const source = toSource(app.source);
    const kind = app.provider === "TK" ? "TK" : "DAK";

    entries.push({
      email,
      personal: {
        name: `${text(personal.firstName)} ${text(personal.lastName)}`.trim(),
        phone: `${text(personal.countryCode)} ${text(personal.phoneNumber)}`.trim(),
        city: text(personal.city),
        country: text(personal.country),
        nationality: text(personal.nationality),
        dob: text(payload.selectPlan?.dob),
      },
      application: {
        id: app.id,
        ref: app.applicationNumber || app.id,
        kind,
        product: `${kind} public insurance`,
        status: app.status,
        createdAt: app.createdAt,
        source,
        referrer: referrerFor(source, app.partnerId),
      },
    });
  }

  /**
   * GROUP BY EMAIL (OLDEST FIRST, SO THE LATEST DETAILS WIN)
   */
  entries.sort(
    (a, b) =>
      (a.application.createdAt?.getTime() ?? 0) -
      (b.application.createdAt?.getTime() ?? 0),
  );

  const customers = new Map<string, Customer>();

  for (const entry of entries) {
    const customer: Customer =
      customers.get(entry.email) ?? {
        email: entry.email,
        name: "",
        phone: "",
        city: "",
        country: "",
        nationality: "",
        dob: "",
        hasAccount: false,
        source: "direct",
        referrer: null,
        latestAt: null,
        counts: { TK: 0, DAK: 0, private: 0 },
        applications: [],
      };

    for (const [key, value] of Object.entries(entry.personal)) {
      if (value) customer[key as keyof Entry["personal"]] = value;
    }

    customer.source = entry.application.source;
    customer.referrer = entry.application.referrer;
    customer.latestAt = entry.application.createdAt ?? customer.latestAt;
    customer.counts[entry.application.kind] += 1;
    customer.applications.unshift(entry.application);

    customers.set(entry.email, customer);
  }

  /**
   * LOGIN ACCOUNTS
   */
  const emails = [...customers.keys()];

  if (emails.length) {
    const accounts = await prisma.$queryRaw<{ email: string }[]>`
      SELECT lower("email") AS "email"
      FROM "User"
      WHERE lower("email") = ANY(${emails})
    `;

    for (const account of accounts) {
      const customer = customers.get(account.email);

      if (customer) customer.hasAccount = true;
    }
  }

  return [...customers.values()];
}
