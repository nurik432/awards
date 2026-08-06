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
      type="button"
      onClick={handleDelete}
      className="adm-btn adm-btn-sm adm-btn-danger"
    >
      Удалить
    </button>
  );
}
