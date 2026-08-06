import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { safeParseObject } from "@/lib/safe-json";

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: "Ожидает",         bg: "#fff7ed", color: "#9a3412" },
  REVIEW:   { label: "На рассмотрении", bg: "#eff6ff", color: "#1e40af" },
  APPROVED: { label: "Одобрено",        bg: "#f0fdf4", color: "#166534" },
  REJECTED: { label: "Отклонено",       bg: "#fef2f2", color: "#991b1b" },
};

export default async function JuryAllPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; nomination?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status || "";
  const nomFilter = sp.nomination || "";

  const applications = await prisma.application.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(nomFilter ? { nomination: { slug: nomFilter } } : {}),
    },
    include: {
      nomination: { select: { title: true, icon: true, slug: true } },
      user: { select: { name: true, email: true } },
      juryScores: { select: { judgeId: true, score: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const nominations = await prisma.nomination.findMany({
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === "PENDING").length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
  };

  return (
    <>
      <div className="section-title">
        <p className="kicker">Все заявки</p>
        <h2>Список участников</h2>
      </div>

      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 28 }}>
        {[
          { label: "Всего",     value: counts.total    },
          { label: "Ожидают",  value: counts.pending  },
          { label: "Одобрено", value: counts.approved },
          { label: "Отклонено",value: counts.rejected },
        ].map(s => (
          <div key={s.label} className="stat">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form className="white-panel" style={{ padding: "18px 24px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" }}>
        <select
          name="status"
          defaultValue={statusFilter}
          title="Фильтр по статусу"
          style={{ padding: "10px 14px", border: "1px solid #fecaca", borderRadius: 12, fontSize: 14, color: "#1e293b", background: "#fff", fontFamily: "inherit" }}
        >
          <option value="">Все статусы</option>
          <option value="PENDING">Ожидают</option>
          <option value="REVIEW">На рассмотрении</option>
          <option value="APPROVED">Одобрено</option>
          <option value="REJECTED">Отклонено</option>
        </select>
        <select
          name="nomination"
          defaultValue={nomFilter}
          title="Фильтр по номинации"
          style={{ padding: "10px 14px", border: "1px solid #fecaca", borderRadius: 12, fontSize: 14, color: "#1e293b", background: "#fff", fontFamily: "inherit" }}
        >
          <option value="">Все номинации</option>
          {nominations.map(n => <option key={n.slug} value={n.slug}>{n.title}</option>)}
        </select>
        <button
          type="submit"
          className="apply-btn"
          style={{ padding: "10px 22px", background: "linear-gradient(135deg, #b91c1c, #ef4444)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Фильтровать
        </button>
      </form>

      {/* Applications list */}
      {applications.length === 0 ? (
        <div className="empty-state"><p>Заявок не найдено</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {applications.map(app => {
            const emp = safeParseObject(app.employeeData);
            const st = STATUS_LABEL[app.status] ?? { label: app.status, bg: "#f1f5f9", color: "#475569" };
            const avgScore = app.juryScores.length > 0
              ? (app.juryScores.reduce((s: number, j: { score: number }) => s + j.score, 0) / app.juryScores.length).toFixed(1)
              : null;
            return (
              <Link key={app.id} href={`/jury/${app.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{app.nomination.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: "#1e293b", fontWeight: 700, fontSize: 15 }}>{emp.name || app.user?.name}</p>
                    <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 13 }}>
                      {emp.position} · {emp.department} · {app.nomination.title}
                    </p>
                    <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: 12 }}>
                      {new Date(app.submittedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    {avgScore && (
                      <span style={{ background: "linear-gradient(135deg, #b91c1c, #ef4444)", color: "#fff", fontWeight: 800, padding: "4px 12px", borderRadius: 10, fontSize: 14 }}>
                        ★ {avgScore}
                      </span>
                    )}
                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33`, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
