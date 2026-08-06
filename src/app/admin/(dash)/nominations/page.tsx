import { prisma } from '@/lib/prisma';
import NominationToggle from '@/components/NominationToggle';
import { createNomination } from '@/app/admin/actions';
import DeleteButton from '@/components/DeleteButton';
import EditNominationModal from '@/components/EditNominationModal';

export const dynamic = 'force-dynamic';

export default async function AdminNominationsPage() {
  const nominations = await prisma.nomination.findMany({ orderBy: { createdAt: 'asc' } });

  const activeCount = nominations.filter((n: any) => n.isActive).length;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Управление номинациями</h1>
          <p className="adm-page-sub">
            Добавляйте, включайте/выключайте и удаляйте номинации. Изменения сразу отражаются на сайте.
          </p>
        </div>
      </div>

      <div className="adm-grid-2">
        {/* Create form */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Добавить номинацию</h2>
          </div>
          <div className="adm-card-body">
            <form action={createNomination}>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newTitle">Название *</label>
                <input className="adm-input" id="newTitle" type="text" name="title" required placeholder="Новатор года" />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newSlug">Slug (URL-код)</label>
                <input className="adm-input" id="newSlug" type="text" name="slug" placeholder="novator-goda (авто если пусто)" />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newIcon">Иконка (emoji)</label>
                <input className="adm-input" id="newIcon" type="text" name="icon" placeholder="💡" defaultValue="🏆" />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newDescription">Описание *</label>
                <textarea className="adm-textarea" id="newDescription" name="description" rows={3} required placeholder="Описание номинации..." />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newCriteria">Критерии (по одному на строку)</label>
                <textarea className="adm-textarea" id="newCriteria" name="criteria" rows={4} placeholder={'Критерий 1\nКритерий 2\nКритерий 3'} />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newSteps">Этапы участия (по одному на строку)</label>
                <textarea className="adm-textarea" id="newSteps" name="steps" rows={4} placeholder={'Этап 1\nЭтап 2\nЭтап 3'} />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newTags">Кто может участвовать (по одному на строку)</label>
                <textarea className="adm-textarea" id="newTags" name="tags" rows={3} placeholder={'Все сотрудники\nСтаж от 6 месяцев'} />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newGoogleFormUrl">Ссылка на Google Form (опционально)</label>
                <input className="adm-input" id="newGoogleFormUrl" type="url" name="googleFormUrl" placeholder="https://docs.google.com/forms/..." />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="newFormType">Тип формы</label>
                <select className="adm-select" id="newFormType" name="formType">
                  <option value="basic">Базовая</option>
                  <option value="innovator">Новатор</option>
                  <option value="manager">Руководитель</option>
                </select>
              </div>
              <div className="adm-field">
                <div className="adm-checkline">
                  <input type="checkbox" name="acceptsApplications" id="newAcceptsApplications" style={{ width: 16, height: 16, accentColor: '#b91c1c' }} />
                  <label htmlFor="newAcceptsApplications">
                    Принимать заявки (кнопка «Подать заявку»)
                  </label>
                </div>
              </div>
              <button type="submit" className="adm-btn adm-btn-primary adm-btn-block">
                Добавить номинацию
              </button>
            </form>
          </div>
        </div>

        {/* Nominations list */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Номинации</h2>
            <span className="adm-badge adm-badge-neutral adm-badge-plain">
              {activeCount} из {nominations.length} активны
            </span>
          </div>

          {nominations.length === 0 ? (
            <div className="adm-empty">
              <span className="adm-empty-icon" aria-hidden>🏆</span>
              Номинаций пока нет. Добавьте первую через форму слева.
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Номинация</th>
                    <th>Slug</th>
                    <th>Статус</th>
                    <th className="adm-td-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {nominations.map((n: any) => (
                    <tr key={n.id}>
                      <td>
                        <div className="adm-td-strong">
                          {n.icon} {n.title}
                        </div>
                        <div className="adm-td-sub">
                          {n.description.substring(0, 60)}...
                        </div>
                      </td>
                      <td>
                        <span className="adm-td-mono">{n.slug}</span>
                      </td>
                      <td>
                        <span className={`adm-badge ${n.isActive ? 'adm-badge-ok' : 'adm-badge-neutral'}`}>
                          {n.isActive ? 'Активна' : 'Отключена'}
                        </span>
                      </td>
                      <td className="adm-td-right">
                        <div className="adm-actions">
                          <EditNominationModal nomination={n} />
                          <NominationToggle id={n.id} isActive={n.isActive} />
                          <DeleteButton id={n.id} action="nomination" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
