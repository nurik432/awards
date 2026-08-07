import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createUser, toggleUserActive, deleteUser } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
  EMPLOYEE: { label: 'Сотрудник', cls: 'adm-badge-neutral' },
  JUDGE:    { label: 'Жюри',      cls: 'adm-badge-review' },
  ADMIN:    { label: 'Админ',     cls: 'adm-badge-danger' },
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  const active = users.filter((u) => u.isActive).length;
  const judges = users.filter((u) => u.role === 'JUDGE').length;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Пользователи</h1>
          <p className="adm-page-sub">
            Члены комиссии и сотрудники с доступом к панели. Заблокированный пользователь остаётся в списке, но не может войти.
          </p>
        </div>
      </div>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-label">Всего пользователей</div>
          <div className="adm-stat-value">{users.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Активных</div>
          <div className={`adm-stat-value${active ? ' is-ok' : ''}`}>{active}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">В комиссии</div>
          <div className="adm-stat-value">{judges}</div>
        </div>
      </div>

      <div className="adm-grid-2">
        {/* Форма создания */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Создать пользователя</h2>
            <Link href="/admin/users/import" className="adm-hint">Массовый импорт из Excel →</Link>
          </div>
          <div className="adm-card-body">
            <form action={createUser}>
              <div className="adm-field">
                <label className="adm-label" htmlFor="user-name">ФИО</label>
                <input id="user-name" name="name" type="text" required placeholder="Иванов Иван" className="adm-input" />
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor="user-email">Email</label>
                <input id="user-email" name="email" type="email" required placeholder="ivan@farovon.com" className="adm-input" />
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor="user-department">Подразделение</label>
                <input id="user-department" name="department" type="text" required placeholder="Farovon Group" className="adm-input" />
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor="user-password">Пароль</label>
                <input id="user-password" name="password" type="password" required placeholder="Минимум 8 символов" className="adm-input" />
                <span className="adm-hint">Пароль должен быть не менее 8 символов.</span>
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor="user-role">Роль</label>
                <select id="user-role" name="role" required title="Роль пользователя" className="adm-select" defaultValue="JUDGE">
                  <option value="JUDGE">Жюри (комиссия)</option>
                  <option value="EMPLOYEE">Сотрудник</option>
                  <option value="ADMIN">Админ</option>
                </select>
              </div>

              <button type="submit" className="adm-btn adm-btn-primary adm-btn-block">Создать</button>
            </form>
          </div>
        </div>

        {/* Таблица пользователей */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Пользователи</h2>
            <span className="adm-badge adm-badge-neutral adm-badge-plain">{users.length}</span>
          </div>

          {users.length === 0 ? (
            <div className="adm-empty">
              <span className="adm-empty-icon" aria-hidden>👥</span>
              Пользователей нет
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th className="adm-td-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const rl = ROLE_LABEL[u.role] ?? { label: u.role, cls: 'adm-badge-neutral' };
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="adm-td-strong">{u.name}</div>
                          <div className="adm-td-sub">{u.email}{u.department ? ` · ${u.department}` : ''}</div>
                        </td>
                        <td>
                          <span className={`adm-badge ${rl.cls}`}>{rl.label}</span>
                        </td>
                        <td>
                          {u.isActive ? (
                            <span className="adm-badge adm-badge-ok">Активен</span>
                          ) : (
                            <span className="adm-badge adm-badge-danger">Заблокирован</span>
                          )}
                        </td>
                        <td className="adm-td-right">
                          <div className="adm-actions">
                            <form action={toggleUserActive.bind(null, u.id, !u.isActive)}>
                              <button
                                type="submit"
                                className={`adm-btn adm-btn-sm${u.isActive ? ' adm-btn-danger' : ' adm-btn-ok'}`}
                              >
                                {u.isActive ? 'Заблокировать' : 'Активировать'}
                              </button>
                            </form>
                            <form action={deleteUser.bind(null, u.id)}>
                              <button type="submit" className="adm-btn adm-btn-sm adm-btn-danger">Удалить</button>
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
      </div>
    </>
  );
}
