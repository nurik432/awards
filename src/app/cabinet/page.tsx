import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "Ожидает рассмотрения", color: "#C8973A", bg: "rgba(200,151,58,0.15)" },
  REVIEW:   { label: "На рассмотрении",      color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
  APPROVED: { label: "Одобрено",             color: "#4ade80", bg: "rgba(74,222,128,0.15)" },
  REJECTED: { label: "Отклонено",            color: "#f87171", bg: "rgba(248,113,113,0.15)" },
};

export default async function CabinetPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const applications = await prisma.application.findMany({
    where: { userId },
    include: { nomination: { select: { title: true, icon: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 className="glass-section-title">Мои заявки</h1>
          <p className="glass-section-sub">Статус ваших заявок на участие в номинациях</p>
        </div>
        <Link href="/cabinet/apply" className="btn btn-primary btn-topbar">
          + Подать заявку
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card empty-state">
          <p>Вы ещё не подавали заявки</p>
          <Link href="/cabinet/apply" className="btn btn-primary btn-topbar">
            Подать первую заявку →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {applications.map((app) => {
            const emp = (() => { try { return JSON.parse(app.employeeData); } catch { return {}; } })();
            const fd  = (() => { try { return JSON.parse(app.formData); }    catch { return {}; } })();
            const st  = STATUS[app.status] ?? { label: app.status, color: "#aaa", bg: "rgba(255,255,255,0.08)" };
            const preview = fd.projectDescription || fd.projectText || "";

            return (
              <div key={app.id} className="glass-card">
                {/* Top row: nomination + status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{app.nomination.icon}</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{app.nomination.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {app.score !== null && (
                      <span style={{ color: "#C8973A", fontWeight: 700, fontSize: 15 }}>★ {app.score}/10</span>
                    )}
                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}44`, borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
                      {st.label}
                    </span>
                  </div>
                </div>

                <hr className="glass-divider" style={{ marginBottom: 14 }} />

                {/* Meta */}
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: preview ? 10 : 0 }}>
                  Подано: {new Date(app.submittedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  {emp.position ? ` · ${emp.position}` : ""}
                  {emp.department ? ` · ${emp.department}` : ""}
                </p>

                {/* Project name for innovator */}
                {fd.projectName && (
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{fd.projectName}</p>
                )}

                {/* Preview */}
                {preview && (
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6 }}>
                    {preview.slice(0, 220)}{preview.length > 220 ? "…" : ""}
                  </p>
                )}

                {/* Jury comment */}
                {app.reviewNote && (
                  <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>Комментарий комиссии:</p>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>{app.reviewNote}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
