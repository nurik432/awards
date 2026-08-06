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
      <div className="adm-field">
        <label className="adm-label">Фото (JPG, PNG, WebP, до 5 МБ) *</label>
        <input
          type="file"
          name="fileInput"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={handleFileChange}
          className="adm-input"
          style={{ borderStyle: 'dashed', cursor: 'pointer' }}
        />
      </div>

      {preview && (
        <div style={{ marginBottom: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Hidden URL field — will be set programmatically after upload */}
      <input type="hidden" name="url" />

      <div className="adm-field">
        <label className="adm-label">Описание</label>
        <input type="text" name="alt" className="adm-input" placeholder="Farovon Awards • кадр" />
      </div>
      <div className="adm-field">
        <label className="adm-label">Альбом</label>
        <input
          type="text"
          name="album"
          className="adm-input"
          placeholder="Итоги года 2025"
          defaultValue="Итоги года 2025"
        />
      </div>

      {error && (
        <div className="adm-note" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button type="submit" className="adm-btn adm-btn-primary adm-btn-block" disabled={uploading}>
        {uploading ? 'Загрузка...' : 'Загрузить фото'}
      </button>
    </form>
  );
}
