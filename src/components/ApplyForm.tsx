'use client';
import { useState } from 'react';

interface Nomination {
  id: string;
  slug: string;
  title: string;
}

interface ApplyFormProps {
  nominations: Nomination[];
}

export default function ApplyForm({ nominations }: ApplyFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const selectedNom = nominations.find((n) => n.slug === formData.get('nominationSlug'));

    const data = {
      nominationSlug: formData.get('nominationSlug'),
      nominationTitle: selectedNom?.title || formData.get('nominationSlug'),
      name: formData.get('name'),
      email: formData.get('email'),
      department: formData.get('department'),
      position: formData.get('position'),
      phone: formData.get('phone'),
      projectText: formData.get('projectText'),
    };

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-panel">
        <div className="form-inner">
          <div className="success-msg" style={{ display: 'block', textAlign: 'center' }}>
            <h2>Ура! Заявка успешно отправлена.</h2>
            <p>Ваша заявка сохранена и будет рассмотрена комиссией.</p>
            <br />
            <div className="card-actions" style={{ justifyContent: 'center' }}>
              <a className="btn btn-primary" href="/">
                Вернуться на главную
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-panel">
      <div className="form-inner">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Nomination Selection — dynamic from DB */}
            <div className="form-field full">
              <label htmlFor="nominationSlug">Номинация *</label>
              <select name="nominationSlug" id="nominationSlug" required>
                <option value="">-- Выберите номинацию --</option>
                {nominations.map((n) => (
                  <option key={n.id} value={n.slug}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Info */}
            <div className="form-field">
              <label htmlFor="name">ФИО сотрудника *</label>
              <input type="text" id="name" name="name" required placeholder="Иванов Иван Иванович" />
            </div>
            <div className="form-field">
              <label htmlFor="department">Подразделение / Компания *</label>
              <input type="text" id="department" name="department" required placeholder="Завод 'Farovon-1'" />
            </div>
            <div className="form-field">
              <label htmlFor="position">Занимаемая должность *</label>
              <input type="text" id="position" name="position" required placeholder="Инженер" />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Номер телефона *</label>
              <input type="text" id="phone" name="phone" required placeholder="+992 ..." />
            </div>
            <div className="form-field full">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="example@farovon.com" />
            </div>

            {/* Project Details */}
            <div className="form-field full" style={{ marginTop: '10px' }}>
              <label htmlFor="projectText">Обоснование / Описание проекта *</label>
              <textarea
                id="projectText"
                name="projectText"
                rows={6}
                required
                placeholder="Опишите ваши достижения и причину выдвижения на эту номинацию..."
              />
              <div className="form-note">
                <strong>Примечание:</strong> Расскажите подробно о вашем вкладе. Если есть цифровые или подтверждающие
                документы, пожалуйста укажите их в описании или отправьте HR-партнеру на почту.
              </div>
            </div>

            {error && (
              <div className="form-note full" style={{ color: 'red', border: '1px solid red' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="submit-row full">
              <a className="btn btn-secondary" href="/">
                Отмена
              </a>
              <button type="submit" className="apply-btn" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
