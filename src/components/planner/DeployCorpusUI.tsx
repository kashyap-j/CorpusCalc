import { useState, useEffect } from 'react';
import AmountInput from './AmountInput';
import { usePlannerStore } from '../../store/plannerStore';
import {
  fmt, fmtPct, buildPhases, simPhase, applyPhaseInflAdj,
  type Instrument, type InstrumentType, type Phase,
  type PhaseMonthlyExpenses, type PhaseYearlyExpenses, type SimPhaseResult,
} from '../../lib/math';
import StepHeader from './StepHeader';

// ── Types ─────────────────────────────────────────────────────────────────────

export type KidGoal = {
  kidName: string;
  type: string;
  yearsUntil: number;
  futureCorpus: number;
  monthlySIP: number;
  currentCost: number;
};

export interface DeployCorpusUIProps {
  totalCorpus: number;
  moAtRet: number;
  kidsGoals?: KidGoal[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PHASE_COLORS = [
  { bg: 'linear-gradient(135deg, #0f2318, #1a3a2a)', label: '#fff', accent: '#86EFAC' },
  { bg: 'linear-gradient(135deg, #1e3a5f, #2d5282)', label: '#fff', accent: '#93C5FD' },
  { bg: 'linear-gradient(135deg, #4a1942, #6b2660)', label: '#fff', accent: '#F0ABFC' },
  { bg: 'linear-gradient(135deg, #7c2d12, #9a3412)', label: '#fff', accent: '#FCA5A5' },
];

const MO_FIELDS: { label: string; key: keyof PhaseMonthlyExpenses }[] = [
  { label: 'Rent / Housing', key: 'rent' },
  { label: 'EMI', key: 'emi' },
  { label: 'Groceries', key: 'groc' },
  { label: 'Travel', key: 'trav' },
  { label: 'Utilities', key: 'util' },
  { label: 'Entertainment', key: 'ent' },
  { label: 'Healthcare', key: 'hlth' },
  { label: 'Household Help', key: 'hh' },
  { label: 'Other', key: 'other' },
];

const YR_FIELDS: { label: string; key: keyof PhaseYearlyExpenses }[] = [
  { label: 'Holidays', key: 'hol' },
  { label: 'Health Insurance', key: 'ins' },
  { label: 'Gadgets', key: 'gad' },
  { label: 'Clothes', key: 'clo' },
  { label: 'Car Insurance', key: 'cins' },
  { label: 'Donations', key: 'don' },
  { label: 'Home Repairs', key: 'rep' },
  { label: 'Other Yearly', key: 'oy' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function scaleFields<T extends Record<string, number>>(fields: T, newTotal: number): T {
  const cur = Object.values(fields).reduce((s: number, v) => s + (+v || 0), 0);
  if (cur === 0) {
    const keys = Object.keys(fields);
    return { ...fields, [keys[keys.length - 1]]: newTotal } as T;
  }
  const ratio = newTotal / cur;
  const result = {} as T;
  for (const k of Object.keys(fields) as (keyof T)[]) {
    (result as Record<keyof T, number>)[k] = Math.round((fields[k] as number) * ratio);
  }
  return result;
}

// ── InstrCard ─────────────────────────────────────────────────────────────────

function InstrCard({ instr, onChange, onRemove }: {
  instr: Instrument; onChange: (p: Partial<Instrument>) => void; onRemove: () => void;
}) {
  const isDebt = instr.t === 'i';
  return (
    <div style={{
      borderRadius: '14px',
      background: isDebt ? '#F0FDF4' : '#EFF6FF',
      border: `1px solid ${isDebt ? '#86EFAC' : '#93C5FD'}`,
      borderLeft: `4px solid ${isDebt ? '#16A34A' : '#2563EB'}`,
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            padding: '3px 8px', borderRadius: '6px',
            background: isDebt ? '#DCFCE7' : '#DBEAFE',
            color: isDebt ? '#15803D' : '#1D4ED8',
            fontFamily: 'var(--font-body)', flexShrink: 0,
          }}>{isDebt ? 'Debt' : 'Equity'}</span>
          <input
            type="text" value={instr.n}
            onChange={e => onChange({ n: e.target.value })}
            placeholder={isDebt ? 'e.g. Fixed Deposit' : 'e.g. Equity Fund'}
            style={{
              flex: 1, fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)',
              background: 'transparent', border: 'none', outline: 'none', color: '#0f2318',
            }}
          />
        </div>
        <button onClick={onRemove} style={{ fontSize: '16px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
        <AmountInput value={instr.a} onChange={v => onChange({ a: v })} placeholder="Amount" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number" min={1} max={30} value={instr.r}
            onChange={e => onChange({ r: parseFloat(e.target.value) || 0 })}
            style={{
              width: '52px', padding: '9px 8px', borderRadius: '10px',
              border: '1.5px solid #E8E4DE', background: '#FAFAF8',
              fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none', textAlign: 'center',
            }}
          />
          <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>%</span>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: isDebt ? '#15803D' : '#1D4ED8', fontFamily: 'var(--font-body)', margin: 0, opacity: 0.8 }}>
        {isDebt ? 'Principal fixed · interest funds expenses' : 'Principal grows · acts as buffer'}
      </p>
    </div>
  );
}

// ── PhaseExpenseEditor ────────────────────────────────────────────────────────

function PhaseExpenseEditor({ phIdx, ph }: { phIdx: number; ph: Phase }) {
  const { state: S, update } = usePlannerStore();
  const mode = S.phExpMode[phIdx] ?? 'quick';

  const moTotal = Object.values(ph.mo).reduce((s, v) => s + (+v || 0), 0);
  const yrTotal = Object.values(ph.yr).reduce((s, v) => s + (+v || 0), 0);

  const savePhase = (patch: Partial<Phase>) => {
    const updated = [...S.phases];
    updated[phIdx] = { ...updated[phIdx], ...patch, userEdited: true };
    update({ phases: updated });
  };

  const setMode = (m: string) =>
    update({ phExpMode: { ...S.phExpMode, [phIdx]: m as 'quick' | 'detailed' } });

  const applyAutoFill = () => {
    const adj = applyPhaseInflAdj(phIdx, S.phases, S.inflation);
    savePhase(adj);
  };

  const fieldLabel: React.CSSProperties = {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px',
    color: '#9CA3AF', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'block', marginBottom: '4px',
  };

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>Phase Expenses</p>
        <div style={{ display: 'inline-flex', borderRadius: '8px', border: '1px solid #E8E4DE', overflow: 'hidden' }}>
          {(['quick', 'detailed'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '5px 12px', fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600,
              border: 'none', cursor: 'pointer', background: mode === m ? '#0f2318' : '#fff',
              color: mode === m ? '#fff' : '#6B7280', transition: 'all 0.15s',
            }}>{m === 'quick' ? 'Quick' : 'Detailed'}</button>
          ))}
        </div>
      </div>

      {phIdx > 0 && S.phases.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button onClick={applyAutoFill} style={{
            fontSize: '11px', padding: '6px 12px', borderRadius: '8px',
            background: '#F0FDF4', border: '1px solid #86EFAC', color: '#15803D',
            fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}>
            Same as Phase 1 (inflation-adjusted)
          </button>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>or edit below</span>
        </div>
      )}

      {mode === 'quick' ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
            <div>
              <label style={fieldLabel}>Monthly total</label>
              <AmountInput value={moTotal} onChange={v => savePhase({ mo: scaleFields({ ...ph.mo }, v) })} />
            </div>
            <div>
              <label style={fieldLabel}>Yearly total</label>
              <AmountInput value={yrTotal} onChange={v => savePhase({ yr: scaleFields({ ...ph.yr }, v) })} />
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0 }}>
            Total annual: <strong style={{ color: '#0f2318' }}>{fmt(moTotal * 12 + yrTotal)}/yr</strong>
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ ...fieldLabel, marginBottom: '8px' }}>Monthly (₹/mo)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {MO_FIELDS.map(({ label, key }) => (
                <div key={key}>
                  <label style={fieldLabel}>{label}</label>
                  <AmountInput value={ph.mo[key]} onChange={v => savePhase({ mo: { ...ph.mo, [key]: v } })} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f2318', color: '#f4f2ee', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
              <span>Monthly total</span>
              <strong>{fmt(moTotal)}/mo</strong>
            </div>
          </div>
          <div>
            <p style={{ ...fieldLabel, marginBottom: '8px' }}>Yearly (₹/yr)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {YR_FIELDS.map(({ label, key }) => (
                <div key={key}>
                  <label style={fieldLabel}>{label}</label>
                  <AmountInput value={ph.yr[key]} onChange={v => savePhase({ yr: { ...ph.yr, [key]: v } })} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f2318', color: '#f4f2ee', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
              <span>Yearly total</span>
              <strong>{fmt(yrTotal)}/yr</strong>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0 }}>
            Total annual: <strong style={{ color: '#0f2318' }}>{fmt(moTotal * 12 + yrTotal)}/yr</strong>
          </p>
        </div>
      )}
    </div>
  );
}

// ── PhaseCard ─────────────────────────────────────────────────────────────────

function PhaseCard({ phIdx, ph, allPhases, preResult, kidsGoals }: {
  phIdx: number;
  ph: Phase;
  allPhases: Phase[];
  preResult: SimPhaseResult;
  kidsGoals?: KidGoal[];
}) {
  const { state: S, update } = usePlannerStore();
  const [showTable, setShowTable] = useState(false);
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const isOpen = S.phOpen[phIdx] ?? (phIdx === 0);
  const colors = PHASE_COLORS[phIdx % PHASE_COLORS.length];

  const setOpen = (v: boolean) => update({ phOpen: { ...S.phOpen, [phIdx]: v } });

  const result = preResult;
  const annExp0 = result.rows[0]?.annExp ?? 0;
  const debtInt = result.debtIntPerYr;
  const net = debtInt - annExp0;

  // Kids events happening in this phase
  const kidsInPhase = (kidsGoals ?? []).filter(g => {
    const eventAge = S.age + g.yearsUntil;
    return eventAge >= ph.from && eventAge < ph.to;
  });

  // FIX 5: instruments auto-filled into this phase (S.phDep[phIdx])
  const filledInstrs: Instrument[] = phIdx > 0 ? (S.phDep[phIdx] ?? []) : [];
  const hasFilledInstrs = filledInstrs.length > 0;

  const updateFilledInstr = (id: string, patch: Partial<Instrument>) => {
    const updated = filledInstrs.map(i => i.id === id ? { ...i, ...patch } : i);
    update({ phDep: { ...S.phDep, [phIdx]: updated } });
  };

  const clearThisFill = () => {
    const newPhDep = { ...S.phDep };
    delete newPhDep[phIdx];
    update({ phDep: newPhDep });
    setEditingChipId(null);
  };

  // FIX 4: auto-fill next phase
  const nextFilled = (S.phDep[phIdx + 1]?.length ?? 0) > 0;

  const autoFillNext = () => {
    const redeployed = result.si.map((i, idx) => ({ ...i, id: `ph${phIdx + 1}_${idx}` }));
    update({ phDep: { ...S.phDep, [phIdx + 1]: redeployed } });
  };

  const clearNextFill = () => {
    const newPhDep = { ...S.phDep };
    delete newPhDep[phIdx + 1];
    update({ phDep: newPhDep });
  };

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,35,24,0.08)' }}>
      {/* Gradient header */}
      <button
        onClick={() => setOpen(!isOpen)}
        style={{
          width: '100%', border: 'none', cursor: 'pointer',
          background: colors.bg, padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: colors.label, fontFamily: 'var(--font-body)' }}>
            Phase {phIdx + 1}: Age {ph.from}–{ph.to}
          </span>
          {kidsInPhase.length > 0 && (
            <span style={{
              fontSize: '10px', background: 'rgba(244,196,48,0.25)', color: '#FCD34D',
              borderRadius: '100px', padding: '2px 8px', fontFamily: 'var(--font-body)', fontWeight: 600,
            }}>
              {kidsInPhase.length} kids event{kidsInPhase.length > 1 ? 's' : ''}
            </span>
          )}
          {result.bothDep && (
            <span style={{ fontSize: '10px', background: 'rgba(255,0,0,0.25)', color: '#FCA5A5', borderRadius: '100px', padding: '2px 8px', fontFamily: 'var(--font-body)' }}>
              Depleted
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', opacity: 0.6, color: colors.label, fontFamily: 'var(--font-body)', margin: 0 }}>Exp / Income</p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: colors.accent, fontFamily: 'var(--font-body)', margin: 0 }}>
              {fmt(annExp0)} / {fmt(debtInt)}/yr
            </p>
          </div>
          <span style={{ color: colors.label, opacity: 0.6, fontSize: '14px' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div style={{ background: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #E8E4DE', borderTop: 'none', borderRadius: '0 0 16px 16px' }}>

          {/* FIX 5: Editable chips for auto-filled starting instruments */}
          {hasFilledInstrs && (
            <div style={{ borderRadius: '10px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
                  Starting instruments (auto-filled)
                </p>
                <button
                  onClick={clearThisFill}
                  style={{ fontSize: '11px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}
                >
                  Reset to chain
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filledInstrs.map(instr => {
                  const isDebt = instr.t === 'i';
                  const isEditing = editingChipId === instr.id;
                  return (
                    <div key={instr.id}>
                      {isEditing ? (
                        <div style={{
                          borderRadius: '10px', background: '#fff',
                          border: `1.5px solid ${isDebt ? '#86EFAC' : '#93C5FD'}`,
                          padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                              padding: '2px 7px', borderRadius: '5px',
                              background: isDebt ? '#DCFCE7' : '#DBEAFE',
                              color: isDebt ? '#15803D' : '#1D4ED8',
                              fontFamily: 'var(--font-body)',
                            }}>{isDebt ? 'Debt' : 'Equity'}</span>
                            <button onClick={() => setEditingChipId(null)} style={{ fontSize: '12px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Done</button>
                          </div>
                          <input
                            type="text" value={instr.n}
                            onChange={e => updateFilledInstr(instr.id, { n: e.target.value })}
                            style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', border: '1px solid #E8E4DE', borderRadius: '8px', padding: '6px 10px', outline: 'none', background: '#FAFAF8' }}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                            <AmountInput value={instr.a} onChange={v => updateFilledInstr(instr.id, { a: v })} placeholder="Amount" />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <input
                                type="number" min={1} max={30} value={instr.r}
                                onChange={e => updateFilledInstr(instr.id, { r: parseFloat(e.target.value) || 0 })}
                                style={{ width: '48px', padding: '8px 6px', borderRadius: '8px', border: '1.5px solid #E8E4DE', background: '#FAFAF8', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none', textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          borderRadius: '8px', padding: '7px 10px',
                          background: isDebt ? '#F0FDF4' : '#EFF6FF',
                          border: `1px solid ${isDebt ? '#BBF7D0' : '#BFDBFE'}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                              padding: '2px 6px', borderRadius: '4px',
                              background: isDebt ? '#DCFCE7' : '#DBEAFE',
                              color: isDebt ? '#15803D' : '#1D4ED8',
                              fontFamily: 'var(--font-body)',
                            }}>{isDebt ? 'Debt' : 'Eq'}</span>
                            <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'var(--font-body)' }}>{instr.n}</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f2318', fontFamily: 'var(--font-body)' }}>{fmt(instr.a)}</span>
                            <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>@ {instr.r}%</span>
                          </div>
                          <button
                            onClick={() => setEditingChipId(instr.id)}
                            style={{ fontSize: '13px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                            title="Edit"
                          >✎</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kids events in this phase */}
          {kidsInPhase.length > 0 && (
            <div style={{ borderRadius: '10px', background: '#FFFBEB', border: '1px solid #FCD34D', padding: '12px 14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
                Kids events in this phase
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {kidsInPhase.map((g, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#78350F', fontFamily: 'var(--font-body)' }}>
                      {g.kidName} · {g.type}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400E', fontFamily: 'var(--font-body)' }}>
                        {fmt(g.futureCorpus)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#92400E', fontFamily: 'var(--font-body)', marginLeft: '4px', opacity: 0.7 }}>
                        at age {S.age + g.yearsUntil}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense editor */}
          <PhaseExpenseEditor phIdx={phIdx} ph={ph} />

          {/* Stats chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Debt interest income</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#16A34A', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(debtInt)}/yr</p>
            </div>
            <div style={{ borderRadius: '10px', background: net >= 0 ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${net >= 0 ? '#BBF7D0' : '#FECACA'}`, padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Net (income − exp)</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: net >= 0 ? '#16A34A' : '#DC2626', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(net)}/yr</p>
            </div>
          </div>

          {/* Coverage bar */}
          {annExp0 > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)', marginBottom: '4px' }}>
                <span>Income coverage</span>
                <span>{Math.round(Math.min(debtInt / annExp0 * 100, 999))}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '100px', background: '#E8E4DE', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '100px',
                  width: `${Math.min(debtInt / annExp0 * 100, 100)}%`,
                  background: debtInt >= annExp0 ? '#16A34A' : '#f97316',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}

          {/* Depletion warnings */}
          {result.evDep && !result.bothDep && (
            <div style={{ borderRadius: '10px', background: '#FFFBEB', border: '1px solid #FCD34D', padding: '10px 12px', fontSize: '13px', color: '#92400E', fontFamily: 'var(--font-body)' }}>
              Equity depleted in Year {result.fdYr} (age {result.fdAge}). Drawing from debt principal.
            </div>
          )}
          {result.bothDep && (
            <div style={{ borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 12px', fontSize: '13px', color: '#DC2626', fontFamily: 'var(--font-body)' }}>
              Both depleted in Year {result.bdYr} (age {result.bdAge}). Unfunded: {fmt(result.totUnf)}
              <br /><span style={{ fontSize: '12px', opacity: 0.7 }}>Consider reviewing expenses in Step 3.</span>
            </div>
          )}

          {/* Year-by-year */}
          <button onClick={() => setShowTable(!showTable)} style={{ fontSize: '12px', color: '#e8622a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', padding: 0 }}>
            {showTable ? 'Hide' : 'Show'} year-by-year breakdown
          </button>

          {showTable && (
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E8E4DE' }}>
              <table style={{ width: '100%', fontSize: '11px', fontFamily: 'var(--font-body)', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8F7F4' }}>
                    {['Yr', 'Age', 'Expenses', 'Interest', 'Net', 'Equity', 'Total'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map(row => (
                    <tr key={row.y} style={{ background: row.unfunded > 0 ? '#FEF2F2' : 'transparent', borderTop: '1px solid #E8E4DE' }}>
                      <td style={{ padding: '5px 10px', color: '#9CA3AF' }}>{row.y}</td>
                      <td style={{ padding: '5px 10px', color: '#9CA3AF' }}>{row.age}</td>
                      <td style={{ padding: '5px 10px' }}>{fmt(row.annExp)}</td>
                      <td style={{ padding: '5px 10px', color: '#16A34A' }}>{fmt(row.interest)}</td>
                      <td style={{ padding: '5px 10px', color: row.net >= 0 ? '#16A34A' : '#DC2626' }}>{fmt(row.net)}</td>
                      <td style={{ padding: '5px 10px' }}>{fmt(row.eqEnd)}</td>
                      <td style={{ padding: '5px 10px', fontWeight: 600 }}>{fmt(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FIX 4: Bridge to next phase — proper button with chip state */}
          {phIdx < allPhases.length - 1 && result.end > 0 && !result.bothDep && (
            <div style={{ borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#15803D', fontFamily: 'var(--font-body)', margin: '0 0 2px' }}>
                Corpus entering Phase {phIdx + 2}: {fmt(result.end)}
              </p>
              <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>
                Debt: {fmt(result.iE)} · Equity: {fmt(result.gE)}
              </p>
              {nextFilled ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '100px', padding: '5px 12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', fontFamily: 'var(--font-body)' }}>
                    Phase {phIdx + 2} auto-filled
                  </span>
                  <button
                    onClick={clearNextFill}
                    style={{ fontSize: '14px', color: '#15803D', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0, marginTop: '-1px' }}
                    title="Clear"
                  >×</button>
                </div>
              ) : (
                <button
                  onClick={autoFillNext}
                  style={{
                    padding: '9px 16px', borderRadius: '10px',
                    background: '#16A34A', border: 'none',
                    color: '#fff', fontSize: '13px', fontWeight: 600,
                    fontFamily: 'var(--font-body)', cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                >
                  Auto-fill Phase {phIdx + 2} with these balances →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── DeployCorpusUI ────────────────────────────────────────────────────────────

export default function DeployCorpusUI({ totalCorpus, moAtRet, kidsGoals }: DeployCorpusUIProps) {
  const { state: S, update } = usePlannerStore();

  const phases = buildPhases(S);

  useEffect(() => {
    if (phases.length > 0 && S.phases.length === 0) {
      update({ phases });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayPhases: Phase[] = S.phases.length > 0 ? S.phases : phases;

  const depTotal = S.dep.reduce((s, d) => s + d.a, 0);
  const unalloc = totalCorpus - depTotal;
  const allocPct = totalCorpus > 0 ? Math.min(depTotal / totalCorpus * 100, 100) : 0;

  // FIX 2: Suggested split
  const annualExp = moAtRet * 12;
  const suggestedDebt = (totalCorpus > 0 && annualExp > 0)
    ? Math.min(Math.round(annualExp / 0.07), Math.round(totalCorpus * 0.6))
    : 0;
  const suggestedEquity = suggestedDebt > 0 ? totalCorpus - suggestedDebt : 0;

  const useSuggestedSplit = () => {
    const debt: Instrument = { id: String(S._id), t: 'i', n: 'Fixed Deposit', a: suggestedDebt, r: 7 };
    const equity: Instrument = { id: String(S._id + 1), t: 'g', n: 'Equity Fund', a: suggestedEquity, r: 12 };
    update({ dep: [debt, equity], _id: S._id + 2 });
  };

  const addInstrument = (t: InstrumentType) => {
    const newInstr: Instrument = {
      id: String(S._id),
      t,
      n: t === 'i' ? 'Fixed Deposit' : 'Equity Fund',
      a: 0,
      r: t === 'i' ? 7 : 12,
    };
    update({ dep: [...S.dep, newInstr], _id: S._id + 1 });
  };

  const updateInstr = (id: string, patch: Partial<Instrument>) =>
    update({ dep: S.dep.map(d => d.id === id ? { ...d, ...patch } : d) });

  const removeInstr = (id: string) =>
    update({ dep: S.dep.filter(d => d.id !== id) });

  // FIX 3: Pre-compute phase simulation chain to detect depletion
  const phaseResults: { result: SimPhaseResult; }[] = [];
  if (S.dep.length > 0 && displayPhases.length > 0) {
    let chain = S.dep;
    for (let i = 0; i < displayPhases.length; i++) {
      const chDep = S.phDep[i];
      const instrForPhase = i === 0 ? S.dep : ((chDep?.length ?? 0) > 0 ? chDep : chain);
      const result = simPhase(displayPhases[i], instrForPhase);
      phaseResults.push({ result });
      chain = result.si;
    }
  }
  const depletedIdx = phaseResults.findIndex(e => e.result.bothDep);
  const visibleCount = depletedIdx >= 0 ? depletedIdx + 1 : phaseResults.length;

  // Kids goals happening before retirement (banner for Tab 2)
  const preRetKids = (kidsGoals ?? []).filter(g => S.age + g.yearsUntil < S.retAge);

  return (
    <div>
      <StepHeader step={6} title="Deploy Your Corpus" oneLiner="The end game. Put your money to work so it outlasts you." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Concept explainer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ borderRadius: '12px', background: '#F0FDF4', border: '1px solid #86EFAC', borderLeft: '4px solid #16A34A', padding: '12px 14px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#15803D', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Debt</p>
            <p style={{ fontSize: '11px', color: '#166534', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.4 }}>Principal fixed. Interest income covers your expenses each year.</p>
          </div>
          <div style={{ borderRadius: '12px', background: '#EFF6FF', border: '1px solid #93C5FD', borderLeft: '4px solid #2563EB', padding: '12px 14px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>Equity</p>
            <p style={{ fontSize: '11px', color: '#1E40AF', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.4 }}>Principal grows over time. Acts as your long-term buffer.</p>
          </div>
        </div>

        {/* FIX 2: Suggested split */}
        {suggestedDebt > 0 && (
          <div style={{
            borderRadius: '14px', padding: '14px 16px',
            background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
            border: '1px solid #86EFAC', borderLeft: '4px solid #16A34A',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#15803D', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>
              Suggested starting split
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.7)', padding: '10px 12px', border: '1px solid #BBF7D0' }}>
                <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Debt (FD / Bonds)</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#15803D', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(suggestedDebt)}</p>
                <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{Math.round(suggestedDebt / totalCorpus * 100)}% · 7% return</p>
              </div>
              <div style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.7)', padding: '10px 12px', border: '1px solid #BFDBFE' }}>
                <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 3px' }}>Equity (MF / Stocks)</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#1D4ED8', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(suggestedEquity)}</p>
                <p style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{Math.round(suggestedEquity / totalCorpus * 100)}% · 12% return</p>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: '#166534', fontFamily: 'var(--font-body)', margin: '0 0 10px', lineHeight: 1.5 }}>
              Debt sized to cover annual expenses ({fmt(annualExp)}/yr) at 7% interest. Equity is the remaining buffer.
            </p>
            <button
              onClick={useSuggestedSplit}
              style={{
                padding: '9px 18px', borderRadius: '10px',
                background: '#16A34A', border: 'none',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
              }}
            >
              Use this split →
            </button>
          </div>
        )}

        {/* Pre-retirement kids banner (Tab 2 only) */}
        {preRetKids.length > 0 && (
          <div style={{ borderRadius: '12px', background: '#FFFBEB', border: '1px solid #FCD34D', borderLeft: '4px solid #F59E0B', padding: '12px 14px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
              Pre-retirement goals (funded by SIPs)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {preRetKids.map((g, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
                  <span style={{ color: '#78350F' }}>{g.kidName} · {g.type}</span>
                  <span style={{ fontWeight: 600, color: '#92400E' }}>{fmt(g.futureCorpus)}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#92400E', fontFamily: 'var(--font-body)', margin: '8px 0 0', opacity: 0.7 }}>
              These are separate from your retirement corpus.
            </p>
          </div>
        )}

        {/* Corpus allocation bar */}
        <div style={{ borderRadius: '14px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'var(--font-body)' }}>
              Allocated: <strong style={{ color: '#0f2318' }}>{fmt(depTotal)}</strong>
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)', color: unalloc > 0 ? '#EA8C00' : unalloc < 0 ? '#DC2626' : '#16A34A' }}>
              {unalloc > 0 ? `${fmt(unalloc)} unallocated` : unalloc < 0 ? `${fmt(Math.abs(unalloc))} over` : 'Fully allocated'}
            </span>
          </div>
          <div style={{ height: '8px', borderRadius: '100px', background: '#E8E4DE', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{
              height: '100%', borderRadius: '100px', transition: 'width 0.5s ease',
              width: `${Math.min(allocPct, 100)}%`,
              background: allocPct >= 100 ? '#16A34A' : allocPct > 80 ? '#F4C430' : '#f97316',
            }} />
          </div>
          <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
            {allocPct.toFixed(0)}% of {fmt(totalCorpus)} corpus allocated
          </p>
        </div>

        {/* Add instruments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>Instruments</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => addInstrument('i')} style={{
                fontSize: '12px', padding: '7px 14px', borderRadius: '10px',
                border: '1.5px solid #86EFAC', background: '#F0FDF4', color: '#15803D',
                fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
              }}>+ Debt</button>
              <button onClick={() => addInstrument('g')} style={{
                fontSize: '12px', padding: '7px 14px', borderRadius: '10px',
                border: '1.5px solid #93C5FD', background: '#EFF6FF', color: '#1D4ED8',
                fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
              }}>+ Equity</button>
            </div>
          </div>

          {S.dep.length === 0 && (
            <div style={{ borderRadius: '12px', background: '#F8F7F4', border: '1px dashed #D1D5DB', padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
                Add debt and equity instruments to start deploying your corpus.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {S.dep.map(instr => (
              <InstrCard key={instr.id} instr={instr}
                onChange={p => updateInstr(instr.id, p)}
                onRemove={() => removeInstr(instr.id)} />
            ))}
          </div>
        </div>

        {/* Mix summary chips */}
        {S.dep.length > 0 && depTotal > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Debt %', value: fmtPct(S.dep.filter(d => d.t === 'i').reduce((s, d) => s + d.a, 0) / depTotal * 100) },
              { label: 'Equity %', value: fmtPct(S.dep.filter(d => d.t === 'g').reduce((s, d) => s + d.a, 0) / depTotal * 100) },
              { label: 'Blended return', value: fmtPct(S.dep.reduce((s, d) => s + d.a * d.r / 100, 0) / depTotal * 100) },
            ].map(c => (
              <div key={c.label} style={{ borderRadius: '10px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>{c.label}</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Phase cards */}
        {S.dep.length > 0 && displayPhases.length > 0 && phaseResults.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f2318', fontFamily: 'var(--font-body)', margin: 0 }}>Retirement Phases</h3>
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>
                {displayPhases.length} phase{displayPhases.length > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayPhases.slice(0, visibleCount).map((ph, i) => (
                <PhaseCard
                  key={`${ph.from}-${ph.to}`}
                  phIdx={i}
                  ph={ph}
                  allPhases={displayPhases}
                  preResult={phaseResults[i].result}
                  kidsGoals={kidsGoals}
                />
              ))}

              {/* FIX 3: Red stop card after depletion */}
              {depletedIdx >= 0 && (
                <div style={{
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
                  padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-body)', margin: 0 }}>
                    Simulation stopped — corpus depleted
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
                    Corpus runs out in Phase {depletedIdx + 1} at age {phaseResults[depletedIdx].result.bdAge}.
                    {depletedIdx + 1 < displayPhases.length && ` ${displayPhases.length - depletedIdx - 1} later phase${displayPhases.length - depletedIdx - 1 > 1 ? 's' : ''} cannot be funded.`}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-body)', margin: 0 }}>
                    Try increasing your SIP in Step 4, reducing expenses, or adjusting your retirement age.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
