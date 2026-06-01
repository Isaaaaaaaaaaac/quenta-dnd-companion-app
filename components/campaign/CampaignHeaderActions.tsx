'use client';

import { useState, useEffect } from 'react';

export default function CampaignHeaderActions({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
      {children}
    </div>
  );
}
