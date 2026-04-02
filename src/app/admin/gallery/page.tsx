import { prisma } from '@/lib/prisma';
import DeleteButton from '@/components/DeleteButton';
import GalleryUploadForm from '@/components/GalleryUploadForm';
import GalleryVisibilityToggle from '@/components/GalleryVisibilityToggle';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const items = await prisma.gallery.findMany({ orderBy: { orderIndex: 'asc' } });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '32px', color: '#111827', margin: 0 }}>Управление галереей</h2>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>
            Загружайте фото, управляйте видимостью. Изменения сразу отражаются на сайте.
          </p>
        </div>
        <a href="/admin" className="btn btn-secondary" style={{ color: '#7f1d1d', borderColor: '#7f1d1d' }}>
          К заявкам
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Upload form */}
        <div className="white-panel" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: '#7f1d1d' }}>Загрузить фото</h3>
          <GalleryUploadForm />
        </div>

        {/* Gallery items */}
        <div className="white-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #fecaca',
                  background: '#fff',
                  opacity: item.isVisible ? 1 : 0.5,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt || ''}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#7f1d1d', marginBottom: '4px' }}>
                    {item.alt || 'Без описания'}
                  </div>
                  {item.album && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{item.album}</div>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <GalleryVisibilityToggle id={item.id} isVisible={item.isVisible} />
                    <DeleteButton id={item.id} action="gallery" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              Фото ещё не добавлены.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
