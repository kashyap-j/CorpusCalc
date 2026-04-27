import { useState, useEffect, useRef } from 'react';
import { usePlannerStore } from '../../store/plannerStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
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
  // stateDiff targets — wiring to store.update() happens Saturday session:
  // - `dep`     → DeployCorpusUI Instruments list (debt/equity split) — Step 6
  // - `phases`  → DeployCorpusUI PhaseCard expense budgets — Step 6
  // - `phDep`   → DeployCorpusUI per-phase instrument overrides — Step 6
  // - `sipAmt`  → Step 4 SIP amount (cross-step, needs navigation awareness)
  // - `sipReturn` / `inflation` → return/inflation assumption flags
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

const DIAG_STYLE: Record<DiagnosticItem['type'], { bg: string; borderColor: string }> = {
  critical: { bg: '#fef2f2', borderColor: '#dc2626' },
  warning:  { bg: '#fff7ed', borderColor: '#e8622a' },
  positive: { bg: '#f0fdf4', borderColor: '#16A34A' },
  info:     { bg: '#f0f9ff', borderColor: '#0ea5e9' },
};

const DIAG_LABEL: Record<DiagnosticItem['type'], string> = {
  critical: 'Critical',
  warning:  'Warning',
  positive: 'Positive',
  info:     'Info',
};

const DIAG_LABEL_COLOR: Record<DiagnosticItem['type'], string> = {
  critical: '#dc2626',
  warning:  '#e8622a',
  positive: '#16A34A',
  info:     '#0ea5e9',
};

// ── Styles (<style> block for animation + media query only; rest is inline) ───

const PANEL_CSS = `
  .ai-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 900;
  }
  .ai-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: #fff;
    z-index: 1000;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: -4px 0 40px rgba(15, 35, 24, 0.15);
  }
  .ai-panel.ai-panel--open {
    transform: translateX(0);
  }
  @media (max-width: 768px) {
    .ai-panel {
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 85vh;
      border-radius: 16px 16px 0 0;
      transform: translateY(100%);
      box-shadow: 0 -4px 40px rgba(15, 35, 24, 0.15);
    }
    .ai-panel.ai-panel--open {
      transform: translateY(0);
    }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function computePlanHash(plannerState: PlannerState): Promise<string> {
  const msgBuffer = new TextEncoder().encode(JSON.stringify(plannerState));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonBlock({ height = 80 }: { height?: number }) {
  return (
    <div style={{
      height, borderRadius: 12,
      background: 'linear-gradient(90deg, #f0eeeb 25%, #e8e4de 50%, #f0eeeb 75%)',
      backgroundSize: '200% 100%',
      animation: 'ai-shimmer 1.5s infinite',
    }} />
  );
}

// ── Shared input style ────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #e5e7eb',
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  color: '#0f2318',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

// ── Main component ────────────────────────────────────────────────────────────

export default function AIInsightPanel({ isOpen, onClose }: AIInsightPanelProps) {
  const { state: plannerState } = usePlannerStore();
  const { user } = useAuthStore();
  const plannerStateRef = useRef(plannerState);
  useEffect(() => { plannerStateRef.current = plannerState; }, [plannerState]);

  // Insight API state
  const [panelState, setPanelState] = useState<PanelState>('loading');
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [appliedSet, setAppliedSet] = useState<Set<number>>(new Set());

  // Waitlist form state
  const [waitlistExpanded, setWaitlistExpanded] = useState(false);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState(user?.email ?? '');
  const [waitlistWhatsapp, setWaitlistWhatsapp] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>('idle');
  const [waitlistError, setWaitlistError] = useState('');

  // Sync email pre-fill if user loads after mount
  useEffect(() => {
    if (user?.email && !waitlistEmail) {
      setWaitlistEmail(user.email);
    }
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger API call whenever the panel opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setPanelState('loading');
    setInsightData(null);
    setAppliedSet(new Set());

    const stateSnapshot = plannerStateRef.current;

    const run = async () => {
      try {
        const hash = await computePlanHash(stateSnapshot);
        const res = await fetch(EDGE_FN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plannerState: stateSnapshot, plan_hash: hash }),
        });

        if (cancelled) return;

        if (res.status === 429) {
          setPanelState('rate-limited');
          return;
        }

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          setErrorMsg(text || `Error ${res.status}`);
          setPanelState('error');
          return;
        }

        const data: InsightData = await res.json();
        if (!cancelled) {
          setInsightData(data);
          setPanelState('loaded');
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Network error');
          setPanelState('error');
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, [isOpen]); // plannerState intentionally excluded — capture state at open time

  const handleApply = (idx: number, diff: Partial<PlannerState>) => {
    // Visual-only for now. Saturday session: wire to store.update(diff)
    // Step 6 fields targeted by stateDiff:
    //   `dep`    → instruments array in DeployCorpusUI (debt/equity split)
    //   `phases` → phase expense budgets in PhaseCard
    //   `phDep`  → per-phase instrument override map
    console.log('[AIInsightPanel] Suggestion applied (visual only):', idx, diff);
    setAppliedSet(prev => new Set([...prev, idx]));
    setTimeout(() => {
      setAppliedSet(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }, 2000);
  };

  const handleRetry = () => {
    setPanelState('loading');
    setInsightData(null);

    const stateSnapshot = plannerStateRef.current;
    const run = async () => {
      try {
        const hash = await computePlanHash(stateSnapshot);
        const res = await fetch(EDGE_FN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plannerState: stateSnapshot, plan_hash: hash }),
        });
        if (res.status === 429) { setPanelState('rate-limited'); return; }
        if (!res.ok) { setErrorMsg(`Error ${res.status}`); setPanelState('error'); return; }
        const data: InsightData = await res.json();
        setInsightData(data);
        setPanelState('loaded');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Network error');
        setPanelState('error');
      }
    };
    run();
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistError('');

    if (!waitlistName.trim()) { setWaitlistError('Name is required.'); return; }
    if (!waitlistEmail.trim()) { setWaitlistError('Email is required.'); return; }

    setWaitlistStatus('submitting');

    const { error } = await supabase.from('elite_waitlist').insert({
      name: waitlistName.trim(),
      email: waitlistEmail.trim(),
      whatsapp: waitlistWhatsapp.trim() || null,
      user_id: user?.id ?? null,
    });

    if (error) {
      setWaitlistError('Something went wrong. Try again.');
      setWaitlistStatus('error');
    } else {
      setWaitlistStatus('success');
      setWaitlistExpanded(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{PANEL_CSS}</style>
      <style>{`@keyframes ai-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Backdrop */}
      <div className="ai-overlay" onClick={onClose} />

      {/* Sliding panel */}
      <div className={`ai-panel${isOpen ? ' ai-panel--open' : ''}`}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid #F0EDE8',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{
              fontSize: 17, fontWeight: 700, color: '#0f2318',
              fontFamily: 'var(--font-body)', margin: 0,
            }}>
              AI Plan Insights
            </p>
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

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Loading state */}
          {panelState === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{
                fontSize: 12, color: '#9CA3AF', fontFamily: 'var(--font-body)',
                textAlign: 'center', margin: '8px 0',
              }}>
                Analysing your plan…
              </p>
              <SkeletonBlock height={72} />
              <SkeletonBlock height={90} />
              <SkeletonBlock height={90} />
              <SkeletonBlock height={80} />
            </div>
          )}

          {/* Error state */}
          {panelState === 'error' && (
            <div style={{
              borderRadius: 12, padding: '20px 18px',
              background: '#fef2f2', border: '1px solid #FECACA',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: 15, fontWeight: 700, color: '#dc2626',
                fontFamily: 'var(--font-body)', margin: '0 0 8px',
              }}>
                Something went wrong
              </p>
              <p style={{
                fontSize: 13, color: '#7F1D1D',
                fontFamily: 'var(--font-body)', margin: '0 0 16px', lineHeight: 1.5,
              }}>
                {errorMsg || 'Could not fetch insights. Please try again.'}
              </p>
              <button
                onClick={handleRetry}
                style={{
                  padding: '9px 20px', borderRadius: 10,
                  background: '#dc2626', border: 'none',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Rate-limited state */}
          {panelState === 'rate-limited' && (
            <div style={{
              borderRadius: 12, padding: '20px 18px',
              background: '#fff7ed', border: '1px solid #FCD34D',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 28, margin: '0 0 10px' }}>⏳</p>
              <p style={{
                fontSize: 15, fontWeight: 700, color: '#92400E',
                fontFamily: 'var(--font-body)', margin: '0 0 8px',
              }}>
                Already received insights
              </p>
              <p style={{
                fontSize: 13, color: '#78350F',
                fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6,
              }}>
                You've already received insights for this plan. Update your inputs and try again.
              </p>
            </div>
          )}

          {/* Loaded state */}
          {panelState === 'loaded' && insightData && (
            <>
              {/* Summary */}
              <div style={{
                borderRadius: 12, padding: '16px 18px',
                background: '#F8F7F4', border: '1px solid #E8E4DE',
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.8px', color: '#9CA3AF',
                  fontFamily: 'var(--font-body)', margin: '0 0 10px',
                }}>
                  Summary
                </p>
                <p style={{
                  fontSize: 14, color: '#374151',
                  fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0,
                }}>
                  {insightData.summary}
                </p>
              </div>

              {/* Diagnostics */}
              {insightData.diagnostics.length > 0 && (
                <div>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: '#0f2318',
                    fontFamily: 'var(--font-body)', margin: '0 0 10px',
                  }}>
                    What we found
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {insightData.diagnostics.map((d, i) => (
                      <div key={i} style={{
                        borderRadius: 10,
                        background: DIAG_STYLE[d.type].bg,
                        borderLeft: `4px solid ${DIAG_STYLE[d.type].borderColor}`,
                        border: `1px solid ${DIAG_STYLE[d.type].borderColor}22`,
                        borderLeftWidth: 4,
                        padding: '12px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: DIAG_LABEL_COLOR[d.type],
                            fontFamily: 'var(--font-body)',
                          }}>
                            {DIAG_LABEL[d.type]}
                          </span>
                          <span style={{
                            fontSize: 13, fontWeight: 700, color: '#0f2318',
                            fontFamily: 'var(--font-body)',
                          }}>
                            {d.title}
                          </span>
                        </div>
                        <p style={{
                          fontSize: 13, color: '#374151',
                          fontFamily: 'var(--font-body)', lineHeight: 1.55, margin: 0,
                        }}>
                          {d.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {insightData.suggestions.length > 0 && (
                <div>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: '#0f2318',
                    fontFamily: 'var(--font-body)', margin: '0 0 10px',
                  }}>
                    What to consider
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {insightData.suggestions.map((s, i) => (
                      <div key={i} style={{
                        borderRadius: 10,
                        background: '#F8F7F4',
                        border: '1px solid #E8E4DE',
                        padding: '12px 14px',
                      }}>
                        <p style={{
                          fontSize: 13, fontWeight: 700, color: '#0f2318',
                          fontFamily: 'var(--font-body)', margin: '0 0 5px',
                        }}>
                          {s.title}
                        </p>
                        <p style={{
                          fontSize: 13, color: '#374151',
                          fontFamily: 'var(--font-body)', lineHeight: 1.55, margin: '0 0 10px',
                        }}>
                          {s.detail}
                        </p>
                        {/* Apply button — visual only until Saturday wiring session.
                            stateDiff keys to wire:
                            - `dep`    → store.update({ dep: s.stateDiff.dep })   → Step 6 instruments
                            - `phases` → store.update({ phases: ... })            → Step 6 phase budgets
                            - `sipAmt` → store.update({ sipAmt: ... })            → Step 4 SIP (cross-step)
                        */}
                        <button
                          onClick={() => handleApply(i, s.stateDiff)}
                          style={{
                            padding: '6px 14px', borderRadius: 8,
                            background: appliedSet.has(i) ? '#16A34A' : '#0f2318',
                            border: 'none',
                            color: '#fff', fontSize: 12, fontWeight: 600,
                            fontFamily: 'var(--font-body)', cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                        >
                          {appliedSet.has(i) ? 'Applied ✓' : 'Apply'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer — Elite Waitlist ──────────────────────────────────────── */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #F0EDE8',
          flexShrink: 0,
        }}>

          {/* Success state — shown permanently once submitted */}
          {waitlistStatus === 'success' && (
            <p style={{
              fontSize: 13, color: '#16A34A', fontWeight: 600,
              fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center',
            }}>
              You're on the list ✓
            </p>
          )}

          {/* Collapsed prompt */}
          {waitlistStatus !== 'success' && !waitlistExpanded && (
            <p style={{
              fontSize: 12, color: '#6B7280',
              fontFamily: 'var(--font-body)', margin: 0, textAlign: 'center',
            }}>
              Want a human to review your plan?{' '}
              <button
                onClick={() => setWaitlistExpanded(true)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: '#e8622a', fontWeight: 600, fontSize: 12,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                Join the waitlist →
              </button>
            </p>
          )}

          {/* Expanded inline form */}
          {waitlistStatus !== 'success' && waitlistExpanded && (
            <form onSubmit={handleWaitlistSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: '#0f2318',
                fontFamily: 'var(--font-body)', margin: '0 0 2px',
              }}>
                Get a human review of your plan
              </p>

              <input
                type="text"
                placeholder="Your name"
                value={waitlistName}
                onChange={e => setWaitlistName(e.target.value)}
                style={INPUT_STYLE}
                required
              />

              <input
                type="email"
                placeholder="Email address"
                value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                style={INPUT_STYLE}
                required
              />

              <input
                type="tel"
                placeholder="WhatsApp number (optional)"
                value={waitlistWhatsapp}
                onChange={e => setWaitlistWhatsapp(e.target.value)}
                style={INPUT_STYLE}
              />

              {waitlistError && (
                <p style={{
                  fontSize: 12, color: '#dc2626',
                  fontFamily: 'var(--font-body)', margin: 0,
                }}>
                  {waitlistError}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="submit"
                  disabled={waitlistStatus === 'submitting'}
                  style={{
                    padding: '9px 18px', borderRadius: 8,
                    background: '#0f2318', border: 'none',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    fontFamily: 'var(--font-body)', cursor: 'pointer',
                    opacity: waitlistStatus === 'submitting' ? 0.6 : 1,
                  }}
                >
                  {waitlistStatus === 'submitting' ? 'Joining…' : 'Join Waitlist'}
                </button>
                <button
                  type="button"
                  onClick={() => { setWaitlistExpanded(false); setWaitlistError(''); }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: 12, color: '#9CA3AF',
                    fontFamily: 'var(--font-body)', cursor: 'pointer',
                  }}
                >
                  Never mind
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </>
  );
}
