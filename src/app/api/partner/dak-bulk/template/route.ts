import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

import { requireBulkPartner } from "@/lib/dak/bulk/access";
import { BULK_CATEGORIES, BULK_COLUMNS, BULK_MAX_ROWS } from "@/lib/dak/bulk/config";

/** The DAK bulk upload template: headers, one example row and instructions. */
export async function GET() {
  const { response } = await requireBulkPartner();
  if (response) return response;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "InsurBe";

  const sheet = workbook.addWorksheet("Applicants");
  sheet.columns = BULK_COLUMNS.map((column) => ({
    header: column.required ? `${column.label} *` : column.label,
    key: column.key,
    width: Math.max(16, column.label.length + 4),
  }));
  sheet.addRow(Object.fromEntries(BULK_COLUMNS.map((column) => [column.key, column.example])));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF820AD1" } };
  sheet.getRow(2).font = { italic: true, color: { argb: "FF888888" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const help = workbook.addWorksheet("How to fill in");
  help.columns = [{ width: 110 }];
  [
    "InsurBe – DAK bulk upload",
    "",
    "• One person per row, starting in row 3 (row 2 is an example and is ignored).",
    "• Required: First name, Last name, Email. All other columns are optional – leave them empty if you don't know them.",
    "• Dates: YYYY-MM-DD (e.g. 2026-10-01).",
    `• Category: ${BULK_CATEGORIES.join(", ")}.`,
    `• At most ${BULK_MAX_ROWS} people per file. Keep the column headers as they are.`,
    "• Only upload people who asked you to start their DAK application and agreed to share their data.",
    "• Each person gets an email from InsurBe to check the details, upload documents and submit the application themselves.",
  ].forEach((line) => help.addRow([line]));
  help.getRow(1).font = { bold: true, size: 14 };

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="InsurBe-DAK-bulk-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
