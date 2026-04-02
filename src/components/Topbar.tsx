'use client';
import { useEffect, useRef, useState } from 'react';

export default function Topbar() {
  return (
    <div className="site-topbar">
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/image_1.png" alt="Логотип Фаровон" />
        <div className="brand-copy">
          <span>Корпоративная премия</span>
          <strong>Farovon Awards</strong>
        </div>
      </div>
      <nav className="topnav">
        <a href="#nominations">Номинации</a>
        <a href="#gallery">Галерея</a>
        <a href="#winners">Победители</a>
        <a href="#process">Процесс</a>
      </nav>
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
