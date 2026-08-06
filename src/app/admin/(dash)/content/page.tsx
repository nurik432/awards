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

export default async function AdminContentPage() {
  const allContent = await prisma.siteContent.findMany();
  const contentMap = Object.fromEntries(allContent.map((c) => [c.key, c.value]));

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Редактирование контента</h1>
          <p className="adm-page-sub">
            Управление всеми текстами, заголовками и подписями на сайте.
            Изменения сразу отражаются на публичной части после сохранения.
          </p>
        </div>
      </div>

      <form action={updateSiteContent}>
        {CONTENT_SECTIONS.map((section) => (
          <details
            key={section.id}
            className="adm-card adm-collapse"
            open={section.id === 'hero' || section.id === 'info'}
          >
            <summary className="adm-card-head adm-collapse-head">
              <div>
                <h2 className="adm-card-title">{section.label}</h2>
                <p className="adm-hint" style={{ margin: '3px 0 0' }}>{section.description}</p>
              </div>
              <span className="adm-collapse-chev" aria-hidden>▾</span>
            </summary>

            <div className="adm-card-body">
              {section.fields.map((field) => (
                <div key={field.key} className="adm-field">
                  <label className="adm-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {field.label}
                    <span className="adm-key">{field.key}</span>
                  </label>
                  <input type="hidden" name="key" value={field.key} />
                  {field.textarea ? (
                    <textarea
                      className="adm-textarea"
                      name="value"
                      rows={3}
                      defaultValue={contentMap[field.key] || ''}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      className="adm-input"
                      type="text"
                      name="value"
                      defaultValue={contentMap[field.key] || ''}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </details>
        ))}

        {/* ── Sticky save button ────────── */}
        <div className="adm-savebar">
          <button type="submit" className="adm-btn adm-btn-primary">
            💾 Сохранить все изменения
          </button>
        </div>
      </form>
    </>
  );
}
