/**
 * CSV parser utility – handles Google Sheets export format.
 * Supports quoted fields, embedded commas, and multiline values.
 */

export function parseCSV(raw: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        row.push(current.trim());
        current = '';
        if (row.some((cell) => cell.length > 0)) {
          rows.push(row);
        }
        row = [];
        if (ch === '\r') i++; // skip \n after \r
      } else {
        current += ch;
      }
    }
  }

  // last row
  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row);
  }

  return rows;
}

/**
 * Extracts the Google Spreadsheet ID from various URL formats:
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/gviz/tq?tqx=out:csv
 * - Just the raw ID string
 */
export function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();

  // Direct ID (no slashes, looks like a Google ID)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

/**
 * Builds a CSV export URL for a Google Sheet.
 * @param spreadsheetId - The spreadsheet ID
 * @param gid - Sheet GID (default "0" for first sheet)
 */
export function buildCsvUrl(spreadsheetId: string, gid: string = '0'): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}
