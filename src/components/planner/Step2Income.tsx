import AmountInput from './AmountInput';
import { usePlannerStore } from '../../store/plannerStore';
import { fmt, totInv, addIncome } from '../../lib/math';
import StepHeader from './StepHeader';

function ToggleGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'inline-flex', borderRadius: '10px', border: '1.5px solid #E8E4DE', overflow: 'hidden' }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: '7px 18px', fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: value === o.value ? '#0f2318' : '#fff',
            color: value === o.value ? '#fff' : '#6B7280',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Slider({ label, value, min, max, unit, onChange, hint }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; hint?: string;
}) {
  const inputId = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor={inputId} style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: '#374151', fontWeight: 500 }}>{label}</label>
        <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: '#e8622a', fontWeight: 700 }}>{value}{unit}</span>
      </div>
      {hint && <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '-4px 0 0' }}>{hint}</p>}
      <input id={inputId} type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#e8622a' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
  color: '#6B7280', fontFamily: 'var(--font-body)', fontWeight: 600,
  display: 'block', marginBottom: '6px',
};

export default function Step2Income() {
  const { state: S, update, showErrors } = usePlannerStore();

  const totalInvested = totInv(S);
  const totalAddInc = addIncome(S);
  const salaryErr = showErrors && S.salaryMonthly <= 0;

  return (
    <div>
      <StepHeader step={2} title="Financial Picture" oneLiner="Show us what you've got. No judgment, only math." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Existing Investments */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>Existing investments</h3>
            <ToggleGroup
              value={S.invMode}
              options={[{ label: 'Quick', value: 'quick' }, { label: 'Detailed', value: 'detailed' }]}
              onChange={(v) => update({ invMode: v as 'quick' | 'detailed' })}
            />
          </div>

          {S.invMode === 'quick' ? (
            <div>
              <label style={fieldLabel}>Total investments today</label>
              <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>All savings: MFs, stocks, PF, FDs</p>
              <AmountInput value={S.invQuick} onChange={(v) => update({ invQuick: v })} placeholder="e.g. 10L" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {([
                { label: 'Mutual Funds', key: 'invMF' as const },
                { label: 'Direct Equity', key: 'invEQ' as const },
                { label: 'PF / EPF / PPF', key: 'invPF' as const },
                { label: 'Debt / FDs', key: 'invDT' as const },
              ]).map(({ label, key }) => (
                <div key={key}>
                  <label style={fieldLabel}>{label}</label>
                  <AmountInput value={S[key]} onChange={(v) => update({ [key]: v })} />
                </div>
              ))}
            </div>
          )}

          {totalInvested > 0 && (
            <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)', marginTop: '8px' }}>
              Total invested: <strong style={{ color: '#0f2318' }}>{fmt(totalInvested)}</strong>
            </p>
          )}

          <div style={{ marginTop: '16px' }}>
            <Slider label="Expected investment growth rate" value={S.invGR} min={6} max={18} unit="%" onChange={(v) => update({ invGR: v })} hint="Equity MFs avg 12%; debt-heavy portfolios: 6–8%" />
          </div>
        </section>

        {/* Monthly Salary */}
        <section>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: '0 0 14px' }}>Monthly income</h3>
          <div>
            <label htmlFor="salary" style={{ ...fieldLabel, color: salaryErr ? '#DC2626' : '#6B7280' }}>Monthly salary / take-home</label>
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>In-hand amount after tax — not CTC</p>
            <AmountInput id="salary" value={S.salaryMonthly} onChange={(v) => update({ salaryMonthly: v })} placeholder="e.g. 1.2L" hasError={salaryErr} />
            {salaryErr && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>Required</p>}
          </div>
          <div style={{ marginTop: '16px' }}>
            <Slider label="Annual salary growth" value={S.salaryGrowth} min={3} max={20} unit="%" onChange={(v) => update({ salaryGrowth: v })} hint="Steps up your SIP each year automatically" />
          </div>
        </section>

        {/* Additional Income */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>Additional income</h3>
            <ToggleGroup
              value={S.addIncMode}
              options={[{ label: 'Quick', value: 'quick' }, { label: 'Detailed', value: 'detailed' }]}
              onChange={(v) => update({ addIncMode: v as 'quick' | 'detailed' })}
            />
          </div>

          {S.addIncMode === 'quick' ? (
            <div>
              <label style={fieldLabel}>Other monthly income <span style={{ color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 }}>(rental, business, freelance…)</span></label>
              <AmountInput value={S.addIncQuick} onChange={(v) => update({ addIncQuick: v })} placeholder="0" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={fieldLabel}>Rental income / mo</label>
                <AmountInput value={S.addIncRental} onChange={(v) => update({ addIncRental: v })} />
              </div>
              <div>
                <label style={fieldLabel}>Other income / mo</label>
                <AmountInput value={S.addIncOther} onChange={(v) => update({ addIncOther: v })} />
              </div>
            </div>
          )}

          {totalAddInc > 0 && (
            <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)', marginTop: '8px' }}>
              Additional income: <strong style={{ color: '#0f2318' }}>{fmt(totalAddInc)}/mo</strong>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
