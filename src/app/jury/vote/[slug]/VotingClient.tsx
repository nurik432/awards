"use client";
import { useState } from "react";
import { isLocalUpload, isLocalPdf, isHttpLink } from "@/lib/safe-url";

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
const range = (a?: string, b?: string) => [a, b].filter(Boolean).join(" — ");

type JuryScoreEntry = { judgeId: string; judgeName: string; score: number; comment: string };
type AppData = {
  id: string;
  photoUrl: string | null;
  presentationUrl: string | null;
  presentationName: string | null;
  emp: Record<string, string>;
  fd: Record<string, any>;
  juryScores: JuryScoreEntry[];
  myScore: { score: number; comment: string } | null;
  avgScore: number | null;
  scoredCount: number;
};

function ApplicantCard({ app, index, totalJudges }: { app: AppData; index: number; totalJudges: number }) {
  const [score, setScore] = useState<number>(app.myScore?.score ?? 0);
  const [comment, setComment] = useState(app.myScore?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showJuryScores, setShowJuryScores] = useState(false);

  const liveAvg = app.juryScores.length > 0
    ? (app.juryScores.reduce((s, j) => s + j.score, 0) / app.juryScores.length).toFixed(1)
    : null;

  async function handleSave() {
    if (!score) { setError("Выберите балл от 1 до 10"); return; }
    setLoading(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/jury/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: app.id, score, comment }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Ошибка сохранения"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Ошибка сети"); }
    finally { setLoading(false); }
  }

  const emp = app.emp;
  const fd = app.fd;
  const isScored = app.myScore !== null;

  return (
    <div className="card" style={{ marginBottom: 20, padding: 0, overflow: "hidden" }}>

      {/* Card header */}
      <div style={{ padding: "20px 26px", display: "flex", alignItems: "flex-start", gap: 16 }}>
        {/* Rank + photo */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 800, fontSize: 15,
            background: index === 0 ? "#fef3c7" : "#fef2f2",
            color: index === 0 ? "#92400e" : "#991b1b",
            border: `2px solid ${index === 0 ? "#fcd34d" : "#fecaca"}`,
          }}>
            {index + 1}
          </div>
          {isLocalUpload(app.photoUrl) ? (
            <img src={app.photoUrl} alt={emp.name} style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 14, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#dc2626" }}>
              👤
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b", fontWeight: 800, lineHeight: 1.2 }}>{emp.name}</h3>
              <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 13 }}>{emp.position}</p>
              <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: 12 }}>{emp.department}</p>
            </div>

            {/* Average score badge */}
            {liveAvg && (
              <div style={{
                background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
                color: "#fff", borderRadius: 14, padding: "10px 16px", textAlign: "center" as const,
                boxShadow: "0 6px 20px rgba(185,28,28,0.25)", flexShrink: 0,
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>★ {liveAvg}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{app.scoredCount}/{totalJudges} судей</div>
              </div>
            )}
          </div>

          {fd.projectName && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca" }}>
              <span style={{ color: "#991b1b", fontSize: 13, fontWeight: 700 }}>Проект: </span>
              <span style={{ color: "#7f1d1d", fontSize: 13 }}>{fd.projectName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expand details */}
      <div style={{ paddingLeft: 110, paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{ background: "none", border: "none", color: "#dc2626", fontSize: 13, cursor: "pointer", fontWeight: 600, padding: 0 }}
        >
          {expanded ? "▲ Скрыть детали" : "▼ Подробнее о проекте"}
        </button>
      </div>

      {/* Project details */}
      {expanded && (
        <div style={{ margin: "0 24px 16px", padding: "18px 20px", background: "#fef9f9", borderRadius: 16, border: "1px solid #fee2e2" }}>
          {[
            fd.projectDescription && ["Суть инициативы", fd.projectDescription],
            (Array.isArray(fd.category) ? fd.category.length > 0 : fd.category) && [
              "Категория инициативы",
              (Array.isArray(fd.category)
                ? fd.category.map((c: string) => CATEGORY_LABELS[c] ?? c).join(", ")
                : CATEGORY_LABELS[fd.category] ?? fd.category),
            ],
            fd.implementationStatus && ["Статус реализации", STATUS_LABELS[fd.implementationStatus] ?? fd.implementationStatus],
            (fd.implementationPlace || fd.implementedWhen) && ["Где реализована / планируется", fd.implementationPlace || fd.implementedWhen],
            fd.problemsSolved && ["Задачи / проблемы", fd.problemsSolved],
            (fd.resultsSummary || fd.economicBenefits) && ["Результаты (получены / ожидаются)", fd.resultsSummary || fd.economicBenefits],
            range(fd.startDate, fd.endDate) && ["Период реализации", range(fd.startDate, fd.endDate)],
            fd.actualResults && ["Фактические результаты внедрения", fd.actualResults],
            fd.baselineValue && ["Базовое значение (до)", fd.baselineValue],
            fd.actualValue && ["Фактическое значение (после)", fd.actualValue],
            fd.achievedEffect && ["Достигнутый эффект / экономия", fd.achievedEffect],
            fd.calcMethod && ["Методика расчёта эффекта", fd.calcMethod],
            fd.expectedEffect && ["Ожидаемый эффект (%)", fd.expectedEffect],
            fd.expectedSavings && ["Ожидаемая экономия", fd.expectedSavings],
            fd.effectJustification && ["Обоснование ожидаемого эффекта", fd.effectJustification],
            range(fd.plannedStartDate, fd.plannedEndDate) && ["Планируемый срок реализации", range(fd.plannedStartDate, fd.plannedEndDate)],
            fd.scope && ["Масштаб влияния", SCOPE_LABELS[fd.scope] ?? fd.scope],
            fd.hasParticipants === "yes" && ["Участники инициативы", fd.participants || "Да"],
            fd.hasParticipants === "no" && ["Участники инициативы", "Нет"],
            fd.projectText && ["Описание проекта", fd.projectText],
          ].filter(Boolean).map((row) => {
            const [label, val] = row as [string, string];
            return (
              <div key={label} style={{ marginBottom: 14 }}>
                <p style={{ color: "#991b1b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{val}</p>
              </div>
            );
          })}

          {fd.materialsLink && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ color: "#991b1b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Подтверждающие материалы</p>
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

          {app.presentationUrl && (
            <div style={{ borderTop: "1px solid #fecaca", paddingTop: 14, marginTop: 4 }}>
              <p style={{ color: "#991b1b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Презентация проекта</p>
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
                <div style={{ marginTop: 14, borderRadius: 12, overflow: "hidden", border: "1px solid #fecaca" }}>
                  <iframe
                    src={app.presentationUrl}
                    style={{ width: "100%", height: 480, border: "none", display: "block" }}
                    title="Презентация"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voting panel */}
      <div style={{ borderTop: "1px solid #fee2e2", padding: "20px 26px", background: "#fff7f7" }}>
        {isScored && (
          <div style={{ marginBottom: 14, padding: "8px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 700 }}>✓ Ваша оценка: {app.myScore!.score}/10</span>
            {app.myScore!.comment && <span style={{ color: "#64748b", fontSize: 12 }}>— {app.myScore!.comment}</span>}
          </div>
        )}

        <p style={{ color: "#7f1d1d", fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {isScored ? "Изменить оценку" : "Выставить оценку"} <span style={{ color: "#dc2626", fontSize: 18, fontWeight: 800 }}>{score > 0 ? `— ${score}/10` : ""}</span>
        </p>

        {/* Score buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 14 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setScore(v)}
              style={{
                width: 44, height: 44, borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: "pointer",
                border: score === v ? "2px solid #b91c1c" : "2px solid #fecaca",
                background: score === v
                  ? "linear-gradient(135deg, #b91c1c, #ef4444)"
                  : "#fff",
                color: score === v ? "#fff" : "#dc2626",
                boxShadow: score === v ? "0 4px 14px rgba(185,28,28,0.35)" : "none",
                transform: score === v ? "scale(1.1)" : "scale(1)",
                transition: "all 0.15s ease",
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Comment */}
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Краткий комментарий (необязательно)..."
          style={{
            width: "100%", padding: "11px 14px", border: "1px solid #fecaca", borderRadius: 12,
            fontFamily: "inherit", fontSize: 14, color: "#1e293b", background: "#fff",
            marginBottom: 14, boxSizing: "border-box" as const,
          }}
        />

        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>{error}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || score === 0}
            style={{
              padding: "11px 28px", fontWeight: 800, fontSize: 14, borderRadius: 14, cursor: score > 0 ? "pointer" : "not-allowed",
              border: "none", transition: "transform 0.15s ease, box-shadow 0.15s ease",
              background: score > 0 ? "linear-gradient(135deg, #b91c1c, #ef4444)" : "#e2e8f0",
              color: score > 0 ? "#fff" : "#94a3b8",
              boxShadow: score > 0 ? "0 8px 24px rgba(185,28,28,0.28)" : "none",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Сохранение..." : isScored ? "Обновить оценку" : "Сохранить оценку"}
          </button>
          {saved && (
            <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              ✓ Сохранено
            </span>
          )}

          {app.juryScores.length > 0 && (
            <button
              type="button"
              onClick={() => setShowJuryScores(!showJuryScores)}
              style={{ background: "none", border: "1px solid #fecaca", borderRadius: 10, color: "#991b1b", fontSize: 13, cursor: "pointer", padding: "8px 14px", marginLeft: "auto" }}
            >
              {showJuryScores ? "Скрыть" : `Оценки жюри (${app.juryScores.length})`}
            </button>
          )}
        </div>

        {/* Other jury scores */}
        {showJuryScores && app.juryScores.length > 0 && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {app.juryScores.map(s => (
              <div key={s.judgeId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fff", borderRadius: 10, border: "1px solid #fee2e2" }}>
                <span style={{ color: "#64748b", fontSize: 13, flex: 1 }}>{s.judgeName}</span>
                <span style={{
                  background: "linear-gradient(135deg, #b91c1c, #ef4444)", color: "#fff",
                  fontWeight: 800, fontSize: 14, padding: "3px 12px", borderRadius: 8,
                }}>
                  {s.score}/10
                </span>
                {s.comment && <span style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}>— {s.comment}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VotingClient({ applications, judgeId, totalJudges }: {
  applications: AppData[];
  judgeId: string;
  totalJudges: number;
}) {
  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <p>В этой номинации пока нет участников</p>
      </div>
    );
  }

  return (
    <div>
      {applications.map((app, i) => (
        <ApplicantCard key={app.id} app={app} index={i} totalJudges={totalJudges} />
      ))}
    </div>
  );
}
