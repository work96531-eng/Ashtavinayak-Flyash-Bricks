'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now we don't have an order creation endpoint yet or GET endpoint
    // Just a placeholder since the user didn't ask for full checkout processing.
    // Wait, the user did ask for an "Order Tracker". Let's fetch from the DB.
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOrders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Order Tracker</h1>
      </div>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Incoming Orders</h2>
        {loading ? <p>Loading orders...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>ID / Date</th>
                <th style={{ padding: '0.75rem' }}>Customer</th>
                <th style={{ padding: '0.75rem' }}>Location</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No orders found.</td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{o.id}</div>
                      <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div>{o.customerName}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{o.phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div>{o.address}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{o.distance} km</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.75rem',
                        backgroundColor: o.status === 'PENDING' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: o.status === 'PENDING' ? 'var(--danger)' : 'var(--success)'
                      }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
