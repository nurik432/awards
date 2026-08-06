import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { updateApplicationStatus, deleteApplication } from '@/app/admin/actions';
import { safeParseObject } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Ожидает',         cls: 'adm-badge-pending' },
  REVIEW:   { label: 'На рассмотрении', cls: 'adm-badge-review' },
  APPROVED: { label: 'Одобрено',        cls: 'adm-badge-ok' },
  REJECTED: { label: 'Отклонено',       cls: 'adm-badge-danger' },
};

export default async function AdminDashboard() {
  const applications = await prisma.application.findMany({
    include: { nomination: true },
    orderBy: { submittedAt: 'desc' },
  });

  const count = (s: string) => applications.filter((a) => a.status === s).length;
  const pending = count('PENDING');
  const approved = count('APPROVED');
  const rejected = count('REJECTED');

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Заявки на участие</h1>
          <p className="adm-page-sub">
            Входящие заявки от сотрудников. Откройте заявку, чтобы увидеть проект целиком и оценки комиссии.
          </p>
        </div>
      </div>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-label">Всего заявок</div>
          <div className="adm-stat-value">{applications.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Ожидают решения</div>
          <div className={`adm-stat-value${pending ? ' is-warn' : ''}`}>{pending}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Одобрено</div>
          <div className={`adm-stat-value${approved ? ' is-ok' : ''}`}>{approved}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Отклонено</div>
          <div className="adm-stat-value">{rejected}</div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-head">
          <h2 className="adm-card-title">Список заявок</h2>
          <span className="adm-badge adm-badge-neutral adm-badge-plain">{applications.length}</span>
        </div>

        {applications.length === 0 ? (
          <div className="adm-empty">
            <span className="adm-empty-icon" aria-hidden>📭</span>
            Заявок пока нет. Они появятся здесь сразу после подачи через форму на сайте.
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Номинация</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th className="adm-td-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const employee = safeParseObject(app.employeeData);
                  const isPending = app.status === 'PENDING';
                  const st = STATUS[app.status] ?? { label: app.status, cls: 'adm-badge-neutral' };

                  return (
                    <tr key={app.id}>
                      <td>
                        <div className="adm-td-strong">{employee.name || 'Имя не указано'}</div>
                        {employee.department && <div className="adm-td-sub">{employee.department}</div>}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span aria-hidden style={{ fontSize: 16 }}>{app.nomination.icon}</span>
                          {app.nomination.title}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(app.submittedAt).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className={`adm-badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="adm-td-right">
                        <div className="adm-actions">
                          <Link href={`/admin/applications/${app.id}`} className="adm-btn adm-btn-sm">
                            Открыть
                          </Link>
                          {isPending && (
                            <>
                              <form action={async () => { 'use server'; await updateApplicationStatus(app.id, 'APPROVED'); }}>
                                <button type="submit" className="adm-btn adm-btn-sm adm-btn-ok">Одобрить</button>
                              </form>
                              <form action={async () => { 'use server'; await updateApplicationStatus(app.id, 'REJECTED'); }}>
                                <button type="submit" className="adm-btn adm-btn-sm adm-btn-danger">Отклонить</button>
                              </form>
                            </>
                          )}
                          <form action={async () => { 'use server'; await deleteApplication(app.id); }}>
                            <button type="submit" className="adm-btn adm-btn-sm adm-btn-icon" title="Удалить заявку" aria-label="Удалить заявку">🗑</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
