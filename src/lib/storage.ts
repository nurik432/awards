import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase Storage client, used to persist uploaded files.
 *
 * Vercel's function filesystem is ephemeral (and read-only outside /tmp) —
 * anything written to public/uploads at runtime disappears the moment the
 * instance recycles or a new deployment ships. Supabase Storage is the
 * durable backing store instead; files are proxied back out through
 * src/app/uploads/[...path]/route.ts so every existing "/uploads/..." URL
 * (validated by src/lib/safe-url.ts and src/app/api/apply/route.ts) keeps
 * working unchanged.
 *
 * SUPABASE_SERVICE_ROLE_KEY bypasses Row Level Security — it must only ever
 * be read on the server (route handlers / server actions), never exposed to
 * the client.
 */

export const UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || 'uploads';

let cached: ReturnType<typeof createClient> | null = null;

export function getStorageClient() {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть заданы в окружении для загрузки файлов.'
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Uploads a buffer to the shared bucket at `key` and returns the storage path. */
export async function uploadToStorage(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const client = getStorageClient();
  const { error } = await client.storage
    .from(UPLOADS_BUCKET)
    .upload(key, buffer, { contentType, upsert: false });
  if (error) throw error;
}

/** Downloads a single object; returns null if it does not exist. */
export async function downloadFromStorage(
  key: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const client = getStorageClient();
  const { data, error } = await client.storage.from(UPLOADS_BUCKET).download(key);
  if (error || !data) return null;
  const buffer = Buffer.from(await data.arrayBuffer());
  return { buffer, contentType: data.type || 'application/octet-stream' };
}

/** Deletes a single object. Silently no-ops if it does not exist. */
export async function deleteFromStorage(key: string): Promise<void> {
  const client = getStorageClient();
  await client.storage.from(UPLOADS_BUCKET).remove([key]);
}

/** Recursively sums the byte size of every object under `prefix` (default: whole bucket). */
export async function storageUsedBytes(prefix = ''): Promise<number> {
  const client = getStorageClient();
  let total = 0;

  async function walk(dir: string): Promise<void> {
    const { data, error } = await client.storage.from(UPLOADS_BUCKET).list(dir, { limit: 1000 });
    if (error || !data) return;
    for (const entry of data) {
      const full = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.id === null) {
        // Folders come back with id: null and no metadata.
        await walk(full);
      } else {
        total += (entry.metadata as { size?: number } | null)?.size ?? 0;
      }
    }
  }

  await walk(prefix);
  return total;
}
