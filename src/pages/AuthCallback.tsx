import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { usePlannerStore } from '../store/plannerStore';

// Reads the sessionStorage keys written by PlannerShell before the OAuth redirect,
// advances the planner step in the Zustand store, clears the keys, and returns
// the path to navigate to.
//
// Full flow:
//   1. User on Solo Step 4 clicks "See My Story →"
//   2. PlannerShell saves postAuthStep='next', postAuthMode='solo' to sessionStorage
//   3. LoginGate opens → user clicks Google sign-in → browser redirects to Google
//   4. Google redirects back to /auth/callback (same tab, sessionStorage survives)
//   5. exchangeCodeForSession succeeds → getPostAuthDestination() runs
//   6. Reads 'solo' → updates Zustand store step to 5 → clears keys → returns '/plan'
//   7. User lands on /plan with Step 5 (Retirement Story) active  ✅
//
// Kids flow: same but postAuthMode='kids', step advances 5 → 6  ✅
function getPostAuthDestination(): string {
  const pendingStep = sessionStorage.getItem('postAuthStep');
  const pendingMode = sessionStorage.getItem('postAuthMode');

  if (pendingStep === 'next' && pendingMode) {
    sessionStorage.removeItem('postAuthStep');
    sessionStorage.removeItem('postAuthMode');

    const { update } = usePlannerStore.getState();
    if (pendingMode === 'solo') {
      update({ step: 5 });  // Solo: Step 4 → Step 5 (Retirement Story)
    } else if (pendingMode === 'kids') {
      update({ step: 6 });  // Kids: Step 5 → Step 6 (Deploy Corpus)
    }
    return '/plan';
  }

  return '/';
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
      supabase.auth
        .exchangeCodeForSession(window.location.href)
        .then(({ error: err }) => {
          if (err) {
            setError(err.message);
          } else {
            navigate(getPostAuthDestination(), { replace: true });
          }
        });
    } else {
      // Code already consumed (e.g. component mounted twice) — check for existing session
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          navigate(getPostAuthDestination(), { replace: true });
        } else {
          setError('No authentication code found. Please try signing in again.');
        }
      });
    }
  }, [navigate]);

  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: '16px',
        background: '#f4f2ee', fontFamily: 'var(--font-body)',
      }}>
        <p style={{ fontSize: '16px', color: '#DC2626', maxWidth: '360px', textAlign: 'center' }}>
          {error}
        </p>
        <a href="/" style={{ fontSize: '14px', color: '#0f2318', fontWeight: 600 }}>
          Return home
        </a>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '16px',
      background: '#f4f2ee', fontFamily: 'var(--font-body)',
    }}>
      <Helmet>
        <title>Signing in… | CorpusCalc</title>
        <meta name="description" content="Please wait while we complete your sign-in." />
      </Helmet>
      <div style={{
        width: 40, height: 40,
        border: '3px solid #e8e4de',
        borderTop: '3px solid #e8622a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '15px', color: '#6B7280' }}>Signing you in…</p>
    </div>
  );
}
