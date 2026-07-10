'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

const FIREBASE_API_KEY = 'AIzaSyDPdr3rnb3euBVlNNfMakj1ZAZ1RdOQ4cw';

async function firebaseSignIn(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw { code: data.error?.message };
  return data; // { idToken, email, localId, ... }
}

async function firebaseSignUp(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw { code: data.error?.message };
  return data;
}

function getFirebaseErrorMsg(code) {
  if (!code) return 'Something went wrong. Try again.';
  if (code.includes('EMAIL_EXISTS')) return 'This email is already registered. Try signing in instead.';
  if (code.includes('INVALID_LOGIN_CREDENTIALS') || code.includes('INVALID_PASSWORD') || code.includes('EMAIL_NOT_FOUND'))
    return 'Invalid email or password.';
  if (code.includes('WEAK_PASSWORD')) return 'Password must be at least 6 characters.';
  if (code.includes('INVALID_EMAIL')) return 'Invalid email address.';
  if (code.includes('TOO_MANY_ATTEMPTS')) return 'Too many attempts. Try again later.';
  if (code.includes('USER_DISABLED')) return 'This account has been disabled.';
  return code;
}

export default function AdminLogin() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [pendingMsg, setPendingMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPending(false);

    try {
      // Call Firebase REST API directly — no npm package needed
      const firebaseData = mode === 'signup'
        ? await firebaseSignUp(email, password)
        : await firebaseSignIn(email, password);

      const { idToken } = firebaseData;

      // Send token to our backend for role check / registration
      const res = await fetch('/api/admin/firebase-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();

      if (res.status === 202 || data.error === 'pending') {
        setPending(true);
        setPendingMsg(data.message || 'Your request is awaiting approval from the primary admin.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        setLoading(false);
        return;
      }

      // Success — navigate to admin
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(getFirebaseErrorMsg(err.code));
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginBg}></div>
      <div className={styles.loginBgOverlay}></div>

      <div className={styles.loginCard}>
        {/* Brand */}
        <div className={styles.loginBrand}>
          <img src="/logo.png" alt="Logo" className={styles.loginLogo} />
          <h1 className={styles.loginTitle}>ASHTAVINAYAK FLYASH BRICKS</h1>
          <p className={styles.loginSubtitle}>Owner Admin Portal</p>
        </div>

        {/* Sign In / Sign Up toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', marginBottom: '1.5rem' }}>
          {[{ id: 'signin', label: '🔑 Sign In' }, { id: 'signup', label: '📝 Sign Up' }].map(m => (
            <button key={m.id}
              onClick={() => { setMode(m.id); setError(''); setPending(false); }}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none',
                background: mode === m.id ? 'white' : 'transparent',
                color: mode === m.id ? '#0f172a' : '#64748b',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                boxShadow: mode === m.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.15s'
              }}
            >{m.label}</button>
          ))}
        </div>

        {/* Pending approval screen */}
        {pending ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⏳</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>Approval Pending</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{pendingMsg}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              The primary admin will approve or reject your request. Come back after approval.
            </p>
            <button onClick={() => { setPending(false); setError(''); setEmail(''); setPassword(''); }}
              className="btn" style={{ marginTop: '1.5rem', width: '100%' }}>
              ← Try Another Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label className="label">Email Address</label>
              <input type="email" className="input" required autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" />
            </div>
            <div className={styles.inputGroup}>
              <label className="label">
                Password{' '}
                {mode === 'signup' && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(min. 6 characters)</span>}
              </label>
              <input type="password" className="input" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" minLength={6} />
            </div>

            {error && (
              <div style={{
                padding: '0.75rem', borderRadius: '8px',
                background: 'rgba(239,68,68,0.08)', color: '#dc2626',
                border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>{error}</div>
            )}

            <button type="submit" className={`btn btn-primary ${styles.loginBtn}`} disabled={loading}>
              {loading ? '⏳ Please wait...' : mode === 'signin' ? '🔑 Sign In' : '📝 Create Account'}
            </button>

            {mode === 'signup' && (
              <div style={{
                padding: '0.75rem', background: 'rgba(249,115,22,0.06)',
                borderRadius: '8px', border: '1px solid rgba(249,115,22,0.15)',
                fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5
              }}>
                ℹ️ Only <strong>2 admin accounts</strong> are allowed. If a primary admin exists, your signup will need their approval.
              </div>
            )}
          </form>
        )}

        <a href="/" className={styles.backLink} style={{ marginTop: '1.25rem' }}>← Back to Store</a>
      </div>
    </div>
  );
}
