'use client';

import { toggleGalleryVisibility } from '@/app/admin/actions';

interface Props {
  id: string;
  isVisible: boolean;
}

export default function GalleryVisibilityToggle({ id, isVisible }: Props) {
  return (
    <button
      type="button"
      onClick={() => toggleGalleryVisibility(id, !isVisible)}
      className={`adm-btn adm-btn-sm${isVisible ? ' adm-btn-ok' : ''}`}
    >
      {isVisible ? '👁 Видно' : '🚫 Скрыто'}
    </button>
  );
}
