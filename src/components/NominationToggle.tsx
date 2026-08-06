'use client';

import { toggleNomination } from '@/app/admin/actions';
import { useState } from 'react';

export default function NominationToggle({ id, isActive }: { id: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleNomination(id, !isActive);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`adm-btn adm-btn-sm ${isActive ? 'adm-btn-danger' : 'adm-btn-ok'}`}
    >
      {loading ? '...' : (isActive ? 'Отключить' : 'Включить')}
    </button>
  );
}
