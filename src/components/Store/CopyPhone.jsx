'use client';

import { useState } from 'react';

export default function CopyPhone({ phone }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span style={{ position: 'relative' }}>
      <a 
        href={`tel:${phone}`} 
        onClick={handleCopy}
        style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        title="Click to copy number"
      >
        {phone}
      </a>
      {copied && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          marginBottom: '4px',
          zIndex: 10
        }}>
          Copied!
        </span>
      )}
    </span>
  );
}
