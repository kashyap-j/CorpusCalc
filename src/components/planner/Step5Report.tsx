import { usePlannerStore } from '../../store/plannerStore';
import { fmt, compute } from '../../lib/math';
import StepHeader from './StepHeader';

const S5_STYLES = `
  .s5-eq-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .s5-eq-op { display: none; }
  @media (min-width: 480px) {
    .s5-eq-row {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }
    .s5-eq-op {
      display: flex;
      align-items: center;
    }
  }
`;

export default function Step5Report() {
  const { state: S } = usePlannerStore();
  const r = compute(S);
  const yearsOfDiscipline = S.retAge > S.age ? S.retAge - S.age : 30;

  return (
    <div>
      <style>{S5_STYLES}</style>
      <StepHeader step={5} title="Your Retirement Story" oneLiner={`This is what ${yearsOfDiscipline} years of discipline looks like. Impressive.`} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Hero corpus card */}
        <div style={{
          borderRadius: '20px', padding: '28px 24px',
          background: 'linear-gradient(135deg, #0f2318 0%, #1a3a2a 50%, #0f2318 100%)',
          color: '#fff', textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.55, fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
            Your projected corpus at {S.retAge}
          </p>
          <p style={{ fontSize: '48px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: '0 0 4px', lineHeight: 1.1 }}>
            {fmt(r.totalCorpus)}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
            After {r.years} years of investing
          </p>

          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '100px', height: '10px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{
              height: '100%', borderRadius: '100px', transition: 'width 0.7s ease',
              width: `${Math.min(r.pct, 100)}%`,
              background: r.onTrack ? 'linear-gradient(90deg, #F4C430, #f4d460)' : 'linear-gradient(90deg, #f97316, #fb923c)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.5, fontFamily: 'var(--font-body)' }}>
            <span>₹0</span>
            <span>{r.pct.toFixed(0)}% of target</span>
            <span>Target: {fmt(r.reqCorpus)}</span>
          </div>
        </div>

        {/* The 25x Rule education card */}
        <div style={{
          borderRadius: '16px', padding: '20px 24px',
          background: '#FFF8F0', border: '1px solid #FDE68A',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>
            How we calculated your target
          </p>
          <p style={{ fontSize: '14px', color: '#78350F', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: '0 0 12px' }}>
            Your monthly expenses at retirement will be <strong>{fmt(r.moAtRet)}/mo</strong> (today's expenses inflated at {S.inflation}% for {r.years} years). To fund {r.dur} years of retirement, you need roughly <strong>×{r.mult}</strong> that amount — the famous corpus multiplier.
          </p>
          <div className="s5-eq-row">
            <div style={{ flex: 1, minWidth: '120px', background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #FDE68A', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 4px', opacity: 0.7 }}>Monthly at retirement</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#78350F', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(r.moAtRet)}</p>
            </div>
            <div className="s5-eq-op" style={{ fontSize: '20px', color: '#92400E', opacity: 0.5 }}>×</div>
            <div style={{ flex: 1, minWidth: '120px', background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #FDE68A', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 4px', opacity: 0.7 }}>Corpus multiplier</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#78350F', fontFamily: 'var(--font-body)', margin: 0 }}>×{r.mult}</p>
            </div>
            <div className="s5-eq-op" style={{ fontSize: '20px', color: '#92400E', opacity: 0.5 }}>=</div>
            <div style={{ flex: 1, minWidth: '120px', background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #FDE68A', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 4px', opacity: 0.7 }}>Required corpus</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#78350F', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(r.reqCorpus)}</p>
            </div>
          </div>
        </div>

        {/* Status card — amber for shortfall, green for on-track */}
        {r.onTrack ? (
          <div style={{
            borderRadius: '16px', padding: '20px',
            background: '#F0FDF4', border: '1px solid #86EFAC',
          }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#15803D', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
              You are on track
            </p>
            <p style={{ fontSize: '14px', color: '#166534', fontFamily: 'var(--font-body)', lineHeight: 1.5, margin: '0 0 14px' }}>
              Your projected corpus exceeds the requirement by <strong>{fmt(Math.abs(r.gap))}</strong>. Excellent discipline — you've already won half the battle.
            </p>
            <p style={{ fontSize: '13px', color: '#166534', fontFamily: 'var(--font-body)', opacity: 0.75, margin: 0 }}>
              Next up: deploy your corpus wisely in Step 6 to make it last through retirement.
            </p>
          </div>
        ) : (
          <div style={{
            borderRadius: '16px', padding: '20px',
            background: '#FFFBEB', border: '1px solid #FCD34D',
          }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
              Shortfall of {fmt(r.gap)}
            </p>
            <p style={{ fontSize: '14px', color: '#78350F', fontFamily: 'var(--font-body)', lineHeight: 1.5, margin: '0 0 14px' }}>
              You're building a strong foundation. To fully close the gap, increase your SIP to <strong>{fmt(r.neededFlat)}/mo</strong> (flat) — or go back to Step 4 and adjust your investment plan.
            </p>
            <p style={{ fontSize: '13px', color: '#78350F', fontFamily: 'var(--font-body)', opacity: 0.75, margin: 0 }}>
              Even a small increase now compounds massively over {r.years} years.
            </p>
          </div>
        )}

        {/* Breakdown two-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ borderRadius: '14px', background: '#F8F7F4', padding: '16px', border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>What you build</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>Existing investments</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>{fmt(r.existGrown)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>SIP accumulated</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>{fmt(r.sipC)}</span>
              </div>
              <div style={{ borderTop: '1px solid #E8E4DE', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>Total corpus</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A', fontFamily: 'var(--font-body)' }}>{fmt(r.totalCorpus)}</span>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: '14px', background: '#F8F7F4', padding: '16px', border: '1px solid #E8E4DE' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>What you need</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>Mo. expenses at ret.</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>{fmt(r.moAtRet)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>Corpus multiplier</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>×{r.mult}</span>
              </div>
              <div style={{ borderTop: '1px solid #E8E4DE', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>Required corpus</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#EA8C00', fontFamily: 'var(--font-body)' }}>{fmt(r.reqCorpus)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rates used */}
        <div style={{ borderRadius: '12px', background: '#F8F7F4', padding: '14px 16px', fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          Assumptions: {S.sipReturn}% SIP return · {S.invGR}% existing investment growth · {S.inflation}% inflation · {S.retAge - S.age} years to build · {r.dur} years to fund
        </div>
      </div>

    </div>
  );
}
