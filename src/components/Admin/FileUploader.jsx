'use client';

import { useState, useRef } from 'react';

/**
 * Reusable image/file uploader component.
 * Shows a URL input + a "Choose File" button.
 * On file select, uploads to /api/upload and calls onUrlChange with the resulting URL.
 */
export default function FileUploader({
  label = 'Image',
  value = '',
  onUrlChange,
  accept = 'image/*',
  placeholder = 'https://example.com/image.jpg',
  previewStyle = {},
  showPreview = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        onUrlChange(data.url);
      } else {
        setError('Upload failed. Try a URL instead.');
      }
    } catch {
      setError('Upload failed. Check your connection.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      {/* URL input */}
      <input
        type="text"
        className="input"
        value={value}
        onChange={e => onUrlChange(e.target.value)}
        placeholder={placeholder}
        style={{ marginBottom: '0.5rem' }}
      />
      {/* File picker row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', background: 'var(--card)',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          color: 'var(--foreground)', transition: 'background 0.2s'
        }}>
          {uploading ? '⏳ Uploading...' : '📁 Choose File'}
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
          or paste a URL above
        </span>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>}
      {/* Preview */}
      {showPreview && value && accept.startsWith('image') && (
        <div style={{ marginTop: '0.75rem', ...previewStyle }}>
          <img
            src={value}
            alt="Preview"
            style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>
      )}
    </div>
  );
}
