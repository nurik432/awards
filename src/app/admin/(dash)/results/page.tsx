import { prisma } from "@/lib/prisma";
import { isLocalUpload } from "@/lib/safe-url";
import { safeParseObject } from "@/lib/safe-json";

export const dynamic = "force-dynamic";

// Admin palette (matches .adm-badge-* / .adm-stat-value modifiers in admin.css).
function scoreColor(score: number) {
  if (score >= 8) return "#15803d";
  if (score >= 6) return "#b45309";
  if (score >= 4) return "#c2410c";
  return "#b91c1c";
}

export default async function AdminResultsPage() {
  const nominations = await prisma.nomination.findMany({
    where: { isActive: true },
    include: {
      applications: {
        include: {
          juryScores: {
            include: { judge: { select: { id: true, name: true } } },
          },
        },
      },
    },
    orderBy: { title: "asc" },
  });

  const judges = await prisma.user.findMany({
    where: { role: "JUDGE", isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Build results per nomination
  const results = nominations.map(nom => {
    const rankedApps = nom.applications
      .map(app => {
        const emp = safeParseObject(app.employeeData) as Record<string, string>;
        const fd = safeParseObject(app.formData) as Record<string, string>;
        const avgScore = app.juryScores.length > 0
          ? app.juryScores.reduce((s: number, j: { score: number }) => s + j.score, 0) / app.juryScores.length
          : 0;
        return {
          id: app.id,
          name: emp.name,
          position: emp.position,
          department: emp.department,
          projectName: fd.projectName ?? fd.projectText ?? "",
          photoUrl: app.photoUrl,
          avgScore,
          scoredCount: app.juryScores.length,
          scores: app.juryScores.map((s: { judge: { id: string; name: string }; score: number; comment: string | null }) => ({
            judgeId: s.judge.id,
            judgeName: s.judge.name,
            score: s.score,
            comment: s.comment ?? "",
          })),
        };
      })
      .filter(a => a.scoredCount > 0)
      .sort((a, b) => b.avgScore - a.avgScore);

    return { nomination: nom, rankedApps };
  });

  const totalVotes = nominations.reduce((s, n) =>
    s + n.applications.reduce((ss, a) => ss + a.juryScores.length, 0), 0);
  const totalApps = nominations.reduce((s, n) => s + n.applications.length, 0);
  const scoredApps = results.reduce((s, r) => s + r.rankedApps.length, 0);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Результаты голосования</h1>
          <p className="adm-page-sub">Итоговые баллы по всем номинациям · автоматический подсчёт</p>
        </div>
      </div>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-label">Номинаций</div>
          <div className="adm-stat-value is-brand">{nominations.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Участников</div>
          <div className="adm-stat-value">{totalApps}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Оценено заявок</div>
          <div className={`adm-stat-value${scoredApps ? " is-ok" : ""}`}>{scoredApps}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Членов жюри</div>
          <div className="adm-stat-value">{judges.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Оценок выставлено</div>
          <div className="adm-stat-value">{totalVotes}</div>
        </div>
      </div>

      {results.map(({ nomination, rankedApps }) => (
        <div key={nomination.id} className="adm-card" style={{ marginBottom: 18 }}>
          <div className="adm-card-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span aria-hidden style={{ fontSize: 20 }}>{nomination.icon}</span>
              <div style={{ minWidth: 0 }}>
                <h2 className="adm-card-title">{nomination.title}</h2>
                <div className="adm-td-sub">
                  {nomination.applications.length} участников · {rankedApps.length} оценено
                </div>
              </div>
            </div>

            {rankedApps.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
                <span className="adm-stat-label">ПОБЕДИТЕЛЬ</span>
                <span className="adm-badge adm-badge-pending adm-badge-plain">
                  🥇 {rankedApps[0].name} · ★ {rankedApps[0].avgScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {rankedApps.length === 0 ? (
            <div className="adm-empty">
              <span className="adm-empty-icon" aria-hidden>🗳</span>
              Голосование не началось
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: 52 }}>#</th>
                    <th>Участник</th>
                    {judges.map(judge => (
                      <th key={judge.id} className="adm-td-right">{judge.name}</th>
                    ))}
                    <th className="adm-td-right">Средний балл</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedApps.map((app, idx) => (
                    <tr key={app.id}>
                      <td className="adm-td-strong" style={{ fontSize: 15 }}>
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          {isLocalUpload(app.photoUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.photoUrl}
                              alt={app.name}
                              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              aria-hidden
                              style={{
                                width: 36, height: 36, borderRadius: 8, background: "#f3f4f6",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#9ca3af", fontSize: 16, flexShrink: 0,
                              }}
                            >
                              👤
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div className="adm-td-strong">{app.name}</div>
                            <div className="adm-td-sub">{app.position} · {app.department}</div>
                            {app.projectName && (
                              <div className="adm-td-sub" style={{ color: "var(--adm-brand)" }}>{app.projectName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {judges.map(judge => {
                        const s = app.scores.find(sc => sc.judgeId === judge.id);
                        return (
                          <td
                            key={judge.id}
                            className="adm-td-right"
                            title={`${judge.name}${s?.comment ? ": " + s.comment : ""}`}
                            style={{ fontWeight: 600, color: s ? scoreColor(s.score) : "#9ca3af" }}
                          >
                            {s ? s.score : "—"}
                          </td>
                        );
                      })}

                      <td className="adm-td-right">
                        <div style={{ fontSize: 19, fontWeight: 700, color: scoreColor(app.avgScore) }}>
                          {app.avgScore.toFixed(1)}
                        </div>
                        <div className="adm-td-sub">{app.scoredCount} оценок</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {results.length === 0 && (
        <div className="adm-card">
          <div className="adm-empty">
            <span className="adm-empty-icon" aria-hidden>🏆</span>
            Нет активных номинаций
          </div>
        </div>
      )}
    </>
  );
}
