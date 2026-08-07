import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkContentLength } from '@/lib/upload-guard';
import { findColumn } from '@/lib/sheets';
import { parseXlsxRows, generatePassword, MAX_XLSX_ROWS } from '@/lib/xlsx-users';

/**
 * POST /api/admin/bulk-users
 *
 * multipart/form-data body: { file: <.xlsx>, mode: "preview" | "import" }
 *
 * Expected columns (first row = header, order-independent, RU/EN synonyms):
 *   ФИО / Name, Email, Подразделение / Department, Роль / Role (JUDGE|EMPLOYEE, optional),
 *   Пароль / Password (optional — generated if omitted)
 */

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const VALID_ROLES = ['JUDGE', 'EMPLOYEE'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RowStatus =
  | 'ok'
  | 'missing_fields'
  | 'invalid_email'
  | 'duplicate_in_file'
  | 'exists_in_db'
  | 'invalid_role'
  | 'weak_password';

type ParsedRow = {
  row: number;
  name: string;
  email: string;
  department: string;
  role: 'JUDGE' | 'EMPLOYEE';
  roleRaw: string;
  password: string;
  passwordProvided: boolean;
  generatedPassword: string | null;
  status: RowStatus;
};

function isZipFile(buf: Buffer): boolean {
  return buf[0] === 0x50 && buf[1] === 0x4b; // "PK" — xlsx is a zip container
}

type DetectedColumns = {
  name: string | null;
  email: string | null;
  department: string | null;
  role: string | null;
  password: string | null;
};

async function parseAndValidate(
  buffer: Buffer
): Promise<{ parsed: ParsedRow[]; detectedColumns: DetectedColumns } | { error: string; status: number }> {
  const rows = await parseXlsxRows(buffer);
  if (rows.length < 2) {
    return { error: 'Таблица пуста или содержит только заголовок.', status: 400 };
  }
  if (rows.length - 1 > MAX_XLSX_ROWS) {
    return { error: `Слишком много строк (макс. ${MAX_XLSX_ROWS}).`, status: 400 };
  }

  const header = rows[0].map((h) => h.toLowerCase().trim());
  const dataRows = rows.slice(1);

  const nameCol = findColumn(header, ['фио', 'имя', 'name', 'сотрудник', 'ф.и.о']);
  const emailCol = findColumn(header, ['email', 'e-mail', 'почта', 'эл. почта', 'электронная почта', 'mail']);
  const deptCol = findColumn(header, ['подразделение', 'department', 'отдел', 'компания']);
  const roleCol = findColumn(header, ['роль', 'role']);
  const passCol = findColumn(header, ['пароль', 'password', 'пасс']);

  if (nameCol === -1) {
    return { error: `Не найден столбец «ФИО». Заголовки: ${rows[0].join(', ')}`, status: 400 };
  }
  if (emailCol === -1) {
    return { error: `Не найден столбец «Email». Заголовки: ${rows[0].join(', ')}`, status: 400 };
  }

  // Preload existing emails once for exists_in_db checks.
  const rawEmails = dataRows
    .map((r) => (r[emailCol] || '').trim().toLowerCase())
    .filter(Boolean);
  const existing = rawEmails.length
    ? await prisma.user.findMany({
        where: { email: { in: rawEmails } },
        select: { email: true },
      })
    : [];
  const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));

  const seenInFile = new Set<string>();
  const parsed: ParsedRow[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const rowNum = i + 2;

    const name = (r[nameCol] || '').trim();
    const emailRaw = (r[emailCol] || '').trim();
    const email = emailRaw.toLowerCase();
    const department = deptCol !== -1 ? (r[deptCol] || '').trim() : '';
    const roleRaw = roleCol !== -1 ? (r[roleCol] || '').trim() : '';
    const passwordCell = passCol !== -1 ? (r[passCol] || '').trim() : '';

    if (!name && !email && !department && !roleRaw && !passwordCell) continue; // fully blank row

    let status: RowStatus | null = null;

    if (!name || !email) {
      status = 'missing_fields';
    } else if (!EMAIL_RE.test(email)) {
      status = 'invalid_email';
    } else if (seenInFile.has(email)) {
      status = 'duplicate_in_file';
    } else if (existingEmails.has(email)) {
      status = 'exists_in_db';
    }

    if (email) seenInFile.add(email);

    const roleUpper = roleRaw.toUpperCase();
    let role: 'JUDGE' | 'EMPLOYEE' = 'EMPLOYEE';
    if (!status) {
      if (roleUpper === '') {
        role = 'EMPLOYEE';
      } else if (VALID_ROLES.includes(roleUpper)) {
        role = roleUpper as 'JUDGE' | 'EMPLOYEE';
      } else {
        status = 'invalid_role'; // includes an explicit "ADMIN" — never allowed via bulk import
      }
    }

    if (!status && passwordCell && passwordCell.length < 8) {
      status = 'weak_password';
    }

    const ok = status === null;
    const generatedPassword = ok && !passwordCell ? generatePassword() : null;

    parsed.push({
      row: rowNum,
      name,
      email,
      department,
      role,
      roleRaw,
      password: passwordCell || generatedPassword || '',
      passwordProvided: !!passwordCell,
      generatedPassword,
      status: status ?? 'ok',
    });
  }

  return {
    parsed,
    detectedColumns: {
      name: rows[0][nameCol],
      email: rows[0][emailCol],
      department: deptCol !== -1 ? rows[0][deptCol] : null,
      role: roleCol !== -1 ? rows[0][roleCol] : null,
      password: passCol !== -1 ? rows[0][passCol] : null,
    },
  };
}

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  }

  try {
    const lenCheck = checkContentLength(request.headers.get('content-length'), MAX_SIZE);
    if (!lenCheck.ok) {
      return NextResponse.json({ error: lenCheck.error }, { status: lenCheck.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = formData.get('mode') as string | null;

    if (!file) return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    if (mode !== 'preview' && mode !== 'import') {
      return NextResponse.json({ error: 'Некорректный режим' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой (макс. 2 МБ)' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.xlsx') || (file.type && file.type !== ALLOWED_TYPE)) {
      return NextResponse.json({ error: 'Допускается только файл .xlsx' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isZipFile(buffer)) {
      return NextResponse.json({ error: 'Содержимое файла не соответствует формату .xlsx' }, { status: 400 });
    }

    const result = await parseAndValidate(buffer);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { parsed, detectedColumns } = result;

    const validCount = parsed.filter((p) => p.status === 'ok').length;
    const errorCount = parsed.length - validCount;

    if (mode === 'preview') {
      return NextResponse.json({
        success: true,
        mode: 'preview',
        totalRows: parsed.length,
        validCount,
        errorCount,
        detectedColumns,
        items: parsed.map((p) => ({
          row: p.row,
          name: p.name,
          email: p.email,
          department: p.department,
          role: p.role,
          roleRaw: p.roleRaw,
          passwordProvided: p.passwordProvided,
          generatedPassword: p.generatedPassword,
          status: p.status,
        })),
      });
    }

    // ── Import mode — re-validation already happened against fresh DB state above ──
    const valid = parsed.filter((p) => p.status === 'ok');
    if (valid.length === 0) {
      return NextResponse.json({ error: 'Нет валидных строк для импорта.' }, { status: 400 });
    }

    const results: Array<{ row: number; email: string; status: 'created' | 'skipped'; reason?: string; password?: string }> = [];
    let created = 0;

    for (const item of parsed) {
      if (item.status !== 'ok') {
        results.push({ row: item.row, email: item.email, status: 'skipped', reason: item.status });
        continue;
      }
      try {
        const hashed = await bcryptjs.hash(item.password, 10);
        await prisma.user.create({
          data: {
            name: item.name,
            email: item.email,
            password: hashed,
            role: item.role,
            department: item.department || null,
          },
        });
        created++;
        results.push({
          row: item.row,
          email: item.email,
          status: 'created',
          ...(item.generatedPassword ? { password: item.generatedPassword } : {}),
        });
      } catch {
        // Most likely a unique-email race against another concurrent import.
        results.push({ row: item.row, email: item.email, status: 'skipped', reason: 'exists_in_db' });
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'import',
      created,
      skipped: results.length - created,
      results,
    });
  } catch (error) {
    console.error('Bulk users import error:', error);
    return NextResponse.json({ error: 'Ошибка импорта' }, { status: 500 });
  }
}
