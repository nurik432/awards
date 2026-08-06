"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Nomination = {
  id: string; slug: string; title: string;
  icon: string | null; description: string; formType: string;
};

const MAX_UPLOAD_MB = 5;

const CATEGORY_OPTIONS = [
  { value: "reduce_time",    label: "Сокращение сроков выполнения работ и автоматизация процессов" },
  { value: "reduce_errors",  label: "Снижение количества ошибок / дефектов" },
  { value: "productivity",   label: "Рост производительности труда" },
  { value: "direct_savings", label: "Прямая экономия затрат" },
  { value: "reduce_cost",    label: "Снижение себестоимости" },
];
const STATUS_OPTIONS = [
  { value: "done",        label: "Инициатива реализована" },
  { value: "in_progress", label: "Инициатива находится в процессе внедрения" },
  { value: "planned",     label: "Инициатива планируется к реализации" },
];
const SCOPE_OPTIONS = [
  { value: "department", label: "В рамках отдела" },
  { value: "division",   label: "В рамках подразделения" },
  { value: "multi",      label: "На уровне нескольких подразделений" },
  { value: "company",    label: "На уровне компании" },
];

const sectionTitle: React.CSSProperties = {
  color: "#C8973A", fontWeight: 700, fontSize: 13, marginBottom: 16,
  textTransform: "uppercase", letterSpacing: "0.08em",
};
const optionRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
  padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
  transition: "background 0.15s",
};
const optionText: React.CSSProperties = { color: "rgba(255,255,255,0.85)", fontSize: 14 };

export default function CabinetApplyForm({
  nominations, userName, userEmail, userId,
}: {
  nominations: Nomination[];
  userName: string;
  userEmail: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNom, setSelectedNom] = useState<Nomination | null>(null);
  const [implStatus, setImplStatus] = useState("");
  const [hasParticipants, setHasParticipants] = useState("");
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [managerApproved, setManagerApproved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [presentationUploading, setPresentationUploading] = useState(false);

  const isInnovator = selectedNom?.formType === "innovator";

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`Фото слишком большое (макс. ${MAX_UPLOAD_MB} МБ). Выберите файл поменьше.`);
      e.target.value = "";
      setPhotoFile(null); setPhotoPreview(null);
      return;
    }
    setError("");
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  function handlePresentationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`Файл слишком большой (макс. ${MAX_UPLOAD_MB} МБ). Выберите файл поменьше либо загрузите его в облако и вставьте ссылку выше.`);
      e.target.value = "";
      setPresentationFile(null);
      return;
    }
    setError("");
    setPresentationFile(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (isInnovator) {
      if (fd.getAll("category").length === 0) {
        setError("Выберите хотя бы одну категорию инициативы");
        return;
      }
      if (!confirmAccuracy || !managerApproved) {
        setError("Необходимо подтвердить достоверность информации и согласование с руководителем");
        return;
      }
    }
    setError("");
    setLoading(true);

    // Upload photo first if selected
    let photoUrl: string | null = null;
    if (photoFile) {
      setPhotoUploading(true);
      const uploadForm = new FormData();
      uploadForm.append("file", photoFile);
      const upRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const upJson = await upRes.json();
      setPhotoUploading(false);
      if (!upRes.ok) { setError(upJson.error ?? "Ошибка загрузки фото"); setLoading(false); return; }
      photoUrl = upJson.url;
    }

    // Upload presentation if selected
    let presentationUrl: string | null = null;
    let presentationName: string | null = null;
    if (presentationFile) {
      setPresentationUploading(true);
      const presForm = new FormData();
      presForm.append("file", presentationFile);
      const presRes = await fetch("/api/upload/presentation", { method: "POST", body: presForm });
      const presJson = await presRes.json();
      setPresentationUploading(false);
      if (!presRes.ok) { setError(presJson.error ?? "Ошибка загрузки презентации"); setLoading(false); return; }
      presentationUrl = presJson.url;
      presentationName = presJson.originalName;
    }

    const body = {
      nominationSlug: fd.get("nominationSlug"),
      nominationTitle: selectedNom?.title,
      userId,
      email: userEmail,
      photoUrl,
      presentationUrl,
      presentationName,
      // Раздел 1 — информация о заявителе
      name:       fd.get("name"),
      position:   fd.get("position"),
      department: fd.get("department"),
      phone:      fd.get("phone"),
      // Разделы 2–7 — данные инициативы
      ...(isInnovator ? {
        managerName:          fd.get("managerName"),
        projectName:          fd.get("projectName"),
        projectDescription:   fd.get("projectDescription"),
        category:             fd.getAll("category"),
        implementationStatus: fd.get("implementationStatus"),
        implementationPlace:  fd.get("implementationPlace"),
        problemsSolved:       fd.get("problemsSolved"),
        resultsSummary:       fd.get("resultsSummary"),
        // Если «Инициатива реализована»
        startDate:            fd.get("startDate"),
        endDate:              fd.get("endDate"),
        actualResults:        fd.get("actualResults"),
        baselineValue:        fd.get("baselineValue"),
        actualValue:          fd.get("actualValue"),
        achievedEffect:       fd.get("achievedEffect"),
        calcMethod:           fd.get("calcMethod"),
        // Если «Планируется» или «В процессе»
        expectedEffect:       fd.get("expectedEffect"),
        expectedSavings:      fd.get("expectedSavings"),
        effectJustification:  fd.get("effectJustification"),
        plannedStartDate:     fd.get("plannedStartDate"),
        plannedEndDate:       fd.get("plannedEndDate"),
        // Раздел 4–7
        scope:                fd.get("scope"),
        hasParticipants:      fd.get("hasParticipants"),
        participants:         fd.get("participants"),
        materialsLink:        fd.get("materialsLink"),
        confirmAccuracy,
        managerApproved,
      } : {
        projectText: fd.get("projectText"),
      }),
    };

    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Ошибка отправки"); return; }
    router.push("/cabinet?submitted=1");
  }

  const submitDisabled = loading || photoUploading || presentationUploading
    || (isInnovator && (!confirmAccuracy || !managerApproved));

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 680 }}>
      {error && (
        <div className="glass-card" style={{ marginBottom: 20, borderColor: "rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.08)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Nomination selector */}
      <div className="glass-card" style={{ marginBottom: 16 }}>
        <label className="glass-label">Номинация *</label>
        <select
          name="nominationSlug"
          required
          title="Выберите номинацию"
          className="glass-input"
          onChange={(e) => {
            setSelectedNom(nominations.find(n => n.slug === e.target.value) ?? null);
            setImplStatus(""); setHasParticipants("");
            setConfirmAccuracy(false); setManagerApproved(false);
          }}
        >
          <option value="">— Выберите номинацию —</option>
          {nominations.map((n) => (
            <option key={n.id} value={n.slug}>{n.icon} {n.title}</option>
          ))}
        </select>
        {selectedNom && (
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 8, marginBottom: 0 }}>
            {selectedNom.description}
          </p>
        )}
      </div>

      {selectedNom && (
        <>
          {/* ── Раздел 1: Информация о заявителе ── */}
          <div className="glass-card" style={{ marginBottom: 16 }}>
            <p style={sectionTitle}>1. Информация о заявителе</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="glass-label">ФИО сотрудника *</label>
                <input name="name" required defaultValue={userName} placeholder="Иванов Иван Иванович" className="glass-input" />
              </div>
              <div>
                <label className="glass-label">Должность *</label>
                <input name="position" required placeholder="Например: Менеджер по продажам" className="glass-input" />
              </div>
              <div>
                <label className="glass-label">Подразделение / отдел *</label>
                <input name="department" required placeholder="Например: Farovon Telecom" className="glass-input" />
              </div>
              <div>
                <label className="glass-label">Контактный номер телефона *</label>
                <input name="phone" required placeholder="+992 XX XXX-XX-XX" className="glass-input" />
              </div>
              {isInnovator && (
                <div>
                  <label className="glass-label">ФИО непосредственного руководителя *</label>
                  <input name="managerName" required placeholder="Иванов Иван Иванович" className="glass-input" />
                </div>
              )}
            </div>
          </div>

          {isInnovator ? (
            <>
              {/* ── Раздел 2: Информация об инициативе ── */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <p style={sectionTitle}>2. Информация об инициативе</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="glass-label">Название инициативы / проекта *</label>
                    <input name="projectName" required placeholder="Краткое название вашей инициативы или проекта" className="glass-input" />
                  </div>
                  <div>
                    <label className="glass-label">
                      Опишите суть инициативы *
                      <span style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic", fontWeight: 400 }}> — что внедрено или планируется, в чём идея и какую проблему решает</span>
                    </label>
                    <textarea name="projectDescription" required rows={4} placeholder="Опишите суть вашей инициативы..." className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                  <div>
                    <label className="glass-label">Категория инициативы *</label>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 12px" }}>Можно выбрать несколько вариантов</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {CATEGORY_OPTIONS.map(opt => (
                        <label key={opt.value} style={optionRow}>
                          <input type="checkbox" name="category" value={opt.value} style={{ width: 16, height: 16, accentColor: "#C8973A", flexShrink: 0 }} />
                          <span style={optionText}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Раздел 3: Реализация инициативы ── */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <p style={sectionTitle}>3. Реализация инициативы</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="glass-label">Статус реализации инициативы *</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                      {STATUS_OPTIONS.map(opt => (
                        <label key={opt.value} style={optionRow}>
                          <input
                            type="radio" name="implementationStatus" value={opt.value} required
                            onChange={() => setImplStatus(opt.value)}
                            style={{ width: 16, height: 16, accentColor: "#C8973A", flexShrink: 0 }}
                          />
                          <span style={optionText}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="glass-label">Где реализована или планируется к реализации инициатива? *</label>
                    <textarea name="implementationPlace" required rows={2} placeholder="Например: отдел логистики, завод Farovon-1" className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                  <div>
                    <label className="glass-label">Какие задачи или проблемы решает инициатива? *</label>
                    <textarea name="problemsSolved" required rows={3} placeholder="Опишите задачи или проблемы, которые решает инициатива..." className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                  <div>
                    <label className="glass-label">Какие результаты получены или ожидаются от реализации инициативы? *</label>
                    <textarea name="resultsSummary" required rows={3} placeholder="Опишите полученные или ожидаемые результаты..." className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                </div>

                {/* Блок для «Инициатива реализована» */}
                {implStatus === "done" && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 14 }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Заполняется, если инициатива уже реализована</p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="glass-label">Дата начала реализации</label>
                        <input name="startDate" type="date" title="Дата начала реализации" className="glass-input" />
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="glass-label">Дата завершения реализации</label>
                        <input name="endDate" type="date" title="Дата завершения реализации" className="glass-input" />
                      </div>
                    </div>
                    <div>
                      <label className="glass-label">Опишите фактические результаты внедрения</label>
                      <textarea name="actualResults" rows={3} placeholder="Фактические результаты внедрения..." className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="glass-label">Базовое значение показателя (до внедрения)</label>
                        <input name="baselineValue" placeholder="Например: 100 ч / мес" className="glass-input" />
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="glass-label">Фактическое значение показателя (после внедрения)</label>
                        <input name="actualValue" placeholder="Например: 60 ч / мес" className="glass-input" />
                      </div>
                    </div>
                    <div>
                      <label className="glass-label">Достигнутый эффект (%) или сумма экономии</label>
                      <input name="achievedEffect" placeholder="Например: −40% или 250 000 сомони" className="glass-input" />
                    </div>
                    <div>
                      <label className="glass-label">Опишите методику расчёта эффекта</label>
                      <textarea name="calcMethod" rows={3} placeholder="Как рассчитан эффект..." className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                  </div>
                )}

                {/* Блок для «Планируется» или «В процессе внедрения» */}
                {(implStatus === "planned" || implStatus === "in_progress") && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 14 }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Заполняется, если инициатива планируется или в процессе внедрения</p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="glass-label">Ожидаемый эффект (%)</label>
                        <input name="expectedEffect" placeholder="Например: −30%" className="glass-input" />
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="glass-label">Ожидаемая экономия (если применимо)</label>
                        <input name="expectedSavings" placeholder="Например: 150 000 сомони / год" className="glass-input" />
                      </div>
                    </div>
                    <div>
                      <label className="glass-label">Обоснование ожидаемого эффекта</label>
                      <textarea name="effectJustification" rows={3} placeholder="На чём основаны ожидания..." className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                    <div>
                      <label className="glass-label">Планируемый срок реализации</label>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <input name="plannedStartDate" type="date" title="Планируемая дата начала" className="glass-input" />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <input name="plannedEndDate" type="date" title="Планируемая дата завершения" className="glass-input" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Раздел 4: Масштаб влияния ── */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <p style={sectionTitle}>4. Масштаб влияния</p>
                <label className="glass-label">Масштаб влияния инициативы *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
                  {SCOPE_OPTIONS.map(opt => (
                    <label key={opt.value} style={optionRow}>
                      <input type="radio" name="scope" value={opt.value} required style={{ width: 16, height: 16, accentColor: "#C8973A", flexShrink: 0 }} />
                      <span style={optionText}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Раздел 5: Участники инициативы ── */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <p style={sectionTitle}>5. Участники инициативы</p>
                <label className="glass-label">Участвовали ли другие сотрудники в реализации инициативы? *</label>
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  {[{ value: "yes", label: "Да" }, { value: "no", label: "Нет" }].map(opt => (
                    <label key={opt.value} style={{ ...optionRow, flex: 1 }}>
                      <input
                        type="radio" name="hasParticipants" value={opt.value} required
                        onChange={() => setHasParticipants(opt.value)}
                        style={{ width: 16, height: 16, accentColor: "#C8973A", flexShrink: 0 }}
                      />
                      <span style={optionText}>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {hasParticipants === "yes" && (
                  <div style={{ marginTop: 14 }}>
                    <label className="glass-label">Укажите ФИО и подразделения участников *</label>
                    <textarea name="participants" required rows={3} placeholder="Иванов И.И. — отдел логистики; Петров П.П. — ИТ-отдел" className="glass-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                )}
              </div>

              {/* ── Раздел 6: Подтверждающие материалы ── */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <p style={sectionTitle}>6. Подтверждающие материалы</p>
                <div>
                  <label className="glass-label">Ссылка на папку с подтверждающими материалами</label>
                  <input name="materialsLink" type="url" placeholder="https://..." className="glass-input" />
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                    Загрузите документы, расчёты, презентации, фотографии или другие материалы в корпоративное облако и вставьте ссылку.
                  </p>
                </div>

                {/* Presentation upload (необязательно) */}
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "18px 0 10px" }}>
                  Либо загрузите файл напрямую — жюри сможет ознакомиться с материалами (необязательно)
                </p>
                <label style={{
                  display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                  border: presentationFile ? "2px solid rgba(200,151,58,0.5)" : "2px dashed rgba(255,255,255,0.15)",
                  borderRadius: 12, padding: "16px 20px", transition: "all 0.15s", marginBottom: 16,
                  background: presentationFile ? "rgba(200,151,58,0.06)" : "transparent",
                }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.ods"
                    title="Выберите файл"
                    onChange={handlePresentationChange}
                    style={{ display: "none" }}
                  />
                  <span style={{ fontSize: 28 }}>
                    {presentationFile
                      ? (presentationFile.name.endsWith('.pdf') ? '📄'
                        : presentationFile.name.match(/\.pptx?$/i) ? '📊'
                        : presentationFile.name.match(/\.docx?$/i) ? '📝'
                        : presentationFile.name.match(/\.xlsx?$/i) ? '📈'
                        : '📎')
                      : '📎'}
                  </span>
                  <div style={{ flex: 1 }}>
                    {presentationFile ? (
                      <>
                        <p style={{ color: "#C8973A", fontSize: 14, fontWeight: 600, margin: 0 }}>{presentationFile.name}</p>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>
                          {(presentationFile.size / (1024 * 1024)).toFixed(1)} МБ · Нажмите, чтобы изменить
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, margin: 0 }}>Нажмите, чтобы выбрать файл</p>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 }}>PDF, Word, PowerPoint, Excel, ODF · макс. 5 МБ</p>
                      </>
                    )}
                  </div>
                  {presentationFile && (
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); setPresentationFile(null); }}
                      style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, color: "#f87171", padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  )}
                </label>

                {/* Photo upload */}
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 10 }}>
                  Фотография сотрудника (необязательно)
                </p>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  {photoPreview && (
                    <img src={photoPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", cursor: "pointer", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 10, padding: "14px 18px", textAlign: "center" as const }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        title="Выберите фото"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                        {photoFile ? `✓ ${photoFile.name}` : "Нажмите, чтобы выбрать фото"}
                      </span>
                    </label>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>
                      JPG, PNG, WebP · макс. 5 МБ
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Раздел 7: Подтверждение ── */}
              <div className="glass-card" style={{ marginBottom: 16, border: "1px solid rgba(200,151,58,0.25)" }}>
                <p style={sectionTitle}>7. Подтверждение</p>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    title="Подтверждаю достоверность информации"
                    checked={confirmAccuracy}
                    onChange={(e) => setConfirmAccuracy(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "#C8973A" }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6 }}>
                    Подтверждаю достоверность предоставленной информации *
                  </span>
                </label>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginTop: 14 }}>
                  <input
                    type="checkbox"
                    title="Согласовано с руководителем"
                    checked={managerApproved}
                    onChange={(e) => setManagerApproved(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: "#C8973A" }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6 }}>
                    Согласовано с непосредственным руководителем *
                  </span>
                </label>
              </div>
            </>
          ) : (
            <>
              {/* ── Описание достижения (прочие номинации) ── */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <p style={sectionTitle}>2. Описание достижения</p>
                <label className="glass-label">Опишите ваш проект или достижение *</label>
                <textarea
                  name="projectText"
                  required
                  rows={6}
                  placeholder="Расскажите о проекте, его целях, результатах и вкладе в развитие компании..."
                  className="glass-input"
                  style={{ resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              {/* Supporting materials (прочие номинации) */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <p style={sectionTitle}>3. Подтверждающие материалы</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 10 }}>
                  Загрузите файл — жюри сможет ознакомиться с материалами (необязательно)
                </p>
                <label style={{
                  display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                  border: presentationFile ? "2px solid rgba(200,151,58,0.5)" : "2px dashed rgba(255,255,255,0.15)",
                  borderRadius: 12, padding: "16px 20px", transition: "all 0.15s", marginBottom: 16,
                  background: presentationFile ? "rgba(200,151,58,0.06)" : "transparent",
                }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.ods"
                    title="Выберите файл"
                    onChange={handlePresentationChange}
                    style={{ display: "none" }}
                  />
                  <span style={{ fontSize: 28 }}>
                    {presentationFile
                      ? (presentationFile.name.endsWith('.pdf') ? '📄'
                        : presentationFile.name.match(/\.pptx?$/i) ? '📊'
                        : presentationFile.name.match(/\.docx?$/i) ? '📝'
                        : presentationFile.name.match(/\.xlsx?$/i) ? '📈'
                        : '📎')
                      : '📎'}
                  </span>
                  <div style={{ flex: 1 }}>
                    {presentationFile ? (
                      <>
                        <p style={{ color: "#C8973A", fontSize: 14, fontWeight: 600, margin: 0 }}>{presentationFile.name}</p>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>
                          {(presentationFile.size / (1024 * 1024)).toFixed(1)} МБ · Нажмите, чтобы изменить
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, margin: 0 }}>Нажмите, чтобы выбрать файл</p>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 }}>PDF, Word, PowerPoint, Excel, ODF · макс. 5 МБ</p>
                      </>
                    )}
                  </div>
                  {presentationFile && (
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); setPresentationFile(null); }}
                      style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, color: "#f87171", padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  )}
                </label>

                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 10 }}>
                  Фотография сотрудника (необязательно)
                </p>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  {photoPreview && (
                    <img src={photoPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", cursor: "pointer", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 10, padding: "14px 18px", textAlign: "center" as const }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        title="Выберите фото"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                        {photoFile ? `✓ ${photoFile.name}` : "Нажмите, чтобы выбрать фото"}
                      </span>
                    </label>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>
                      JPG, PNG, WebP · макс. 5 МБ
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitDisabled}
            className="btn btn-primary"
            style={{ padding: "14px 36px", fontSize: 15, borderRadius: 12, opacity: submitDisabled ? 0.55 : 1, cursor: (loading || photoUploading || presentationUploading) ? "not-allowed" : "pointer" }}
          >
            {presentationUploading ? "Загрузка файла..." : photoUploading ? "Загрузка фото..." : loading ? "Отправка..." : "Отправить заявку"}
          </button>
        </>
      )}
    </form>
  );
}
