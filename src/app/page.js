import { prisma } from '@/lib/prisma';
import Header from '@/components/Store/Header';
import ProductCard from '@/components/Store/ProductCard';
import CopyPhone from '@/components/Store/CopyPhone';
import styles from './page.module.css';

// Force dynamic rendering so admin settings always reflect instantly
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: "Ashtavinayak Flyash Bricks - Premium Quality Bricks",
  description: "Buy premium quality flyash bricks from Ashtavinayak Flyash Bricks. Durable, eco-friendly, and cost-effective.",
};

const DEFAULT_STATS = [
  { value: '10+', label: 'Years Experience' },
  { value: '500+', label: 'Projects Delivered' },
  { value: '100%', label: 'Eco-Friendly' },
];

export default async function Home() {
  let settings = null;
  let products = [];
  let media = [];

  try {
    settings = await prisma.settings.findFirst();
    products = await prisma.product.findMany();
    media = await prisma.media.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  } catch (e) {
    console.error("Database not initialized yet:", e);
  }

  // ── Map embed logic ─────────────────────────────────────────────────────
  const gmLink = settings?.googleMapsLink || '';
  const gmAddress = settings?.factoryAddress || '';

  let mapEmbedUrl = null;
  let mapButtonUrl = gmLink; // used for the "View on Google Maps" button

  if (gmLink) {
    // Case 1: Admin pasted a full <iframe> embed code → extract the src
    const iframeSrcMatch = gmLink.match(/src=["']([^"']+)["']/);
    if (iframeSrcMatch) {
      mapEmbedUrl = iframeSrcMatch[1]; // use the src directly
      // Try to get a clean button URL from the iframe code too
      const hrefMatch = gmLink.match(/href=["']([^"']+)["']/);
      mapButtonUrl = hrefMatch ? hrefMatch[1] : '';
    }
    // Case 2: Already a proper embed URL
    else if (gmLink.includes('/maps/embed')) {
      mapEmbedUrl = gmLink;
    }
    // Case 3: Full Google Maps URL or short link
    else {
      let resolvedUrl = gmLink;
      // Follow redirect for short links server-side
      if (gmLink.includes('maps.app.goo.gl') || gmLink.includes('goo.gl/maps')) {
        try {
          const res = await fetch(gmLink, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(4000) });
          resolvedUrl = res.url || gmLink;
        } catch {
          resolvedUrl = gmLink;
        }
      }
      // Extract coordinates e.g. /@18.5204,73.8567,15z OR /search/23.105260,+72.675507
      const atMatch = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const searchMatch = resolvedUrl.match(/search\/(-?\d+\.\d+),(?:\+)?(-?\d+\.\d+)/);
      
      const coordMatch = atMatch || searchMatch;
      
      if (coordMatch) {
        mapEmbedUrl = `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
      } else if (gmAddress) {
        mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(gmAddress)}&output=embed`;
      }
    }
  } else if (gmAddress) {
    mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(gmAddress)}&output=embed`;
  }

  const hasMap = !!(mapEmbedUrl || mapButtonUrl || gmAddress);
  // ─────────────────────────────────────────────────────────────────────────

  const primaryColor = settings?.primaryColor || '#f97316';

  return (
    <div className={styles.wrapper}>
      {settings && (
        <style dangerouslySetInnerHTML={{__html: `
          :root { --primary: ${primaryColor}; }
        `}} />
      )}

      <Header settings={settings} />

      <main>
        {/* Hero Section */}
        <section
          className={`${styles.hero} ${settings?.heroImageUrl ? styles.heroCustomBg : ''}`}
        >
          {settings?.heroImageUrl && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url('${settings.heroImageUrl}')`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0.35, zIndex: 0
            }} />
          )}
          <div className={`container ${styles.heroContent} animate-fade-in`}>
            {settings?.heroBadgeText !== '' && (
              <div className={styles.heroBadge}>
                {settings?.heroBadgeText ?? '🏗 Est. Since Decades'}
              </div>
            )}
            <h1 className={styles.heroTitle}>
              {settings?.bannerText || "Premium Flyash Bricks for Professional Builders"}
            </h1>
            <p className={styles.heroSubtitle}>
              Manufactured by <strong>Ashtavinayak Flyash Bricks</strong> — 
              Durable, eco-friendly, and cost-effective building materials delivered to your site.
            </p>
            <div className={styles.heroActions}>
              <a href="#products" className={`btn btn-primary ${styles.heroBtn}`}>
                View Our Products
              </a>
              <a href="#contact" className={`btn ${styles.heroBtnOutline}`}>
                Contact Us
              </a>
            </div>
            {(() => {
              let stats = DEFAULT_STATS;
              try {
                if (settings?.heroStats) stats = JSON.parse(settings.heroStats);
              } catch {}
              return stats.length > 0 ? (
                <div className={styles.heroStats}>
                  {stats.map((stat, i) => (
                    <div key={i} className={styles.heroStat}>
                      <span>{stat.value}</span>
                      <label>{stat.label}</label>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className={`container ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Products</h2>
            <p className={styles.sectionSubtitle}>High-quality flyash bricks crafted for strength and sustainability</p>
          </div>
          <div className={styles.productGrid}>
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Products coming soon. Check back shortly!</p>
              </div>
            )}
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className={styles.aboutSection}>
          <div className={`container ${styles.aboutContainer}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>About Ashtavinayak Flyash Bricks</h2>
              <p className={styles.sectionSubtitle}>Built on trust, quality, and sustainability</p>
            </div>
            <div className={styles.aboutContent}>
              <p className={styles.aboutText}>
                {settings?.aboutUsText || "Ashtavinayak Flyash Bricks is a leading manufacturer of high-quality, eco-friendly flyash bricks. Committed to sustainability and strength, our bricks are the foundation of modern infrastructure."}
              </p>
              <div className={styles.aboutFeatures}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🌿</span>
                  <strong>Eco-Friendly</strong>
                  <p>Made from flyash — a recycled industrial byproduct</p>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💪</span>
                  <strong>High Strength</strong>
                  <p>Superior compressive strength for lasting construction</p>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💰</span>
                  <strong>Cost Effective</strong>
                  <p>Better value without compromising on quality</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Media Gallery Section */}
      {media.length > 0 && (
        <section id="gallery" className={styles.mediaSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Gallery & Videos</h2>
              <p className={styles.sectionSubtitle}>Our factory, products, and construction solutions</p>
            </div>
            <div className={styles.mediaGrid}>
              {media.map(item => {
                const ytMatch = item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                const ytId = ytMatch ? ytMatch[1] : null;
                return (
                  <div key={item.id} className={styles.mediaItem}>
                    {item.type === 'VIDEO' ? (
                      ytId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title={item.title || 'Video'}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ width: '100%', height: '100%', borderRadius: '10px' }}
                        />
                      ) : (
                        <video src={item.url} controls style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                      )
                    ) : (
                      <img src={item.url} alt={item.title || 'Gallery'} className={styles.mediaImg} />
                    )}
                    {item.title && <div className={styles.mediaTitle}>{item.title}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer / Contact */}
      <footer id="contact" className={styles.footer}>
        <div className={`container ${styles.footerContainer}`}>
          <div className={styles.footerBrand}>
            <div style={{
              width: settings?.logoSize ? `${settings.logoSize}px` : '52px',
              height: settings?.logoSize ? `${settings.logoSize}px` : '52px',
              borderRadius: settings?.logoShape === 'circle' ? '50%' : settings?.logoShape === 'rounded' ? '12px' : '0',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#fff'
            }}>
              <img src={settings?.logoUrl || '/logo.png'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 className={styles.footerBrandName}>ASHTAVINAYAK FLYASH BRICKS</h3>
            <p className={styles.footerTagline}>Eco-Friendly Construction Solutions</p>
            {/* Social Media Links */}
            {(settings?.instagram || settings?.facebook || settings?.youtube || settings?.twitter || settings?.linkedin) && (
              <div className={styles.socialLinks}>
                {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" className={styles.socialLink} title="Instagram">📸</a>}
                {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" className={styles.socialLink} title="Facebook">👥</a>}
                {settings?.youtube && <a href={settings.youtube} target="_blank" rel="noreferrer" className={styles.socialLink} title="YouTube">▶️</a>}
                {settings?.twitter && <a href={settings.twitter} target="_blank" rel="noreferrer" className={styles.socialLink} title="Twitter / X">🐦</a>}
                {settings?.linkedin && <a href={settings.linkedin} target="_blank" rel="noreferrer" className={styles.socialLink} title="LinkedIn">💼</a>}
              </div>
            )}
          </div>

          <div className={styles.footerInfo}>
            <h4 className={styles.footerSectionTitle}>Contact Us</h4>
            {settings?.factoryAddress && (
              <p>📍 {settings.factoryAddress}</p>
            )}
            {settings?.contactPhone && (
              <p>📞 <CopyPhone phone={settings.contactPhone} /></p>
            )}
            {settings?.contactWhatsApp && (
              <p>💬 <a href={`https://wa.me/${settings.contactWhatsApp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                WhatsApp: {settings.contactWhatsApp}
              </a></p>
            )}
            {!settings?.factoryAddress && !settings?.contactPhone && (
              <p style={{color: '#94a3b8'}}>Contact details coming soon.</p>
            )}
          </div>

          <div className={styles.mapContainer}>
            {hasMap ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mapEmbedUrl ? (
                  <iframe
                    width="100%"
                    height="180"
                    style={{ border: 0, borderRadius: '8px', display: 'block' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapEmbedUrl}
                  />
                ) : (
                  <div className={styles.mapPlaceholder} style={{ height: '120px' }}>
                    <span>🗺</span>
                    <p style={{ fontSize: '0.85rem' }}>Also set your Factory Address to show the embedded map</p>
                  </div>
                )}
                {mapButtonUrl && (
                  <a
                    href={mapButtonUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', padding: '0.6rem 1.25rem',
                      background: 'rgba(249,115,22,0.15)', color: '#fb923c',
                      border: '1px solid rgba(249,115,22,0.3)', borderRadius: '8px',
                      textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
                    }}
                  >
                    📍 View on Google Maps
                  </a>
                )}
              </div>
            ) : (
              <div className={styles.mapPlaceholder}>
                <span>🗺</span>
                <p>Map will appear here</p>
                <p className={styles.smallText}>(Paste your Google Maps link in Admin → Settings)</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Ashtavinayak Flyash Bricks. All rights reserved.</p>
          <a href="/admin/login" className={styles.adminPortalLink} title="Owner Admin Portal">
            🔐 Admin Portal
          </a>
        </div>
      </footer>
    </div>
  );
}

