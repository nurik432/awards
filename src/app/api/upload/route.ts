import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { checkContentLength, wouldExceedBudget, noteWritten } from '@/lib/upload-guard';
import { uploadToStorage } from '@/lib/storage';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
};

function checkImageMagicBytes(buf: Buffer, declaredType: string): boolean {
  switch (declaredType) {
    case 'image/jpeg':
      return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
    case 'image/png':
      return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    case 'image/webp':
      return buf.slice(0, 4).toString('ascii') === 'RIFF' &&
             buf.slice(8, 12).toString('ascii') === 'WEBP';
    case 'image/gif':
      return buf.slice(0, 6).toString('ascii').startsWith('GIF8');
    default:
      return false;
  }
}

export async function POST(request: Request) {
  try {
    // Reject before buffering the body. A missing Content-Length is refused
    // outright so a chunked body cannot bypass the size limit.
    const lenCheck = checkContentLength(request.headers.get('content-length'), MAX_SIZE);
    if (!lenCheck.ok) {
      return NextResponse.json({ error: lenCheck.error }, { status: lenCheck.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Допускаются только JPG, PNG, WebP, GIF' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой (макс. 5 МБ)' }, { status: 400 });
    }

    if (await wouldExceedBudget(file.size)) {
      return NextResponse.json({ error: 'Хранилище переполнено' }, { status: 507 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify actual file content matches the declared MIME type
    if (!checkImageMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: 'Содержимое файла не соответствует формату' }, { status: 400 });
    }

    // Filename generated server-side — no user input reaches the path
    const ext = EXT_MAP[file.type] ?? 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await uploadToStorage(filename, buffer, file.type);
    noteWritten(buffer.length);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
=======

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB (better for base64 storage)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Допускаются только JPG, PNG, WebP' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Файл слишком большой для хранения в базе (макс. 2 МБ)' },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Create data URL
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  }
}
