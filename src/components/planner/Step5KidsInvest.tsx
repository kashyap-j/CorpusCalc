import AmountInput from './AmountInput';
import { usePlannerStore } from '../../store/plannerStore';
import {
  fmt, moSurplus, calcAllKidGoals, totalKidsSIPNeeded,
  computeTab2, type SIPMode,
} from '../../lib/math';
import StepHeader from './StepHeader';

function Slider({ label, value, min, max, unit, onChange, hint }: {
  label: string; value: number; min: number; max: number; unit: string;
  onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: '#e8622a', fontWeight: 700 }}>{value}{unit}</span>
      </div>
      {hint && <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '-4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hint}</p>}
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#e8622a' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

const SIP_MODES: { label: string; value: SIPMode; desc: string }[] = [
  { label: 'With salary', value: 'salary', desc: 'Grows with your salary hike each year' },
  { label: 'Fixed step-up', value: 'fixed', desc: 'You specify a fixed ₹ increase each year' },
  { label: 'Flat', value: 'flat', desc: 'Same amount throughout' },
];

const fieldLabel: React.CSSProperties = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
  color: '#6B7280', fontFamily: 'var(--font-body)', fontWeight: 600,
  display: 'block', marginBottom: '6px',
};

export default function Step5KidsInvest() {
  const { state: S, update } = usePlannerStore();

  const surplus = moSurplus(S);
  const goals = calcAllKidGoals(S);
  const kidsSIPTotal = totalKidsSIPNeeded(S);
  const retSurplus = Math.max(surplus - kidsSIPTotal, 0);
  const r2 = computeTab2(S);
  const totalMonthly = kidsSIPTotal + S.retSipAmt;
  const gap = surplus - totalMonthly;
  const hasSIP = S.retSipAmt > 0;

  return (
    <div>
      <StepHeader step={5} title="Investment Split" oneLiner="Kids goals and retirement SIP — all in one picture." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── SECTION 1: Kids SIP breakdown (auto-calculated, read-only) ── */}
        <div>
          <p style={{ ...fieldLabel, marginBottom: '10px' }}>Kids goal SIPs (auto-calculated)</p>

          {goals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {goals.map((g, i) => (
                <div key={i} style={{
                  borderRadius: '12px', background: '#FAFAF8', border: '1px solid #E8E4DE',
                  padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 2px' }}>
                      {g.kidName} · {g.type}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
                      {fmt(g.currentCost)} today → {fmt(g.futureCorpus)} in {g.yearsUntil} yrs
                    </p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#e8622a', fontFamily: 'var(--font-body)', margin: 0 }}>
                    {fmt(g.monthlySIP)}/mo
                  </p>
                </div>
              ))}
              {/* Kids total row */}
              <div style={{
                borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0',
                padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#15803D', fontFamily: 'var(--font-body)' }}>Total kids SIP</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#15803D', fontFamily: 'var(--font-body)' }}>{fmt(kidsSIPTotal)}/mo</span>
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: '12px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '14px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
                No goals with amounts entered yet. Go back to add goal costs.
              </p>
            </div>
          )}

          {/* Pre-retirement events */}
          {goals.some(g => g.yearsUntil < (S.retAge - S.age)) && (
            <div style={{ borderRadius: '12px', background: '#FFFBEB', border: '1px solid #FCD34D', padding: '12px 14px', marginTop: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
                Pre-retirement events
              </p>
              {goals.filter(g => g.yearsUntil < (S.retAge - S.age)).map((g, i) => (
                <p key={i} style={{ fontSize: '12px', color: '#78350F', fontFamily: 'var(--font-body)', margin: '0 0 2px' }}>
                  {g.kidName} {g.type} — in {g.yearsUntil} yrs (you age {S.age + g.yearsUntil})
                </p>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 2: Retirement SIP inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>
            Retirement SIP
          </h3>

          {/* Surplus context */}
          <div style={{ borderRadius: '12px', border: '1px solid #E8E4DE', overflow: 'hidden' }}>
            {[
              { label: 'Monthly surplus', value: fmt(surplus) + '/mo', color: '#0f2318' },
              { label: 'Kids SIP committed', value: fmt(kidsSIPTotal) + '/mo', color: '#EA8C00' },
              { label: 'Left for retirement SIP', value: fmt(retSurplus) + '/mo', color: '#16A34A' },
            ].map((row, i) => (
              <div key={i} style={{
                padding: '10px 14px', display: 'flex', justifyContent: 'space-between',
                borderBottom: i < 2 ? '1px solid #E8E4DE' : 'none',
                background: i % 2 === 0 ? '#fff' : '#FAFAF8',
              }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: row.color, fontFamily: 'var(--font-body)' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* SIP amount input */}
          <div>
            <label style={fieldLabel}>Monthly retirement SIP</label>
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Monthly SIP for your retirement corpus</p>
            <AmountInput
              value={S.retSipAmt}
              onChange={(v) => update({ retSipAmt: v })}
              placeholder={`Suggested: ${fmt(retSurplus)}`}
            />
            {S.retSipAmt > retSurplus * 1.05 && retSurplus > 0 && (
              <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
                Exceeds available surplus after kids SIPs
              </p>
            )}
          </div>

          {/* SIP mode buttons */}
          <div>
            <label style={fieldLabel}>How will it grow?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SIP_MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => update({ retSipMode: m.value })}
                  style={{
                    width: '100%', textAlign: 'left', borderRadius: '12px', padding: '12px 16px',
                    border: `1.5px solid ${S.retSipMode === m.value ? '#e8622a' : '#E8E4DE'}`,
                    background: S.retSipMode === m.value ? '#FFF5F2' : '#FAFAF8',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: S.retSipMode === m.value ? '0 0 0 3px rgba(232,98,42,0.08)' : 'none',
                  }}
                >
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>{m.label}</p>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {S.retSipMode === 'fixed' && (
            <div>
              <label style={fieldLabel}>Annual step-up amount</label>
              <AmountInput value={S.retSipFixed} onChange={(v) => update({ retSipFixed: v })} placeholder="e.g. 12K/year" />
            </div>
          )}

          {/* Return rate slider */}
          <Slider label="SIP return rate" value={S.sipReturn} min={7} max={20} unit="%" onChange={(v) => update({ sipReturn: v })} hint="Equity MFs avg 12% p.a. historically" />
          <Slider label="Inflation rate" value={S.inflation} min={4} max={12} unit="%" onChange={(v) => update({ inflation: v })} hint="India's avg inflation is 6–7% p.a." />
        </div>

        {/* ── SECTION 3 & 4: Only visible once retirement SIP is entered ── */}
        {!hasSIP ? (
          <div style={{
            borderRadius: '14px', background: '#F8F7F4', border: '1px dashed #D1D5DB',
            padding: '20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
              Enter your retirement SIP above to see<br />your complete investment picture.
            </p>
          </div>
        ) : (
          <>
            {/* ── SECTION 3: Complete investment picture card ── */}
            <div style={{
              borderRadius: '20px', padding: '22px',
              background: 'linear-gradient(135deg, #0f2318 0%, #1a3a2a 50%, #0f2318 100%)',
              color: '#fff',
            }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.55, fontFamily: 'var(--font-body)', margin: '0 0 16px' }}>
                Your complete investment picture
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Kids SIP total</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0, color: '#F4C430' }}>{fmt(kidsSIPTotal)}/mo</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Retirement SIP</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(S.retSipAmt)}/mo</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Total monthly</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(totalMonthly)}/mo</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Gap / surplus</p>
                  <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0, color: gap >= 0 ? '#86EFAC' : '#FCA5A5' }}>
                    {gap >= 0 ? '+' : ''}{fmt(gap)}/mo
                  </p>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '100px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{
                  height: '100%', borderRadius: '100px',
                  width: `${Math.min(surplus > 0 ? (totalMonthly / surplus) * 100 : 0, 100)}%`,
                  background: gap >= 0 ? 'linear-gradient(90deg, #86EFAC, #4ADE80)' : 'linear-gradient(90deg, #FCA5A5, #F87171)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <p style={{ fontSize: '11px', opacity: 0.5, fontFamily: 'var(--font-body)', margin: 0 }}>
                {surplus > 0 ? Math.round((totalMonthly / surplus) * 100) : 0}% of monthly surplus committed
              </p>
            </div>

            {/* ── SECTION 4: Retirement corpus preview ── */}
            {r2 && (
              <div style={{
                borderRadius: '18px', padding: '20px',
                background: 'linear-gradient(135deg, #0f2318, #1a3a2a)',
                color: '#fff',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)', margin: '0 0 14px', opacity: 0.85 }}>
                  Retirement Corpus Preview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Projected</p>
                    <p style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(r2.totalCorpus)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Required</p>
                    <p style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(r2.reqCorpus)}</p>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '100px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{
                    height: '100%', borderRadius: '100px',
                    width: `${Math.min(r2.pct, 100)}%`,
                    background: r2.onTrack ? '#F4C430' : '#f97316',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <p style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>{r2.pct.toFixed(0)}% funded</p>
                {r2.onTrack
                  ? <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', margin: 0 }}>On track · surplus {fmt(Math.abs(r2.gap))}</p>
                  : <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', margin: 0 }}>Shortfall {fmt(r2.gap)} · suggest {fmt(r2.neededFlat)}/mo</p>
                }
              </div>
            )}
          </>
        )}


      </div>
    </div>
  );
}
