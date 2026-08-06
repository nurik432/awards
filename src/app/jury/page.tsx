import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export default async function JuryPage() {
  const session = await auth();
  const judgeId = (session?.user as any)?.id as string;

  const nominations = await prisma.nomination.findMany({
    where: { isActive: true },
    include: {
      applications: {
        include: {
          juryScores: { select: { judgeId: true, score: true } },
        },
      },
    },
    orderBy: { title: "asc" },
  });

  const totalApps = nominations.reduce((s, n) => s + n.applications.length, 0);
  const totalScored = nominations.reduce(
    (s, n) => s + n.applications.filter(a => a.juryScores.some((js: { judgeId: string }) => js.judgeId === judgeId)).length,
    0
  );
  const judgesCount = await prisma.user.count({ where: { role: "JUDGE", isActive: true } });

  return (
    <>
      {/* Section header */}
      <div className="section-title">
        <p className="kicker">Панель комиссии</p>
        <h2>Голосование по номинациям</h2>
      </div>

      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 36 }}>
        {[
          { label: "Номинации",        value: nominations.length },
          { label: "Участников",       value: totalApps },
          { label: "Вы оценили",       value: totalScored },
          { label: "Членов комиссии",  value: judgesCount },
        ].map(s => (
          <div key={s.label} className="stat">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Nomination cards */}
      <div className="cards">
        {nominations.map(nom => {
          const total = nom.applications.length;
          const myScored = nom.applications.filter(
            a => a.juryScores.some((js: { judgeId: string }) => js.judgeId === judgeId)
          ).length;
          const pct = total > 0 ? Math.round((myScored / total) * 100) : 0;
          const done = myScored === total && total > 0;

          return (
            <div key={nom.id} className="card">
              <div className="card-head">
                <div className="icon">{nom.icon}</div>
                <h3 style={{ fontSize: 20 }}>{nom.title}</h3>
              </div>
              <p className="desc">{nom.description}</p>

              {/* Progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#475569", fontSize: 13 }}>Ваш прогресс</span>
                  <span style={{ color: done ? "#166534" : "#991b1b", fontSize: 13, fontWeight: 700 }}>
                    {myScored} / {total}
                  </span>
                </div>
                <div style={{ background: "#fee2e2", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{
                    background: done ? "#16a34a" : "linear-gradient(90deg, #b91c1c, #ef4444)",
                    width: `${pct}%`, height: "100%", borderRadius: 6,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>

              <div className="card-actions">
                <Link
                  href={`/jury/vote/${nom.slug}`}
                  className="apply-btn"
                  style={{
                    textDecoration: "none",
                    background: done
                      ? "linear-gradient(135deg, #166534, #16a34a)"
                      : "linear-gradient(135deg, #b91c1c, #ef4444)",
                    padding: "12px 22px",
                    borderRadius: 16,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    display: "inline-block",
                  }}
                >
                  {done ? "✓ Голосование завершено" : total === 0 ? "Нет участников" : "Голосовать →"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {nominations.length === 0 && (
        <div className="empty-state">
          <p>Активных номинаций нет</p>
        </div>
      )}
    </>
  );
}
