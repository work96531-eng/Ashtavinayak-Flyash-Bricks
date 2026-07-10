'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import FileUploader from '@/components/Admin/FileUploader';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stockQuantity: '', imageUrl: '', specifications: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchProducts = () => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (!data.error) setProducts(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', stockQuantity: '', imageUrl: '', specifications: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || '',
      specifications: product.specifications || ''
    });
    setEditingProduct(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setMsg('✅ Product deleted successfully!');
      } else {
        setMsg('❌ Failed to delete product.');
      }
    } catch {
      setMsg('❌ Error deleting product.');
    } finally {
      setDeletingId(null);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed');
      setMsg(editingProduct ? '✅ Product updated!' : '✅ Product added!');
      resetForm();
      fetchProducts();
    } catch {
      setMsg('❌ Failed to save product.');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Cancel' : '+ Add New Product'}
        </button>
      </div>

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
          <h2 className={styles.cardTitle}>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div>
                <label className="label">Product Name *</label>
                <input className="input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Standard Flyash Brick" />
              </div>
              <div>
                <label className="label">Price (₹) *</label>
                <input className="input" type="number" step="0.01" required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 8.50" />
              </div>
              <div>
                <label className="label">Stock Quantity</label>
                <input className="input" type="number" value={form.stockQuantity} onChange={e => setForm(p => ({ ...p, stockQuantity: e.target.value }))} placeholder="e.g. 10000" />
              </div>
              <div>
                <FileUploader
                  label="Product Image"
                  value={form.imageUrl}
                  onUrlChange={url => setForm(p => ({ ...p, imageUrl: url }))}
                  placeholder="https://example.com/product.jpg"
                />
              </div>
              <div className={styles.fullWidth}>
                <label className="label">Description *</label>
                <textarea className="input" rows={3} required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the product..." />
              </div>
              <div className={styles.fullWidth}>
                <label className="label">Specifications (optional)</label>
                <textarea className="input" rows={2} value={form.specifications} onChange={e => setForm(p => ({ ...p, specifications: e.target.value }))} placeholder='e.g. {"Size":"230x110x75mm","Strength":"7.5 N/mm²"}' />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingProduct ? '💾 Update Product' : '➕ Add Product'}</button>
              <button type="button" className="btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>All Products ({products.length})</h2>
        {loading ? <p>Loading...</p> : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
            No products yet. Click "Add New Product" to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products.map(product => (
              <div key={product.id} style={{
                display: 'flex', gap: '1rem', alignItems: 'center',
                padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'var(--background)'
              }}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{product.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>{product.description?.slice(0, 80)}...</div>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.3rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{product.price}</span>
                    <span style={{ color: 'var(--secondary)', marginLeft: '1rem' }}>Stock: {product.stockQuantity}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(product)} style={{ padding: '0.5rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    style={{ padding: '0.5rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    {deletingId === product.id ? '...' : '🗑 Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
