import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  type?: 'error' | 'success';
}

export default function Toast({ message, onDismiss, type = 'error' }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const bg = type === 'success' ? '#16A34A' : '#DC2626';
  const shadow = type === 'success'
    ? '0 4px 24px rgba(22,163,74,0.35)'
    : '0 4px 24px rgba(220,38,38,0.35)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: bg,
        color: '#fff',
        borderRadius: '100px',
        padding: '10px 20px',
        fontSize: '13px',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        boxShadow: shadow,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'toastSlide 0.25s ease-out',
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        style={{ opacity: 0.75, cursor: 'pointer', fontSize: '14px', lineHeight: 1, background: 'none', border: 'none', color: '#fff' }}
        aria-label="Dismiss"
      >
        ✕
      </button>
      <style>{`
        @keyframes toastSlide {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
