'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header({ settings }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoUrl = settings?.logoUrl || '/logo.png';
  const logoSize = settings?.logoSize || 52;
  const logoShape = settings?.logoShape || 'square';
  const borderRadius = logoShape === 'circle' ? '50%' : logoShape === 'rounded' ? '12px' : '0';

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoImgWrapper} style={{ width: logoSize, height: logoSize, flexShrink: 0, borderRadius, overflow: 'hidden' }}>
            <Image
              src={logoUrl}
              alt="Ashtavinayak Flyash Bricks Logo"
              width={logoSize}
              height={logoSize}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority
            />
          </div>
          <div className={styles.logoTextGroup}>
            <span className={styles.logoText}>ASHTAVINAYAK FLYASH BRICKS</span>
            <span className={styles.logoTagline}>Eco-Friendly Construction Solutions</span>
          </div>
        </Link>
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.open : ''}`}>
          <a href="#products" className={styles.navLink} onClick={closeMenu}>Products</a>
          <a href="#about" className={styles.navLink} onClick={closeMenu}>About Us</a>
          <a href="#contact" className={styles.navLink} onClick={closeMenu}>Contact</a>
        </nav>
        <button className={styles.mobileMenuBtn} onClick={toggleMenu} aria-label="Menu">
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
