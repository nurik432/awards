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
<<<<<<< HEAD
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`adm-btn adm-btn-sm ${isActive ? 'adm-btn-danger' : 'adm-btn-ok'}`}
=======
    <button 
      onClick={handleToggle}
      disabled={loading}
      className="btn btn-secondary" 
      style={{ 
        padding: '8px 12px', 
        fontSize: '12px',
        background: isActive ? '#fff1f2' : '#f0fdf4',
        color: isActive ? '#be123c' : '#15803d',
        borderColor: isActive ? '#fecaca' : '#bbf7d0'
      }}
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
    >
      {loading ? '...' : (isActive ? 'Отключить' : 'Включить')}
    </button>
  );
}
