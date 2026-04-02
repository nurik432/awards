'use client';

import { deleteNomination, deleteWinner, deleteGalleryItem } from '@/app/admin/actions';

interface DeleteButtonProps {
  id: string;
  action: 'nomination' | 'winner' | 'gallery';
}

export default function DeleteButton({ id, action }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!confirm('Вы уверены? Это действие нельзя отменить.')) return;

    if (action === 'nomination') {
      await deleteNomination(id);
    } else if (action === 'winner') {
      await deleteWinner(id);
    } else if (action === 'gallery') {
      await deleteGalleryItem(id);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="btn btn-secondary"
      style={{ padding: '6px 12px', fontSize: '11px', color: '#ef4444', borderColor: '#ef4444' }}
    >
      Удалить
    </button>
  );
}
