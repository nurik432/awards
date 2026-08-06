import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import JuryReviewForm from "./JuryReviewForm";
import Breadcrumb from "@/components/Breadcrumb";
import { isLocalUpload, isLocalPdf, isHttpLink } from "@/lib/safe-url";
import { safeParseObject, safeParseArray } from "@/lib/safe-json";

export default async function JuryApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const judgeId = (session?.user as any)?.id as string;

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
    // legacy
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
    // Если реализовано
    range(fd.startDate, fd.endDate) && ["Период реализации", range(fd.startDate, fd.endDate)],
    fd.actualResults && ["Фактические результаты внедрения", fd.actualResults],
    fd.baselineValue && ["Базовое значение (до внедрения)", fd.baselineValue],
    fd.actualValue && ["Фактическое значение (после внедрения)", fd.actualValue],
    fd.achievedEffect && ["Достигнутый эффект / экономия", fd.achievedEffect],
    fd.calcMethod && ["Методика расчёта эффекта", fd.calcMethod],
    // Если планируется / в процессе
    fd.expectedEffect && ["Ожидаемый эффект (%)", fd.expectedEffect],
    fd.expectedSavings && ["Ожидаемая экономия", fd.expectedSavings],
    fd.effectJustification && ["Обоснование ожидаемого эффекта", fd.effectJustification],
    range(fd.plannedStartDate, fd.plannedEndDate) && ["Планируемый срок реализации", range(fd.plannedStartDate, fd.plannedEndDate)],
    // Разделы 4–7
    fd.scope && ["Масштаб влияния", SCOPE_LABELS[fd.scope] ?? fd.scope],
    participantsText && ["Участники инициативы", participantsText],
    fd.confirmAccuracy && ["Достоверность информации", "Подтверждена"],
    fd.managerApproved && ["Согласование с руководителем", "Подтверждено"],
    fd.projectText && ["Описание проекта", fd.projectText],
  ];

  const myScore = app.juryScores.find((s: { judgeId: string }) => s.judgeId === judgeId);
  const avgScore = app.juryScores.length > 0
    ? (app.juryScores.reduce((s: number, j: { score: number }) => s + j.score, 0) / app.juryScores.length).toFixed(1)
    : null;

  return (
    <>
      <Breadcrumb items={[
        { label: 'Жюри', href: '/jury' },
        { label: 'Все заявки', href: '/jury/all' },
        { label: emp.name ?? 'Участник' },
      ]} />

      {/* Main applicant card */}
      <div className="card" style={{ marginBottom: 20, padding: "26px 30px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 22 }}>
          {isLocalUpload(app.photoUrl) ? (
            <img src={app.photoUrl} alt={emp.name} style={{ width: 88, height: 88, borderRadius: 18, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: 18, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
              {app.nomination.icon}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" as const }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" }}>{emp.name || app.user?.name}</h1>
                <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 14 }}>{emp.position}</p>
                <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: 13 }}>{emp.department || app.user?.department}</p>
                <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "5px 12px" }}>
                  <span style={{ fontSize: 16 }}>{app.nomination.icon}</span>
                  <span style={{ color: "#991b1b", fontSize: 13, fontWeight: 700 }}>{app.nomination.title}</span>
                </div>
              </div>
              {avgScore && (
                <div style={{ background: "linear-gradient(135deg, #7f1d1d, #dc2626)", color: "#fff", borderRadius: 16, padding: "14px 20px", textAlign: "center" as const, boxShadow: "0 8px 24px rgba(127,29,29,0.3)" }}>
                  <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>★ {avgScore}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{app.juryScores.length} оценок</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20, padding: "16px 18px", background: "#fef9f9", borderRadius: 14, border: "1px solid #fee2e2" }}>
          {[
            ["Телефон", emp.phone],
            ["Email", emp.email || app.user?.email],
            ["Дата подачи", new Date(app.submittedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })],
          ].map(([label, val]) => (
            <div key={label}>
              <p style={{ color: "#991b1b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{label}</p>
              <p style={{ color: "#1e293b", fontSize: 14, fontWeight: 500 }}>{val || "—"}</p>
            </div>
          ))}
        </div>

        {/* Project fields */}
        {projectRows.filter(Boolean).map((row) => {
          const [label, val] = row as readonly [string, string];
          return (
            <div key={label} style={{ borderTop: "1px solid #fee2e2", paddingTop: 16, marginTop: 16 }}>
              <p style={{ color: "#991b1b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</p>
              <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{val}</p>
            </div>
          );
        })}

        {fd.materialsLink && (
          <div style={{ borderTop: "1px solid #fee2e2", paddingTop: 16, marginTop: 16 }}>
            <p style={{ color: "#991b1b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Подтверждающие материалы</p>
            {isHttpLink(fd.materialsLink) ? (
              <a href={fd.materialsLink} target="_blank" rel="noopener noreferrer" style={{ color: "#dc2626", fontSize: 14, wordBreak: "break-all" }}>
                {fd.materialsLink}
              </a>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13, wordBreak: "break-all", margin: 0 }}>
                Ссылка не прошла проверку и не отображается: {String(fd.materialsLink).slice(0, 200)}
              </p>
            )}
          </div>
        )}

        {criteria.length > 0 && (
          <div style={{ borderTop: "1px solid #fee2e2", paddingTop: 16, marginTop: 16 }}>
            <p style={{ color: "#991b1b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Критерии оценки</p>
            <ul style={{ paddingLeft: 0, margin: 0, listStyle: "none" }}>
              {criteria.map((c, i) => (
                <li key={i} style={{ display: "flex", gap: 10, marginBottom: 6, color: "#475569", fontSize: 14 }}>
                  <span className="dot" style={{ marginTop: 6 }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {app.presentationUrl && (
          <div style={{ borderTop: "1px solid #fee2e2", paddingTop: 16, marginTop: 16 }}>
            <p style={{ color: "#991b1b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Презентация проекта</p>
            {isLocalUpload(app.presentationUrl, "/uploads/presentations/") ? (
              <a
                href={app.presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "linear-gradient(135deg, #b91c1c, #ef4444)", color: "#fff",
                  padding: "10px 20px", borderRadius: 12, textDecoration: "none",
                  fontWeight: 700, fontSize: 14, boxShadow: "0 4px 14px rgba(185,28,28,0.3)",
                }}
              >
                <span>{
                  app.presentationName?.match(/\.pdf$/i) ? "📄" :
                  app.presentationName?.match(/\.pptx?$/i) ? "📊" :
                  app.presentationName?.match(/\.docx?$/i) ? "📝" :
                  app.presentationName?.match(/\.xlsx?$/i) ? "📈" : "📎"
                }</span>
                <span>{app.presentationName ?? "Открыть презентацию"}</span>
              </a>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13, wordBreak: "break-all", margin: 0 }}>
                Вложение не прошло проверку и не отображается: {String(app.presentationUrl).slice(0, 200)}
              </p>
            )}
            {isLocalPdf(app.presentationUrl) && (
              <div style={{ marginTop: 14, borderRadius: 14, overflow: "hidden", border: "1px solid #fecaca" }}>
                <iframe
                  src={app.presentationUrl}
                  style={{ width: "100%", height: 560, border: "none", display: "block" }}
                  title="Презентация"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* All jury scores */}
      {app.juryScores.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: "22px 28px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#7f1d1d", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Оценки комиссии
          </h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {app.juryScores.map((s: { id: string; score: number; comment: string | null; judge: { id: string; name: string } }) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#fef9f9", borderRadius: 12, border: "1px solid #fee2e2" }}>
                <span style={{ color: "#475569", fontSize: 14, flex: 1 }}>{s.judge.name}</span>
                <span style={{ background: "linear-gradient(135deg, #b91c1c, #ef4444)", color: "#fff", fontWeight: 800, fontSize: 16, padding: "4px 14px", borderRadius: 10 }}>
                  {s.score}/10
                </span>
                {s.comment && <span style={{ color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>— {s.comment}</span>}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #fee2e2", marginTop: 14, paddingTop: 14, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>Средний балл:</span>
            <span style={{ background: "linear-gradient(135deg, #7f1d1d, #dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 24 }}>
              ★ {avgScore}
            </span>
          </div>
        </div>
      )}

      <JuryReviewForm
        appId={app.id}
        currentScore={myScore?.score ?? null}
        currentStatus={app.status}
        currentNote={(myScore as any)?.comment ?? app.reviewNote ?? ""}
      />
    </>
  );
}
