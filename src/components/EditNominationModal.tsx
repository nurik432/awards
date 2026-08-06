"use client";
import { useState } from "react";
import { updateNomination } from "@/app/admin/actions";

type Nomination = {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  description: string;
  criteria: string;
  steps: string;
  tags: string;
  googleFormUrl: string | null;
  formType: string;
  acceptsApplications: boolean;
};

function parseJsonArray(json: string): string {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.join("\n") : "";
  } catch {
    return "";
  }
}

export default function EditNominationModal({ nomination }: { nomination: Nomination }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await updateNomination(fd);
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="adm-btn adm-btn-sm"
      >
        Редактировать
      </button>

      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(17,24,39,0.45)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="adm-card"
            style={{ width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Header */}
            <div
              className="adm-card-head"
              style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}
            >
              <h3 className="adm-card-title">Редактировать номинацию</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="adm-btn adm-btn-icon"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="adm-card-body">
              <input type="hidden" name="id" value={nomination.id} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`edit-title-${nomination.id}`}>Название *</label>
                  <input className="adm-input" id={`edit-title-${nomination.id}`} name="title" required defaultValue={nomination.title} />
                </div>
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`edit-slug-${nomination.id}`}>Slug</label>
                  <input className="adm-input" id={`edit-slug-${nomination.id}`} name="slug" required defaultValue={nomination.slug} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 14 }}>
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`edit-icon-${nomination.id}`}>Иконка</label>
                  <input className="adm-input" id={`edit-icon-${nomination.id}`} name="icon" defaultValue={nomination.icon ?? "🏆"} style={{ textAlign: "center", fontSize: 18 }} />
                </div>
                <div className="adm-field">
                  <label className="adm-label" htmlFor={`edit-formType-${nomination.id}`}>Тип формы</label>
                  <select className="adm-select" id={`edit-formType-${nomination.id}`} name="formType" defaultValue={nomination.formType}>
                    <option value="basic">Базовая</option>
                    <option value="innovator">Новатор</option>
                    <option value="manager">Руководитель</option>
                  </select>
                </div>
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor={`edit-description-${nomination.id}`}>Описание *</label>
                <textarea className="adm-textarea" id={`edit-description-${nomination.id}`} name="description" required rows={3} defaultValue={nomination.description} />
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor={`edit-criteria-${nomination.id}`}>Критерии (по одному на строку)</label>
                <textarea className="adm-textarea" id={`edit-criteria-${nomination.id}`} name="criteria" rows={4} defaultValue={parseJsonArray(nomination.criteria)} />
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor={`edit-steps-${nomination.id}`}>Этапы участия (по одному на строку)</label>
                <textarea className="adm-textarea" id={`edit-steps-${nomination.id}`} name="steps" rows={3} defaultValue={parseJsonArray(nomination.steps)} />
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor={`edit-tags-${nomination.id}`}>Кто может участвовать (по одному на строку)</label>
                <textarea className="adm-textarea" id={`edit-tags-${nomination.id}`} name="tags" rows={3} defaultValue={parseJsonArray(nomination.tags)} />
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor={`edit-googleFormUrl-${nomination.id}`}>Ссылка на Google Form (опционально)</label>
                <input className="adm-input" id={`edit-googleFormUrl-${nomination.id}`} name="googleFormUrl" type="url" defaultValue={nomination.googleFormUrl ?? ""}
                  placeholder="https://docs.google.com/forms/..." />
              </div>

              <div className="adm-field">
                <div className="adm-checkline">
                  <input
                    type="checkbox"
                    name="acceptsApplications"
                    id={`edit-acceptsApplications-${nomination.id}`}
                    defaultChecked={nomination.acceptsApplications}
                    style={{ width: 16, height: 16, accentColor: "#b91c1c", cursor: "pointer" }}
                  />
                  <label htmlFor={`edit-acceptsApplications-${nomination.id}`} style={{ cursor: "pointer" }}>
                    Принимать заявки (показывать кнопку «Подать заявку»)
                  </label>
                </div>
              </div>

              <div className="adm-actions">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="adm-btn"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="adm-btn adm-btn-primary"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
