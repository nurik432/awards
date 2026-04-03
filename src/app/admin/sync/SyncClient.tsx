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
    const styles: Record<string, React.CSSProperties> = {
      ok: { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
      nomination_not_found: { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' },
      missing_name: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
    };
    const labels: Record<string, string> = {
      ok: '✓ Готов',
      nomination_not_found: '⚠ Номинация не найдена',
      missing_name: '✕ Нет ФИО',
    };
    return (
      <span style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        ...styles[status],
      }}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* ── Header ─────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>
          🔄 Синхронизация победителей
        </h2>
        <p style={{ color: '#64748b', margin: '8px 0 0', lineHeight: 1.6 }}>
          Импорт списка победителей из публичной Google-таблицы. Таблица должна быть доступна
          по ссылке (Файл → Настройки доступа → «Все у кого есть ссылка»).
        </p>
      </div>

      {/* ── Setup Panel ────────────────────── */}
      <div className="white-panel" style={{ marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0, color: '#7f1d1d', fontSize: '18px', borderBottom: '2px solid #fecaca', paddingBottom: '12px' }}>
          Настройки импорта
        </h3>

        {/* URL */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
            Ссылка на Google Таблицу *
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/1ABC.../edit"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px',
              border: '2px solid #e2e8f0', fontSize: '14px',
            }}
          />
        </div>

        {/* Row: GID + Year + Clear */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
              GID листа
            </label>
            <input
              type="text"
              value={gid}
              onChange={(e) => setGid(e.target.value)}
              placeholder="0"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '2px solid #e2e8f0', fontSize: '14px',
              }}
            />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>0 = первый лист</span>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
              Год по умолчанию
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '2px solid #e2e8f0', fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#b91c1c' }}
              />
              <span>Удалить существующих за {year} год</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => doFetch('preview')}
            disabled={loading || !url}
            className="apply-btn"
            style={{ padding: '12px 24px', opacity: loading || !url ? 0.5 : 1 }}
          >
            {loading ? '⏳ Загрузка...' : '👁 Предпросмотр'}
          </button>

          {preview && preview.validCount > 0 && (
            <button
              onClick={() => doFetch('import')}
              disabled={loading}
              className="apply-btn"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #166534, #22c55e)',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? '⏳ Импорт...' : `✅ Импортировать ${preview.validCount} записей`}
            </button>
          )}
        </div>
      </div>

      {/* ── Error ──────────────────────────── */}
      {error && (
        <div style={{
          padding: '16px 20px', borderRadius: '14px', marginBottom: '16px',
          background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b',
          fontWeight: 600, fontSize: '14px',
        }}>
          ❌ {error}
        </div>
      )}

      {/* ── Import Success ─────────────────── */}
      {importResult && (
        <div style={{
          padding: '20px 24px', borderRadius: '14px', marginBottom: '16px',
          background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            ✅ Импорт завершён
          </div>
          <div style={{ fontSize: '15px' }}>
            Добавлено <strong>{importResult.created}</strong> победителей.
            {importResult.skippedErrors > 0 && (
              <span> Пропущено ошибок: <strong>{importResult.skippedErrors}</strong>.</span>
            )}
          </div>
        </div>
      )}

      {/* ── Sheet Format Hint ──────────────── */}
      <div className="white-panel" style={{ marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0, color: '#7f1d1d', fontSize: '16px' }}>
          📄 Ожидаемый формат таблицы
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>
          Первая строка — заголовки. Названия столбцов определяются автоматически по ключевым словам.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Номинация *', 'ФИО *', 'Должность', 'Подразделение', 'Год'].map((h) => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0',
                  color: '#7f1d1d', fontWeight: 700,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Новатор года</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Иванов Иван Иванович</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Инженер</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Farovon Group</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>2025</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Лучший руководитель</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Петрова Мария Сергеевна</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Директор</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>Farovon Group</td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>2025</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', marginBottom: 0 }}>
          * Обязательные столбцы. Названия столбцов могут быть: «Номинация» / «Категория», «ФИО» / «Сотрудник» / «Имя», 
          «Должность» / «Позиция», «Подразделение» / «Отдел» / «Компания», «Год» / «Year».
        </p>
      </div>

      {/* ── Preview Table ──────────────────── */}
      {preview && (
        <div className="white-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: '16px', padding: '16px 24px', flexWrap: 'wrap',
            background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
          }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Всего строк:</span>
              <strong style={{ marginLeft: '6px', color: '#1e293b' }}>{preview.totalRows}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#166534' }}>✓ Валидных:</span>
              <strong style={{ marginLeft: '6px', color: '#166534' }}>{preview.validCount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#b91c1c' }}>✕ Ошибок:</span>
              <strong style={{ marginLeft: '6px', color: '#b91c1c' }}>{preview.errorCount}</strong>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>
              Столбцы: {Object.entries(preview.detectedColumns)
                .filter(([, v]) => v)
                .map(([k, v]) => `${k}="${v}"`)
                .join(' · ')}
            </div>
          </div>

          {/* Data rows */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '720px' }}>
              <thead>
                <tr style={{ background: '#fff5f5' }}>
                  {['#', 'Статус', 'Номинация', 'ФИО', 'Должность', 'Подразделение', 'Год'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #fecaca',
                      color: '#991b1b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.items.map((item) => (
                  <tr key={item.row} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: item.status !== 'ok' ? '#fffbeb' : undefined,
                  }}>
                    <td style={{ padding: '10px 14px', color: '#94a3b8', width: '50px' }}>{item.row}</td>
                    <td style={{ padding: '10px 14px' }}>{statusBadge(item.status)}</td>
                    <td style={{ padding: '10px 14px', color: '#334155' }}>
                      {item.nominationTitle || item.nomination}
                      {item.status === 'nomination_not_found' && (
                        <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>
                          «{item.nomination}» не найдена в базе
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{item.name || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{item.position || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{item.department || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{item.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
