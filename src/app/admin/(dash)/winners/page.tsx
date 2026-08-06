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

  // Winners already arrive sorted by year desc — grouping preserves that order.
  const byYear = new Map<number, typeof winners>();
  for (const w of winners) {
    const bucket = byYear.get(w.year);
    if (bucket) bucket.push(w);
    else byYear.set(w.year, [w]);
  }
  const years = [...byYear.entries()];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Управление победителями</h1>
          <p className="adm-page-sub">Архив победителей прошлых лет</p>
        </div>
        <div className="adm-page-actions">
          <span className="adm-badge adm-badge-neutral adm-badge-plain">Всего: {winners.length}</span>
        </div>
      </div>

      <div className="adm-grid-2">
        {/* Form to add new winner */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Добавить победителя</h2>
          </div>
          <div className="adm-card-body">
            <form action={createWinner}>
              <div className="adm-field">
                <label className="adm-label" htmlFor="winner-name">ФИО</label>
                <input className="adm-input" id="winner-name" type="text" name="name" required placeholder="Иванов Иван" />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="winner-department">Компания / Отдел</label>
                <input className="adm-input" id="winner-department" type="text" name="department" required placeholder="Farovon-1" />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="winner-position">Должность</label>
                <input className="adm-input" id="winner-position" type="text" name="position" required placeholder="Менеджер" />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="winner-nomination">Номинация</label>
                <select className="adm-select" id="winner-nomination" name="nominationId" required>
                  {nominations.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="winner-year">Год</label>
                <input className="adm-input" id="winner-year" type="number" name="year" defaultValue={new Date().getFullYear()} required />
              </div>
              <div className="adm-field">
                <label className="adm-label" htmlFor="winner-photo">Фото URL (опционально)</label>
                <input className="adm-input" id="winner-photo" type="text" name="photo" placeholder="https://..." />
              </div>
              <button type="submit" className="adm-btn adm-btn-primary adm-btn-block">
                Добавить
              </button>
            </form>
          </div>
        </div>

        {/* List of winners, grouped by year */}
        <div>
          {years.length === 0 ? (
            <div className="adm-card">
              <div className="adm-card-head">
                <h2 className="adm-card-title">Победители</h2>
              </div>
              <div className="adm-empty">
                <span className="adm-empty-icon" aria-hidden>🏆</span>
                Победителей пока нет.
              </div>
            </div>
          ) : (
            years.map(([year, list], i) => (
              <div className="adm-card" key={year} style={i > 0 ? { marginTop: 18 } : undefined}>
                <div className="adm-card-head">
                  <h2 className="adm-card-title">{year}</h2>
                  <span className="adm-badge adm-badge-neutral adm-badge-plain">{list.length}</span>
                </div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Победитель</th>
                        <th>Номинация</th>
                        <th className="adm-td-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((w: any) => (
                        <tr key={w.id}>
                          <td>
                            <div className="adm-td-strong">{w.name}</div>
                            <div className="adm-td-sub">
                              {w.position} | {w.department}
                            </div>
                          </td>
                          <td>
                            <span className="adm-badge adm-badge-neutral adm-badge-plain">
                              <span aria-hidden>{w.nomination.icon}</span>
                              {w.nomination.title}
                            </span>
                          </td>
                          <td className="adm-td-right">
                            <div className="adm-actions">
                              <DeleteButton id={w.id} action="winner" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
