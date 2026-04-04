import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import AuthModal from '../auth/AuthModal';

const navLinks = [
  { label: 'Plan', href: '/plan' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Calculators', href: '/calculators' },
  { label: 'About', href: '/about' },
];

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined;
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return (user.email?.[0] ?? 'U').toUpperCase();
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Close modal when user signs in
  useEffect(() => {
    if (user) setAuthModal(null);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 20); setOpen(false); };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'hsla(38, 50%, 97%, 0.85)' : 'hsl(var(--background))',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <div className="container flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest">
              <span className="text-base font-bold font-body text-primary-foreground">C</span>
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="text-base font-bold text-foreground font-body">CorpusCalc</span>
              <span className="block text-[11px] text-muted-foreground font-body">Retirement Planner</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200 font-body"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: auth */}
          <div className="flex items-center gap-2">
            {user ? (
              /* ── Logged in ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold font-body transition-opacity hover:opacity-80"
                  style={{ background: '#0f2318', color: '#f4f2ee' }}
                  aria-label="Account menu"
                >
                  {getInitials(user)}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-background border border-border shadow-lg overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground font-body truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-3 py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/plan"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-3 py-2.5 text-sm font-body text-foreground hover:bg-secondary transition-colors"
                    >
                      My Plan
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-3 py-2.5 text-sm font-body text-destructive hover:bg-secondary transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Logged out ── */
              <>
                <button
                  onClick={() => setAuthModal('login')}
                  className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 font-body px-3 py-1.5"
                >
                  Log in
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="text-[13px] font-medium font-body px-4 py-1.5 rounded-full transition-all duration-200 text-primary-foreground hover:opacity-90"
                  style={{ background: '#0f2318' }}
                >
                  Sign up
                </button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-foreground ml-1"
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg flex flex-col items-center gap-6 py-8 z-40">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setOpen(false)}
                className="text-xl font-medium text-foreground font-body"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)} className="text-xl font-medium text-foreground font-body">My Account</Link>
                <Link to="/plan" onClick={() => setOpen(false)} className="text-xl font-medium text-foreground font-body">My Plan</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="text-xl font-medium text-destructive font-body">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthModal('login'); setOpen(false); }} className="text-xl font-medium text-foreground font-body">Log in</button>
                <button onClick={() => { setAuthModal('signup'); setOpen(false); }} className="text-xl font-medium text-foreground font-body">Sign up</button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Auth modal */}
      {authModal && (
        <AuthModal
          initialTab={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
