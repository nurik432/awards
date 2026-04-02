import { prisma } from '@/lib/prisma';
import { createWinner } from '@/app/admin/actions';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminWinnersPage() {
  const winners = await prisma.winner.findMany({
    include: { nomination: true },
    orderBy: [{ year: 'desc' }, { name: 'asc' }],
  });

  const nominations = await prisma.nomination.findMany({ orderBy: { title: 'asc' } });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>Управление победителями</h2>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>Архив победителей прошлых лет</p>
        </div>
        <a href="/admin" className="btn btn-secondary" style={{ color: '#7f1d1d', borderColor: '#7f1d1d' }}>
          К заявкам
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Form to add new winner */}
        <div className="white-panel" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: '#7f1d1d' }}>Добавить победителя</h3>
          <form action={createWinner} className="form-field">
            <div style={{ marginBottom: '14px' }}>
              <label>ФИО</label>
              <input type="text" name="name" required placeholder="Иванов Иван" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Компания / Отдел</label>
              <input type="text" name="department" required placeholder="Farovon-1" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Должность</label>
              <input type="text" name="position" required placeholder="Менеджер" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Номинация</label>
              <select name="nominationId" required>
                {nominations.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Год</label>
              <input type="number" name="year" defaultValue={new Date().getFullYear()} required />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label>Фото URL (опционально)</label>
              <input type="text" name="photo" placeholder="https://..." />
            </div>
            <button type="submit" className="apply-btn" style={{ width: '100%', marginTop: '10px' }}>
              Добавить
            </button>
          </form>
        </div>

        {/* List of winners */}
        <div className="white-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Победитель</th>
                <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Номинация</th>
                <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Год</th>
                <th style={{ padding: '20px 15px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w: any) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 800 }}>{w.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {w.position} | {w.department}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div className="badge" style={{ background: '#7f1d1d', fontSize: '12px' }}>
                      {w.nomination.title}
                    </div>
                  </td>
                  <td style={{ padding: '15px', fontSize: '14px', fontWeight: 700 }}>{w.year}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <DeleteButton id={w.id} action="winner" />
                  </td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    Победителей пока нет.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
