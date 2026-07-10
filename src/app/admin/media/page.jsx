'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import FileUploader from '@/components/Admin/FileUploader';

export default function MediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', url: '', type: 'IMAGE', sortOrder: 0 });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchMedia = () => {
    fetch('/api/media')
      .then(r => r.json())
      .then(data => { if (!data.error) setMediaList(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.url) return;
    setAdding(true);
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMsg('✅ Media added successfully!');
        setForm({ title: '', url: '', type: 'IMAGE', sortOrder: 0 });
        setShowForm(false);
        fetchMedia();
      } else {
        setMsg('❌ Failed to add media.');
      }
    } catch {
      setMsg('❌ Error.');
    } finally {
      setAdding(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media item?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaList(prev => prev.filter(m => m.id !== id));
        setMsg('✅ Deleted!');
      } else {
        setMsg('❌ Failed to delete.');
      }
    } catch {
      setMsg('❌ Error.');
    } finally {
      setDeletingId(null);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const toggleActive = async (item) => {
    await fetch(`/api/media/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, isActive: !item.isActive })
    });
    fetchMedia();
  };

  const isVideo = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo') || url.endsWith('.mp4'));

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📸 Media Gallery</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Image / Video'}
        </button>
      </div>

      <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Add images and videos here to display in the advertisement gallery on your customer website.
      </p>

      {msg && (
        <div style={{
          padding: '0.875rem 1.25rem', marginBottom: '1.5rem', borderRadius: 'var(--radius)',
          background: msg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${msg.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontWeight: 600
        }}>{msg}</div>
      )}

      {showForm && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>➕ Add New Media</h2>
          <form onSubmit={handleAdd}>
            <div className={styles.formGrid}>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="IMAGE">🖼 Image</option>
                  <option value="VIDEO">🎬 Video (YouTube / MP4)</option>
                </select>
              </div>
              <div>
                <label className="label">Title (optional)</label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Factory Tour" />
              </div>
              <div className={styles.fullWidth}>
                <FileUploader
                  label={form.type === 'VIDEO' ? 'YouTube URL or Video File' : 'Image URL or Upload File'}
                  value={form.url}
                  onUrlChange={url => setForm(p => ({ ...p, url }))}
                  accept={form.type === 'VIDEO' ? 'video/*' : 'image/*'}
                  placeholder={form.type === 'VIDEO' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/image.jpg'}
                  showPreview={form.type === 'IMAGE'}
                />
              </div>
              <div>
                <label className="label">Sort Order (lower = first)</label>
                <input className="input" type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} />
              </div>
            </div>
            {form.url && form.type === 'IMAGE' && (
              <div style={{ marginTop: '1rem' }}>
                <label className="label">Preview</label>
                <img src={form.url} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={adding}>{adding ? 'Adding...' : '➕ Add Media'}</button>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>All Media ({mediaList.length})</h2>
        {loading ? <p>Loading...</p> : mediaList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📷</div>
            <p>No media added yet. Add images or videos to display on your storefront!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {mediaList.map(item => {
              const ytId = item.type === 'VIDEO' ? getYouTubeId(item.url) : null;
              return (
                <div key={item.id} style={{
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  overflow: 'hidden', background: 'var(--background)',
                  opacity: item.isActive ? 1 : 0.5
                }}>
                  <div style={{ height: '150px', overflow: 'hidden', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.type === 'IMAGE' ? (
                      <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    ) : ytId ? (
                      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '2rem' }}>🎬</span>
                    )}
                    <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8', fontSize: '2rem' }}>🖼</div>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {item.type === 'VIDEO' ? '🎬' : '🖼'} {item.title || 'Untitled'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => toggleActive(item)} style={{
                        flex: 1, padding: '0.4rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                        background: item.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                        color: item.isActive ? 'var(--success)' : 'var(--secondary)',
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {item.isActive ? '✓ Visible' : '✕ Hidden'}
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} style={{
                        padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)',
                        border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                        color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {deletingId === item.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
