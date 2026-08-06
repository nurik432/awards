/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect } from 'react';

export default function ClientHome({ html }: { html: string }) {
  useEffect(() => {
    // Slider Logic
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slider img');
    let interval: NodeJS.Timeout | undefined;
    if (slides.length > 0) {
      interval = setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
      }, 4000);
    }

    // Assign global toggle functions
    (window as any).toggleWinners = function(e: Event) {
      e.preventDefault();
      const winners = document.getElementById('winners-hidden');
      const btn = document.getElementById('toggle-winners-btn');
      if (winners && btn) {
        if (winners.style.display === 'grid' || winners.style.display === 'block') {
          winners.style.display = 'none';
          btn.textContent = 'Показать всех победителей';
        } else {
          winners.style.display = 'grid'; // because it's gallery-grid
          btn.textContent = 'Скрыть';
        }
      }
    };

    (window as any).showWinnerModal = function(imgSrc: string, name: string, dept: string, nom: string) {
      const img = document.getElementById('modal-img') as HTMLImageElement;
      if (img) img.src = imgSrc;
      const elName = document.getElementById('modal-name');
      if (elName) elName.textContent = name;
      const elDept = document.getElementById('modal-dept');
      if (elDept) elDept.textContent = dept;
      const elNom = document.getElementById('modal-nom');
      if (elNom) elNom.textContent = nom;
      
      const modal = document.getElementById('winner-modal');
      if (modal) modal.classList.add('open');
    };

    (window as any).closeModal = function() {
      const modal = document.getElementById('winner-modal');
      if (modal) modal.classList.remove('open');
    };

    return () => clearInterval(interval);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
