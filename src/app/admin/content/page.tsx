import { prisma } from '@/lib/prisma';
import { updateSiteContent } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

const INFO_FIELDS = [
  { key: 'info_1_title', label: 'Карточка 1 — Заголовок', placeholder: 'Кто участвует' },
  { key: 'info_1_text', label: 'Карточка 1 — Текст', placeholder: 'Описание...', textarea: true },
  { key: 'info_2_title', label: 'Карточка 2 — Заголовок', placeholder: 'Кто определяет победителей' },
  { key: 'info_2_text', label: 'Карточка 2 — Текст', placeholder: 'Описание...', textarea: true },
  { key: 'info_3_title', label: 'Карточка 3 — Заголовок', placeholder: 'Главный принцип' },
  { key: 'info_3_text', label: 'Карточка 3 — Текст', placeholder: 'Описание...', textarea: true },
];

export default async function AdminContentPage() {
  const allContent = await prisma.siteContent.findMany();
  const contentMap = Object.fromEntries(allContent.map((c) => [c.key, c.value]));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>Редактирование контента</h2>
        <p style={{ color: '#64748b', margin: '8px 0 0' }}>
          Управление текстовыми блоками на главной странице. Изменения сразу отражаются на сайте.
        </p>
      </div>

      <div className="white-panel">
        <h3 style={{ marginTop: 0, color: '#7f1d1d', fontSize: '20px', borderBottom: '2px solid #fecaca', paddingBottom: '12px' }}>
          Секция «Кто участвует / Кто определяет / Главный принцип»
        </h3>

        <form action={updateSiteContent}>
          {INFO_FIELDS.map((field) => (
            <div key={field.key} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
                {field.label}
              </label>
              <input type="hidden" name="key" value={field.key} />
              {field.textarea ? (
                <textarea
                  name="value"
                  rows={3}
                  defaultValue={contentMap[field.key] || ''}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #fecaca',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              ) : (
                <input
                  type="text"
                  name="value"
                  defaultValue={contentMap[field.key] || ''}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #fecaca',
                    fontSize: '14px',
                  }}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="apply-btn"
            style={{ width: '100%', marginTop: '10px' }}
          >
            Сохранить изменения
          </button>
        </form>
      </div>
    </div>
  );
}
