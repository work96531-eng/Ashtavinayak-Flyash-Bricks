'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

const FIREBASE_API_KEY = 'AIzaSyDPdr3rnb3euBVlNNfMakj1ZAZ1RdOQ4cw';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [myRole, setMyRole] = useState('');
  const [myEmail, setMyEmail] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get current user info from cookies (via API)
    fetch('/api/admin/me').then(r => r.json()).then(data => {
      setMyRole(data.role || '');
      setMyEmail(data.email || '');
    });

    // Fetch products + orders count
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
    ]).then(([products, orders]) => {
      const pendingOrders = Array.isArray(orders) ? orders.filter(o => o.status === 'PENDING').length : 0;
      setStats({
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        pending: pendingOrders
      });
    });

    // If PRIMARY, fetch admin users to check for pending requests
    fetch('/api/admin/users').then(r => r.ok ? r.json() : []).then(users => {
      if (Array.isArray(users)) setAdminUsers(users);
    });
  }, []);

  const pendingUsers = adminUsers.filter(u => u.status === 'PENDING');

  const handleApprove = async (userId, action) => {
    setActionLoading(userId + action);
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    });
    if (res.ok) {
      setAdminUsers(prev => prev.map(u => u.id === userId
        ? { ...u, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
        : u
      ));
    }
    setActionLoading('');
  };

  const handleDeleteAccount = async () => {
    setActionLoading('delete');
    try {
      // Get current idToken from /api/admin/me isn't enough — need to re-auth
      // We delete from our DB (which also handles role promotion)
      const res = await fetch('/api/admin/delete-account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      // Clear Firebase session via REST (revoke token is handled server-side)
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      alert('Could not delete account: ' + err.message);
      setActionLoading('');
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {myEmail && <span>Signed in as <strong>{myEmail}</strong></span>}
            {myRole && <span style={{ marginLeft: '0.75rem', padding: '0.2rem 0.6rem', background: myRole === 'PRIMARY' ? 'rgba(249,115,22,0.15)' : 'rgba(99,102,241,0.15)', color: myRole === 'PRIMARY' ? 'var(--primary)' : '#6366f1', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{myRole}</span>}
          </p>
        </div>
        <button onClick={handleSignOut} className="btn" style={{ fontSize: '0.875rem' }}>
          🚪 Sign Out
        </button>
      </div>

      {/* ── Pending Approval Card (PRIMARY only) ── */}
      {pendingUsers.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.05))',
          border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius)',
          padding: '1.5rem', marginBottom: '2rem'
        }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            🔔 Access Request Pending
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            The following user has requested access to the admin portal. Review and decide:
          </p>
          {pendingUsers.map(user => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem', background: 'var(--card)',
              padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>{user.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                  Requested access as Secondary Admin
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleApprove(user.id, 'approve')}
                  disabled={!!actionLoading}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)',
                    background: 'rgba(34,197,94,0.15)', color: 'var(--success)',
                    border: '1px solid rgba(34,197,94,0.3)', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.875rem'
                  }}
                >
                  {actionLoading === user.id + 'approve' ? '...' : '✅ Approve'}
                </button>
                <button
                  onClick={() => handleApprove(user.id, 'reject')}
                  disabled={!!actionLoading}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)',
                    background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                    border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.875rem'
                  }}
                >
                  {actionLoading === user.id + 'reject' ? '...' : '❌ Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Products', value: stats.products, icon: '📦', href: '/admin/products' },
          { label: 'Total Orders', value: stats.orders, icon: '🧾', href: '/admin/orders' },
          { label: 'Pending Orders', value: stats.pending, icon: '⏳', href: '/admin/orders' },
        ].map(s => (
          <a key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div className={styles.card} style={{ cursor: 'pointer', transition: 'transform 0.15s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{s.label}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Quick Links */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>⚡ Quick Actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            { label: '+ Add Product', href: '/admin/products' },
            { label: '📸 Add Media', href: '/admin/media' },
            { label: '⚙️ Settings', href: '/admin/settings' },
            { label: '📋 View Orders', href: '/admin/orders' },
          ].map(l => (
            <a key={l.label} href={l.href} className="btn" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>{l.label}</a>
          ))}
        </div>
      </div>

      {/* Admin Account Management */}
      {myRole && (
        <div className={styles.card} style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.cardTitle}>👥 Admin Accounts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {adminUsers.length > 0 ? adminUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.2rem', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: u.role === 'PRIMARY' ? 'rgba(249,115,22,0.1)' : 'rgba(99,102,241,0.1)', color: u.role === 'PRIMARY' ? 'var(--primary)' : '#6366f1', fontWeight: 700 }}>{u.role}</span>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: u.status === 'APPROVED' ? 'rgba(34,197,94,0.1)' : u.status === 'PENDING' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)', color: u.status === 'APPROVED' ? 'var(--success)' : u.status === 'PENDING' ? '#ca8a04' : 'var(--danger)', fontWeight: 700 }}>{u.status}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>No other admin accounts.</p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              ⚠️ Deleting your account is permanent.{myRole === 'PRIMARY' ? ' The secondary admin (if approved) will be promoted to Primary.' : ''}
            </p>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                🗑 Delete My Account
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 600 }}>Are you sure?</span>
                <button onClick={handleDeleteAccount} disabled={actionLoading === 'delete'} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: 'none', background: 'var(--danger)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                  {actionLoading === 'delete' ? '...' : 'Yes, Delete'}
                </button>
                <button onClick={() => setDeleteConfirm(false)} className="btn" style={{ fontSize: '0.875rem' }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
