import { prisma } from '@/lib/prisma';
import { updateApplicationStatus, deleteApplication } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const applications = await prisma.application.findMany({
    include: { nomination: true },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>Заявки на участие</h2>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>Управление входящими заявками от сотрудников.</p>
        </div>
        <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Всего заявок:</span>
          <strong style={{ fontSize: '20px', color: '#7f1d1d', marginLeft: '8px' }}>{applications.length}</strong>
        </div>
      </div>

      <div className="white-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Сотрудник</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Номинация</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Дата</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Статус</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  Заявок пока нет.
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                const employee = JSON.parse(app.employeeData || '{}');
                const isPending = app.status === 'PENDING';
                
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{employee.name || 'Имя не указано'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{employee.department}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{app.nomination.icon}</span>
                        <span style={{ fontSize: '14px', color: '#334155' }}>{app.nomination.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                      {new Date(app.submittedAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: app.status === 'APPROVED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                        color: app.status === 'APPROVED' ? '#166534' : app.status === 'REJECTED' ? '#991b1b' : '#854d0e'
                      }}>
                        {app.status === 'APPROVED' ? 'Одобрено' : app.status === 'REJECTED' ? 'Отклонено' : 'Ожидает'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {isPending && (
                          <>
                            <form action={async () => { 'use server'; await updateApplicationStatus(app.id, 'APPROVED'); }}>
                              <button type="submit" style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', fontSize: '12px', cursor: 'pointer' }}>Одобрить</button>
                            </form>
                            <form action={async () => { 'use server'; await updateApplicationStatus(app.id, 'REJECTED'); }}>
                              <button type="submit" style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', fontSize: '12px', cursor: 'pointer' }}>Отклонить</button>
                            </form>
                          </>
                        )}
                        <form action={async () => { 'use server'; await deleteApplication(app.id); }}>
                          <button type="submit" style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>Удалить</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}