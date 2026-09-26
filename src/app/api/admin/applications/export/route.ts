import { getServerSession } from "next-auth";

import {
  buildWhere,
  getApplicationRows,
  getFilterContext,
  orderByFor,
  parseFilters,
} from "@/app/admin/(protected)/applications/query";
import { authOptions } from "@/lib/authOptions";

const MAX_ROWS = 5000;

/**
 * Quote a CSV cell and neutralise spreadsheet formulas.
 */
const csvCell = (value: string | number) => {
  let cell = String(value ?? "");

  if (/^[=+\-@]/.test(cell)) cell = `'${cell}`;

  return `"${cell.replaceAll('"', '""')}"`;
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const filters = parseFilters(params);
    const context = await getFilterContext(filters);

    const rows = await getApplicationRows(
      buildWhere(filters, context),
      orderByFor(filters.sort),
      { take: MAX_ROWS },
    );

    const headers = [
      "Created At",
      "Order ID",
      "Applicant",
      "Email",
      "Phone",
      "Location",
      "Type",
      "Product",
      "Source",
      "Referrer",
      "Status",
      "Commission (EUR)",
      "Commission Status",
    ];

    const lines = rows.map((row) =>
      [
        new Date(row.createdAt).toISOString(),
        row.orderId,
        row.name,
        row.email,
        row.phone,
        row.location,
        row.kind === "private" ? "Private" : row.kind,
        row.product,
        row.source,
        row.referrer,
        row.status,
        row.commission,
        row.commissionStatus,
      ]
        .map(csvCell)
        .join(","),
    );

    const csv = "﻿" + [headers.map(csvCell).join(","), ...lines].join("\n");
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="applications-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("APPLICATIONS EXPORT ERROR:", error);

    return new Response("Failed to export applications", { status: 500 });
  }
}
