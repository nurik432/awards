'use client';

import { updateApplicationStatus, deleteApplication } from '@/app/admin/actions';
import { useState } from 'react';

type Application = {
  id: string;
  nomination: { title: string };
  status: string;
  submittedAt: Date;
  employeeData: string;
  formData: string;
};

export default function AdminApplicationRow({ app }: { app: Application }) {
  const [loading, setLoading] = useState(false);
  const employee = JSON.parse(app.employeeData);
  const content = JSON.parse(app.formData);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    await updateApplicationStatus(app.id, newStatus);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    setLoading(true);
    await deleteApplication(app.id);
    setLoading(false);
  };

  return (
    <tr key={app.id} style={{ opacity: loading ? 0.6 : 1 }}>
      <td style={{ padding: '15px' }}>
        <div style={{ fontWeight: 800 }}>{employee.name}</div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>{employee.position} | {employee.department}</div>
      </td>
      <td style={{ padding: '15px' }}>
        <div className="badge" style={{ background: '#7f1d1d', fontSize: '12px' }}>{app.nomination.title}</div>
      </td>
      <td style={{ padding: '15px' }}>
         <p style={{ fontSize: '14px', margin: 0 }}>{content.projectText?.substring(0, 80)}...</p>
      </td>
      <td style={{ padding: '15px' }}>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '999px', 
          fontSize: '11px', 
          fontWeight: 800,
          background: app.status === 'APPROVED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
          color: app.status === 'APPROVED' ? '#166534' : app.status === 'REJECTED' ? '#991b1b' : '#854d0e'
        }}>
          {app.status}
        </span>
      </td>
      <td style={{ padding: '15px', color: '#64748b', fontSize: '12px' }}>
        {new Date(app.submittedAt).toLocaleDateString()}
      </td>
      <td style={{ padding: '15px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => handleStatusChange('APPROVED')}
            disabled={loading || app.status === 'APPROVED'}
            className="btn btn-primary" 
            style={{ padding: '8px 12px', fontSize: '12px', background: '#dcfce7', color: '#166534' }}
          >
            Одобрить
          </button>
          <button 
            onClick={() => handleStatusChange('REJECTED')}
            disabled={loading || app.status === 'REJECTED'}
            className="btn btn-primary" 
            style={{ padding: '8px 12px', fontSize: '12px', background: '#fee2e2', color: '#991b1b' }}
          >
            Отказ
          </button>
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="btn btn-secondary" 
            style={{ padding: '8px 12px', fontSize: '12px', color: '#ef4444', borderColor: '#ef4444' }}
          >
            Удалить
          </button>
        </div>
      </td>
    </tr>
  );
}
