import AmountInput from './AmountInput';
import { usePlannerStore } from '../../store/plannerStore';
import { fmt, kidGoalCalc, type Kid } from '../../lib/math';
import StepHeader from './StepHeader';

const fieldLabel: React.CSSProperties = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px',
  color: '#6B7280', fontFamily: 'var(--font-body)', fontWeight: 600,
  display: 'block', marginBottom: '6px',
};

const smallInp: React.CSSProperties = {
  width: '100%', background: '#FAFAF8',
  border: '1.5px solid #E8E4DE', borderRadius: '10px',
  padding: '9px 12px', fontSize: '14px',
  fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

type GoalTab = 'ug' | 'pg' | 'mar';

function KidCard({ kid, index, onUpdate, onRemove }: {
  kid: Kid;
  index: number;
  onUpdate: (patch: Partial<Kid>) => void;
  onRemove: () => void;
}) {
  const { state: S } = usePlannerStore();

  const ugRes = kid.inclUG && kid.ugAnnCost > 0
    ? kidGoalCalc(kid, 'ug', S.inflation, S.sipReturn) : null;
  const pgRes = kid.inclPG && kid.pgAnnCost > 0
    ? kidGoalCalc(kid, 'pg', S.inflation, S.sipReturn) : null;
  const marRes = kid.inclMar && kid.marBudget > 0
    ? kidGoalCalc(kid, 'mar', S.inflation, S.sipReturn) : null;

  // Summary rows: all goals that are selected AND have a cost entered
  const summaryRows: { label: string; res: NonNullable<typeof ugRes> }[] = [
    ...(ugRes ? [{ label: 'UG Education', res: ugRes }] : []),
    ...(pgRes ? [{ label: 'PG Education', res: pgRes }] : []),
    ...(marRes ? [{ label: 'Marriage', res: marRes }] : []),
  ];
  const totalSIP = summaryRows.reduce((s, r) => s + r.res.monthlySIP, 0);

  const tabs: { key: GoalTab; label: string; active: boolean }[] = [
    { key: 'ug', label: 'UG', active: kid.inclUG },
    { key: 'pg', label: 'PG', active: kid.inclPG },
    { key: 'mar', label: 'Marriage', active: kid.inclMar },
  ];

  const handleTabClick = (tab: GoalTab) => {
    if (tab === 'ug') onUpdate({ inclUG: !kid.inclUG });
    if (tab === 'pg') onUpdate({ inclPG: !kid.inclPG });
    if (tab === 'mar') onUpdate({ inclMar: !kid.inclMar });
  };

  return (
    <div style={{ borderRadius: '18px', border: '1px solid #E8E4DE', background: '#fff', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', background: '#F8F7F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#0f2318', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-body)', flexShrink: 0,
          }}>
            {index + 1}
          </div>
          <input
            type="text" value={kid.name}
            onChange={e => onUpdate({ name: e.target.value })}
            aria-label={`Child ${index + 1} name`}
            placeholder="Child's name"
            style={{ fontSize: '14px', fontWeight: 600, background: 'transparent', border: 'none', outline: 'none', color: '#0f2318', fontFamily: 'var(--font-body)', width: '130px' }}
          />
        </div>
        <button onClick={onRemove} style={{ fontSize: '12px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Remove
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Age + Education inflation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label htmlFor={`kid-${kid.id}-age`} style={fieldLabel}>Current age</label>
            <input id={`kid-${kid.id}-age`} type="number" min={0} max={25} value={kid.age || ''}
              onChange={e => onUpdate({ age: parseInt(e.target.value) || 0 })}
              placeholder="0" style={smallInp} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...fieldLabel, marginBottom: 0 }}>Edu. inflation</label>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e8622a', fontFamily: 'var(--font-body)' }}>{kid.eduInfl}%</span>
            </div>
            <input type="range" min={4} max={15} value={kid.eduInfl}
              onChange={e => onUpdate({ eduInfl: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#e8622a', marginTop: '8px' }} />
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '5px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>India's edu inflation: 10–12% p.a.</p>
          </div>
        </div>

        {/* Goal tab bar — multi-select toggles */}
        <div style={{ display: 'flex', borderRadius: '10px', border: '1.5px solid #E8E4DE', overflow: 'hidden', marginBottom: '16px' }}>
          {tabs.map((t, i) => (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              style={{
                flex: 1, padding: '9px 4px', fontSize: '12px', fontWeight: 700,
                fontFamily: 'var(--font-body)', border: 'none', cursor: 'pointer',
                transition: 'all 0.15s',
                background: t.active ? '#0f2318' : '#fff',
                color: t.active ? '#fff' : '#9CA3AF',
                borderRight: i < tabs.length - 1 ? '1px solid #E8E4DE' : 'none',
              }}
            >
              {t.label}
              {t.active && (
                <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: '#86EFAC', marginLeft: '5px', verticalAlign: 'middle' }} />
              )}
            </button>
          ))}
        </div>

        {/* Goal input sections — always UG → PG → Marriage order, shown when active */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {kid.inclUG && (
            <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E8E4DE', background: '#FAFAF8' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 10px 0' }}>UG Education</p>
              <div className="s4k-3col">
                <div>
                  <label style={fieldLabel}>Start age</label>
                  <input type="number" min={kid.age + 1} max={25} value={kid.ugStartAge || ''}
                    onChange={e => onUpdate({ ugStartAge: parseInt(e.target.value) || 18 })}
                    placeholder="18" style={smallInp} />
                </div>
                <div>
                  <label style={fieldLabel}>Duration (yrs)</label>
                  <input type="number" min={1} max={6} value={kid.ugDur || ''}
                    onChange={e => onUpdate({ ugDur: parseInt(e.target.value) || 4 })}
                    placeholder="4" style={smallInp} />
                </div>
                <div>
                  <label style={fieldLabel}>Annual cost</label>
                  <AmountInput value={kid.ugAnnCost} onChange={v => onUpdate({ ugAnnCost: v })} placeholder="2L/yr" />
                  <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '5px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Today's cost — we'll calculate future value</p>
                </div>
              </div>
            </div>
          )}

          {kid.inclPG && (
            <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E8E4DE', background: '#FAFAF8' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 10px 0' }}>PG Education</p>
              <div className="s4k-3col">
                <div>
                  <label style={fieldLabel}>Start age</label>
                  <input type="number" min={kid.age + 1} max={30} value={kid.pgStartAge || ''}
                    onChange={e => onUpdate({ pgStartAge: parseInt(e.target.value) || 22 })}
                    placeholder="22" style={smallInp} />
                </div>
                <div>
                  <label style={fieldLabel}>Duration (yrs)</label>
                  <input type="number" min={1} max={4} value={kid.pgDur || ''}
                    onChange={e => onUpdate({ pgDur: parseInt(e.target.value) || 2 })}
                    placeholder="2" style={smallInp} />
                </div>
                <div>
                  <label style={fieldLabel}>Annual cost</label>
                  <AmountInput value={kid.pgAnnCost} onChange={v => onUpdate({ pgAnnCost: v })} placeholder="3L/yr" />
                  <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '5px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Today's cost — we'll calculate future value</p>
                </div>
              </div>
            </div>
          )}

          {kid.inclMar && (
            <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E8E4DE', background: '#FAFAF8' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 10px 0' }}>Marriage</p>
              <div className="s4k-2col-mar">
                <div>
                  <label style={fieldLabel}>Age at marriage</label>
                  <input type="number" min={kid.age + 1} max={40} value={kid.marAge || ''}
                    onChange={e => onUpdate({ marAge: parseInt(e.target.value) || 28 })}
                    placeholder="28" style={smallInp} />
                </div>
                <div>
                  <label style={fieldLabel}>Budget</label>
                  <AmountInput value={kid.marBudget} onChange={v => onUpdate({ marBudget: v })} placeholder="20L" />
                  <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '5px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Today's cost — we'll calculate future value</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* All-goals summary table — shows whenever any goal has a cost entered */}
        {summaryRows.length > 0 && (
          <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E8E4DE' }}>
            {summaryRows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  padding: '10px 14px',
                  background: i % 2 === 0 ? '#FAFAF8' : '#fff',
                  borderBottom: i < summaryRows.length - 1 ? '1px solid #E8E4DE' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e8622a', fontFamily: 'var(--font-body)' }}>
                    need {fmt(row.res.monthlySIP)} SIP/mo
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', lineHeight: '1.5' }}>
                  In {row.res.yearsUntil} yrs &nbsp;·&nbsp; {fmt(row.res.currentCost)} today &rarr; becomes {fmt(row.res.futureCorpus)}
                </div>
              </div>
            ))}
            {/* Total row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px',
              background: '#0f2318',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-body)' }}>
                Total SIP needed
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#86EFAC', fontFamily: 'var(--font-body)' }}>
                {fmt(totalSIP)}/mo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const S4K_STYLES = `
  .s4k-3col {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .s4k-2col-mar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  @media (min-width: 480px) {
    .s4k-3col { grid-template-columns: 1fr 1fr 1fr; }
    .s4k-2col-mar { grid-template-columns: 1fr 1fr; }
  }
`;

export default function Step4Kids() {
  const { state: S, update } = usePlannerStore();

  const addKid = () => {
    const newKid: Kid = {
      id: String(S._kidId),
      name: '',
      age: 0,
      eduInfl: 8,
      inclUG: true,
      ugStartAge: 18,
      ugAnnCost: 0,
      ugDur: 4,
      inclPG: false,
      pgStartAge: 22,
      pgAnnCost: 0,
      pgDur: 2,
      inclMar: false,
      marAge: 28,
      marBudget: 0,
    };
    update({ kids: [...S.kids, newKid], _kidId: S._kidId + 1 });
  };

  const updateKid = (id: string, patch: Partial<Kid>) => {
    update({ kids: S.kids.map(k => k.id === id ? { ...k, ...patch } : k) });
  };

  const removeKid = (id: string) => {
    update({ kids: S.kids.filter(k => k.id !== id) });
  };

  return (
    <div>
      <StepHeader step={4} title="Kids Goals" oneLiner="Their dreams, your numbers. Let's make both work." />

      <style>{S4K_STYLES}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {S.kids.length === 0 && (
          <div style={{ borderRadius: '14px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
              No children added yet. Add a child below to plan their goals.
            </p>
          </div>
        )}

        {S.kids.map((kid, i) => (
          <KidCard
            key={kid.id}
            kid={kid}
            index={i}
            onUpdate={(patch) => updateKid(kid.id, patch)}
            onRemove={() => removeKid(kid.id)}
          />
        ))}

        <button
          onClick={addKid}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            border: '2px dashed #D1D5DB', background: 'transparent',
            fontSize: '14px', fontWeight: 600, color: '#6B7280',
            fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}
        >
          + Add a child
        </button>
      </div>
    </div>
  );
}
