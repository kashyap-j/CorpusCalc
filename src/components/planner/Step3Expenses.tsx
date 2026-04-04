import AmountInput from './AmountInput';
import { usePlannerStore } from '../../store/plannerStore';
import { fmt, totMoIncome, totMoExp, totYrExp, moSurplus } from '../../lib/math';
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

const fieldLabel: React.CSSProperties = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
  color: '#6B7280', fontFamily: 'var(--font-body)', fontWeight: 600,
  display: 'block', marginBottom: '6px',
};

const MONTHLY_FIELDS = [
  { label: 'Rent / mortgage', key: 'expRent' as const },
  { label: 'Loan EMIs', key: 'expEMI' as const },
  { label: 'Groceries', key: 'expGroc' as const },
  { label: 'Travel / commute', key: 'expTrav' as const },
  { label: 'Utilities', key: 'expUtil' as const },
  { label: 'Entertainment', key: 'expEnt' as const },
  { label: 'Health / medical', key: 'expHlth' as const },
  { label: 'Household help', key: 'expHH' as const },
  { label: 'Other monthly', key: 'expOMo' as const },
];

const YEARLY_FIELDS = [
  { label: 'Holidays / travel', key: 'expHol' as const },
  { label: 'Insurance premiums', key: 'expIns' as const },
  { label: 'Gadgets / electronics', key: 'expGad' as const },
  { label: 'Clothing / fashion', key: 'expClo' as const },
  { label: 'Car insurance / service', key: 'expCins' as const },
  { label: 'Donations', key: 'expDon' as const },
  { label: 'Repairs / maintenance', key: 'expRep' as const },
  { label: 'Other yearly', key: 'expOYr' as const },
];

export default function Step3Expenses() {
  const { state: S, update } = usePlannerStore();

  const totalMo = totMoExp(S);
  const totalYr = totYrExp(S);
  const income = totMoIncome(S);
  const surplus = moSurplus(S);
  const inDeficit = surplus < 0;

  return (
    <div>
      <StepHeader step={3} title="Monthly Life" oneLiner="Where does it all go? Let's find out — and not panic." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>Expense detail</h3>
          <ToggleGroup
            value={S.expMode}
            options={[{ label: 'Quick', value: 'quick' }, { label: 'Detailed', value: 'detailed' }]}
            onChange={(v) => update({ expMode: v as 'quick' | 'detailed' })}
          />
        </div>

        {S.expMode === 'quick' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={fieldLabel}>Monthly total</label>
              <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>e.g. Rent, EMIs, groceries, fuel, subs</p>
              <AmountInput value={S.expQMo} onChange={(v) => update({ expQMo: v })} placeholder="e.g. 60K" />
            </div>
            <div>
              <label style={fieldLabel}>Yearly total</label>
              <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>e.g. Insurance, vacations, festivals, clothing</p>
              <AmountInput value={S.expQYr} onChange={(v) => update({ expQYr: v })} placeholder="e.g. 1.2L" />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Monthly */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontFamily: 'var(--font-body)', marginBottom: '12px' }}>Monthly</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {MONTHLY_FIELDS.map(({ label, key }) => (
                  <div key={key}>
                    <label style={fieldLabel}>{label}</label>
                    <AmountInput value={S[key]} onChange={(v) => update({ [key]: v })} />
                  </div>
                ))}
              </div>
              {totalMo > 0 && (
                <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)', marginTop: '8px' }}>
                  Total monthly: <strong style={{ color: '#0f2318' }}>{fmt(totalMo)}</strong>
                </p>
              )}
            </div>

            {/* Yearly */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontFamily: 'var(--font-body)', marginBottom: '12px' }}>Yearly (one-time)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {YEARLY_FIELDS.map(({ label, key }) => (
                  <div key={key}>
                    <label style={fieldLabel}>{label}</label>
                    <AmountInput value={S[key]} onChange={(v) => update({ [key]: v })} />
                  </div>
                ))}
              </div>
              {totalYr > 0 && (
                <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)', marginTop: '8px' }}>
                  Total yearly: <strong style={{ color: '#0f2318' }}>{fmt(totalYr)}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Surplus bar */}
        {(totalMo > 0 || totalYr > 0) && income > 0 && (
          <div style={{
            borderRadius: '14px', padding: '16px',
            background: inDeficit ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${inDeficit ? '#FECACA' : '#BBF7D0'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>Total income</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>{fmt(income)}/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>Total expenses</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>{fmt(totalMo + totalYr / 12)}/mo</span>
            </div>
            <div style={{ borderTop: `1px solid ${inDeficit ? '#FECACA' : '#BBF7D0'}`, paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>Monthly surplus</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: inDeficit ? '#DC2626' : '#16A34A', fontFamily: 'var(--font-body)' }}>
                {inDeficit ? '−' : '+'}{fmt(Math.abs(surplus))}/mo
              </span>
            </div>
            {inDeficit && (
              <p style={{ fontSize: '12px', color: '#DC2626', fontFamily: 'var(--font-body)', marginTop: '8px' }}>
                Expenses exceed income. Reduce expenses or increase income before setting a SIP.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
