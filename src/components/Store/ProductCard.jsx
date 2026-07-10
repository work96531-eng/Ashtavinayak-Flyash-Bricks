import Link from 'next/link';
import styles from './ProductCard.module.css';
import { Package, Phone } from 'lucide-react';

export default function ProductCard({ product }) {
  // Parsing specifications safely
  let specs = {};
  try {
    if (product.specifications) {
      specs = JSON.parse(product.specifications);
    }
  } catch (e) {
    console.error("Error parsing specs", e);
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.placeholderImage}>
            <Package size={48} color="var(--secondary)" />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        
        {Object.keys(specs).length > 0 && (
          <div className={styles.specs}>
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className={styles.specItem}>
                <span className={styles.specKey}>{key}:</span>
                <span className={styles.specValue}>{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.currency}>₹</span>
            {product.price.toFixed(2)}
            <span className={styles.unit}>/unit</span>
          </div>
          <a href="#contact" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} /> Contact
          </a>
        </div>
      </div>
    </div>
  );
}
