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
    >
      {loading ? '...' : (isActive ? 'Отключить' : 'Включить')}
    </button>
  );
}
