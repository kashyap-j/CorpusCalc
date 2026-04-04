import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePlannerStore } from '../../store/plannerStore';
import { useAuthStore } from '../../store/authStore';
import { canNext, buildPhases, compute, computeTab2 } from '../../lib/math';
import { saveUserPlan } from '../../lib/supabase';
import Step1Profile from './Step1Profile';
import Step2Income from './Step2Income';
import Step3Expenses from './Step3Expenses';
import Step4SIP from './Step4SIP';
import Step5Report from './Step5Report';
import Step6Deploy from './Step6Deploy';
import Step7Final from './Step7Final';
import Step4Kids from './Step4Kids';
import Step5KidsInvest from './Step5KidsInvest';
import Step6KidsDeploy from './Step6KidsDeploy';
import Toast from '../ui/Toast';
import LoginGate from '../auth/LoginGate';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          borderRadius: '100px',
          transition: 'all 0.3s',
          height: '7px',
          width: i + 1 === current ? '18px' : '7px',
          background: i + 1 <= current ? 'hsl(var(--warm-gold))' : 'rgba(255,255,255,0.2)',
        }} />
      ))}
    </div>
  );
}

function TabStrip() {
  const { state: S, update } = usePlannerStore();
  const switchTab = (tab: 1 | 2) => {
    if (S.tab !== tab) update({ tab, step: Math.min(S.step, 3) });
  };
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      {([{ value: 1 as const, label: 'Solo / Spouse' }, { value: 2 as const, label: 'With Kids' }] as const).map(t => (
        <button key={t.value} onClick={() => switchTab(t.value)} style={{
          flex: 1, padding: '10px 0', fontSize: '13px', fontWeight: 600,
          fontFamily: 'var(--font-body)', border: 'none', background: 'transparent',
          cursor: 'pointer', transition: 'color 0.2s',
          color: S.tab === t.value ? 'hsl(var(--warm-gold))' : 'rgba(255,255,255,0.45)',
          borderBottom: S.tab === t.value ? '2px solid hsl(var(--warm-gold))' : '2px solid transparent',
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StepContent() {
  const { state: S } = usePlannerStore();
  const { step, tab } = S;
  if (step === 1) return <Step1Profile />;
  if (step === 2) return <Step2Income />;
  if (step === 3) return <Step3Expenses />;
  if (tab === 1) {
    if (step === 4) return <Step4SIP />;
    if (step === 5) return <Step5Report />;
    if (step === 6) return <Step6Deploy />;
    if (step === 7) return <Step7Final />;
  } else {
    if (step === 4) return <Step4Kids />;
    if (step === 5) return <Step5KidsInvest />;
    if (step === 6) return <Step6KidsDeploy />;
    if (step === 7) return <Step7Final />;
  }
  return null;
}

export default function PlannerShell() {
  const { state: S, update, reset, setShowErrors, nextRequested, clearNextRequest } = usePlannerStore();
  const { step } = S;
  const [toast, setToast] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [showLoginGate, setShowLoginGate] = useState(false);
  const { user } = useAuthStore();
  const savedStepRef = useRef<number | null>(null);

  // Save to Supabase when user reaches Step 7 (Final Report) and is logged in
  useEffect(() => {
    if (!user || S.step !== 7 || savedStepRef.current === 7) return;
    savedStepRef.current = 7;
    const corpusResult = S.tab === 2
      ? (computeTab2(S)?.totalCorpus ?? compute(S).totalCorpus)
      : compute(S).totalCorpus;
    saveUserPlan(user.id, S, corpusResult).catch(() => {/* silent — non-critical */});
  }, [S.step, S.tab, user, S]);

  const TOTAL_STEPS = 6;
  const isFinalReport = step === 7;
  const isLastStep = step === 6;
  const canGoNext = canNext(S);
  const progress = Math.min((step - 1) / TOTAL_STEPS * 100, 100);

  // Gate triggers: Tab 1 after Step 4, Tab 2 after Step 5
  const isGateStep = (S.tab === 1 && step === 4) || (S.tab === 2 && step === 5);

  const nextLabel = (() => {
    if (step === 5 && S.tab === 1) return 'Deploy Corpus →';
    if (step === 4 && S.tab === 1) return 'See My Story →';
    if (step === 5 && S.tab === 2) return 'Deploy Corpus →';
    return 'Next →';
  })();

  const proceedNext = () => {
    if (step === 6) {
      update({ phases: S.phases.length === 0 ? buildPhases(S) : S.phases, step: 7 });
    } else {
      update({ step: step + 1 });
    }
  };

  const goNext = () => {
    if (!canGoNext) {
      setShowErrors(true);
      setToast('Please fill in the highlighted fields to continue');
      return;
    }
    setShowErrors(false);
    // Show login gate if not authenticated at the gate step
    if (isGateStep && !user) {
      // Persist intent so AuthCallback can navigate to the right step after OAuth redirect
      sessionStorage.setItem('postAuthStep', 'next');
      sessionStorage.setItem('postAuthMode', S.tab === 1 ? 'solo' : 'kids');
      setShowLoginGate(true);
      return;
    }
    proceedNext();
  };

  const handleAuthSuccess = () => {
    setShowLoginGate(false);
    setSuccessToast('Welcome! Your plan is saved.');
    proceedNext();
  };

  // CTA "Save My Plan" inside step components triggers goNext via the store signal
  useEffect(() => {
    if (!nextRequested) return;
    clearNextRequest();
    goNext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextRequested]);

  const goBack = () => {
    if (step > 1) { setShowErrors(false); update({ step: step - 1 }); }
  };

  const STEP_LABELS: Record<number, Record<number, string>> = {
    1: { 1: 'Your Profile', 2: 'Your Profile' },
    2: { 1: 'Financial Picture', 2: 'Financial Picture' },
    3: { 1: 'Monthly Life', 2: 'Monthly Life' },
    4: { 1: 'Investment Plan', 2: 'Kids Goals' },
    5: { 1: 'Retirement Story', 2: 'Investment Split' },
    6: { 1: 'Deploy Corpus', 2: 'Deploy Corpus' },
  };
  const stepLabel = STEP_LABELS[Math.min(step, 6)]?.[S.tab] ?? '';

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '14px 0', borderRadius: '14px',
    fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-body)',
    cursor: active ? 'pointer' : 'not-allowed',
    opacity: active ? 1 : 0.4,
    border: 'none',
    transition: 'all 0.2s',
    background: active ? 'hsl(var(--warm-gold))' : 'rgba(255,255,255,0.1)',
    color: active ? '#0f2318' : 'rgba(255,255,255,0.5)',
  });

  const backBtnStyle: React.CSSProperties = {
    padding: '14px 20px', borderRadius: '14px',
    fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)',
    cursor: 'pointer', border: '1.5px solid rgba(255,255,255,0.2)',
    background: 'transparent', color: 'rgba(255,255,255,0.8)',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'hsl(var(--background))' }}>
      {/* Toasts */}
      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
      {successToast && <Toast message={successToast} type="success" onDismiss={() => setSuccessToast('')} />}

      {/* Login gate modal */}
      {showLoginGate && (
        <LoginGate
          variant={S.tab === 1 ? 'story' : 'family'}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowLoginGate(false)}
        />
      )}

      {/* Sticky header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f2318' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'hsl(var(--warm-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-body)', color: '#0f2318' }}>C</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-body)' }} className="hidden sm:block">CorpusCalc</span>
          </Link>

          <div style={{ textAlign: 'center' }}>
            {isFinalReport ? (
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-body)', margin: 0 }}>Final Report</p>
            ) : (
              <>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', margin: 0, letterSpacing: '0.5px' }}>
                  STEP {step} OF {TOTAL_STEPS}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.2 }}>
                  {stepLabel}
                </p>
              </>
            )}
          </div>

          <StepDots current={Math.min(step, TOTAL_STEPS)} total={TOTAL_STEPS} />
        </div>

        <TabStrip />

        {!isFinalReport && (
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', transition: 'width 0.5s ease', width: `${progress}%`, background: 'linear-gradient(90deg, #e8622a, #f4944a)' }} />
          </div>
        )}
      </header>

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 16px 120px' }}>
          <StepContent />
        </div>
      </main>

      {/* Fixed bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        background: '#0f2318', borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        {isFinalReport && (
          <>
            <button onClick={goBack} style={{ ...backBtnStyle, flex: 1 }}>← Back</button>
            <button onClick={() => window.print()} style={{ ...btnStyle(true), flex: 1 }}>Print Report</button>
          </>
        )}

        {isLastStep && !isFinalReport && (
          <>
            <button onClick={goBack} style={backBtnStyle}>← Back</button>
            <button onClick={() => reset()} style={{ ...backBtnStyle, color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Restart</button>
            <button onClick={goNext} style={{ ...btnStyle(true), flex: 1 }}>Final Report →</button>
          </>
        )}

        {!isLastStep && !isFinalReport && (
          <>
            {step > 1 && <button onClick={goBack} style={backBtnStyle}>← Back</button>}
            <button onClick={goNext} disabled={false} style={{ ...btnStyle(canGoNext), flex: 1 }}>
              {nextLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
