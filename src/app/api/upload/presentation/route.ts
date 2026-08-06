import { NextResponse } from 'next/server';
import { checkContentLength, wouldExceedBudget, noteWritten } from '@/lib/upload-guard';
import { uploadToStorage } from '@/lib/storage';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB for presentations

const ALLOWED: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
};

function checkDocMagicBytes(buf: Buffer, declaredType: string): boolean {
  switch (declaredType) {
    case 'application/pdf':
      return buf.slice(0, 4).toString('ascii') === '%PDF';
    case 'application/msword':
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.ms-excel':
      // Compound Document File Format (OLE2)
      return buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.oasis.opendocument.text':
    case 'application/vnd.oasis.opendocument.presentation':
    case 'application/vnd.oasis.opendocument.spreadsheet':
      // ZIP-based formats (OOXML and ODF)
      return buf[0] === 0x50 && buf[1] === 0x4B && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07);
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

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Недопустимый формат. Разрешены: PDF, Word, PowerPoint, Excel, ODF' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой (макс. 10 МБ)' }, { status: 400 });
    }

    if (await wouldExceedBudget(file.size)) {
      return NextResponse.json({ error: 'Хранилище переполнено' }, { status: 507 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Verify actual file content matches the declared MIME type
    if (!checkDocMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: 'Содержимое файла не соответствует формату' }, { status: 400 });
    }

    // Filename generated server-side — no user input reaches the path
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await uploadToStorage(`presentations/${filename}`, buffer, file.type);
    noteWritten(buffer.length);

    return NextResponse.json({
      success: true,
      url: `/uploads/presentations/${filename}`,
      originalName: file.name.slice(0, 255),
      ext,
    });
  } catch (error) {
    console.error('Presentation upload error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
}
