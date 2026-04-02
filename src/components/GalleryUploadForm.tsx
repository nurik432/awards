'use client';

import { useState } from 'react';
import { createGalleryItem } from '@/app/admin/actions';

export default function GalleryUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!file) {
      setError('Выберите файл');
      setUploading(false);
      return;
    }

    try {
      // 1. Upload the file
      const uploadData = new FormData();
      uploadData.append('file', file);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const uploadResult = await uploadRes.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Ошибка загрузки');
      }

      // 2. Create gallery record via server action
      const formData = new FormData(form);
      formData.set('url', uploadResult.url);

      await createGalleryItem(formData);

      // Reset form
      form.reset();
      setPreview(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Фото (JPG, PNG, WebP, до 5 МБ) *</label>
        <input
          type="file"
          name="fileInput"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={handleFileChange}
          style={{
            padding: '12px',
            border: '2px dashed #fecaca',
            borderRadius: '16px',
            cursor: 'pointer',
            width: '100%',
          }}
        />
      </div>

      {preview && (
        <div style={{ marginBottom: '14px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Hidden URL field — will be set programmatically after upload */}
      <input type="hidden" name="url" />

      <div className="form-field">
        <label>Описание</label>
        <input type="text" name="alt" placeholder="Farovon Awards • кадр" />
      </div>
      <div className="form-field">
        <label>Альбом</label>
        <input type="text" name="album" placeholder="Итоги года 2025" defaultValue="Итоги года 2025" />
      </div>

      {error && (
        <div className="form-note" style={{ color: 'red', borderColor: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <button type="submit" className="apply-btn" style={{ width: '100%' }} disabled={uploading}>
        {uploading ? 'Загрузка...' : 'Загрузить фото'}
      </button>
    </form>
  );
}
