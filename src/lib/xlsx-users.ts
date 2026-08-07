import ExcelJS from 'exceljs';
import { randomBytes } from 'crypto';

/** Defense-in-depth row cap, backing up the request body size limit. */
export const MAX_XLSX_ROWS = 2000;

/** Parses the first worksheet of an .xlsx buffer into string[][] (row 0 = header). */
export async function parseXlsxRows(buffer: Buffer): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  // exceljs declares its own ambient `Buffer extends ArrayBuffer` interface that
  // conflicts with @types/node's generic Buffer — a typings bug in the package,
  // not a runtime mismatch (it accepts a plain Node Buffer at runtime).
  await wb.xlsx.load(buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];

  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as unknown[]; // index 0 is unused (ExcelJS rows are 1-indexed)
    rows.push(values.slice(1).map(cellToString));
  });
  return rows;
}

function cellToString(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toLocaleDateString('ru-RU');
  if (typeof v === 'object') {
    const anyV = v as { text?: unknown; result?: unknown };
    if (anyV.text != null) return String(anyV.text); // rich text
    if (anyV.result != null) return String(anyV.result); // formula result
    return '';
  }
  return String(v).trim();
}

// Avoid visually-ambiguous characters (0/O, 1/l/I) in generated passwords.
const PWD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Generates a random password for rows that don't supply one. */
export function generatePassword(length = 10): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => PWD_CHARS[b % PWD_CHARS.length]).join('');
}
