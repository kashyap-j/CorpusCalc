import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

/*
 * NOTE FOR TESTING — Disable email confirmation in Supabase:
 * 1. Go to your Supabase project dashboard
 * 2. Left sidebar → Authentication → Settings
 * 3. Under "User Signups", toggle OFF "Enable email confirmations"
 * 4. Save. Now users can sign up and log in instantly without email verification.
 */

interface LoginGateProps {
  variant: 'story' | 'family';
  onSuccess: () => void;
  onClose: () => void;
}

const COPY = {
  story: {
    heading: 'Your plan is ready',
    sub: 'Create a free account to see your personalised retirement story and save your plan forever.',
  },
  family: {
    heading: 'Your family plan is ready',
    sub: 'Log in to deploy your corpus and get your complete family retirement report.',
  },
};

function mapError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'Incorrect password. Please try again.';
  if (m.includes('email not confirmed'))
    return 'Please check your email to confirm your account, then log in.';
  if (m.includes('user already registered') || m.includes('already been registered') || m.includes('already registered'))
    return 'An account with this email already exists. Please log in instead.';
  if (m.includes('password should be at least') || (m.includes('password') && m.includes('6')))
    return 'Password must be at least 6 characters.';
  if (m.includes('unable to validate email') || m.includes('invalid format') || m.includes('valid email'))
    return 'Please enter a valid email address.';
  if (m.includes('email address cannot be used') || m.includes('disposable'))
    return 'Please use a different email address.';
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('user not found') || m.includes('no user found'))
    return 'No account found with this email. Try signing up instead.';
  return msg;
}

const inp: React.CSSProperties = {
  width: '100%',
  background: '#FAFAF8',
  border: '1.5px solid #E8E4DE',
  borderRadius: '12px',
  padding: '13px 16px',
  fontSize: '15px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
  );
}

export default function LoginGate({ variant, onSuccess, onClose }: LoginGateProps) {
  const { heading, sub } = COPY[variant];
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
    });
    setLoading(false);
    if (err) setError(mapError(err.message));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setInfo('');
    setLoading(true);

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (err) { setError(mapError(err.message)); return; }
      // If email confirmation is disabled, a session is returned immediately
      if (data.session) {
        onSuccess();
      } else {
        setInfo('Check your inbox to confirm your email, then log in below.');
        setMode('login');
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) { setError(mapError(err.message)); return; }
      onSuccess();
    }
  };

  const switchMode = (next: 'signup' | 'login') => {
    setMode(next);
    setError('');
    setInfo('');
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .lg-modal {
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-radius: 24px;
          padding: 20px 16px;
          box-shadow: 0 24px 80px rgba(15,35,24,0.25);
        }
        @media (min-width: 480px) {
          .lg-modal { padding: 32px 28px; }
        }
      `}</style>

      <div className="lg-modal">
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#0f2318', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>
            🔒
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#0f2318', textAlign: 'center', margin: '0 0 8px' }}>
          {heading}
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', fontFamily: 'var(--font-body)', margin: '0 0 24px', lineHeight: 1.5 }}>
          {sub}
        </p>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: '12px',
          border: '1.5px solid #E8E4DE', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px',
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? <Spinner /> : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#E8E4DE' }} />
          <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#E8E4DE' }} />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            aria-label="Email address"
            placeholder="Email address"
            style={{ ...inp, borderColor: error && error.includes('email') ? '#DC2626' : '#E8E4DE' }}
          />
          <input
            type="password" required value={password}
            onChange={e => setPassword(e.target.value)}
            aria-label="Password"
            placeholder={mode === 'signup' ? 'Create a password (min. 6 chars)' : 'Password'}
            style={{ ...inp, borderColor: error && error.includes('password') ? '#DC2626' : '#E8E4DE' }}
          />

          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div role="alert" style={{ borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>⚠</span>
                <p style={{ fontSize: '13px', color: '#DC2626', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.4 }}>{error}</p>
              </div>
            )}
            {info && (
              <div style={{ borderRadius: '10px', background: '#F0FDF4', border: '1px solid #86EFAC', padding: '10px 14px' }}>
                <p style={{ fontSize: '13px', color: '#16A34A', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.4 }}>{info}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#374151' : '#0f2318',
              color: '#f4f2ee',
              borderRadius: '12px', border: 'none',
              fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-body)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'background 0.15s',
            }}
          >
            {loading && <Spinner />}
            {loading ? 'One moment…' : mode === 'signup' ? 'Create free account' : 'Log in'}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-body)', color: '#6B7280', marginTop: '16px', marginBottom: '8px' }}>
          {mode === 'signup' ? 'Already have an account? ' : 'No account? '}
          <button
            onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
            style={{ color: '#0f2318', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', fontSize: '13px', fontFamily: 'var(--font-body)' }}
          >
            {mode === 'signup' ? 'Log in' : 'Sign up free'}
          </button>
        </p>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
          Free forever. No spam. No sharing.
        </p>
      </div>
    </div>
  );
}
