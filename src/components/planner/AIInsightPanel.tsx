import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlannerStore } from '../../store/plannerStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { computePlanHash } from '../../lib/hash';
import { fmt, compute } from '../../lib/math';
import type { PlannerState } from '../../lib/math';

// ── Types ─────────────────────────────────────────────────────────────────────

type PanelState = 'loading' | 'loaded' | 'error' | 'rate-limited';
type WaitlistStatus = 'idle' | 'submitting' | 'success' | 'error';

interface DiagnosticItem {
  type: 'critical' | 'warning' | 'positive' | 'info';
  title: string;
  detail: string;
}

interface SuggestionItem {
  title: string;
  detail: string;
  stateDiff: Partial<PlannerState>;
}

interface InsightData {
  summary: string;
  diagnostics: DiagnosticItem[];
  suggestions: SuggestionItem[];
}

interface AIInsightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EDGE_FN_URL =
  'https://oxjlzwvnhfopttcyeeao.supabase.co/functions/v1/generate-plan-insight';

const NOTIFY_WAITLIST_URL =
  'https://oxjlzwvnhfopttcyeeao.supabase.co/functions/v1/notify-waitlist-signup';

const LAST_CALL_KEY = 'cc_last_insight_call';
const WINDOW_MS = 24 * 60 * 60 * 1000;

const DIAG_DOT_COLOR: Record<DiagnosticItem['type'], string> = {
  critical: '#dc2626',
  warning:  '#e8622a',
  positive: '#16A34A',
  info:     '#0ea5e9',
};

const DIAG_LABEL: Record<DiagnosticItem['type'], string> = {
  critical: 'CRITICAL',
  warning:  'WARNING',
  positive: 'POSITIVE',
  info:     'INFO',
};

// Human-readable field name map for stateDiff table
const FIELD_LABELS: Record<string, string> = {
  sipAmt: 'SIP Amount', sipReturn: 'SIP Return', sipMode: 'SIP Mode',
  sipFixed: 'Annual Step-up', inflation: 'Inflation Rate',
  invGR: 'Investment Growth', invQuick: 'Investments', invMF: 'Mutual Funds',
  invEQ: 'Equities', invPF: 'Provident Fund', invDT: 'Debt',
  retAge: 'Retirement Age', lifeE: 'Life Expectancy',
  salaryMonthly: 'Monthly Salary', salaryGrowth: 'Salary Growth',
  expQMo: 'Monthly Expenses', retSipAmt: 'Retirement SIP',
};

const PCT_FIELDS = new Set(['sipReturn', 'inflation', 'invGR', 'salaryGrowth', 'eduInfl']);

function formatDiffValue(key: string, value: unknown): string {
  if (typeof value === 'number') {
    if (PCT_FIELDS.has(key)) return `${value}%`;
    return fmt(value);
  }
  return String(value);
}

// ── Health Score ──────────────────────────────────────────────────────────────

function calcHealthScore(diagnostics: DiagnosticItem[]): number {
  const criticals = diagnostics.filter(d => d.type === 'critical').length;
  const warnings  = diagnostics.filter(d => d.type === 'warning').length;
  const positives = diagnostics.filter(d => d.type === 'positive').length;
  if (criticals > 0) return Math.max(0, Math.min(59, 55 - (criticals - 1) * 10 - warnings * 5 + positives * 3));
  if (warnings  > 0) return Math.max(60, Math.min(89, 85 - (warnings - 1) * 8 + positives * 3));
  return Math.min(100, 90 + positives * 3);
}

function scoreColor(score: number): string {
  if (score >= 90) return '#16A34A';
  if (score >= 60) return '#EA8C00';
  return '#dc2626';
}

// ── Shared input style ────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: '1px solid #e5e7eb', fontSize: 13,
  fontFamily: 'var(--font-body)', color: '#0f2318',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
};

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(90deg, #f0eeeb 25%, #e8e4de 50%, #f0eeeb 75%)', backgroundSize: '200% 100%', animation: 'ai-shimmer 1.5s infinite' }} />
      <div style={{ flex: 1, height: 14, borderRadius: 6, background: 'linear-gradient(90deg, #f0eeeb 25%, #e8e4de 50%, #f0eeeb 75%)', backgroundSize: '200% 100%', animation: 'ai-shimmer 1.5s infinite' }} />
      <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg, #f0eeeb 25%, #e8e4de 50%, #f0eeeb 75%)', backgroundSize: '200% 100%', animation: 'ai-shimmer 1.5s infinite' }} />
    </div>
  );
}

// ── Rate-limited countdown card ───────────────────────────────────────────────

function RateLimitedCard() {
  const [remaining, setRemaining] = useState(() => {
    const last = localStorage.getItem(LAST_CALL_KEY);
    if (!last) return WINDOW_MS;
    return Math.max(0, WINDOW_MS - (Date.now() - parseInt(last, 10)));
  });

  useEffect(() => {
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 60000)), 60000);
    return () => clearInterval(t);
  }, []);

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const mins  = Math.floor((remaining % (60 * 60 * 1000)) / 60000);

  return (
    <div style={{ borderRadius: 12, padding: '20px 18px', background: '#fff7ed', border: '1px solid #FCD34D', textAlign: 'center' }}>
      <p style={{ fontSize: 28, margin: '0 0 10px' }}>⏳</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
        Already received insights
      </p>
      <p style={{ fontSize: 13, color: '#78350F', fontFamily: 'var(--font-body)', margin: '0 0 10px', lineHeight: 1.6 }}>
        Update your plan inputs and try again.
      </p>
      {remaining > 0 && (
        <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', fontFamily: 'var(--font-body)', margin: 0 }}>
          Try again in {hours}h {mins}m
        </p>
      )}
    </div>
  );
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

/*
 * fetchInsights — payload sent to generate-plan-insight edge function
 *
 * plannerState  (full Zustand store snapshot, all monetary fields in raw ₹ integers):
 *   name          — user's display name (string)
 *   age           — current age (integer years)
 *   retAge        — retirement age (integer years)
 *   lifeE         — life expectancy (integer years)
 *   salaryMonthly — monthly salary in ₹
 *   salaryGrowth  — salary growth rate (%, e.g. 8)
 *   sipAmt        — monthly SIP in ₹
 *   sipReturn     — expected SIP CAGR (%, e.g. 12)
 *   sipMode       — 'flat' | 'salary' | 'fixed'
 *   sipFixed      — annual SIP step-up in ₹ (used when sipMode='fixed')
 *   invMode       — 'quick' | 'detailed'
 *   invQuick      — existing investments total in ₹ (quick mode)
 *   invMF/invEQ/invPF/invDT — detailed investment buckets in ₹
 *   invGR         — existing investment growth rate (%, e.g. 10)
 *   expMode       — 'quick' | 'detailed'
 *   expQMo        — monthly expenses in ₹ (quick mode)
 *   expQYr        — annual one-time expenses in ₹
 *   inflation     — inflation rate (%, e.g. 6)
 *
 * computedResult  (output of compute(), all monetary in raw ₹ integers):
 *   totalCorpus — projected corpus at retirement
 *   reqCorpus   — required corpus at retirement
 *   gap         — reqCorpus - totalCorpus (positive = shortfall)
 *   pct         — totalCorpus / reqCorpus × 100 (integer)
 *   onTrack     — totalCorpus >= reqCorpus (boolean)
 *   years       — years to retirement (integer)
 *   dur         — retirement duration in years (integer)
 *   mult        — corpus multiplier: 25, 30, or 35
 *
 * NOT sent: step, tab, showErrors, phases[], deps[], kids[], any UI/display state
 */
async function fetchInsights(
  plannerState: PlannerState,
  cr: ReturnType<typeof compute>,
  userId: string | undefined,
  signal?: AbortSignal
): Promise<InsightData> {
  const hash = await computePlanHash(plannerState) + (import.meta.env.DEV ? Date.now() : '');
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      plannerState,
      plan_hash: hash,
      userId,
      computedResult: {
        totalCorpus: cr.totalCorpus,
        reqCorpus: cr.reqCorpus,
        gap: cr.gap,
        pct: Math.round(cr.pct),
        onTrack: cr.onTrack,
        years: cr.years,
        dur: cr.dur,
        mult: cr.mult,
      },
    }),
  });

  if (res.status === 429) throw Object.assign(new Error('rate-limited'), { status: 429 });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw Object.assign(new Error(text || `Error ${res.status}`), { status: res.status });
  }
  // Record call timestamp for countdown
  localStorage.setItem(LAST_CALL_KEY, Date.now().toString());
  return res.json() as Promise<InsightData>;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AIInsightPanel({ isOpen, onClose }: AIInsightPanelProps) {
  const { state: plannerState, update } = usePlannerStore();
  const { user } = useAuthStore();

  const plannerStateRef = useRef(plannerState);
  useEffect(() => { plannerStateRef.current = plannerState; }, [plannerState]);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [panelState, setPanelState] = useState<PanelState>('loading');
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [appliedSet, setAppliedSet] = useState<Set<number>>(new Set());
  const [computedResult, setComputedResult] = useState<ReturnType<typeof compute> | null>(null);
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);
  const scorePillRef = useRef<HTMLDivElement>(null);

  // Waitlist form state
  const [waitlistExpanded, setWaitlistExpanded] = useState(false);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState(user?.email ?? '');
  const [waitlistWhatsapp, setWaitlistWhatsapp] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>('idle');
  const [waitlistError, setWaitlistError] = useState('');

  useEffect(() => {
    if (user?.email && !waitlistEmail) setWaitlistEmail(user.email);
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dismiss score tooltip on tap-outside (mobile)
  useEffect(() => {
    if (!showScoreTooltip || !isMobile) return;
    const handleDocClick = () => setShowScoreTooltip(false);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [showScoreTooltip, isMobile]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setPanelState('loading');
    setInsightData(null);
    setAppliedSet(new Set());
    const snapshot = plannerStateRef.current;
    const cr = compute(snapshot);
    setComputedResult(cr);
    fetchInsights(snapshot, cr, user?.id, controller.signal)
      .then(data => { setInsightData(data); setPanelState('loaded'); })
      .catch((err: Error & { status?: number }) => {
        if (controller.signal.aborted) return;
        if (err.status === 429) setPanelState('rate-limited');
        else { setErrorMsg(err.message || 'Could not fetch insights.'); setPanelState('error'); }
      });
    return () => controller.abort();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setPanelState('loading');
    setInsightData(null);
    setErrorMsg('');
    const cr = compute(plannerStateRef.current);
    setComputedResult(cr);
    fetchInsights(plannerStateRef.current, cr, user?.id)
      .then(data => { setInsightData(data); setPanelState('loaded'); })
      .catch((err: Error & { status?: number }) => {
        if (err.status === 429) setPanelState('rate-limited');
        else { setErrorMsg(err.message || 'Could not fetch insights.'); setPanelState('error'); }
      });
  };

  const handleApply = (idx: number, diff: Partial<PlannerState>) => {
    const validDiff: Partial<PlannerState> = {};
    for (const key of Object.keys(diff) as (keyof PlannerState)[]) {
      if (key in plannerState) {
        (validDiff as Record<string, unknown>)[key] = diff[key];
      }
    }
    if (Object.keys(validDiff).length > 0) {
      update(validDiff);
      // Re-run compute with merged state so the corpus snapshot updates immediately
      setComputedResult(compute({ ...plannerState, ...validDiff } as PlannerState));
    }
    setAppliedSet(prev => new Set([...prev, idx]));
    setTimeout(() => setAppliedSet(prev => { const n = new Set(prev); n.delete(idx); return n; }), 2000);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistError('');
    if (!waitlistName.trim()) { setWaitlistError('Name is required.'); return; }
    if (!waitlistEmail.trim()) { setWaitlistError('Email is required.'); return; }
    setWaitlistStatus('submitting');
    const { error } = await supabase.from('elite_waitlist').insert({
      name: waitlistName.trim(), email: waitlistEmail.trim(),
      whatsapp: waitlistWhatsapp.trim() || null, user_id: user?.id ?? null,
    });
    if (error) { setWaitlistError('Something went wrong. Try again.'); setWaitlistStatus('error'); }
    else { setWaitlistStatus('success'); setWaitlistExpanded(false); }
  };

  // ── Layout styles ──────────────────────────────────────────────────────────

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 900,
  };

  const panelStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    width: '100%', height: '85vh', borderRadius: '16px 16px 0 0',
    background: '#fff', zIndex: 1000, overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 -4px 40px rgba(15,35,24,0.15)',
  } : {
    position: 'fixed', top: 0, right: 0,
    width: 420, height: '100vh',
    background: '#fff', zIndex: 1000, overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
    boxShadow: '-4px 0 40px rgba(15,35,24,0.15)',
  };

  const panelVariants = isMobile
    ? { hidden: { y: '100%' }, visible: { y: 0 }, exit: { y: '100%' } }
    : { hidden: { x: '100%' }, visible: { x: 0 }, exit: { x: '100%' } };

  const spring = { type: 'spring', damping: 30, stiffness: 300 } as const;

  // ── Derived ────────────────────────────────────────────────────────────────

  const score = insightData ? calcHealthScore(insightData.diagnostics) : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes ai-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="ai-backdrop"
              style={overlayStyle}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />

            <motion.div
              key="ai-panel"
              style={panelStyle}
              variants={panelVariants}
              initial="hidden" animate="visible" exit="exit"
              transition={spring}
            >
              {/* ── Header ──────────────────────────────────────────────────── */}
              <div style={{
                padding: '18px 20px', borderBottom: '1px solid #F0EDE8',
                flexShrink: 0, position: 'sticky', top: 0,
                background: '#fff', zIndex: 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>
                      CorpusCalc Plan Insights
                    </p>
                    {/* Health Score pill with tooltip */}
                    {score !== null && (
                      <div
                        ref={scorePillRef}
                        style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
                        onMouseEnter={() => { if (!isMobile) setShowScoreTooltip(true); }}
                        onMouseLeave={() => { if (!isMobile) setShowScoreTooltip(false); }}
                        onClick={(e) => { if (isMobile) { e.stopPropagation(); setShowScoreTooltip(v => !v); } }}
                      >
                        {showScoreTooltip && (
                          <div style={{
                            position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#0f2318', color: '#fff', fontSize: 12,
                            padding: '8px 10px', borderRadius: 6,
                            whiteSpace: 'nowrap', zIndex: 10,
                            fontFamily: 'var(--font-body)', lineHeight: 1.6,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            pointerEvents: 'none',
                          }}>
                            Plan Health Score — based on your diagnostics.<br />
                            90+ = Strong | 60–89 = Needs attention | Below 60 = At risk
                          </div>
                        )}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 36, height: 36, borderRadius: '50%',
                          background: scoreColor(score),
                          boxShadow: `0 0 0 3px ${scoreColor(score)}22`,
                          cursor: 'pointer',
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-body)', lineHeight: 1 }}>
                            {score}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: '#F8F7F4', border: '1px solid #E8E4DE',
                      fontSize: 18, color: '#6B7280', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1, flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* ── Body ────────────────────────────────────────────────────── */}
              <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

                {/* Corpus snapshot — computed client-side, shows instantly before AI responds */}
                {computedResult && (
                  <div style={{ borderRadius: 12, background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '14px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Projected</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.1 }}>{fmt(computedResult.totalCorpus)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Required</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.1 }}>{fmt(computedResult.reqCorpus)}</p>
                      </div>
                    </div>
                    <div style={{ background: '#E8E4DE', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', borderRadius: 4, background: computedResult.onTrack ? '#16A34A' : '#e8622a', width: `${Math.min(Math.round(computedResult.pct), 100)}%`, transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: 0, fontFamily: 'var(--font-body)', color: computedResult.onTrack ? '#16A34A' : '#dc2626' }}>
                      {computedResult.onTrack
                        ? `${Math.round(computedResult.pct)}% funded — Surplus ${fmt(Math.abs(computedResult.gap))} ✓`
                        : `${Math.round(computedResult.pct)}% funded — Gap ${fmt(computedResult.gap)}`}
                    </p>
                  </div>
                )}

                {/* Loading — 3 skeleton rows */}
                {panelState === 'loading' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'var(--font-body)', textAlign: 'center', margin: '8px 0 16px' }}>
                      Analysing your plan…
                    </p>
                    <SkeletonRow />
                    <div style={{ borderTop: '1px solid #F0EDE8' }} />
                    <SkeletonRow />
                    <div style={{ borderTop: '1px solid #F0EDE8' }} />
                    <SkeletonRow />
                  </div>
                )}

                {/* Error */}
                {panelState === 'error' && (
                  <div style={{ borderRadius: 12, padding: '20px 18px', background: '#fef2f2', border: '1px solid #FECACA', textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
                      Something went wrong
                    </p>
                    <p style={{ fontSize: 13, color: '#7F1D1D', fontFamily: 'var(--font-body)', margin: '0 0 16px', lineHeight: 1.5 }}>
                      {errorMsg || 'Could not fetch insights. Please try again.'}
                    </p>
                    <button
                      onClick={handleRetry}
                      style={{ padding: '9px 20px', borderRadius: 10, background: '#dc2626', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Rate-limited */}
                {panelState === 'rate-limited' && <RateLimitedCard />}

                {/* Loaded */}
                {panelState === 'loaded' && insightData && (
                  <>
                    {/* Summary */}
                    <div style={{ borderRadius: 12, padding: '14px 16px', background: '#F8F7F4', border: '1px solid #E8E4DE' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
                        Summary
                      </p>
                      <p style={{ fontSize: 14, color: '#374151', fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0 }}>
                        {insightData.summary}
                      </p>
                    </div>

                    {/* Diagnostics — compact table */}
                    {insightData.diagnostics.length > 0 && (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
                          Diagnostics
                        </p>
                        <div style={{ border: '1px solid #E8E4DE', borderRadius: 10, overflow: 'hidden' }}>
                          {insightData.diagnostics.map((d, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'grid', gridTemplateColumns: '20px 1fr',
                                gap: '0 10px', padding: '12px 14px',
                                borderBottom: i < insightData.diagnostics.length - 1 ? '1px solid #F0EDE8' : 'none',
                                background: i % 2 === 0 ? '#fff' : '#FAFAF8',
                              }}
                            >
                              <span style={{ color: DIAG_DOT_COLOR[d.type], fontSize: 16, lineHeight: '20px', marginTop: 1 }}>●</span>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: DIAG_DOT_COLOR[d.type], fontFamily: 'var(--font-body)' }}>
                                    {DIAG_LABEL[d.type]}
                                  </span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)' }}>
                                    {d.title}
                                  </span>
                                </div>
                                <p style={{ fontSize: 12, color: '#6B7280', fontFamily: 'var(--font-body)', lineHeight: 1.5, margin: 0 }}>
                                  {d.detail}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {insightData.suggestions.length > 0 && (
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
                          Suggestions
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {insightData.suggestions.map((s, i) => {
                            const diffEntries = Object.entries(s.stateDiff ?? {}).filter(([k]) => k in plannerState);
                            return (
                              <div key={i} style={{ borderRadius: 10, background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '12px 14px' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 5px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                  <span style={{ color: '#e8622a', flexShrink: 0 }}>→</span>
                                  {s.title}
                                </p>
                                <p style={{ fontSize: 12, color: '#6B7280', fontFamily: 'var(--font-body)', lineHeight: 1.55, margin: '0 0 10px' }}>
                                  {s.detail}
                                </p>

                                {/* stateDiff mini-table */}
                                {diffEntries.length > 0 && (
                                  <div style={{ borderRadius: 7, overflow: 'hidden', border: '1px solid #E8E4DE', marginBottom: 10 }}>
                                    {diffEntries.map(([key, val], j) => (
                                      <div key={key} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '6px 10px',
                                        background: j % 2 === 0 ? '#fff' : '#F8F7F4',
                                        borderBottom: j < diffEntries.length - 1 ? '1px solid #F0EDE8' : 'none',
                                      }}>
                                        <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
                                          {FIELD_LABELS[key] ?? key}
                                        </span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)' }}>
                                          {formatDiffValue(key, val)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {diffEntries.length > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => handleApply(i, s.stateDiff)}
                                      style={{
                                        padding: '6px 14px', borderRadius: 8,
                                        background: appliedSet.has(i) ? '#16A34A' : '#0f2318',
                                        border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
                                        fontFamily: 'var(--font-body)', cursor: 'pointer',
                                        transition: 'background 0.2s',
                                      }}
                                    >
                                      {appliedSet.has(i) ? 'Applied ✓' : 'Apply to plan'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Footer — Elite Waitlist ──────────────────────────────────── */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid #F0EDE8', flexShrink: 0 }}>
                {waitlistStatus === 'success' && (
                  <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center' }}>
                    You're on the list ✓
                  </p>
                )}

                {waitlistStatus !== 'success' && !waitlistExpanded && (
                  <p style={{ fontSize: 12, color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center' }}>
                    Want personalised advice from a SEBI Registered Investment Adviser (RIA)?{' '}
                    <button
                      onClick={() => {
                        computePlanHash(plannerStateRef.current).then(hash => {
                          fetch(NOTIFY_WAITLIST_URL, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                            },
                            body: JSON.stringify({
                              name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '',
                              email: user?.email || '',
                              plan_hash: hash,
                              timestamp: new Date().toISOString(),
                            }),
                          }).catch(() => {});
                        }).catch(() => {});
                        setWaitlistExpanded(true);
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#e8622a', fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                    >
                      Join the waitlist →
                    </button>
                  </p>
                )}

                {waitlistStatus !== 'success' && waitlistExpanded && (
                  <form onSubmit={handleWaitlistSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 2px' }}>
                      Get a human review of your plan
                    </p>
                    <input type="text" placeholder="Your name" value={waitlistName} onChange={e => setWaitlistName(e.target.value)} style={INPUT_STYLE} required />
                    <input type="email" placeholder="Email address" value={waitlistEmail} onChange={e => setWaitlistEmail(e.target.value)} style={INPUT_STYLE} required />
                    <input type="tel" placeholder="WhatsApp number (optional)" value={waitlistWhatsapp} onChange={e => setWaitlistWhatsapp(e.target.value)} style={INPUT_STYLE} />
                    {waitlistError && (
                      <p style={{ fontSize: 12, color: '#dc2626', fontFamily: 'var(--font-body)', margin: 0 }}>{waitlistError}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="submit" disabled={waitlistStatus === 'submitting'}
                        style={{ padding: '9px 18px', borderRadius: 8, background: '#0f2318', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', opacity: waitlistStatus === 'submitting' ? 0.6 : 1 }}
                      >
                        {waitlistStatus === 'submitting' ? 'Joining…' : 'Join Waitlist'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setWaitlistExpanded(false); setWaitlistError(''); }}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#9CA3AF', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                      >
                        Never mind
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
