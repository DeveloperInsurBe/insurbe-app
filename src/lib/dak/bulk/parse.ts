import { Readable } from "stream";
import ExcelJS from "exceljs";

import {
  BULK_CATEGORIES,
  BULK_COLUMNS,
  BULK_MAX_FILE_BYTES,
  BULK_MAX_ROWS,
  type BulkColumn,
} from "./config";

export type ParsedRow = {
  /** Spreadsheet row number (header = 1), for messages to the partner */
  rowNumber: number;
  /** Allow-listed, cleaned values only */
  data: Record<string, string>;
  errors: string[];
};

export class BulkFileError extends Error {}

const MAX_CELL_LENGTH = 200;

/** "First name", "first_name", "FIRST NAME" all match the same column. */
const headerKey = (value: string) => value.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");

const COLUMN_BY_HEADER = new Map<string, BulkColumn>();
for (const column of BULK_COLUMNS) {
  COLUMN_BY_HEADER.set(headerKey(column.key), column);
  COLUMN_BY_HEADER.set(headerKey(column.label), column);
}

const pad = (value: number) => String(value).padStart(2, "0");
const isoDate = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

/**
 * Plain text of a cell. Formulas are never evaluated: only the value Excel
 * saved with the file is used.
 */
function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return isoDate(value);
  if (typeof value === "object") {
    if ("result" in value) return cellText((value as ExcelJS.CellFormulaValue).result as ExcelJS.CellValue);
    if ("richText" in value) return (value as ExcelJS.CellRichTextValue).richText.map((part) => part.text).join("");
    if ("text" in value) return String((value as ExcelJS.CellHyperlinkValue).text ?? "");
    return "";
  }
  return String(value);
}

const clean = (value: string) =>
  value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CELL_LENGTH);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Accepts YYYY-MM-DD and DD.MM.YYYY; returns YYYY-MM-DD or null. */
function normalizeDate(value: string): string | null {
  const german = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const text = german ? `${german[3]}-${pad(Number(german[2]))}-${pad(Number(german[1]))}` : value;
  const match = text.match(DATE);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return isoDate(date) === text ? text : null;
}

function validateRow(data: Record<string, string>): string[] {
  const errors: string[] = [];
  for (const column of BULK_COLUMNS) {
    const value = data[column.key] ?? "";
    if (!value) {
      if (column.required) errors.push(`${column.label} is missing`);
      continue;
    }
    if (column.type === "email") {
      data[column.key] = value.toLowerCase();
      if (!EMAIL.test(data[column.key])) errors.push(`${column.label} is not a valid email`);
    }
    if (column.type === "date") {
      const date = normalizeDate(value);
      if (!date) errors.push(`${column.label} must be a date like 2026-10-01`);
      else data[column.key] = date;
    }
    if (column.type === "phone" && !/^\+?[0-9 ()/-]{6,20}$/.test(value)) {
      errors.push(`${column.label} is not a valid phone number`);
    }
    if (column.type === "category") {
      const match = BULK_CATEGORIES.find((category) => category.toLowerCase() === value.toLowerCase());
      if (!match) errors.push(`${column.label} must be one of: ${BULK_CATEGORIES.join(", ")}`);
      else data[column.key] = match;
    }
  }

  const today = isoDate(new Date());
  if (data.date_of_birth && !errors.some((error) => error.startsWith("Date of birth"))) {
    if (data.date_of_birth >= today) errors.push("Date of birth must be in the past");
    else if (data.date_of_birth < "1920-01-01") errors.push("Date of birth looks wrong");
  }
  return errors;
}

/**
 * Reads an uploaded .xlsx or .csv: first sheet, first row = headers, only the
 * allow-listed columns. Throws BulkFileError for problems with the whole file.
 */
export async function parseBulkFile(fileName: string, buffer: Buffer): Promise<ParsedRow[]> {
  if (buffer.length === 0) throw new BulkFileError("The file is empty.");
  if (buffer.length > BULK_MAX_FILE_BYTES) throw new BulkFileError("The file is larger than 2 MB.");

  const lower = fileName.toLowerCase();
  const workbook = new ExcelJS.Workbook();
  try {
    if (lower.endsWith(".xlsx")) {
      // xlsx files are zip archives starting with "PK".
      if (buffer.subarray(0, 2).toString("latin1") !== "PK") throw new BulkFileError("This is not a valid .xlsx file.");
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } else if (lower.endsWith(".csv")) {
      await workbook.csv.read(Readable.from(buffer));
    } else {
      throw new BulkFileError("Please upload the template as .xlsx or .csv.");
    }
  } catch (error) {
    if (error instanceof BulkFileError) throw error;
    throw new BulkFileError("We could not read this file. Please use the InsurBe template.");
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new BulkFileError("The file has no sheet.");

  // Map columns by their header.
  const columns = new Map<number, BulkColumn>();
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const column = COLUMN_BY_HEADER.get(headerKey(clean(cellText(cell.value))));
    if (column && ![...columns.values()].includes(column)) columns.set(colNumber, column);
  });
  const missing = BULK_COLUMNS.filter((column) => column.required && ![...columns.values()].includes(column));
  if (missing.length) {
    throw new BulkFileError(`The file needs these columns: ${missing.map((column) => column.label).join(", ")}.`);
  }

  const rows: ParsedRow[] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const data: Record<string, string> = {};
    columns.forEach((column, colNumber) => {
      const value = clean(cellText(row.getCell(colNumber).value));
      if (value) data[column.key] = value;
    });
    if (Object.keys(data).length === 0) continue; // empty line
    // The template's example row is skipped.
    if (data.email === BULK_COLUMNS.find((column) => column.key === "email")?.example) continue;
    rows.push({ rowNumber, data, errors: [] });
    if (rows.length > BULK_MAX_ROWS) {
      throw new BulkFileError(`Please upload at most ${BULK_MAX_ROWS} people per file.`);
    }
  }
  if (rows.length === 0) throw new BulkFileError("The file has no people in it.");

  // Row checks, then duplicates inside the file (same email twice).
  const seen = new Map<string, number>();
  for (const row of rows) {
    row.errors = validateRow(row.data);
    const email = row.data.email;
    if (email && !row.errors.length) {
      const first = seen.get(email);
      if (first) row.errors.push(`Same email as row ${first}`);
      else seen.set(email, row.rowNumber);
    }
  }
  return rows;
}
