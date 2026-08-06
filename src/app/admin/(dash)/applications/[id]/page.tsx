import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateApplicationStatus, deleteApplication } from "@/app/admin/actions";
import { isLocalUpload, isLocalPdf, isHttpLink } from "@/lib/safe-url";
import { safeParseObject, safeParseArray } from "@/lib/safe-json";

export const dynamic = "force-dynamic";

export default async function AdminApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      nomination: { select: { title: true, icon: true, description: true, criteria: true, slug: true } },
      user: { select: { name: true, email: true, department: true } },
      juryScores: {
        include: { judge: { select: { id: true, name: true } } },
        orderBy: { score: "desc" },
      },
    },
  });

  if (!app) notFound();

  const emp = safeParseObject(app.employeeData);
  const fd = safeParseObject(app.formData);
  const criteria = safeParseArray(app.nomination.criteria);

  const CATEGORY_LABELS: Record<string, string> = {
    reduce_time: "Сокращение сроков / автоматизация процессов",
    reduce_errors: "Снижение количества ошибок / дефектов",
    productivity: "Рост производительности труда",
    direct_savings: "Прямая экономия затрат",
    reduce_cost: "Снижение себестоимости",
    process: "Улучшение процессов",
    economic: "Экономическая эффективность",
    creative: "Креативность и инновационный подход",
  };
  const STATUS_LABELS: Record<string, string> = {
    done: "Инициатива реализована",
    in_progress: "В процессе внедрения",
    planned: "Планируется к реализации",
  };
  const SCOPE_LABELS: Record<string, string> = {
    department: "В рамках отдела",
    division: "В рамках подразделения",
    multi: "На уровне нескольких подразделений",
    company: "На уровне компании",
  };

  const categoryText = Array.isArray(fd.category)
    ? fd.category.map((c: string) => CATEGORY_LABELS[c] ?? c).join(", ")
    : fd.category ? (CATEGORY_LABELS[fd.category] ?? fd.category) : "";
  const range = (a?: string, b?: string) => [a, b].filter(Boolean).join(" — ");
  const participantsText = fd.hasParticipants === "yes"
    ? (fd.participants || "Да")
    : fd.hasParticipants === "no" ? "Нет" : "";

  const projectRows: (readonly [string, string] | false | "" | undefined)[] = [
    fd.projectName && ["Название инициативы", fd.projectName],
    fd.projectDescription && ["Суть инициативы", fd.projectDescription],
    categoryText && ["Категория инициативы", categoryText],
    fd.managerName && ["Непосредственный руководитель", fd.managerName],
    fd.implementationStatus && ["Статус реализации", STATUS_LABELS[fd.implementationStatus] ?? fd.implementationStatus],
    (fd.implementationPlace || fd.implementedWhen) && ["Где реализована / планируется", fd.implementationPlace || fd.implementedWhen],
    fd.problemsSolved && ["Задачи / проблемы", fd.problemsSolved],
    (fd.resultsSummary || fd.economicBenefits) && ["Результаты (получены / ожидаются)", fd.resultsSummary || fd.economicBenefits],
    range(fd.startDate, fd.endDate) && ["Период реализации", range(fd.startDate, fd.endDate)],
    fd.actualResults && ["Фактические результаты внедрения", fd.actualResults],
    fd.baselineValue && ["Базовое значение (до внедрения)", fd.baselineValue],
    fd.actualValue && ["Фактическое значение (после внедрения)", fd.actualValue],
    fd.achievedEffect && ["Достигнутый эффект / экономия", fd.achievedEffect],
    fd.calcMethod && ["Методика расчёта эффекта", fd.calcMethod],
    fd.expectedEffect && ["Ожидаемый эффект (%)", fd.expectedEffect],
    fd.expectedSavings && ["Ожидаемая экономия", fd.expectedSavings],
    fd.effectJustification && ["Обоснование ожидаемого эффекта", fd.effectJustification],
    range(fd.plannedStartDate, fd.plannedEndDate) && ["Планируемый срок реализации", range(fd.plannedStartDate, fd.plannedEndDate)],
    fd.scope && ["Масштаб влияния", SCOPE_LABELS[fd.scope] ?? fd.scope],
    participantsText && ["Участники инициативы", participantsText],
    fd.projectText && ["Описание проекта", fd.projectText],
  ];

  const filledRows = projectRows.filter(Boolean) as (readonly [string, string])[];
  /* The plain "Описание проекта" variant is a free-text application without the
     structured innovator form — the legal attestations do not apply to it. */
  const hasProjectForm = filledRows.some(([label]) => label !== "Описание проекта");

  const avgScore = app.juryScores.length > 0
    ? (app.juryScores.reduce((s: number, j: { score: number }) => s + j.score, 0) / app.juryScores.length).toFixed(1)
    : null;

  const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    PENDING:  { label: "Ожидает",         cls: "adm-badge-pending" },
    REVIEW:   { label: "На рассмотрении", cls: "adm-badge-review" },
    APPROVED: { label: "Одобрено",        cls: "adm-badge-ok" },
    REJECTED: { label: "Отклонено",       cls: "adm-badge-danger" },
  };
  const st = STATUS_MAP[app.status] ?? { label: app.status, cls: "adm-badge-neutral" };

  const contactRows: [string, string][] = [
    ["Должность", emp.position],
    ["Подразделение", emp.department || app.user?.department],
    ["Телефон", emp.phone],
    ["Email", emp.email || app.user?.email],
    ["Дата подачи", new Date(app.submittedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })],
  ];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">{emp.name || app.user?.name}</h1>
          <p className="adm-page-sub">Заявка в номинации «{app.nomination.title}»</p>
        </div>
        <div className="adm-page-actions">
          <Link href="/admin" className="adm-btn">← Все заявки</Link>
        </div>
      </div>

      {/* Status + decision actions */}
      <div
        className="adm-card adm-card-pad"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}
      >
        <span className={`adm-badge ${st.cls}`}>{st.label}</span>
        <div className="adm-actions">
          {app.status === "PENDING" && (
            <>
              <form action={async () => { "use server"; await updateApplicationStatus(id, "APPROVED"); }}>
                <button type="submit" className="adm-btn adm-btn-ok">✓ Одобрить</button>
              </form>
              <form action={async () => { "use server"; await updateApplicationStatus(id, "REJECTED"); }}>
                <button type="submit" className="adm-btn adm-btn-danger">✗ Отклонить</button>
              </form>
            </>
          )}
          {app.status !== "PENDING" && (
            <form action={async () => { "use server"; await updateApplicationStatus(id, "PENDING"); }}>
              <button type="submit" className="adm-btn">Вернуть на рассмотрение</button>
            </form>
          )}
          <form action={async () => { "use server"; await deleteApplication(id); }}>
            <button type="submit" className="adm-btn">🗑 Удалить</button>
          </form>
        </div>
      </div>

      {/* Employee + contacts */}
      <div className="adm-card" style={{ marginBottom: 18 }}>
        <div className="adm-card-head">
          <h2 className="adm-card-title">Сотрудник</h2>
          <span className="adm-badge adm-badge-neutral adm-badge-plain">
            <span aria-hidden>{app.nomination.icon}</span> {app.nomination.title}
          </span>
        </div>
        <div className="adm-card-body" style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          {isLocalUpload(app.photoUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.photoUrl}
              alt={emp.name}
              style={{ width: 76, height: 76, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid var(--adm-border)" }}
            />
          ) : (
            <div
              aria-hidden
              style={{ width: 76, height: 76, borderRadius: 10, background: "var(--adm-brand-sc)", border: "1px solid var(--adm-border)", display: "grid", placeItems: "center", fontSize: 30, flexShrink: 0 }}
            >
              {app.nomination.icon}
            </div>
          )}
          <dl style={{ margin: 0, flex: 1, minWidth: 240, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
            {contactRows.map(([label, val]) => (
              <div key={label}>
                <dt className="adm-stat-label">{label}</dt>
                <dd style={{ margin: "3px 0 0", color: "var(--adm-text)", wordBreak: "break-word" }}>{val || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Project */}
      <div className="adm-card" style={{ marginBottom: 18 }}>
        <div className="adm-card-head">
          <h2 className="adm-card-title">Проект</h2>
        </div>

        {filledRows.length === 0 && !fd.materialsLink ? (
          <div className="adm-empty">
            <span className="adm-empty-icon" aria-hidden>📝</span>
            Заявка подана без описания проекта.
          </div>
        ) : (
          <div className="adm-card-body">
            {filledRows.length > 0 && (
              <dl style={{ margin: 0, display: "grid", gap: 16 }}>
                {filledRows.map(([label, val]) => (
                  <div key={label}>
                    <dt className="adm-stat-label">{label}</dt>
                    <dd style={{ margin: "4px 0 0", color: "var(--adm-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{val}</dd>
                  </div>
                ))}
              </dl>
            )}

            {fd.materialsLink && (
              <>
                {filledRows.length > 0 && <hr className="adm-divider" />}
                <div className="adm-stat-label">Подтверждающие материалы</div>
                {isHttpLink(fd.materialsLink) ? (
                  <a
                    href={fd.materialsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 4, color: "var(--adm-brand-2)", wordBreak: "break-all" }}
                  >
                    {fd.materialsLink}
                  </a>
                ) : (
                  <p className="adm-hint" style={{ margin: "4px 0 0", wordBreak: "break-all" }}>
                    Ссылка не прошла проверку и не отображается: {String(fd.materialsLink).slice(0, 200)}
                  </p>
                )}
              </>
            )}

            {hasProjectForm && (
              <>
                <hr className="adm-divider" />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className={`adm-badge ${fd.confirmAccuracy ? "adm-badge-ok" : "adm-badge-danger"}`}>
                    {fd.confirmAccuracy ? "Достоверность подтверждена" : "Достоверность НЕ подтверждена"}
                  </span>
                  <span className={`adm-badge ${fd.managerApproved ? "adm-badge-ok" : "adm-badge-danger"}`}>
                    {fd.managerApproved ? "Согласовано с руководителем" : "НЕ согласовано с руководителем"}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nomination criteria */}
      {criteria.length > 0 && (
        <div className="adm-card" style={{ marginBottom: 18 }}>
          <div className="adm-card-head">
            <h2 className="adm-card-title">Критерии оценки</h2>
          </div>
          <div className="adm-card-body">
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 7 }}>
              {criteria.map((c, i) => (
                <li key={i} style={{ display: "flex", gap: 9, color: "var(--adm-text-2)", lineHeight: 1.5 }}>
                  <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--adm-brand-2)", flexShrink: 0, marginTop: 7 }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Presentation */}
      {app.presentationUrl && (
        <div className="adm-card" style={{ marginBottom: 18 }}>
          <div className="adm-card-head">
            <h2 className="adm-card-title">Презентация проекта</h2>
          </div>
          <div className="adm-card-body">
            {isLocalUpload(app.presentationUrl, "/uploads/presentations/") ? (
              <a href={app.presentationUrl} target="_blank" rel="noopener noreferrer" className="adm-btn">
                📎 {app.presentationName ?? "Открыть презентацию"}
              </a>
            ) : (
              <p className="adm-hint" style={{ margin: 0, wordBreak: "break-all" }}>
                Вложение не прошло проверку и не отображается: {String(app.presentationUrl).slice(0, 200)}
              </p>
            )}
            {isLocalPdf(app.presentationUrl) && (
              <div style={{ marginTop: 14, borderRadius: 9, overflow: "hidden", border: "1px solid var(--adm-border)" }}>
                <iframe src={app.presentationUrl} style={{ width: "100%", height: 560, border: "none", display: "block" }} title="Презентация" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jury scores */}
      <div className="adm-card">
        <div className="adm-card-head">
          <h2 className="adm-card-title">Оценки комиссии</h2>
          <span className="adm-badge adm-badge-neutral adm-badge-plain">{app.juryScores.length}</span>
        </div>

        {app.juryScores.length === 0 ? (
          <div className="adm-empty">
            <span className="adm-empty-icon" aria-hidden>⭐</span>
            Комиссия ещё не оценивала эту заявку.
          </div>
        ) : (
          <>
            {avgScore && (
              <div className="adm-card-body" style={{ paddingBottom: 0 }}>
                <div className="adm-stat" style={{ maxWidth: 220 }}>
                  <div className="adm-stat-label">Средний балл</div>
                  <div className="adm-stat-value is-brand">★ {avgScore}</div>
                </div>
              </div>
            )}
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Член комиссии</th>
                    <th className="adm-td-right">Балл</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {app.juryScores.map((s: { id: string; score: number; comment: string | null; judge: { id: string; name: string } }) => (
                    <tr key={s.id}>
                      <td className="adm-td-strong">{s.judge.name}</td>
                      <td className="adm-td-right adm-td-strong" style={{ whiteSpace: "nowrap" }}>{s.score}/10</td>
                      <td>{s.comment || <span className="adm-td-sub">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
