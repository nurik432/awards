'use client';
import { useState, useMemo } from 'react';

export interface WinnerGroup {
  title: string;
  slug: string;
  winners: Array<{ name: string; position: string }>;
}

interface WinnersArchiveProps {
  groups: WinnerGroup[];
}

export default function WinnersArchive({ groups }: WinnersArchiveProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const totalWinners = useMemo(() => groups.reduce((acc, g) => acc + g.winners.length, 0), [groups]);

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => {
        const catMatch = !selectedCategory || group.title === selectedCategory;
        if (!catMatch) return { ...group, winners: [] };

        const q = searchQuery.toLowerCase().trim();
        const filteredWinners = !q
          ? group.winners
          : group.winners.filter(
              (w) => w.name.toLowerCase().includes(q) || w.position.toLowerCase().includes(q)
            );

        return { ...group, winners: filteredWinners };
      })
      .filter((g) => g.winners.length > 0);
  }, [groups, searchQuery, selectedCategory]);

  const categoryOptions = useMemo(() => groups.map((g) => g.title), [groups]);

  if (groups.length === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <section className="wrapper winners-toggle-wrap">
        <button
          className="apply-btn"
          type="button"
          onClick={() => {
            setIsVisible((v) => !v);
            if (!isVisible) {
              setTimeout(() => {
                document.getElementById('winners')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }
          }}
        >
          Показать / скрыть победителей прошлых лет
        </button>
      </section>

      {/* Winners section */}
      <section id="winners" className="wrapper" style={{ display: isVisible ? 'block' : 'none' }}>
        <div className="section-title">
          <div className="kicker">Архив победителей</div>
          <h2>Победители и рекомендованные сотрудники по итогам 2025 года</h2>
        </div>

        <div className="archive-panel">
          <div className="archive-inner">
            {/* Stats */}
            <div className="archive-stats">
              <div className="archive-stat">
                <div className="value">2025</div>
                <div className="label">год награждения</div>
              </div>
              <div className="archive-stat">
                <div className="value">{groups.length}</div>
                <div className="label">номинаций</div>
              </div>
              <div className="archive-stat">
                <div className="value">{totalWinners}</div>
                <div className="label">сотрудников в списке</div>
              </div>
              <div className="archive-stat">
                <div className="value">100%</div>
                <div className="label">полный список из протокола</div>
              </div>
            </div>

            {/* Search + filter */}
            <div className="archive-tools">
              <input
                type="text"
                placeholder="Поиск по ФИО или должности..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Все номинации</option>
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Winner groups */}
            {filteredGroups.map((group) => (
              <details key={group.slug} className="winner-group" open>
                <summary>
                  <div>
                    <h3>{group.title}</h3>
                    <div className="group-note">Полный список победителей и рекомендованных сотрудников</div>
                  </div>
                  <div className="winner-meta">
                    <span className="count-badge">{group.winners.length} чел.</span>
                  </div>
                </summary>
                <div className="table-wrap">
                  <table className="winners-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Сотрудник</th>
                        <th>Должность</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.winners.map((w, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{w.name}</td>
                          <td>{w.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}

            {filteredGroups.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#7f1d1d' }}>
                Ничего не найдено по вашему запросу.
              </div>
            )}

            <div className="muted-chip">Источник списка: протокол «Итоги года – 2025»</div>
          </div>
        </div>
      </section>
    </>
  );
}
