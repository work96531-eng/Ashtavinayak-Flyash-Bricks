'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Store/Header';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [address, setAddress] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [distanceResult, setDistanceResult] = useState(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch basic settings for header
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(e => console.error(e));
  }, []);

  const checkLocation = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setIsChecking(true);
    setError('');
    setDistanceResult(null);

    try {
      const res = await fetch('/api/checkout/verify-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify distance');
      }

      setDistanceResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePlaceOrder = () => {
    // Basic mock order placement
    alert('Order placed successfully!');
    // Redirect or show success
  };

  return (
    <div className={styles.wrapper}>
      <Header settings={settings} />
      
      <main className={`container ${styles.main}`}>
        <div className={styles.checkoutBox}>
          <h1 className={styles.title}>Checkout</h1>
          
          <div className={styles.formGroup}>
            <label className="label">Delivery Address</label>
            <div className={styles.inputRow}>
              <input 
                type="text" 
                className="input" 
                placeholder="Enter your full address or pin location" 
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <button 
                className="btn btn-secondary" 
                onClick={checkLocation}
                disabled={isChecking}
              >
                {isChecking ? 'Checking...' : 'Verify'}
              </button>
            </div>
            <p className={styles.helpText}>We need to verify if your location is within our delivery radius.</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {distanceResult && (
            <div className={`${styles.resultBox} ${distanceResult.isWithinRadius ? styles.success : styles.danger}`}>
              <p className={styles.resultMessage}>{distanceResult.message}</p>
              <p className={styles.distanceInfo}>
                Calculated Distance: {distanceResult.distanceKm.toFixed(1)} km 
                (Max Allowed: {distanceResult.maxRadius} km)
              </p>
            </div>
          )}

          <div className={styles.actions}>
            <button 
              className={`btn btn-primary ${styles.placeOrderBtn}`}
              disabled={!distanceResult || !distanceResult.isWithinRadius}
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
