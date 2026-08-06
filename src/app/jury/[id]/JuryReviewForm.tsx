"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JuryReviewForm({ appId, currentScore, currentStatus, currentNote }: {
  appId: string; currentScore: number | null; currentStatus: string; currentNote: string;
}) {
  const router = useRouter();
  const [score, setScore] = useState(currentScore ?? 0);
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState(currentNote);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/jury/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, score, status, reviewNote: note }),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  const STATUS_OPTIONS = [
    { value: "PENDING",  label: "Ожидает",         bg: "#fff7ed", color: "#9a3412", activeBg: "#fed7aa" },
    { value: "REVIEW",   label: "На рассмотрении", bg: "#eff6ff", color: "#1e40af", activeBg: "#bfdbfe" },
    { value: "APPROVED", label: "Одобрить",        bg: "#f0fdf4", color: "#166534", activeBg: "#bbf7d0" },
    { value: "REJECTED", label: "Отклонить",       bg: "#fef2f2", color: "#991b1b", activeBg: "#fecaca" },
  ];

  return (
    <div className="card" style={{ padding: "26px 30px" }}>
      <h2 style={{ margin: "0 0 22px", fontSize: 16, fontWeight: 800, color: "#7f1d1d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Ваша оценка
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Score */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ color: "#991b1b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Балл{score > 0 && <span style={{ color: "#dc2626", fontSize: 20, marginLeft: 8 }}>{score}/10</span>}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {[1,2,3,4,5,6,7,8,9,10].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setScore(v)}
                style={{
                  width: 46, height: 46, borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: "pointer",
                  border: score === v ? "2px solid #b91c1c" : "2px solid #fecaca",
                  background: score === v ? "linear-gradient(135deg, #b91c1c, #ef4444)" : "#fff",
                  color: score === v ? "#fff" : "#dc2626",
                  boxShadow: score === v ? "0 4px 14px rgba(185,28,28,0.35)" : "none",
                  transform: score === v ? "scale(1.12)" : "scale(1)",
                  transition: "all 0.15s ease",
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, background: "#fee2e2", borderRadius: 6, height: 6, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(90deg, #b91c1c, #ef4444)", width: `${score * 10}%`, height: "100%", borderRadius: 6, transition: "width 0.2s ease" }} />
          </div>
        </div>

        {/* Status */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ color: "#991b1b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Статус заявки
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                style={{
                  padding: "9px 18px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  border: `1.5px solid ${status === opt.value ? opt.color : "#fecaca"}`,
                  background: status === opt.value ? opt.activeBg : opt.bg,
                  color: opt.color,
                  boxShadow: status === opt.value ? `0 2px 10px ${opt.color}30` : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ color: "#991b1b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Комментарий
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
            placeholder="Обоснование решения, замечания, пожелания..."
            style={{
              width: "100%", padding: "12px 15px", border: "1px solid #fecaca", borderRadius: 14,
              fontFamily: "inherit", fontSize: 14, color: "#1e293b", background: "#fff",
              resize: "vertical", boxSizing: "border-box" as const, lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 32px", background: "linear-gradient(135deg, #b91c1c, #ef4444)",
              border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              boxShadow: "0 8px 24px rgba(185,28,28,0.28)", transition: "transform 0.15s ease",
            }}
          >
            {loading ? "Сохранение..." : "Сохранить оценку"}
          </button>
          {saved && (
            <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              ✓ Сохранено
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
