'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import FileUploader from '@/components/Admin/FileUploader';

const DEFAULT_STATS = [
  { value: '10+', label: 'Years Experience' },
  { value: '500+', label: 'Projects Delivered' },
  { value: '100%', label: 'Eco-Friendly' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    deliveryRadiusKm: 50,
    primaryColor: '#f97316',
    bannerText: '',
    aboutUsText: '',
    factoryAddress: '',
    factoryLatitude: '',
    factoryLongitude: '',
    contactPhone: '',
    contactWhatsApp: '',
    googleMapsApiKey: '',
    googleMapsLink: '',
    logoUrl: '/logo.png',
    logoShape: 'square',
    logoSize: 52,
    heroBadgeText: '🏗 Est. Since Decades',
    heroImageUrl: '',
    instagram: '',
    facebook: '',
    youtube: '',
    twitter: '',
    linkedin: ''
  });
  const [heroStats, setHeroStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('/logo.png');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            deliveryRadiusKm: data.deliveryRadiusKm || 50,
            primaryColor: data.primaryColor || '#f97316',
            bannerText: data.bannerText || '',
            aboutUsText: data.aboutUsText || '',
            factoryAddress: data.factoryAddress || '',
            factoryLatitude: data.factoryLatitude || '',
            factoryLongitude: data.factoryLongitude || '',
            contactPhone: data.contactPhone || '',
            contactWhatsApp: data.contactWhatsApp || '',
            googleMapsApiKey: data.googleMapsApiKey || '',
            googleMapsLink: data.googleMapsLink || '',
            logoUrl: data.logoUrl || '/logo.png',
            logoShape: data.logoShape || 'square',
            logoSize: data.logoSize || 52,
            heroBadgeText: data.heroBadgeText ?? '🏗 Est. Since Decades',
            heroImageUrl: data.heroImageUrl || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            youtube: data.youtube || '',
            twitter: data.twitter || '',
            linkedin: data.linkedin || ''
          });
          setLogoPreview(data.logoUrl || '/logo.png');
          if (data.heroStats) {
            try { setHeroStats(JSON.parse(data.heroStats)); } catch {}
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    if (name === 'logoUrl') setLogoPreview(value);
  };

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setLogoPreview(dataUrl);
      setSettings(prev => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Hero Stats handlers
  const handleStatChange = (index, field, value) => {
    setHeroStats(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleAddStat = () => {
    setHeroStats(prev => [...prev, { value: '', label: '' }]);
  };

  const handleRemoveStat = (index) => {
    setHeroStats(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, heroStats })
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSaveMsg('✅ Settings saved successfully!');
    } catch (e) {
      setSaveMsg('❌ ' + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Store Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {saveMsg && (
        <div style={{
          padding: '0.875rem 1.25rem',
          marginBottom: '1.5rem',
          borderRadius: 'var(--radius)',
          background: saveMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: saveMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${saveMsg.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontWeight: 600
        }}>
          {saveMsg}
        </div>
      )}

      {/* Logo Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>🖼 Business Logo</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: `${settings.logoSize}px`, height: `${settings.logoSize}px`,
              borderRadius: settings.logoShape === 'circle' ? '50%' : settings.logoShape === 'rounded' ? '12px' : '0',
              overflow: 'hidden', border: '3px solid var(--border)',
              background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src={logoPreview} alt="Logo Preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={() => setLogoPreview('/logo.png')} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Preview</span>
          </div>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <FileUploader
              label="Upload New Logo"
              value={settings.logoUrl}
              onUrlChange={url => {
                setLogoPreview(url);
                setSettings(prev => ({ ...prev, logoUrl: url }));
              }}
              accept="image/*"
              placeholder="/logo.png or https://..."
            />
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label className="label">Logo Shape</label>
                <select className="input" name="logoShape" value={settings.logoShape} onChange={handleChange}>
                  <option value="square">Square</option>
                  <option value="rounded">Rounded Corners</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Logo Size</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{settings.logoSize}px</span>
                </label>
                <input type="range" name="logoSize" min="30" max="120" value={settings.logoSize} onChange={handleChange} style={{ width: '100%', cursor: 'pointer', margin: '0.5rem 0' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Design & Content */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>🎨 Design & Content</h2>
        <div className={styles.formGrid}>
          <div>
            <label className="label">Primary Color</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleChange}
                style={{ width: '50px', height: '40px', padding: '0', cursor: 'pointer', border: 'none' }} />
              <input type="text" className="input" name="primaryColor" value={settings.primaryColor} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="label">Hero Banner Text</label>
            <input type="text" className="input" name="bannerText" value={settings.bannerText} onChange={handleChange}
              placeholder="e.g. Premium Flyash Bricks for Builders" />
          </div>
          <div>
            <label className="label">Hero Badge Text (top of banner)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="input"
                name="heroBadgeText"
                value={settings.heroBadgeText}
                onChange={handleChange}
                placeholder="e.g. 🏗 Est. Since Decades"
              />
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, heroBadgeText: prev.heroBadgeText === '' ? '🏗 Est. Since Decades' : '' }))}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: settings.heroBadgeText === '' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                  color: settings.heroBadgeText === '' ? 'var(--danger)' : 'var(--success)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem'
                }}
              >
                {settings.heroBadgeText === '' ? '✕ Hidden' : '✓ Visible'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>
              Click the toggle button to show or hide this badge on the storefront. Clear the text to hide it.
            </p>
          </div>
          <div className={styles.fullWidth}>
            <label className="label">About Us Text</label>
            <textarea className="input" name="aboutUsText" rows={4} value={settings.aboutUsText} onChange={handleChange}
              placeholder="Write about your business..." />
          </div>
          <div className={styles.fullWidth}>
            <FileUploader
              label="Hero Background Image"
              value={settings.heroImageUrl}
              onUrlChange={url => setSettings(prev => ({ ...prev, heroImageUrl: url }))}
              accept="image/*"
              placeholder="https://example.com/your-image.jpg (leave blank for default)"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>
              Sets the background image of the hero banner on your storefront.
            </p>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>📱 Social Media Links</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Add your social media profile links. They will appear as icon buttons in the footer of your storefront.
        </p>
        <div className={styles.formGrid}>
          <div>
            <label className="label">📸 Instagram URL</label>
            <input type="url" className="input" name="instagram" value={settings.instagram} onChange={handleChange} placeholder="https://instagram.com/yourpage" />
          </div>
          <div>
            <label className="label">👥 Facebook URL</label>
            <input type="url" className="input" name="facebook" value={settings.facebook} onChange={handleChange} placeholder="https://facebook.com/yourpage" />
          </div>
          <div>
            <label className="label">▶️ YouTube URL</label>
            <input type="url" className="input" name="youtube" value={settings.youtube} onChange={handleChange} placeholder="https://youtube.com/@yourchannel" />
          </div>
          <div>
            <label className="label">🐦 Twitter / X URL</label>
            <input type="url" className="input" name="twitter" value={settings.twitter} onChange={handleChange} placeholder="https://x.com/yourhandle" />
          </div>
          <div>
            <label className="label">💼 LinkedIn URL</label>
            <input type="url" className="input" name="linkedin" value={settings.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/yourcompany" />
          </div>
        </div>
      </div>

      {/* Hero Stats Manager */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>📊 Hero Banner Stats</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          These appear as highlights in the hero section of your storefront (e.g. "10+ Years Experience"). Add, edit, or remove them freely.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {heroStats.map((stat, index) => (
            <div key={index} style={{
              display: 'flex', gap: '0.75rem', alignItems: 'center',
              background: 'var(--background)', padding: '0.875rem 1rem',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, minWidth: '20px' }}>#{index + 1}</span>
              <div style={{ flex: '0 0 120px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', marginBottom: '0.3rem' }}>Value</label>
                <input
                  type="text"
                  className="input"
                  value={stat.value}
                  onChange={e => handleStatChange(index, 'value', e.target.value)}
                  placeholder="e.g. 10+"
                  style={{ fontSize: '0.95rem', fontWeight: 700 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', marginBottom: '0.3rem' }}>Label</label>
                <input
                  type="text"
                  className="input"
                  value={stat.label}
                  onChange={e => handleStatChange(index, 'label', e.target.value)}
                  placeholder="e.g. Years Experience"
                />
              </div>
              <button
                onClick={() => handleRemoveStat(index)}
                style={{
                  marginTop: '1.2rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)',
                  padding: '0.5rem 0.875rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddStat}
          style={{
            background: 'rgba(249,115,22,0.1)', color: 'var(--primary)',
            border: '1px dashed var(--primary)', borderRadius: 'var(--radius)',
            padding: '0.6rem 1.25rem', fontWeight: 600, cursor: 'pointer',
            fontSize: '0.9rem', width: '100%'
          }}
        >
          + Add New Stat
        </button>
      </div>

      {/* Logistics */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>📍 Factory & Delivery Radius</h2>
        <div className={styles.formGrid}>
          <div>
            <label className="label">Delivery Radius (km)</label>
            <input type="number" className="input" name="deliveryRadiusKm" value={settings.deliveryRadiusKm} onChange={handleChange} />
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>Orders outside this range will be blocked at checkout.</p>
          </div>
          <div>
            <label className="label">Factory Address (for map embed)</label>
            <input type="text" className="input" name="factoryAddress" value={settings.factoryAddress} onChange={handleChange} placeholder="Full address of your factory" />
          </div>
          <div>
            <label className="label">Factory Latitude</label>
            <input type="number" step="0.0000001" className="input" name="factoryLatitude" value={settings.factoryLatitude} onChange={handleChange} placeholder="e.g. 18.5204" />
          </div>
          <div>
            <label className="label">Factory Longitude</label>
            <input type="number" step="0.0000001" className="input" name="factoryLongitude" value={settings.factoryLongitude} onChange={handleChange} placeholder="e.g. 73.8567" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>📞 Contact & Integrations</h2>
        <div className={styles.formGrid}>
          <div>
            <label className="label">Contact Phone</label>
            <input type="text" className="input" name="contactPhone" value={settings.contactPhone} onChange={handleChange} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="label">WhatsApp Number (with country code)</label>
            <input type="text" className="input" name="contactWhatsApp" value={settings.contactWhatsApp} onChange={handleChange} placeholder="+91 98765 43210" />
          </div>
          <div className={styles.fullWidth}>
            <label className="label">📍 Google Maps Location Link</label>
            <textarea
              className="input"
              name="googleMapsLink"
              value={settings.googleMapsLink}
              onChange={handleChange}
              rows={3}
              placeholder={'Paste your Google Maps share link OR the full <iframe> embed code here...'}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              <strong>Option A — Share link:</strong> Google Maps → Search location → Share → Copy link → Paste here.<br />
              <strong>Option B — Embed code (recommended):</strong> Google Maps → Search location → Share → <strong>Embed a map</strong> → Copy entire <code>&lt;iframe&gt;</code> code → Paste here. This shows the exact location on your storefront.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: '180px' }}>
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  );
}
