'use client';

import { useState } from 'react';

interface ParsedItem {
  row: number;
  nomination: string;
  nominationId: string | null;
  nominationTitle: string | null;
  name: string;
  position: string;
  department: string;
  year: number;
  status: 'ok' | 'nomination_not_found' | 'missing_name';
}

interface PreviewResult {
  success: boolean;
  mode: 'preview';
  totalRows: number;
  validCount: number;
  errorCount: number;
  detectedColumns: Record<string, string | null>;
  items: ParsedItem[];
  nominations: Array<{ id: string; title: string }>;
}

interface ImportResult {
  success: boolean;
  mode: 'import';
  created: number;
  skippedErrors: number;
}

type SyncResult = PreviewResult | ImportResult;

const ROW_STATUS: Record<ParsedItem['status'], { label: string; cls: string }> = {
  ok:                   { label: '✓ Готов',                  cls: 'adm-badge-ok' },
  nomination_not_found: { label: '⚠ Номинация не найдена',   cls: 'adm-badge-pending' },
  missing_name:         { label: '✕ Нет ФИО',                cls: 'adm-badge-danger' },
};

export default function SyncClient() {
  const [url, setUrl] = useState('');
  const [gid, setGid] = useState('0');
  const [year, setYear] = useState(new Date().getFullYear());
  const [clearExisting, setClearExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const doFetch = async (mode: 'preview' | 'import') => {
    setLoading(true);
    setError('');
    setImportResult(null);
    if (mode === 'preview') setPreview(null);

    try {
      const res = await fetch('/api/admin/sync-winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, gid, mode, year, clearExisting }),
      });

      const data: SyncResult & { error?: string } = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || `Ошибка ${res.status}`);
        return;
      }

      if (data.mode === 'preview') {
        setPreview(data as PreviewResult);
      } else {
        setImportResult(data as ImportResult);
        setPreview(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: ParsedItem['status']) => {
    const st = ROW_STATUS[status] ?? { label: status, cls: 'adm-badge-neutral' };
    return <span className={`adm-badge adm-badge-plain ${st.cls}`}>{st.label}</span>;
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Синхронизация победителей</h1>
          <p className="adm-page-sub">
            Импорт списка победителей из публичной Google-таблицы. Таблица должна быть доступна
            по ссылке (Файл → Настройки доступа → «Все у кого есть ссылка»).
          </p>
        </div>
      </div>

      {/* ── Setup Panel ────────────────────── */}
      <div className="adm-card" style={{ marginBottom: 18 }}>
        <div className="adm-card-head">
          <h2 className="adm-card-title">Настройки импорта</h2>
        </div>

        <div className="adm-card-body">
          {/* URL */}
          <div className="adm-field">
            <label className="adm-label" htmlFor="sync-url">Ссылка на Google Таблицу *</label>
            <input
              id="sync-url"
              type="text"
              className="adm-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1ABC.../edit"
            />
          </div>

          {/* Row: GID + Year */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 16px' }}>
            <div className="adm-field">
              <label className="adm-label" htmlFor="sync-gid">GID листа</label>
              <input
                id="sync-gid"
                type="text"
                className="adm-input"
                value={gid}
                onChange={(e) => setGid(e.target.value)}
                placeholder="0"
              />
              <span className="adm-hint">0 = первый лист</span>
            </div>

            <div className="adm-field">
              <label className="adm-label" htmlFor="sync-year">Год по умолчанию</label>
              <input
                id="sync-year"
                type="number"
                className="adm-input"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Clear existing */}
          <div className="adm-field">
            <label className="adm-checkline">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#b91c1c' }}
              />
              <span>Удалить существующих за {year} год</span>
            </label>
          </div>

          <hr className="adm-divider" />

          {/* Actions */}
          <div className="adm-actions" style={{ justifyContent: 'flex-start' }}>
            <button
              onClick={() => doFetch('preview')}
              disabled={loading || !url}
              className="adm-btn adm-btn-primary"
            >
              {loading ? '⏳ Загрузка...' : '👁 Предпросмотр'}
            </button>

            {preview && preview.validCount > 0 && (
              <button
                onClick={() => doFetch('import')}
                disabled={loading}
                className="adm-btn adm-btn-ok"
              >
                {loading ? '⏳ Импорт...' : `✅ Импортировать ${preview.validCount} записей`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Error ──────────────────────────── */}
      {error && (
        <div className="adm-note" style={{ marginBottom: 18 }}>
          ❌ {error}
        </div>
      )}

      {/* ── Import Success ─────────────────── */}
      {importResult && (
        <div className="adm-card adm-card-pad" style={{ marginBottom: 18 }}>
          <span className="adm-badge adm-badge-ok adm-badge-plain">✅ Импорт завершён</span>
          <p style={{ margin: '10px 0 0' }}>
            Добавлено <strong>{importResult.created}</strong> победителей.
            {importResult.skippedErrors > 0 && (
              <span> Пропущено ошибок: <strong>{importResult.skippedErrors}</strong>.</span>
            )}
          </p>
        </div>
      )}

      {/* ── Sheet Format Hint ──────────────── */}
      <div className="adm-card" style={{ marginBottom: 18 }}>
        <div className="adm-card-head">
          <h2 className="adm-card-title">Ожидаемый формат таблицы</h2>
        </div>

        <div className="adm-card-body">
          <p className="adm-note adm-note-info" style={{ margin: 0 }}>
            Первая строка — заголовки. Названия столбцов определяются автоматически по ключевым словам.
          </p>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                {['Номинация *', 'ФИО *', 'Должность', 'Подразделение', 'Год'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Новатор года</td>
                <td>Иванов Иван Иванович</td>
                <td>Инженер</td>
                <td>Farovon Group</td>
                <td>2025</td>
              </tr>
              <tr>
                <td>Лучший руководитель</td>
                <td>Петрова Мария Сергеевна</td>
                <td>Директор</td>
                <td>Farovon Group</td>
                <td>2025</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="adm-card-body">
          <p className="adm-hint" style={{ margin: 0 }}>
            * Обязательные столбцы. Названия столбцов могут быть: «Номинация» / «Категория», «ФИО» / «Сотрудник» / «Имя»,
            «Должность» / «Позиция», «Подразделение» / «Отдел» / «Компания», «Год» / «Year».
          </p>
        </div>
      </div>

      {/* ── Preview Table ──────────────────── */}
      {preview && (
        <>
          <div className="adm-stats">
            <div className="adm-stat">
              <div className="adm-stat-label">Всего строк</div>
              <div className="adm-stat-value">{preview.totalRows}</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-label">✓ Валидных</div>
              <div className={`adm-stat-value${preview.validCount ? ' is-ok' : ''}`}>{preview.validCount}</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-label">✕ Ошибок</div>
              <div className={`adm-stat-value${preview.errorCount ? ' is-brand' : ''}`}>{preview.errorCount}</div>
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-head">
              <h2 className="adm-card-title">Предпросмотр</h2>
              <span className="adm-hint">
                Столбцы: {Object.entries(preview.detectedColumns)
                  .filter(([, v]) => v)
                  .map(([k, v]) => `${k}="${v}"`)
                  .join(' · ')}
              </span>
            </div>

            {preview.items.length === 0 ? (
              <div className="adm-empty">
                <span className="adm-empty-icon" aria-hidden>📄</span>
                В таблице не найдено ни одной строки с данными.
              </div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table" style={{ minWidth: 720 }}>
                  <thead>
                    <tr>
                      {['#', 'Статус', 'Номинация', 'ФИО', 'Должность', 'Подразделение', 'Год'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.items.map((item) => (
                      <tr key={item.row} style={{ background: item.status !== 'ok' ? '#fffbeb' : undefined }}>
                        <td className="adm-td-mono" style={{ width: 56 }}>{item.row}</td>
                        <td>{statusBadge(item.status)}</td>
                        <td>
                          {item.nominationTitle || item.nomination}
                          {item.status === 'nomination_not_found' && (
                            <div className="adm-td-sub">
                              «{item.nomination}» не найдена в базе
                            </div>
                          )}
                        </td>
                        <td className="adm-td-strong">{item.name || '—'}</td>
                        <td>{item.position || '—'}</td>
                        <td>{item.department || '—'}</td>
                        <td>{item.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
