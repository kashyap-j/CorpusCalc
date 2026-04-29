import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  initialTab?: 'login' | 'signup';
  onClose: () => void;
}

type Tab = 'login' | 'signup';

export default function AuthModal({ initialTab = 'login', onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const clearForm = () => {
    setEmail(''); setPassword(''); setConfirm('');
    setError(''); setSuccess('');
  };

  const switchTab = (t: Tab) => { setTab(t); clearForm(); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onClose();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess('Check your email to confirm your account.');
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    // Preserve current path so AuthCallback can return the user here after OAuth
    sessionStorage.setItem('auth_redirect', window.location.pathname);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
    });
    setLoading(false);
    if (err) { sessionStorage.removeItem('auth_redirect'); setError(err.message); }
  };

  const inputCls =
    'w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-background border border-border shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={[
                  'px-4 py-1.5 rounded-md text-sm font-medium font-body transition-all',
                  tab === t
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="auth-login-email" className="text-xs font-medium text-foreground font-body">Email</label>
                <input
                  id="auth-login-email"
                  type="email" required autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputCls}
                  aria-describedby={error ? 'auth-login-error' : undefined}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="auth-login-password" className="text-xs font-medium text-foreground font-body">Password</label>
                <input
                  id="auth-login-password"
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className={inputCls}
                />
              </div>

              <div aria-live="polite" aria-atomic="true">
                {error && <p id="auth-login-error" role="alert" className="text-xs text-destructive font-body">{error}</p>}
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold font-body transition-all disabled:opacity-50"
                style={{ background: '#0f2318', color: '#f4f2ee' }}
              >
                {loading ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="auth-signup-email" className="text-xs font-medium text-foreground font-body">Email</label>
                <input
                  id="auth-signup-email"
                  type="email" required autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputCls}
                  aria-describedby={error ? 'auth-signup-error' : success ? 'auth-signup-success' : undefined}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="auth-signup-password" className="text-xs font-medium text-foreground font-body">Password</label>
                <input
                  id="auth-signup-password"
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="auth-signup-confirm" className="text-xs font-medium text-foreground font-body">Confirm password</label>
                <input
                  id="auth-signup-confirm"
                  type="password" required
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••" className={inputCls}
                />
              </div>

              <div aria-live="polite" aria-atomic="true">
                {error && <p id="auth-signup-error" role="alert" className="text-xs text-destructive font-body">{error}</p>}
                {success && <p id="auth-signup-success" className="text-xs text-forest font-body">{success}</p>}
              </div>

              <button
                type="submit" disabled={loading || !!success}
                className="w-full py-2.5 rounded-xl text-sm font-semibold font-body transition-all disabled:opacity-50"
                style={{ background: '#0f2318', color: '#f4f2ee' }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-body">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle} disabled={loading}
            className="w-full py-2.5 rounded-xl border border-border bg-card text-sm font-medium font-body text-foreground flex items-center justify-center gap-2.5 hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
