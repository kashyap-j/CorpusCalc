import { useState } from 'react';
import { usePlannerStore } from '../../store/plannerStore';
import StepHeader from './StepHeader';

const inp = (err: boolean, focused: boolean, isEmpty: boolean): React.CSSProperties => ({
  width: '100%',
  background: err ? '#FAFAF8' : isEmpty ? '#fff8f5' : '#FAFAF8',
  border: `1.5px solid ${err ? '#DC2626' : focused ? '#e8622a' : isEmpty ? '#f0c0a0' : '#E8E4DE'}`,
  borderRadius: '12px', padding: '13px 16px', fontSize: '16px',
  fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
  boxShadow: err ? '0 0 0 3px rgba(220,38,38,0.1)' : focused ? '0 0 0 3px rgba(232,98,42,0.1)' : 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
});

const label: React.CSSProperties = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
  color: '#6B7280', fontFamily: 'var(--font-body)', fontWeight: 600,
  display: 'block', marginBottom: '6px',
};

export default function Step1Profile() {
  const { state: S, update, showErrors } = usePlannerStore();
  const [ageFoc, setAgeFoc] = useState(false);
  const [retFoc, setRetFoc] = useState(false);
  const [lifeFoc, setLifeFoc] = useState(false);

  const ageErr = showErrors && S.age <= 0;
  const retErr = showErrors && (S.retAge <= 0 || S.retAge <= S.age);
  const lifeErr = showErrors && (S.lifeE <= 0 || S.lifeE <= S.retAge);

  const lifeMsg = (() => {
    if (S.lifeE > 125) return { type: 'amber', text: "Maximum planning horizon is 125 years. Fun fact: only 1 in 10 billion people live past 125. You're optimistic — we respect that. We'll plan to 125." };
    if (S.lifeE >= 100) return { type: 'green', text: `Planning to ${S.lifeE} — ambitious! Your corpus will be well prepared.` };
    return null;
  })();

  const handleLifeE = (v: number) => {
    update({ lifeE: Math.min(v, 125) });
  };

  return (
    <div>
      <StepHeader step={1} title="Your Retirement Profile" oneLiner="A few basics — this is easier than filling a tax form, promise." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Name */}
        <div>
          <label htmlFor="profile-name" style={label}>Your name <span style={{ color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input
            id="profile-name"
            type="text" value={S.name} onChange={e => update({ name: e.target.value })}
            placeholder="e.g. Rahul"
            style={inp(false, false, false)}
          />
        </div>

        {/* Age row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', alignItems: 'start' }}>
          <div style={{ minHeight: '80px' }}>
            <label htmlFor="profile-age" style={{ ...label, color: ageErr ? '#DC2626' : '#6B7280' }}>
              Current age <span style={{ color: '#e8622a' }}>*</span>
            </label>
            <input
              id="profile-age"
              type="number" min={18} max={80}
              value={S.age || ''} onChange={e => update({ age: parseInt(e.target.value) || 0 })}
              onFocus={() => setAgeFoc(true)} onBlur={() => setAgeFoc(false)}
              placeholder="e.g. 28"
              style={inp(ageErr, ageFoc, S.age === 0)}
            />
            {ageErr && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>Required</p>}
            <p style={{ fontSize: '12px', color: '#e8622a', fontStyle: 'italic', fontFamily: 'var(--font-body)', margin: '4px 0 0' }}>* Required</p>
          </div>
          <div style={{ minHeight: '80px' }}>
            <label htmlFor="profile-ret-age" style={{ ...label, color: retErr ? '#DC2626' : '#6B7280' }}>
              Retirement age <span style={{ color: '#e8622a' }}>*</span>
            </label>
            <input
              id="profile-ret-age"
              type="number" min={S.age + 1} max={90}
              value={S.retAge || ''} onChange={e => update({ retAge: parseInt(e.target.value) || 0 })}
              onFocus={() => setRetFoc(true)} onBlur={() => setRetFoc(false)}
              placeholder="e.g. 60"
              style={inp(retErr, retFoc, S.retAge === 0)}
            />
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '4px 0 0' }}>Age to stop working</p>
            {retErr && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>{S.retAge > 0 && S.retAge <= S.age ? 'Must be > current age' : 'Required'}</p>}
          </div>
          <div style={{ minHeight: '80px' }}>
            <label htmlFor="profile-life-e" style={{ ...label, color: lifeErr ? '#DC2626' : '#6B7280' }}>
              Life expectancy <span style={{ color: '#e8622a' }}>*</span>
            </label>
            <input
              id="profile-life-e"
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={S.lifeE || ''} onChange={e => handleLifeE(parseInt(e.target.value) || 0)}
              onFocus={() => setLifeFoc(true)} onBlur={() => setLifeFoc(false)}
              placeholder="e.g. 85"
              style={inp(lifeErr, lifeFoc, S.lifeE === 0)}
            />
            <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '4px 0 0' }}>Your corpus funds this many years</p>
            {lifeErr && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>Must be &gt; retirement age</p>}
          </div>
        </div>

        {/* Life expectancy message */}
        {lifeMsg && (
          <div style={{
            borderRadius: '12px', padding: '12px 16px',
            background: lifeMsg.type === 'amber' ? '#FFFBEB' : '#F0FDF4',
            border: `1px solid ${lifeMsg.type === 'amber' ? '#FCD34D' : '#86EFAC'}`,
            fontSize: '13px', color: lifeMsg.type === 'amber' ? '#92400E' : '#166534',
            fontFamily: 'var(--font-body)', lineHeight: 1.5,
          }}>
            {lifeMsg.text}
          </div>
        )}

        {/* Hint */}
        <div style={{ borderRadius: '12px', background: '#F8F7F4', padding: '14px 16px', fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
          Planning to age 85 is safe, 90 is conservative. Indians are living longer — plan further.
        </div>

        {/* Summary */}
        {S.age > 0 && S.retAge > S.age && S.lifeE > S.retAge && (
          <div style={{
            borderRadius: '16px', padding: '20px',
            background: 'linear-gradient(135deg, #F0FDF4, #FFFFFF)',
            border: '1px solid #BBF7D0',
            boxShadow: '0 2px 20px rgba(15,35,24,0.08)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#16A34A', margin: 0, fontFamily: 'var(--font-body)' }}>{S.retAge - S.age}</p>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>Years to build corpus</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#EA8C00', margin: 0, fontFamily: 'var(--font-body)' }}>{S.lifeE - S.retAge}</p>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>Years to fund</p>
              </div>
            </div>
            {S.name && <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '14px', color: '#0f2318', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Welcome, {S.name}!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
