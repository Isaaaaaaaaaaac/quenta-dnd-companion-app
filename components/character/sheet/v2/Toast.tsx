'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './useToast';

const DISMISS_MS = 1800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--gold)',
            color: 'var(--fg-1)',
            fontSize: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--r-sm)',
            zIndex: 200,
          }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
