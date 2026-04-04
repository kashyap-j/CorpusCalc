import AmountInput from './AmountInput';
import { usePlannerStore } from '../../store/plannerStore';
import { fmt, moSurplus, compute, type SIPMode } from '../../lib/math';
import StepHeader from './StepHeader';
import { useAuthStore } from '../../store/authStore';

function Slider({ label, value, min, max, unit, onChange, hint }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: '#e8622a', fontWeight: 700 }}>{value}{unit}</span>
      </div>
      {hint && <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '-4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hint}</p>}
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#e8622a' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

const SIP_MODES: { label: string; value: SIPMode; desc: string }[] = [
  { label: 'With salary', value: 'salary', desc: 'SIP grows with your salary hike each year' },
  { label: 'Fixed step-up', value: 'fixed', desc: 'You specify a fixed ₹ increase each year' },
  { label: 'Flat', value: 'flat', desc: 'Same amount throughout (no increase)' },
];

const fieldLabel: React.CSSProperties = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
  color: '#6B7280', fontFamily: 'var(--font-body)', fontWeight: 600,
  display: 'block', marginBottom: '6px',
};

export default function Step4SIP() {
  const { state: S, update, showErrors } = usePlannerStore();
  const { user } = useAuthStore();

  const surplus = moSurplus(S);
  const r = compute(S);
  const sipErr = showErrors && S.sipAmt <= 0;
  const overBudget = S.sipAmt > 0 && S.sipAmt > surplus * 1.05;

  return (
    <div>
      <StepHeader step={4} title="Your Investment Plan" oneLiner="The number that changes everything. Small steps today, big freedom tomorrow." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Surplus reminder */}
        <div style={{
          borderRadius: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0',
          padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>Available surplus</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#16A34A', fontFamily: 'var(--font-body)' }}>{fmt(surplus)}/mo</span>
        </div>

        {/* SIP Amount */}
        <div>
          <label style={{ ...fieldLabel, color: sipErr ? '#DC2626' : '#6B7280' }}>Monthly SIP amount</label>
          <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Monthly equity mutual fund investment</p>
          <AmountInput value={S.sipAmt} onChange={(v) => update({ sipAmt: v })} placeholder="e.g. 25K" hasError={sipErr} />
          {sipErr && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>Required</p>}
          {overBudget && !sipErr && (
            <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
              Exceeds available surplus. Consider a lower amount.
            </p>
          )}
          {S.sipAmt > 0 && !overBudget && surplus > 0 && (
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
              {Math.round(S.sipAmt / surplus * 100)}% of your surplus
            </p>
          )}
        </div>

        {/* SIP Growth Mode */}
        <div>
          <label style={fieldLabel}>How will your SIP grow?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SIP_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => update({ sipMode: m.value })}
                style={{
                  width: '100%', textAlign: 'left', borderRadius: '12px', padding: '12px 16px',
                  border: `1.5px solid ${S.sipMode === m.value ? '#e8622a' : '#E8E4DE'}`,
                  background: S.sipMode === m.value ? '#FFF5F2' : '#FAFAF8',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: S.sipMode === m.value ? '0 0 0 3px rgba(232,98,42,0.08)' : 'none',
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>{m.label}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Fixed step-up amount */}
        {S.sipMode === 'fixed' && (
          <div>
            <label style={fieldLabel}>Annual step-up amount</label>
            <AmountInput value={S.sipFixed} onChange={(v) => update({ sipFixed: v })} placeholder="e.g. 12K/year" />
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
              Your SIP will increase by this fixed amount every year
            </p>
          </div>
        )}

        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Slider label="Expected SIP return rate" value={S.sipReturn} min={7} max={20} unit="%" onChange={(v) => update({ sipReturn: v })} hint="Equity MFs avg 12% p.a. historically" />
          <Slider label="Inflation rate" value={S.inflation} min={4} max={12} unit="%" onChange={(v) => update({ inflation: v })} hint="India's avg inflation is 6–7% p.a." />
        </div>

        {/* Live corpus preview */}
        {S.sipAmt > 0 && (
          <div style={{
            borderRadius: '18px', padding: '22px',
            background: 'linear-gradient(135deg, #0f2318, #1a3a2a)',
            color: '#fff',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-body)', margin: '0 0 16px', opacity: 0.85 }}>
              Projected Corpus at {S.retAge}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Projected corpus</p>
                <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(r.totalCorpus)}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Required corpus</p>
                <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(r.reqCorpus)}</p>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ height: '8px', borderRadius: '100px', background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '100px', transition: 'width 0.5s ease',
                  width: `${Math.min(r.pct, 100)}%`,
                  background: r.onTrack ? '#F4C430' : '#f97316',
                }} />
              </div>
              <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '6px 0 0' }}>{r.pct.toFixed(0)}% of target funded</p>
            </div>

            {r.onTrack ? (
              <div style={{ borderRadius: '10px', background: 'rgba(244,196,48,0.15)', padding: '10px 14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', margin: 0 }}>On track</p>
                <p style={{ fontSize: '12px', opacity: 0.75, fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>
                  Projected surplus: {fmt(Math.abs(r.gap))}
                </p>
              </div>
            ) : (
              <div style={{ borderRadius: '10px', background: 'rgba(249,115,22,0.2)', padding: '10px 14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', margin: 0 }}>Shortfall of {fmt(r.gap)}</p>
                <p style={{ fontSize: '12px', opacity: 0.75, fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>
                  Suggested flat SIP: {fmt(r.neededFlat)}/mo
                </p>
              </div>
            )}
          </div>
        )}

        {/* Advice card — shown once a SIP is entered */}
        {S.sipAmt > 0 && (
          <div style={{
            borderRadius: '18px', overflow: 'hidden',
            border: `1.5px solid ${r.onTrack ? '#BBF7D0' : '#FCD34D'}`,
          }}>
            {/* Body */}
            <div style={{
              padding: '20px',
              background: r.onTrack ? '#F0FDF4' : '#FFFBEB',
            }}>
              <p style={{
                fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-body)',
                color: r.onTrack ? '#15803D' : '#92400E',
                margin: '0 0 12px',
              }}>
                {r.onTrack ? "You're on track \uD83C\uDF89" : 'Deficit is manageable — here\'s how'}
              </p>

              {r.onTrack ? (
                <p style={{ fontSize: '14px', color: '#166534', fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: 0 }}>
                  Your corpus covers your retirement comfortably. Consider deploying the surplus into a mix of debt funds for stability and equity for continued growth. A <strong>60:40 debt-equity split</strong> is common post-retirement.
                </p>
              ) : (
                <div>
                  <p style={{ fontSize: '14px', color: '#78350F', fontFamily: 'var(--font-body)', lineHeight: 1.65, margin: '0 0 10px' }}>
                    A deficit doesn't mean you can't retire well. Small adjustments go a long way:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      'Reduce discretionary expenses by 10–15%',
                      `Delay retirement by 2–3 years`,
                      `Increase SIP by ${fmt(Math.max(r.neededFlat - S.sipAmt, 0))}/mo to fully close the gap`,
                    ].map((tip, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{
                          flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%',
                          background: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 700, color: '#92400E', fontFamily: 'var(--font-body)',
                          marginTop: '1px',
                        }}>
                          {i + 1}
                        </div>
                        <p style={{ fontSize: '14px', color: '#78350F', fontFamily: 'var(--font-body)', lineHeight: 1.55, margin: 0 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: '#92400E', fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: '12px 0 0', opacity: 0.8 }}>
                    Remember — expense planning is more powerful than earning more.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 20px',
              background: r.onTrack ? '#DCFCE7' : '#FEF9C3',
              borderTop: `1px solid ${r.onTrack ? '#BBF7D0' : '#FCD34D'}`,
            }}>
              <p style={{
                fontSize: '13px', color: r.onTrack ? '#166534' : '#78350F',
                fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5,
              }}>
                Ready to build your plan? {user ? 'Your plan auto-saves as you progress.' : 'Save it to your account and track your progress over time.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
