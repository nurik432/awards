'use client';
import { useEffect, useRef, useState } from 'react';
<<<<<<< HEAD
import { useSession } from 'next-auth/react';

export default function Topbar() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as string | undefined;
  const [menuOpen, setMenuOpen] = useState(false);

  let cabinetLink: { href: string; label: string } | null = null;
  if (status === 'authenticated') {
    if (role === 'ADMIN') cabinetLink = { href: '/admin', label: 'Админ-панель' };
    else if (role === 'JUDGE') cabinetLink = { href: '/jury', label: 'Панель жюри' };
    else cabinetLink = { href: '/cabinet', label: 'Мой кабинет' };
  }

  const close = () => setMenuOpen(false);

  return (
    <div className="site-topbar">
      {/* Логотип */}
=======

export default function Topbar() {
  return (
    <div className="site-topbar">
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/image_1.png" alt="Логотип Фаровон" />
        <div className="brand-copy">
          <span>Корпоративная премия</span>
          <strong>Farovon Awards</strong>
        </div>
      </div>
<<<<<<< HEAD

      {/* Навигация — скрыта на мобильном */}
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
      <nav className="topnav">
        <a href="#nominations">Номинации</a>
        <a href="#gallery">Галерея</a>
        <a href="#winners">Победители</a>
        <a href="#process">Процесс</a>
      </nav>
<<<<<<< HEAD

      {/* Кнопка входа + hamburger */}
      <div className="topbar-end">
        <div className="topbar-auth">
          {status === 'loading' ? null : cabinetLink ? (
            <>
              <span className="topbar-auth-name">{session?.user?.name}</span>
              <a href={cabinetLink.href} className="btn btn-primary btn-topbar">
                {cabinetLink.label}
              </a>
            </>
          ) : (
            <a href="/login" className="btn btn-primary btn-topbar">Войти</a>
          )}
        </div>

        {/* Hamburger button — только на мобильном */}
        <button
          type="button"
          className="topbar-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen ? 'true' : 'false'}
        >
          <span className={`hb-line ${menuOpen ? 'hb-open-1' : ''}`} />
          <span className={`hb-line ${menuOpen ? 'hb-open-2' : ''}`} />
          <span className={`hb-line ${menuOpen ? 'hb-open-3' : ''}`} />
        </button>
      </div>

      {/* Мобильное меню — разворачивается ниже */}
      {menuOpen && (
        <nav className="topnav-mobile">
          <a href="#nominations" onClick={close}>Номинации</a>
          <a href="#gallery" onClick={close}>Галерея</a>
          <a href="#winners" onClick={close}>Победители</a>
          <a href="#process" onClick={close}>Процесс</a>
          {cabinetLink && (
            <a href={cabinetLink.href} onClick={close} className="topnav-mobile-cabinet">
              → {cabinetLink.label}
            </a>
          )}
        </nav>
      )}
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
    </div>
  );
}

export function HeroSlider({ slides }: { slides: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="hero-slider">
      {slides.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`Слайд ${i + 1}`}
          className={i === activeIndex ? 'active' : ''}
        />
      ))}
    </div>
  );
}
