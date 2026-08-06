'use client';
import { useState } from 'react';

interface Nomination {
  id: string;
  slug: string;
  title: string;
  formType: string;
}

interface ApplyFormProps {
  nominations: Nomination[];
  preselectedId?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'reduce_time',    label: 'Сокращение сроков выполнения работ и автоматизация процессов' },
  { value: 'reduce_errors',  label: 'Снижение количества ошибок / дефектов' },
  { value: 'productivity',   label: 'Рост производительности труда' },
  { value: 'direct_savings', label: 'Прямая экономия затрат' },
  { value: 'reduce_cost',    label: 'Снижение себестоимости' },
];
const STATUS_OPTIONS = [
  { value: 'done',        label: 'Инициатива реализована' },
  { value: 'in_progress', label: 'Инициатива находится в процессе внедрения' },
  { value: 'planned',     label: 'Инициатива планируется к реализации' },
];
const SCOPE_OPTIONS = [
  { value: 'department', label: 'В рамках отдела' },
  { value: 'division',   label: 'В рамках подразделения' },
  { value: 'multi',      label: 'На уровне нескольких подразделений' },
  { value: 'company',    label: 'На уровне компании' },
];

const MAX_UPLOAD_MB = 5;

const SECTION_HEAD: React.CSSProperties = {
  marginTop: 24, marginBottom: 6, paddingBottom: 6, borderBottom: '2px solid #fecaca',
};
const SECTION_LABEL: React.CSSProperties = {
  color: '#7f1d1d', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.07em',
};
const RADIO_STYLE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
  padding: '11px 14px', borderRadius: 12,
  border: '1px solid #fecaca', marginBottom: 8, background: '#fff',
};
const CHECK_STYLE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
  padding: '11px 14px', borderRadius: 12,
  border: '1px solid #fecaca', marginBottom: 8, background: '#fff',
};

const FILE_AREA_STYLE = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
  border: active ? '2px solid #dc2626' : '2px dashed #fecaca',
  borderRadius: 14, padding: '16px 18px',
  background: active ? '#fef2f2' : '#fff', transition: 'all 0.15s',
});

export default function ApplyForm({ nominations, preselectedId }: ApplyFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [implStatus, setImplStatus] = useState('');
  const [hasParticipants, setHasParticipants] = useState('');
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [managerApproved, setManagerApproved] = useState(false);
  const [selectedNom, setSelectedNom] = useState<Nomination | null>(
    () => nominations.find(n => n.id === preselectedId) ?? null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [presentationUploading, setPresentationUploading] = useState(false);

  const isInnovator = selectedNom?.formType === 'innovator';

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`Фото слишком большое (макс. ${MAX_UPLOAD_MB} МБ). Выберите файл поменьше.`);
      e.target.value = '';
      setPhotoFile(null); setPhotoPreview(null);
      return;
    }
    setError('');
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
      e.target.value = '';
      setPresentationFile(null);
      return;
    }
    setError('');
    setPresentationFile(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (isInnovator) {
      if (fd.getAll('category').length === 0) {
        setError('Выберите хотя бы одну категорию инициативы');
        return;
      }
      if (!confirmAccuracy || !managerApproved) {
        setError('Необходимо подтвердить достоверность информации и согласование с руководителем');
        return;
      }
    }
    setError('');
    setLoading(true);

    // Upload photo
    let photoUrl: string | null = null;
    if (photoFile) {
      setPhotoUploading(true);
      const up = new FormData();
      up.append('file', photoFile);
      const r = await fetch('/api/upload', { method: 'POST', body: up });
      const j = await r.json();
      setPhotoUploading(false);
      if (!r.ok) { setError(j.error ?? 'Ошибка загрузки фото'); setLoading(false); return; }
      photoUrl = j.url;
    }

    // Upload presentation
    let presentationUrl: string | null = null;
    let presentationName: string | null = null;
    if (presentationFile) {
      setPresentationUploading(true);
      const up = new FormData();
      up.append('file', presentationFile);
      const r = await fetch('/api/upload/presentation', { method: 'POST', body: up });
      const j = await r.json();
      setPresentationUploading(false);
      if (!r.ok) { setError(j.error ?? 'Ошибка загрузки файла'); setLoading(false); return; }
      presentationUrl = j.url;
      presentationName = j.originalName;
    }

    const body = {
      nominationSlug:  fd.get('nominationSlug'),
      nominationTitle: selectedNom?.title,
      name:            fd.get('name'),
      email:           fd.get('email'),
      position:        fd.get('position'),
      department:      fd.get('department'),
      phone:           fd.get('phone'),
      photoUrl,
      presentationUrl,
      presentationName,
      ...(isInnovator ? {
        managerName:          fd.get('managerName'),
        projectName:          fd.get('projectName'),
        projectDescription:   fd.get('projectDescription'),
        category:             fd.getAll('category'),
        implementationStatus: fd.get('implementationStatus'),
        implementationPlace:  fd.get('implementationPlace'),
        problemsSolved:       fd.get('problemsSolved'),
        resultsSummary:       fd.get('resultsSummary'),
        // Если «Инициатива реализована»
        startDate:            fd.get('startDate'),
        endDate:              fd.get('endDate'),
        actualResults:        fd.get('actualResults'),
        baselineValue:        fd.get('baselineValue'),
        actualValue:          fd.get('actualValue'),
        achievedEffect:       fd.get('achievedEffect'),
        calcMethod:           fd.get('calcMethod'),
        // Если «Планируется» или «В процессе»
        expectedEffect:       fd.get('expectedEffect'),
        expectedSavings:      fd.get('expectedSavings'),
        effectJustification:  fd.get('effectJustification'),
        plannedStartDate:     fd.get('plannedStartDate'),
        plannedEndDate:       fd.get('plannedEndDate'),
        // Раздел 4–7
        scope:                fd.get('scope'),
        hasParticipants:      fd.get('hasParticipants'),
        participants:         fd.get('participants'),
        materialsLink:        fd.get('materialsLink'),
        confirmAccuracy,
        managerApproved,
      } : {
        projectText: fd.get('projectText'),
      }),
    };

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Ошибка отправки');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="form-panel">
        <div className="form-inner" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#7f1d1d', marginBottom: 8 }}>Заявка успешно отправлена!</h2>
          <p style={{ color: '#64748b', marginBottom: 28 }}>
            Ваша заявка зарегистрирована и будет рассмотрена комиссией.
          </p>
          <a className="apply-btn" href="/">Вернуться на главную</a>
        </div>
      </div>
    );
  }

  const submitDisabled = loading || photoUploading || presentationUploading
    || (isInnovator && (!confirmAccuracy || !managerApproved));

  return (
    <div className="form-panel">
      <div className="form-inner">
        <form onSubmit={handleSubmit}>

          {/* ── Выбор номинации ── */}
          <div className="form-field">
            <label htmlFor="nominationSlug">Номинация *</label>
            <select
              name="nominationSlug"
              id="nominationSlug"
              required
              value={selectedNom?.slug ?? ''}
              onChange={e => {
                setSelectedNom(nominations.find(n => n.slug === e.target.value) ?? null);
                setImplStatus(''); setHasParticipants('');
                setConfirmAccuracy(false); setManagerApproved(false);
              }}
            >
              <option value="">— Выберите номинацию —</option>
              {nominations.map(n => (
                <option key={n.id} value={n.slug}>{n.title}</option>
              ))}
            </select>
          </div>

          {selectedNom && (
            <>
              {/* ══ Раздел 1: Информация о заявителе ══ */}
              <div style={SECTION_HEAD}>
                <span style={SECTION_LABEL}>1. Информация о заявителе</span>
              </div>
              <div className="form-grid" style={{ marginTop: 14 }}>
                <div className="form-field">
                  <label htmlFor="name">ФИО сотрудника *</label>
                  <input type="text" id="name" name="name" required placeholder="Иванов Иван Иванович" />
                </div>
                <div className="form-field">
                  <label htmlFor="position">Должность *</label>
                  <input type="text" id="position" name="position" required placeholder="Инженер / Менеджер" />
                </div>
                <div className="form-field">
                  <label htmlFor="department">Подразделение / отдел *</label>
                  <input type="text" id="department" name="department" required placeholder="Farovon Telecom" />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Контактный номер телефона *</label>
                  <input type="text" id="phone" name="phone" required placeholder="+992 XX XXX-XX-XX" />
                </div>
                {isInnovator && (
                  <div className="form-field">
                    <label htmlFor="managerName">ФИО непосредственного руководителя *</label>
                    <input type="text" id="managerName" name="managerName" required placeholder="Иванов Иван Иванович" />
                  </div>
                )}
                <div className="form-field full">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" placeholder="example@farovon.com" />
                </div>
              </div>

              {isInnovator ? (
                <>
                  {/* ══ Раздел 2: Информация об инициативе ══ */}
                  <div style={SECTION_HEAD}>
                    <span style={SECTION_LABEL}>2. Информация об инициативе</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                    <div className="form-field">
                      <label>Название инициативы / проекта *</label>
                      <input name="projectName" required placeholder="Краткое название вашей инициативы или проекта" />
                    </div>
                    <div className="form-field">
                      <label>
                        Опишите суть инициативы *{' '}
                        <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>
                          — что внедрено или планируется, в чём идея и какую проблему решает
                        </span>
                      </label>
                      <textarea name="projectDescription" required rows={4} placeholder="Опишите суть вашей инициативы..." style={{ resize: 'vertical' }} />
                    </div>
                    <div className="form-field">
                      <label>Категория инициативы *</label>
                      <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 10px' }}>Можно выбрать несколько вариантов</p>
                      {CATEGORY_OPTIONS.map(opt => (
                        <label key={opt.value} style={CHECK_STYLE}>
                          <input type="checkbox" name="category" value={opt.value} style={{ width: 16, height: 16, accentColor: '#dc2626' }} />
                          <span style={{ fontSize: 14, color: '#1e293b' }}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ══ Раздел 3: Реализация инициативы ══ */}
                  <div style={SECTION_HEAD}>
                    <span style={SECTION_LABEL}>3. Реализация инициативы</span>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div className="form-field" style={{ marginBottom: 14 }}>
                      <label>Статус реализации инициативы *</label>
                      <div style={{ marginTop: 6 }}>
                        {STATUS_OPTIONS.map(opt => (
                          <label key={opt.value} style={RADIO_STYLE}>
                            <input
                              type="radio" name="implementationStatus" value={opt.value} required
                              onChange={() => setImplStatus(opt.value)}
                              style={{ width: 16, height: 16, accentColor: '#dc2626' }}
                            />
                            <span style={{ fontSize: 14, color: '#1e293b' }}>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: 14 }}>
                      <label>Где реализована или планируется к реализации инициатива? *</label>
                      <textarea name="implementationPlace" required rows={2} placeholder="Например: отдел логистики, завод Farovon-1" style={{ resize: 'vertical' }} />
                    </div>
                    <div className="form-field" style={{ marginBottom: 14 }}>
                      <label>Какие задачи или проблемы решает инициатива? *</label>
                      <textarea name="problemsSolved" required rows={3} placeholder="Опишите задачи или проблемы, которые решает инициатива..." style={{ resize: 'vertical' }} />
                    </div>
                    <div className="form-field" style={{ marginBottom: 14 }}>
                      <label>Какие результаты получены или ожидаются от реализации инициативы? *</label>
                      <textarea name="resultsSummary" required rows={3} placeholder="Опишите полученные или ожидаемые результаты..." style={{ resize: 'vertical' }} />
                    </div>

                    {/* Блок для «Инициатива реализована» */}
                    {implStatus === 'done' && (
                      <div style={{ padding: '16px 18px', background: '#fff7f7', border: '1px solid #fee2e2', borderRadius: 14, marginBottom: 6 }}>
                        <p style={{ color: '#991b1b', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Заполняется, если инициатива уже реализована</p>
                        <div className="form-grid">
                          <div className="form-field">
                            <label>Дата начала реализации</label>
                            <input name="startDate" type="date" title="Дата начала реализации" />
                          </div>
                          <div className="form-field">
                            <label>Дата завершения реализации</label>
                            <input name="endDate" type="date" title="Дата завершения реализации" />
                          </div>
                        </div>
                        <div className="form-field" style={{ marginTop: 14 }}>
                          <label>Опишите фактические результаты внедрения</label>
                          <textarea name="actualResults" rows={3} placeholder="Фактические результаты внедрения..." style={{ resize: 'vertical' }} />
                        </div>
                        <div className="form-grid" style={{ marginTop: 14 }}>
                          <div className="form-field">
                            <label>Базовое значение показателя (до внедрения)</label>
                            <input name="baselineValue" placeholder="Например: 100 ч / мес" />
                          </div>
                          <div className="form-field">
                            <label>Фактическое значение показателя (после внедрения)</label>
                            <input name="actualValue" placeholder="Например: 60 ч / мес" />
                          </div>
                        </div>
                        <div className="form-field" style={{ marginTop: 14 }}>
                          <label>Достигнутый эффект (%) или сумма экономии</label>
                          <input name="achievedEffect" placeholder="Например: −40% или 250 000 сомони" />
                        </div>
                        <div className="form-field" style={{ marginTop: 14 }}>
                          <label>Опишите методику расчёта эффекта</label>
                          <textarea name="calcMethod" rows={3} placeholder="Как рассчитан эффект..." style={{ resize: 'vertical' }} />
                        </div>
                      </div>
                    )}

                    {/* Блок для «Планируется» или «В процессе внедрения» */}
                    {(implStatus === 'planned' || implStatus === 'in_progress') && (
                      <div style={{ padding: '16px 18px', background: '#fff7f7', border: '1px solid #fee2e2', borderRadius: 14, marginBottom: 6 }}>
                        <p style={{ color: '#991b1b', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Заполняется, если инициатива планируется или в процессе внедрения</p>
                        <div className="form-grid">
                          <div className="form-field">
                            <label>Ожидаемый эффект (%)</label>
                            <input name="expectedEffect" placeholder="Например: −30%" />
                          </div>
                          <div className="form-field">
                            <label>Ожидаемая экономия (если применимо)</label>
                            <input name="expectedSavings" placeholder="Например: 150 000 сомони / год" />
                          </div>
                        </div>
                        <div className="form-field" style={{ marginTop: 14 }}>
                          <label>Обоснование ожидаемого эффекта</label>
                          <textarea name="effectJustification" rows={3} placeholder="На чём основаны ожидания..." style={{ resize: 'vertical' }} />
                        </div>
                        <div className="form-grid" style={{ marginTop: 14 }}>
                          <div className="form-field">
                            <label>Планируемая дата начала</label>
                            <input name="plannedStartDate" type="date" title="Планируемая дата начала" />
                          </div>
                          <div className="form-field">
                            <label>Планируемая дата завершения</label>
                            <input name="plannedEndDate" type="date" title="Планируемая дата завершения" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ══ Раздел 4: Масштаб влияния ══ */}
                  <div style={SECTION_HEAD}>
                    <span style={SECTION_LABEL}>4. Масштаб влияния</span>
                  </div>
                  <div className="form-field" style={{ marginTop: 14 }}>
                    <label>Масштаб влияния инициативы *</label>
                    <div style={{ marginTop: 6 }}>
                      {SCOPE_OPTIONS.map(opt => (
                        <label key={opt.value} style={RADIO_STYLE}>
                          <input type="radio" name="scope" value={opt.value} required style={{ width: 16, height: 16, accentColor: '#dc2626' }} />
                          <span style={{ fontSize: 14, color: '#1e293b' }}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ══ Раздел 5: Участники инициативы ══ */}
                  <div style={SECTION_HEAD}>
                    <span style={SECTION_LABEL}>5. Участники инициативы</span>
                  </div>
                  <div className="form-field" style={{ marginTop: 14 }}>
                    <label>Участвовали ли другие сотрудники в реализации инициативы? *</label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                      {[{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }].map(opt => (
                        <label key={opt.value} style={{ ...RADIO_STYLE, flex: 1, marginBottom: 0 }}>
                          <input
                            type="radio" name="hasParticipants" value={opt.value} required
                            onChange={() => setHasParticipants(opt.value)}
                            style={{ width: 16, height: 16, accentColor: '#dc2626' }}
                          />
                          <span style={{ fontSize: 14, color: '#1e293b' }}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {hasParticipants === 'yes' && (
                      <div style={{ marginTop: 14 }}>
                        <label>Укажите ФИО и подразделения участников *</label>
                        <textarea name="participants" required rows={3} placeholder="Иванов И.И. — отдел логистики; Петров П.П. — ИТ-отдел" style={{ resize: 'vertical' }} />
                      </div>
                    )}
                  </div>

                  {/* ══ Раздел 6: Подтверждающие материалы ══ */}
                  <div style={SECTION_HEAD}>
                    <span style={SECTION_LABEL}>6. Подтверждающие материалы</span>
                  </div>
                  <div className="form-field" style={{ marginTop: 14 }}>
                    <label>Ссылка на папку с подтверждающими материалами</label>
                    <input name="materialsLink" type="url" placeholder="https://..." />
                    <div className="form-note">
                      Загрузите документы, расчёты, презентации, фотографии или другие материалы
                      в корпоративное облако и вставьте ссылку.
                    </div>
                  </div>

                  {/* Загрузка файла */}
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 13, marginBottom: 8 }}>
                      Либо загрузите файл напрямую (PDF, Word, Excel, PowerPoint) — необязательно
                    </p>
                    <label style={FILE_AREA_STYLE(!!presentationFile)}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.ods"
                        title="Выберите файл"
                        onChange={handlePresentationChange}
                        style={{ display: 'none' }}
                      />
                      <span style={{ fontSize: 26 }}>
                        {presentationFile
                          ? (presentationFile.name.endsWith('.pdf') ? '📄'
                            : presentationFile.name.match(/\.pptx?$/i) ? '📊'
                            : presentationFile.name.match(/\.docx?$/i) ? '📝'
                            : '📎')
                          : '📎'}
                      </span>
                      <div style={{ flex: 1 }}>
                        {presentationFile ? (
                          <>
                            <p style={{ color: '#dc2626', fontSize: 14, fontWeight: 600, margin: 0 }}>{presentationFile.name}</p>
                            <p style={{ color: '#9ca3af', fontSize: 12, margin: '2px 0 0' }}>
                              {(presentationFile.size / (1024 * 1024)).toFixed(1)} МБ · Нажмите, чтобы изменить
                            </p>
                          </>
                        ) : (
                          <>
                            <p style={{ color: '#64748b', fontSize: 14, fontWeight: 600, margin: 0 }}>Нажмите, чтобы выбрать файл</p>
                            <p style={{ color: '#9ca3af', fontSize: 12, margin: '2px 0 0' }}>PDF, Word, PowerPoint, Excel · макс. 5 МБ</p>
                          </>
                        )}
                      </div>
                      {presentationFile && (
                        <button
                          type="button"
                          onClick={e => { e.preventDefault(); setPresentationFile(null); }}
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      )}
                    </label>
                  </div>

                  {/* Загрузка фото */}
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 13, marginBottom: 8 }}>
                      Фотография сотрудника — необязательно
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {photoPreview && (
                        <img src={photoPreview} alt="preview" style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '2px solid #fecaca' }} />
                      )}
                      <label style={{ flex: 1, display: 'block', cursor: 'pointer', border: '2px dashed #fecaca', borderRadius: 12, padding: '14px 18px', textAlign: 'center' as const }}>
                        <input type="file" accept="image/jpeg,image/png,image/webp" title="Выберите фото" onChange={handlePhotoChange} style={{ display: 'none' }} />
                        <span style={{ color: '#64748b', fontSize: 13 }}>
                          {photoFile ? `✓ ${photoFile.name}` : 'Нажмите, чтобы выбрать фото'}
                        </span>
                      </label>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 6 }}>JPG, PNG, WebP · макс. 5 МБ</p>
                  </div>

                  {/* ══ Раздел 7: Подтверждение ══ */}
                  <div style={{ ...SECTION_HEAD, marginTop: 28 }}>
                    <span style={SECTION_LABEL}>7. Подтверждение</span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginTop: 14, padding: '14px 16px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                    <input
                      type="checkbox"
                      title="Подтверждаю достоверность информации"
                      checked={confirmAccuracy}
                      onChange={e => setConfirmAccuracy(e.target.checked)}
                      style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: '#dc2626' }}
                    />
                    <span style={{ color: '#7f1d1d', fontSize: 13, lineHeight: 1.65 }}>
                      Подтверждаю достоверность предоставленной информации *
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginTop: 10, padding: '14px 16px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                    <input
                      type="checkbox"
                      title="Согласовано с руководителем"
                      checked={managerApproved}
                      onChange={e => setManagerApproved(e.target.checked)}
                      style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: '#dc2626' }}
                    />
                    <span style={{ color: '#7f1d1d', fontSize: 13, lineHeight: 1.65 }}>
                      Согласовано с непосредственным руководителем *
                    </span>
                  </label>
                </>
              ) : (
                /* ── Простая форма для других номинаций ── */
                <>
                  <div style={SECTION_HEAD}>
                    <span style={SECTION_LABEL}>2. Описание достижения</span>
                  </div>
                  <div className="form-field" style={{ marginTop: 14 }}>
                    <label htmlFor="projectText">Обоснование / Описание проекта *</label>
                    <textarea
                      id="projectText"
                      name="projectText"
                      rows={6}
                      required
                      placeholder="Опишите ваши достижения и причину выдвижения на эту номинацию..."
                      style={{ resize: 'vertical' }}
                    />
                    <div className="form-note">
                      <strong>Примечание:</strong> Расскажите подробно о вашем вкладе. Если есть подтверждающие
                      документы, укажите их в описании или передайте HR-партнёру.
                    </div>
                  </div>
                </>
              )}

              {/* ── Ошибка ── */}
              {error && (
                <div className="form-note" style={{ marginTop: 14, color: '#dc2626', borderColor: '#dc2626', background: '#fef2f2' }}>
                  {error}
                </div>
              )}

              {/* ── Отправка ── */}
              <div className="submit-row" style={{ marginTop: 28 }}>
                <a className="btn btn-secondary" href="/">Отмена</a>
                <button
                  type="submit"
                  className="apply-btn"
                  disabled={submitDisabled}
                  style={{ opacity: submitDisabled ? 0.6 : 1 }}
                >
                  {presentationUploading ? 'Загрузка файла...'
                    : photoUploading ? 'Загрузка фото...'
                    : loading ? 'Отправка...'
                    : 'Отправить заявку'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
