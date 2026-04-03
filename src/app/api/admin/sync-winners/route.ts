import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCSV, extractSpreadsheetId, buildCsvUrl } from '@/lib/sheets';

/**
 * POST /api/admin/sync-winners
 *
 * Body:
 *   { url: string, gid?: string, mode: "preview" | "import", year?: number, clearExisting?: boolean }
 *
 * Expected Google Sheet columns (first row = header):
 *   A: Номинация (must match an existing nomination title)
 *   B: ФИО
 *   C: Должность
 *   D: Подразделение
 *   E: Год (optional, overrides the year in body)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, gid, mode, year, clearExisting } = body as {
      url: string;
      gid?: string;
      mode: 'preview' | 'import';
      year?: number;
      clearExisting?: boolean;
    };

    if (!url) {
      return NextResponse.json({ error: 'URL таблицы не указан' }, { status: 400 });
    }

    // ── 1. Extract spreadsheet ID and build CSV URL ──────────
    const spreadsheetId = extractSpreadsheetId(url);
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Не удалось определить ID таблицы. Вставьте ссылку на Google Sheets.' },
        { status: 400 }
      );
    }

    const csvUrl = buildCsvUrl(spreadsheetId, gid || '0');

    // ── 2. Fetch CSV from Google Sheets ─────────────────────
    const csvRes = await fetch(csvUrl, {
      headers: { 'Accept': 'text/csv' },
    });

    if (!csvRes.ok) {
      const statusText = csvRes.status === 404
        ? 'Таблица не найдена. Проверьте ссылку.'
        : csvRes.status === 403
          ? 'Нет доступа. Откройте доступ «Все у кого есть ссылка» → «Читатель».'
          : `Google вернул ошибку ${csvRes.status}`;
      return NextResponse.json({ error: statusText }, { status: 400 });
    }

    const csvText = await csvRes.text();

    // ── 3. Parse CSV ────────────────────────────────────────
    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'Таблица пуста или содержит только заголовок.' },
        { status: 400 }
      );
    }

    // First row is header, rest is data
    const header = rows[0].map((h) => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Detect column indices (flexible header matching)
    const nomCol = findColumn(header, ['номинация', 'nomination', 'категория']);
    const nameCol = findColumn(header, ['фио', 'имя', 'name', 'сотрудник', 'ф.и.о']);
    const posCol = findColumn(header, ['должность', 'position', 'позиция']);
    const deptCol = findColumn(header, ['подразделение', 'department', 'отдел', 'компания']);
    const yearCol = findColumn(header, ['год', 'year']);

    if (nomCol === -1) {
      return NextResponse.json(
        { error: `Не найден столбец «Номинация». Заголовки: ${rows[0].join(', ')}` },
        { status: 400 }
      );
    }
    if (nameCol === -1) {
      return NextResponse.json(
        { error: `Не найден столбец «ФИО». Заголовки: ${rows[0].join(', ')}` },
        { status: 400 }
      );
    }

    // ── 4. Load nominations from DB for matching ────────────
    const nominations = await prisma.nomination.findMany({
      select: { id: true, title: true, slug: true },
    });

    const nomMap = new Map<string, { id: string; title: string }>();
    for (const n of nominations) {
      nomMap.set(n.title.toLowerCase().trim(), { id: n.id, title: n.title });
      // Also map slug for convenience
      nomMap.set(n.slug.toLowerCase().trim(), { id: n.id, title: n.title });
    }

    // ── 5. Process rows ─────────────────────────────────────
    const defaultYear = year || new Date().getFullYear();
    const parsed: Array<{
      row: number;
      nomination: string;
      nominationId: string | null;
      nominationTitle: string | null;
      name: string;
      position: string;
      department: string;
      year: number;
      status: 'ok' | 'nomination_not_found' | 'missing_name';
    }> = [];

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      const nomValue = (r[nomCol] || '').trim();
      const nameValue = (r[nameCol] || '').trim();
      const posValue = posCol !== -1 ? (r[posCol] || '').trim() : '';
      const deptValue = deptCol !== -1 ? (r[deptCol] || '').trim() : 'Farovon Group';
      const yearValue = yearCol !== -1 && r[yearCol] ? parseInt(r[yearCol]) : defaultYear;

      if (!nameValue) {
        if (nomValue) {
          parsed.push({
            row: i + 2,
            nomination: nomValue,
            nominationId: null,
            nominationTitle: null,
            name: '',
            position: posValue,
            department: deptValue,
            year: yearValue,
            status: 'missing_name',
          });
        }
        continue; // skip completely empty rows
      }

      const match = nomMap.get(nomValue.toLowerCase().trim());

      parsed.push({
        row: i + 2,
        nomination: nomValue,
        nominationId: match?.id ?? null,
        nominationTitle: match?.title ?? null,
        name: nameValue,
        position: posValue,
        department: deptValue,
        year: isNaN(yearValue) ? defaultYear : yearValue,
        status: match ? 'ok' : 'nomination_not_found',
      });
    }

    const valid = parsed.filter((p) => p.status === 'ok');
    const errors = parsed.filter((p) => p.status !== 'ok');

    // ── 6. Preview mode — return parsed data ────────────────
    if (mode === 'preview') {
      return NextResponse.json({
        success: true,
        mode: 'preview',
        totalRows: dataRows.length,
        validCount: valid.length,
        errorCount: errors.length,
        detectedColumns: {
          nomination: nomCol !== -1 ? rows[0][nomCol] : null,
          name: nameCol !== -1 ? rows[0][nameCol] : null,
          position: posCol !== -1 ? rows[0][posCol] : null,
          department: deptCol !== -1 ? rows[0][deptCol] : null,
          year: yearCol !== -1 ? rows[0][yearCol] : null,
        },
        items: parsed,
        nominations: nominations.map((n) => ({ id: n.id, title: n.title })),
      });
    }

    // ── 7. Import mode — write to DB ────────────────────────
    if (valid.length === 0) {
      return NextResponse.json(
        { error: 'Нет валидных строк для импорта. Проверьте названия номинаций.' },
        { status: 400 }
      );
    }

    // Optionally clear existing winners for this year
    if (clearExisting) {
      await prisma.winner.deleteMany({
        where: { year: defaultYear },
      });
    }

    let created = 0;
    for (const item of valid) {
      await prisma.winner.create({
        data: {
          name: item.name,
          position: item.position,
          department: item.department,
          nominationId: item.nominationId!,
          year: item.year,
        },
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      mode: 'import',
      created,
      skippedErrors: errors.length,
    });
  } catch (error: unknown) {
    console.error('Sync winners error:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Helper: find column index by matching header keywords ──
function findColumn(header: string[], keywords: string[]): number {
  return header.findIndex((h) =>
    keywords.some((kw) => h.includes(kw))
  );
}
