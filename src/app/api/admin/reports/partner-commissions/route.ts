import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getCommissionReport, parseRange } from "@/app/admin/(protected)/reports/report";
import { authOptions } from "@/lib/authOptions";

/**
 * Commission report for ?month=YYYY-MM or ?from=&to=, optional
 * ?who=partner|agent. JSON by default, CSV with ?format=csv.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const range = parseRange(params);
    const who = params.who === "partner" || params.who === "agent" ? params.who : null;

    const rows = (await getCommissionReport(range))
      .filter((row) => !who || row.source === who)
      .sort((a, b) => b.approved - a.approved || b.total - a.total);

    if (params.format !== "csv") {
      return NextResponse.json({ from: range.from, to: range.to, rows });
    }

    const cell = (value: string | number) => {
      let text = String(value ?? "");
      if (/^[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };

    const headers = [
      "Type",
      "Partner ID",
      "Name",
      "Company",
      "Email",
      "Rate (EUR)",
      "Applications",
      "Total (EUR)",
      "Pending (EUR)",
      "Approved / payable (EUR)",
      "Paid (EUR)",
      "Rejected (EUR)",
      "Account holder",
      "IBAN",
      "BIC",
      "Account number",
      "IFSC",
      "Bank",
    ];

    const lines = rows.map((row) =>
      [
        row.source,
        row.code,
        row.name,
        row.company,
        row.email,
        row.rate,
        row.applications,
        row.total,
        row.pending,
        row.approved,
        row.paid,
        row.rejected,
        row.bank?.holder ?? "",
        row.bank?.iban ?? "",
        row.bank?.bic ?? "",
        row.bank?.accountNumber ?? "",
        row.bank?.ifsc ?? "",
        row.bank?.bankName ?? "",
      ]
        .map(cell)
        .join(","),
    );

    const csv = "﻿" + [headers.map(cell).join(","), ...lines].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="commission-report-${range.from}-to-${range.to}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("COMMISSION REPORT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to generate commission report" },
      { status: 500 },
    );
  }
}
