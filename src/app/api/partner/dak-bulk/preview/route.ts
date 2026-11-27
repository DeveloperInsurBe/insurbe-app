import { NextResponse } from "next/server";

import { readUploadedFile, requireBulkPartner } from "@/lib/dak/bulk/access";
import { BulkFileError, parseBulkFile } from "@/lib/dak/bulk/parse";

export const maxDuration = 60;

/** Checks an uploaded file and returns every row with its problems. Saves nothing. */
export async function POST(req: Request) {
  const { response } = await requireBulkPartner();
  if (response) return response;

  const { file } = await readUploadedFile(req);
  if (!file) return NextResponse.json({ error: "Please choose a file." }, { status: 400 });

  try {
    const rows = await parseBulkFile(file.name, file.buffer);
    return NextResponse.json({
      fileName: file.name,
      total: rows.length,
      valid: rows.filter((row) => row.errors.length === 0).length,
      rows: rows.map((row) => ({
        rowNumber: row.rowNumber,
        name: [row.data.first_name, row.data.last_name].filter(Boolean).join(" "),
        email: row.data.email ?? "",
        errors: row.errors,
      })),
    });
  } catch (error) {
    if (error instanceof BulkFileError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("DAK BULK PREVIEW ERROR:", error);
    return NextResponse.json({ error: "We could not check this file. Please try again." }, { status: 500 });
  }
}
