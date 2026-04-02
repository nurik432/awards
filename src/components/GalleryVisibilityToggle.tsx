'use client';

import { toggleGalleryVisibility } from '@/app/admin/actions';

interface Props {
  id: string;
  isVisible: boolean;
}

export default function GalleryVisibilityToggle({ id, isVisible }: Props) {
  return (
    <button
      onClick={() => toggleGalleryVisibility(id, !isVisible)}
      className="btn btn-secondary"
      style={{
        padding: '6px 12px',
        fontSize: '11px',
        color: isVisible ? '#166534' : '#64748b',
        borderColor: isVisible ? '#166534' : '#64748b',
      }}
    >
      {isVisible ? '👁 Видно' : '🚫 Скрыто'}
    </button>
  );
}
