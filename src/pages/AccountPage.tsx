import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { usePlannerStore } from '../store/plannerStore';
import { compute, fmt, totMoExp, totMoIncome } from '../lib/math';
import { fetchUserPlan, type SavedPlan } from '../lib/supabase';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getDisplayName(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined;
  if (name?.trim()) return name.trim();
  return user.email?.split('@')[0] ?? 'Account';
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #E8E4DE',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #E8E4DE',
        background: '#FAFAF8',
      }}>
        <p style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#9CA3AF',
          fontFamily: 'var(--font-body)',
        }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #F5F3F0',
    }}>
      <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>
        {value}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();
  const { state: S } = usePlannerStore();
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);

  // Redirect to home if not logged in once auth resolves
  useEffect(() => {
    if (!loading && !user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  // Fetch saved plan from Supabase
  useEffect(() => {
    if (!user) return;
    fetchUserPlan(user.id).then(setSavedPlan).catch(() => {/* silent */});
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#f4f2ee',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid #E8E4DE',
          borderTop: '3px solid #e8622a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Plan completeness — age > 0 means at least Step 1 was filled
  const hasPlan = S.age > 0;
  const hasCorpus = hasPlan && S.step >= 5;
  const result = hasPlan ? compute(S) : null;
  const monthlyIncome = hasPlan ? totMoIncome(S) : 0;
  const monthlyExpenses = hasPlan ? totMoExp(S) : 0;

  const monthlySIP = (() => {
    if (!hasPlan) return 0;
    if (S.sipMode === 'fixed') return S.sipFixed;
    if (S.sipMode === 'flat') return S.sipAmt;
    if (S.sipMode === 'salary') return (S.salaryMonthly * S.sipAmt) / 100;
    return S.sipAmt;
  })();

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />

      {/* Hero strip */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2318 0%, #1a3a2a 60%, #0f2318 100%)',
        padding: '40px 24px 36px',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Avatar */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'hsl(var(--warm-gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 700,
            color: '#0f2318', fontFamily: 'var(--font-body)',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url as string}
                alt="User profile photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : getInitials(user)}
          </div>

          <div>
            <h1 style={{
              margin: '0 0 4px',
              fontSize: '22px', fontWeight: 700,
              color: '#fff', fontFamily: 'var(--font-display)',
              lineHeight: 1.2,
            }}>
              {getDisplayName(user)}
            </h1>
            <p style={{
              margin: 0,
              fontSize: '13px', color: 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-body)',
            }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 16px 60px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── 1. Profile ── */}
        <SectionCard title="Profile">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>
                {getDisplayName(user)}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: '1.5px solid #E8E4DE',
                background: '#fff',
                fontSize: '13px', fontWeight: 600,
                color: '#DC2626', fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>
        </SectionCard>

        {/* ── 2. My Retirement Plan ── */}
        <SectionCard title="My Retirement Plan">
          {!hasPlan ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '32px', margin: '0 0 10px' }}>📋</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
                You haven't built your plan yet
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 18px' }}>
                It takes about 5 minutes to get your retirement number.
              </p>
              <Link
                to="/"
                style={{
                  display: 'inline-block',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: '#0f2318',
                  color: '#f4f2ee',
                  fontSize: '13px', fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                }}
              >
                Build My Plan
              </Link>
            </div>
          ) : (
            <div>
              <StatRow label="Current age" value={`${S.age} years`} />
              <StatRow label="Retirement age" value={`${S.retAge} years`} />
              <StatRow label="Years to retirement" value={`${Math.max(0, S.retAge - S.age)} years`} />
              <StatRow label="Monthly income" value={monthlyIncome > 0 ? fmt(monthlyIncome) : '—'} />
              <StatRow label="Monthly expenses" value={monthlyExpenses > 0 ? fmt(monthlyExpenses) : '—'} />
              <div style={{ borderBottom: 'none' }}>
                <StatRow label="Monthly SIP" value={monthlySIP > 0 ? fmt(monthlySIP) : '—'} />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 3. Corpus Result ── */}
        <SectionCard title="Corpus Result">
          {!hasCorpus ? (
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
              Complete the planner through Step 5 to see your corpus projection.
            </p>
          ) : (
            <div>
              {/* Hero number */}
              <div style={{
                borderRadius: '12px',
                background: result!.onTrack ? '#F0FDF4' : '#FEF9EE',
                border: `1px solid ${result!.onTrack ? '#86EFAC' : '#FDE68A'}`,
                padding: '18px 20px',
                marginBottom: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
              }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: result!.onTrack ? '#16A34A' : '#D97706', fontFamily: 'var(--font-body)' }}>
                    Projected corpus at {S.retAge}
                  </p>
                  <p style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: result!.onTrack ? '#15803D' : '#92400E', fontFamily: 'var(--font-display)' }}>
                    {fmt(result!.totalCorpus)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
                    Required
                  </p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#6B7280', fontFamily: 'var(--font-display)' }}>
                    {fmt(result!.reqCorpus)}
                  </p>
                </div>
              </div>

              {savedPlan && (
                <StatRow
                  label="Saved corpus"
                  value={fmt(savedPlan.corpus_result)}
                />
              )}
              <StatRow label="Gap" value={result!.gap >= 0 ? `+${fmt(result!.gap)} surplus` : `-${fmt(Math.abs(result!.gap))} shortfall`} />
              <StatRow label="On track" value={result!.onTrack ? '✓ Yes' : '✗ Not yet'} />
              <StatRow label="Retirement duration" value={`${result!.dur} years`} />
              <StatRow
                label="Last calculated"
                value={savedPlan
                  ? new Date(savedPlan.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              />
            </div>
          )}
        </SectionCard>

        {/* ── 4. Update Details ── */}
        {hasPlan && (
          <SectionCard title="Update Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                Your plan inputs are saved in this browser. Head back to the planner to update any numbers and recalculate.
              </p>
              <Link
                to="/plan"
                style={{
                  display: 'inline-block',
                  padding: '11px 22px',
                  borderRadius: '10px',
                  background: '#0f2318',
                  color: '#f4f2ee',
                  fontSize: '13px', fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                  alignSelf: 'flex-start',
                }}
              >
                Recalculate my plan →
              </Link>
            </div>
          </SectionCard>
        )}

      </div>

      <Footer />
    </div>
  );
}
