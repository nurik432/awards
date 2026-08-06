'use client';

import { toggleGalleryVisibility } from '@/app/admin/actions';

interface Props {
  id: string;
  isVisible: boolean;
}

export default function GalleryVisibilityToggle({ id, isVisible }: Props) {
  return (
    <button
<<<<<<< HEAD
      type="button"
      onClick={() => toggleGalleryVisibility(id, !isVisible)}
      className={`adm-btn adm-btn-sm${isVisible ? ' adm-btn-ok' : ''}`}
=======
      onClick={() => toggleGalleryVisibility(id, !isVisible)}
      className="btn btn-secondary"
      style={{
        padding: '6px 12px',
        fontSize: '11px',
        color: isVisible ? '#166534' : '#64748b',
        borderColor: isVisible ? '#166534' : '#64748b',
      }}
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
    >
      {isVisible ? '👁 Видно' : '🚫 Скрыто'}
    </button>
  );
}
