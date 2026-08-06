import { storageUsedBytes } from './storage';

/**
 * Total bytes allowed across all uploaded files. Uploads are anonymous, so
 * without a global ceiling an attacker can fill the storage bucket.
 */
export const UPLOAD_BUDGET_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

let usedBytes: number | null = null;
let scanning: Promise<number> | null = null;

/** Scans the bucket once per warm instance, then tracks incrementally. */
async function ensureScanned(): Promise<number> {
  if (usedBytes !== null) return usedBytes;
  if (!scanning) scanning = storageUsedBytes().then((n) => (usedBytes = n));
  return scanning;
}

/** True when adding `incoming` bytes would exceed the budget. */
export async function wouldExceedBudget(incoming: number): Promise<boolean> {
  const used = await ensureScanned();
  return used + incoming > UPLOAD_BUDGET_BYTES;
}

/** Call after a successful write so the counter stays accurate. */
export function noteWritten(bytes: number): void {
  if (usedBytes !== null) usedBytes += bytes;
}

/** Call after deleting a file so freed space is reusable without a restart. */
export function noteDeleted(bytes: number): void {
  if (usedBytes !== null) usedBytes = Math.max(0, usedBytes - bytes);
}

/**
 * Validates Content-Length strictly. A missing or non-numeric header means we
 * cannot bound the body before buffering it, so the request is refused rather
 * than trusted (chunked bodies would otherwise skip the size check entirely).
 */
export function checkContentLength(
  header: string | null,
  maxSize: number
): { ok: true } | { ok: false; error: string; status: number } {
  if (!header || !/^\d+$/.test(header)) {
    return { ok: false, error: 'Не указан размер файла', status: 411 };
  }
  if (parseInt(header, 10) > maxSize + 2048) {
    return {
      ok: false,
      error: `Файл слишком большой (макс. ${Math.floor(maxSize / (1024 * 1024))} МБ)`,
      status: 413,
    };
  }
  return { ok: true };
}
