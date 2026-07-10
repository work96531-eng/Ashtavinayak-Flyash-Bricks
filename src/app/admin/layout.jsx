import Link from 'next/link';
import styles from './admin.module.css';
import { Package, Settings, ShoppingCart, LayoutDashboard, ExternalLink, Image } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: "Owner Panel - Ashtavinayak Flyash Bricks",
  robots: "noindex, nofollow",
};

// Force dynamic so logo updates immediately after saving settings
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  let logoUrl = '/logo.png';
  try {
    const settings = await prisma.settings.findFirst();
    if (settings?.logoUrl) logoUrl = settings.logoUrl;
  } catch {}

  return (
    <div className={styles.adminWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src={logoUrl} alt="Logo" className={styles.sidebarLogo} />
          <div>
            <h2 className={styles.sidebarTitle}>Owner Panel</h2>
            <p className={styles.sidebarBrand}>Ashtavinayak Flyash Bricks</p>
          </div>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.navLink}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className={styles.navLink}>
            <Package size={18} />
            <span>Products</span>
          </Link>
          <Link href="/admin/media" className={styles.navLink}>
            <Image size={18} />
            <span>Media Gallery</span>
          </Link>
          <Link href="/admin/orders" className={styles.navLink}>
            <ShoppingCart size={18} />
            <span>Orders</span>
          </Link>
          <Link href="/admin/settings" className={styles.navLink}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <a href="/" target="_blank" rel="noreferrer" className={styles.navLink}>
            <ExternalLink size={18} />
            <span>View Storefront</span>
          </a>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}
