interface GalleryItem {
  src: string;
  label: string;
}

interface GalleryProps {
  items: GalleryItem[];
  kicker?: string;
  title?: string;
}

export default function Gallery({ items, kicker, title }: GalleryProps) {
  return (
    <section id="gallery" className="wrapper">
      <div className="section-title">
        <div className="kicker">{kicker || 'Галерея'}</div>
        <h2>{title || 'Фото с прошлых мероприятий «Итоги года»'}</h2>
      </div>
      {items.length === 0 ? (
        <div className="white-panel" style={{ textAlign: 'center', padding: '60px', color: '#7f1d1d' }}>
          Фото ещё не добавлены. Загрузите их через админ-панель.
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map((item) => (
            <div key={item.src} className="gallery-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.label} />
              <div className="gallery-label">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
