import { prisma } from '@/lib/prisma';
import NominationToggle from '@/components/NominationToggle';
import { createNomination, deleteNomination } from '@/app/admin/actions';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminNominationsPage() {
  const nominations = await prisma.nomination.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>Управление номинациями</h2>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>
            Добавляйте, включайте/выключайте и удаляйте номинации. Изменения сразу отражаются на сайте.
          </p>
        </div>
        <a href="/admin" className="btn btn-secondary" style={{ color: '#7f1d1d', borderColor: '#7f1d1d' }}>
          К заявкам
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Create form */}
        <div className="white-panel" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: '#7f1d1d' }}>Добавить номинацию</h3>
          <form action={createNomination}>
            <div className="form-field">
              <label>Название *</label>
              <input type="text" name="title" required placeholder="Новатор года" />
            </div>
            <div className="form-field">
              <label>Slug (URL-код)</label>
              <input type="text" name="slug" placeholder="novator-goda (авто если пусто)" />
            </div>
            <div className="form-field">
              <label>Иконка (emoji)</label>
              <input type="text" name="icon" placeholder="💡" defaultValue="🏆" />
            </div>
            <div className="form-field">
              <label>Описание *</label>
              <textarea name="description" rows={3} required placeholder="Описание номинации..." />
            </div>
            <div className="form-field">
              <label>Критерии (по одному на строку)</label>
              <textarea name="criteria" rows={4} placeholder={'Критерий 1\nКритерий 2\nКритерий 3'} />
            </div>
            <div className="form-field">
              <label>Этапы участия (по одному на строку)</label>
              <textarea name="steps" rows={4} placeholder={'Этап 1\nЭтап 2\nЭтап 3'} />
            </div>
            <div className="form-field">
              <label>Кто может участвовать (по одному на строку)</label>
              <textarea name="tags" rows={3} placeholder={'Все сотрудники\nСтаж от 6 месяцев'} />
            </div>
            <div className="form-field">
              <label>Ссылка на Google Form (опционально)</label>
              <input type="url" name="googleFormUrl" placeholder="https://docs.google.com/forms/..." />
            </div>
            <div className="form-field">
              <label>Тип формы</label>
              <select name="formType">
                <option value="basic">Базовая</option>
                <option value="innovator">Новатор</option>
                <option value="manager">Руководитель</option>
              </select>
            </div>
            <button type="submit" className="apply-btn" style={{ width: '100%', marginTop: '10px' }}>
              Добавить номинацию
            </button>
          </form>
        </div>

        {/* Nominations list */}
        <div className="white-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Номинация</th>
                <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Slug</th>
                <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Статус</th>
                <th style={{ padding: '20px 15px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {nominations.map((n: any) => (
                <tr key={n.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 800 }}>
                      {n.icon} {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {n.description.substring(0, 60)}...
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <code>{n.slug}</code>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: n.isActive ? '#dcfce7' : '#f1f5f9',
                        color: n.isActive ? '#166534' : '#64748b',
                      }}
                    >
                      {n.isActive ? 'Активна' : 'Отключена'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <NominationToggle id={n.id} isActive={n.isActive} />
                      <DeleteButton id={n.id} action="nomination" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
