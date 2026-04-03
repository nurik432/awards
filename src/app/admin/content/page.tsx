import { prisma } from '@/lib/prisma';
import { updateSiteContent } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

// ── Структура всех редактируемых полей, сгруппированных по секциям ──
const CONTENT_SECTIONS = [
  {
    id: 'hero',
    label: '🎬 Hero-секция (баннер)',
    description: 'Главный баннер сайта — заголовок, описание и плашки.',
    fields: [
      { key: 'hero_badge', label: 'Плашка (badge)', placeholder: 'Годовые номинации и признание лучших сотрудников' },
      { key: 'hero_title', label: 'Заголовок', placeholder: 'Farovon Awards' },
      { key: 'hero_description', label: 'Описание', placeholder: 'Премиальный корпоративный сайт награждения...', textarea: true },
      { key: 'hero_photo_badge', label: 'Плашка на фото', placeholder: 'Итоги года • церемония признания' },
      { key: 'hero_btn_nominations', label: 'Кнопка «Номинации»', placeholder: 'Смотреть номинации' },
      { key: 'hero_btn_gallery', label: 'Кнопка «Галерея»', placeholder: 'Открыть галерею' },
      { key: 'hero_btn_winners', label: 'Кнопка «Победители»', placeholder: 'Победители прошлых лет' },
    ],
  },
  {
    id: 'info',
    label: '📋 Информационные карточки',
    description: 'Три карточки под баннером: «Кто участвует», «Кто определяет», «Главный принцип».',
    fields: [
      { key: 'info_1_title', label: 'Карточка 1 — Заголовок', placeholder: 'Кто участвует' },
      { key: 'info_1_text', label: 'Карточка 1 — Текст', placeholder: 'Описание...', textarea: true },
      { key: 'info_2_title', label: 'Карточка 2 — Заголовок', placeholder: 'Кто определяет победителей' },
      { key: 'info_2_text', label: 'Карточка 2 — Текст', placeholder: 'Описание...', textarea: true },
      { key: 'info_3_title', label: 'Карточка 3 — Заголовок', placeholder: 'Главный принцип' },
      { key: 'info_3_text', label: 'Карточка 3 — Текст', placeholder: 'Описание...', textarea: true },
    ],
  },
  {
    id: 'nominations',
    label: '🏆 Секция «Номинации»',
    description: 'Заголовок и подзаголовок блока номинаций.',
    fields: [
      { key: 'nom_kicker', label: 'Подзаголовок (kicker)', placeholder: 'Номинации' },
      { key: 'nom_title', label: 'Заголовок секции', placeholder: 'Основные категории премии' },
    ],
  },
  {
    id: 'gallery',
    label: '📸 Секция «Галерея»',
    description: 'Заголовок и подзаголовок блока галереи.',
    fields: [
      { key: 'gallery_kicker', label: 'Подзаголовок (kicker)', placeholder: 'Галерея' },
      { key: 'gallery_title', label: 'Заголовок секции', placeholder: 'Фото с прошлых мероприятий «Итоги года»' },
    ],
  },
  {
    id: 'winners',
    label: '🥇 Секция «Победители»',
    description: 'Заголовок и подзаголовок блока архива победителей.',
    fields: [
      { key: 'winners_kicker', label: 'Подзаголовок (kicker)', placeholder: 'Архив победителей' },
      { key: 'winners_title', label: 'Заголовок секции', placeholder: 'Победители и рекомендованные сотрудники по итогам 2025 года' },
      { key: 'winners_btn_toggle', label: 'Кнопка показа/скрытия', placeholder: 'Показать / скрыть победителей прошлых лет' },
    ],
  },
  {
    id: 'footer',
    label: '🔻 Подвал (Footer)',
    description: 'Тексты подвала сайта.',
    fields: [
      { key: 'footer_left', label: 'Левый текст', placeholder: '© 2026 Farovon Group — Все права защищены' },
      { key: 'footer_right', label: 'Правый текст', placeholder: 'Корпоративная премия «Farovon Awards»' },
    ],
  },
];

// ── Shared input styles ──────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '2px solid #e2e8f0',
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'border-color .2s, box-shadow .2s',
  outline: 'none',
};

export default async function AdminContentPage() {
  const allContent = await prisma.siteContent.findMany();
  const contentMap = Object.fromEntries(allContent.map((c) => [c.key, c.value]));

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* ── Header ───────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>✏️ Редактирование контента</h2>
        <p style={{ color: '#64748b', margin: '8px 0 0', lineHeight: 1.6 }}>
          Управление всеми текстами, заголовками и подписями на сайте.
          Изменения сразу отражаются на публичной части после сохранения.
        </p>
      </div>

      {/* ── All content sections ──────────  */}
      <form action={updateSiteContent}>
        {CONTENT_SECTIONS.map((section) => (
          <details
            key={section.id}
            className="white-panel"
            style={{ marginBottom: '16px', cursor: 'default' }}
            open={section.id === 'hero' || section.id === 'info'}
          >
            <summary
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '2px solid #f1f5f9',
                listStyle: 'none',
                userSelect: 'none',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                  {section.label}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  {section.description}
                </p>
              </div>
              <span style={{
                fontSize: '20px',
                color: '#94a3b8',
                transition: 'transform .2s',
                flexShrink: 0,
                marginLeft: '16px',
              }}>
                ▾
              </span>
            </summary>

            <div style={{ padding: '20px 24px' }}>
              {section.fields.map((field) => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#475569',
                      marginBottom: '6px',
                    }}
                  >
                    {field.label}
                    <span style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      fontWeight: 400,
                      fontFamily: 'monospace',
                      background: '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {field.key}
                    </span>
                  </label>
                  <input type="hidden" name="key" value={field.key} />
                  {field.textarea ? (
                    <textarea
                      name="value"
                      rows={3}
                      defaultValue={contentMap[field.key] || ''}
                      placeholder={field.placeholder}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      name="value"
                      defaultValue={contentMap[field.key] || ''}
                      placeholder={field.placeholder}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          </details>
        ))}

        {/* ── Sticky save button ────────── */}
        <div style={{
          position: 'sticky',
          bottom: '20px',
          zIndex: 10,
          padding: '16px 0',
        }}>
          <button
            type="submit"
            className="apply-btn"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(185, 28, 28, 0.3)',
            }}
          >
            💾 Сохранить все изменения
          </button>
        </div>
      </form>
    </div>
  );
}
