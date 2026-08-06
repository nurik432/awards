import { prisma } from '@/lib/prisma';
import DeleteButton from '@/components/DeleteButton';
import GalleryUploadForm from '@/components/GalleryUploadForm';
import GalleryVisibilityToggle from '@/components/GalleryVisibilityToggle';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const items = await prisma.gallery.findMany({ orderBy: { orderIndex: 'asc' } });

  const visible = items.filter((i) => i.isVisible).length;
  const hidden = items.length - visible;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1 className="adm-page-title">Управление галереей</h1>
          <p className="adm-page-sub">
            Загружайте фото, управляйте видимостью. Изменения сразу отражаются на сайте.
          </p>
        </div>
      </div>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-label">Всего фото</div>
          <div className="adm-stat-value">{items.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Видно на сайте</div>
          <div className={`adm-stat-value${visible ? ' is-ok' : ''}`}>{visible}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Скрыто</div>
          <div className={`adm-stat-value${hidden ? ' is-warn' : ''}`}>{hidden}</div>
        </div>
      </div>

      <div className="adm-grid-2">
        {/* Upload form */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Загрузить фото</h2>
          </div>
          <div className="adm-card-body">
            <GalleryUploadForm />
          </div>
        </div>

        {/* Gallery items */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h2 className="adm-card-title">Фотографии</h2>
            <span className="adm-badge adm-badge-neutral adm-badge-plain">{items.length}</span>
          </div>

          {items.length === 0 ? (
            <div className="adm-empty">
              <span className="adm-empty-icon" aria-hidden>🖼</span>
              Фото ещё не добавлены.
            </div>
          ) : (
            <div className="adm-card-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 14,
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="adm-card"
                    style={{ overflow: 'hidden', opacity: item.isVisible ? 1 : 0.55 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.alt || ''}
                      style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                    />
                    <div className="adm-card-body" style={{ padding: 12 }}>
                      <div className="adm-td-strong">{item.alt || 'Без описания'}</div>
                      {item.album && <div className="adm-td-sub">{item.album}</div>}
                      <div className="adm-actions" style={{ marginTop: 10 }}>
                        <GalleryVisibilityToggle id={item.id} isVisible={item.isVisible} />
                        <DeleteButton id={item.id} action="gallery" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
