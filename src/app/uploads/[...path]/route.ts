import { NextRequest, NextResponse } from 'next/server';
import { downloadFromStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * Serves files that used to live in public/uploads from Supabase Storage
 * instead, keeping every "/uploads/..." URL already stored in the database
 * (and validated by src/lib/safe-url.ts) working unchanged.
 *
 * next.config.ts already locks down "/uploads/:path*" with a strict
 * Content-Security-Policy — that header rule applies to this route too.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments?.length || segments.some((s) => s.includes('..') || s.includes('\\'))) {
    return new NextResponse('Not found', { status: 404 });
  }

  const key = segments.join('/');
  const file = await downloadFromStorage(key);
  if (!file) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(file.buffer, {
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
