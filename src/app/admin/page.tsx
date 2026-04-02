import { prisma } from '@/lib/prisma';
import AdminApplicationRow from '@/components/AdminApplicationRow';

export default async function AdminDashboard() {
  const applications = await prisma.application.findMany({
    include: { nomination: true },
    orderBy: { submittedAt: 'desc' }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
           <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>Заявки на участие</h2>
           <p style={{ color: '#64748b', margin: '8px 0 0' }}>Просмотр и подтверждение номинаций от сотрудников</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <a href="/admin/winners" className="btn btn-secondary" style={{ color: '#7f1d1d', borderColor: '#7f1d1d' }}>Победители</a>
           <a href="/admin/nominations" className="btn btn-secondary" style={{ color: '#7f1d1d', borderColor: '#7f1d1d' }}>Номинации</a>
        </div>
      </div>

      <div className="white-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Сотрудник</th>
              <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Номинация</th>
              <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Описание</th>
              <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Статус</th>
              <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Отправлено</th>
              <th style={{ padding: '20px 15px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>Управление</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app: any) => (
               <AdminApplicationRow key={app.id} app={app} />
            ))}
            {applications.length === 0 && (
               <tr>
                 <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    Заявок пока нет.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
