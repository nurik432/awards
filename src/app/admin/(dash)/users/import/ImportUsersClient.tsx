'use client';

import { useState } from 'react';

interface ParsedItem {
  row: number;
  name: string;
  email: string;
  department: string;
  role: 'JUDGE' | 'EMPLOYEE';
  roleRaw: string;
  passwordProvided: boolean;
  generatedPassword: string | null;
  status:
    | 'ok'
    | 'missing_fields'
    | 'invalid_email'
    | 'duplicate_in_file'
    | 'exists_in_db'
    | 'invalid_role'
    | 'weak_password';
}

interface PreviewResult {
  success: boolean;
  mode: 'preview';
  totalRows: number;
  validCount: number;
  errorCount: number;
  detectedColumns: Record<string, string | null>;
  items: ParsedItem[];
}

interface ImportResultItem {
  row: number;
  email: string;
  status: 'created' | 'skipped';
  reason?: string;
  password?: string;
}

interface ImportResult {
  success: boolean;
  mode: 'import';
  created: number;
  skipped: number;
  results: ImportResultItem[];
}

type ImportResponse = PreviewResult | ImportResult;

const ROW_STATUS: Record<ParsedItem['status'], { label: string; cls: string }> = {
  ok:                 { label: '✓ Готов',                    cls: 'adm-badge-ok' },
  missing_fields:     { label: '✕ Нет ФИО или Email',         cls: 'adm-badge-danger' },
  invalid_email:      { label: '✕ Некорректный email',        cls: 'adm-badge-danger' },
  duplicate_in_file:  { label: '⚠ Повтор в файле',            cls: 'adm-badge-pending' },
  exists_in_db:       { label: '⚠ Уже существует',            cls: 'adm-badge-pending' },
  invalid_role:       { label: '✕ Неверная роль',             cls: 'adm-badge-danger' },
  weak_password:      { label: '✕ Пароль короче 8 символов',  cls: 'adm-badge-danger' },
};

const ROLE_LABEL: Record<'JUDGE' | 'EMPLOYEE', string> = {
  JUDGE: 'Жюри',
  EMPLOYEE: 'Сотрудник',
};

export default function ImportUsersClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [copiedRow, setCopiedRow] = useState<number | null>(null);

  const doFetch = async (mode: 'preview' | 'import') => {
    if (!file) return;
    setLoading(true);
    setError('');
    setImportResult(null);
    if (mode === 'preview') setPreview(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const res = await fetch('/api/admin/bulk-users', { method: 'POST', body: formData });
      const data: ImportResponse & { error?: string } = await res.json();

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

  const copyPassword = async (row: number, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedRow(row);
      setTimeout(() => setCopiedRow((r) => (r === row ? null : r)), 1500);
    } catch {
      // Clipboard API unavailable — password is still visible for manual copy.
    }
  };

  const createdWithPassword = importResult?.results.filter((r) => r.status === 'created' && r.password) ?? [];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Импорт пользователей из Excel</h1>
          <p className="adm-page-sub">
            Массовое создание учётных записей сотрудников и жюри из файла .xlsx.
          </p>
        </div>
      </div>

      {/* ── Upload Panel ────────────────────── */}
      <div className="adm-card" style={{ marginBottom: 18 }}>
        <div className="adm-card-head">
          <h2 className="adm-card-title">Файл</h2>
        </div>

        <div className="adm-card-body">
          <div className="adm-field">
            <label className="adm-label" htmlFor="import-file">Файл .xlsx</label>
            <input
              id="import-file"
              type="file"
              accept=".xlsx"
              className="adm-input"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPreview(null);
                setImportResult(null);
                setError('');
              }}
            />
          </div>

          <p className="adm-note adm-note-info" style={{ margin: '0 0 12px' }}>
            Пароль можно не указывать — он будет сгенерирован автоматически. Сохраните
            сгенерированные пароли: восстановить их после импорта будет невозможно — смена
            пароля пользователем пока не реализована. Роль «Админ» через импорт создать нельзя.
          </p>

          <hr className="adm-divider" />

          <div className="adm-actions" style={{ justifyContent: 'flex-start' }}>
            <button
              onClick={() => doFetch('preview')}
              disabled={loading || !file}
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
                {loading ? '⏳ Импорт...' : `✅ Импортировать ${preview.validCount} учётных записей`}
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
            Создано <strong>{importResult.created}</strong> учётных записей.
            {importResult.skipped > 0 && (
              <span> Пропущено: <strong>{importResult.skipped}</strong>.</span>
            )}
          </p>

          {createdWithPassword.length > 0 && (
            <div className="adm-table-wrap" style={{ marginTop: 14 }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Сгенерированный пароль</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {createdWithPassword.map((r) => (
                    <tr key={r.row}>
                      <td className="adm-td-mono" style={{ width: 56 }}>{r.row}</td>
                      <td>{r.email}</td>
                      <td className="adm-td-mono">{r.password}</td>
                      <td className="adm-td-right">
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm"
                          onClick={() => copyPassword(r.row, r.password!)}
                        >
                          {copiedRow === r.row ? '✓ Скопировано' : 'Копировать'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Format Hint ─────────────────────── */}
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
                {['ФИО *', 'Email *', 'Подразделение', 'Роль', 'Пароль'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Иванов Иван Иванович</td>
                <td>ivan@farovon.com</td>
                <td>Farovon Group</td>
                <td>EMPLOYEE</td>
                <td>(пусто — сгенерируется)</td>
              </tr>
              <tr>
                <td>Петрова Мария Сергеевна</td>
                <td>maria@farovon.com</td>
                <td>Farovon Group</td>
                <td>JUDGE</td>
                <td>MyPassw0rd</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="adm-card-body">
          <p className="adm-hint" style={{ margin: 0 }}>
            * Обязательные столбцы. Названия столбцов могут быть: «ФИО» / «Сотрудник» / «Имя» / «Name»,
            «Email» / «Почта», «Подразделение» / «Отдел» / «Компания», «Роль» / «Role» (JUDGE или EMPLOYEE,
            по умолчанию — EMPLOYEE), «Пароль» / «Password» (не менее 8 символов, если указан).
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
                <table className="adm-table" style={{ minWidth: 760 }}>
                  <thead>
                    <tr>
                      {['#', 'Статус', 'ФИО', 'Email', 'Подразделение', 'Роль', 'Пароль'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.items.map((item) => (
                      <tr key={item.row} style={{ background: item.status !== 'ok' ? '#fffbeb' : undefined }}>
                        <td className="adm-td-mono" style={{ width: 56 }}>{item.row}</td>
                        <td>{statusBadge(item.status)}</td>
                        <td className="adm-td-strong">{item.name || '—'}</td>
                        <td>{item.email || '—'}</td>
                        <td>{item.department || '—'}</td>
                        <td>{ROLE_LABEL[item.role]}</td>
                        <td className="adm-td-mono">
                          {item.status === 'ok'
                            ? (item.generatedPassword ?? (item.passwordProvided ? 'указан в файле' : '—'))
                            : '—'}
                        </td>
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
