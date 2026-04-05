import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// ─── Formatters ───────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function fmtShort(n: number): string {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000)   return (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return (n / 1000).toFixed(0) + 'K';
  return String(Math.round(n));
}

// ─── Shared label style ───────────────────────────────────────────────
const lbl: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
  color: '#9CA3AF', fontFamily: 'var(--font-body)', display: 'block', marginBottom: '8px',
};

// ─── parseIndianNumber ────────────────────────────────────────────────
// Accepts plain numbers, and Indian shorthand: k/K, l/L, cr/Cr/CR
// Examples: "50K" → 50000, "1.5L" → 150000, "5Cr" → 50000000, "50000" → 50000
function parseIndianNumber(raw: string): number {
  const s = raw.trim().toLowerCase().replace(/,/g, '').replace(/%/g, '');
  if (!s) return NaN;
  const match = s.match(/^([0-9]*\.?[0-9]+)\s*(cr|l|k)?$/);
  if (!match) return NaN;
  const num = parseFloat(match[1]);
  const suffix = match[2] ?? '';
  if (suffix === 'cr') return num * 10_000_000;
  if (suffix === 'l')  return num * 100_000;
  if (suffix === 'k')  return num * 1_000;
  return num;
}

// ─── NumberInput ──────────────────────────────────────────────────────
// Clean input styled like planner Step 1.
// - Local string state so typing is always smooth
// - Parses on blur or Enter; reverts on invalid/empty
// - Shows "= formatted value" below when parsedDisplay is provided
// - Shows hint text below
function NumberInput({ label, value, min = 0, max = Infinity, onChange, hint, parsedDisplay }: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  hint: string;
  parsedDisplay?: (n: number) => string;
}) {
  const [text, setText] = useState(() => value > 0 ? String(value) : '');
  const [focused, setFocused] = useState(false);

  const commit = (raw: string) => {
    const n = parseIndianNumber(raw);
    if (!isNaN(n) && n > 0) {
      const clamped = Math.max(min, Math.min(max, n));
      onChange(clamped);
      setText(String(clamped));
    } else {
      // Revert to last valid value
      setText(value > 0 ? String(value) : '');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <label style={lbl}>{label}</label>
      <input
        type="text"
        value={focused ? text : (value > 0 ? String(value) : '')}
        onFocus={() => {
          setFocused(true);
          setText(value > 0 ? String(value) : '');
        }}
        onChange={e => setText(e.target.value)}
        onBlur={() => {
          setFocused(false);
          commit(text);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        placeholder="0"
        style={{
          width: '100%',
          background: '#FAFAF8',
          border: `1.5px solid ${focused ? '#e8622a' : '#E8E4DE'}`,
          borderRadius: '12px',
          padding: '13px 16px',
          fontSize: '16px',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          color: '#0f2318',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: focused ? '0 0 0 3px rgba(232,98,42,0.1)' : 'none',
        }}
      />
      {/* Parsed value confirmation */}
      {parsedDisplay && value > 0 && (
        <p style={{ fontSize: '11px', color: '#16A34A', fontFamily: 'var(--font-body)', margin: '5px 0 0', fontWeight: 600 }}>
          = {parsedDisplay(value)}
        </p>
      )}
      {/* Helper hint */}
      <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {hint}
      </p>
    </div>
  );
}

// ─── Knowledge box ────────────────────────────────────────────────────
function KnowledgeBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderLeft: '4px solid #16A34A',
      background: '#F0FDF4',
      borderRadius: '0 10px 10px 0',
      padding: '14px 18px',
      marginTop: '24px',
    }}>
      <p style={{ fontSize: '13px', color: '#166534', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.7 }}>
        {children}
      </p>
    </div>
  );
}

// ─── Calculator 1 — SIP Growth ────────────────────────────────────────
function SIPCalc() {
  const [sip, setSip] = useState(10000);
  const [yr, setYr]   = useState(20);
  const [ret, setRet] = useState(12);

  const { data, corpus, invested } = useMemo(() => {
    const r = ret / 100 / 12;
    const pts: { year: number; invested: number; corpus: number }[] = [];
    for (let y = 0; y <= yr; y++) {
      const n = y * 12;
      const inv  = sip * n;
      const corp = r === 0 ? inv : sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      pts.push({ year: y, invested: Math.round(inv), corpus: Math.round(corp) });
    }
    return { data: pts, corpus: pts[pts.length - 1]?.corpus ?? 0, invested: pts[pts.length - 1]?.invested ?? 0 };
  }, [sip, yr, ret]);

  const multiplier = invested > 0 ? (corpus / invested).toFixed(1) : '0';

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        {/* Inputs */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>
              How much will your SIP grow?
            </h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
              Spoiler: more than you think, less than your broker promises.
            </p>
          </div>

          <NumberInput
            label="Monthly SIP amount"
            value={sip} min={100} max={10000000}
            onChange={setSip}
            parsedDisplay={n => fmt(n) + '/mo'}
            hint="e.g. 5000, 10K, 1L"
          />
          <NumberInput
            label="Duration (years)"
            value={yr} min={1} max={40}
            onChange={setYr}
            hint="e.g. 10, 20, 30 (in years)"
          />
          <NumberInput
            label="Expected annual return"
            value={ret} min={1} max={30}
            onChange={setRet}
            parsedDisplay={n => `${n}% p.a.`}
            hint="e.g. 12. Equity MFs: 12–14%, FD: 6–8%"
          />
        </div>

        {/* Results */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Corpus card */}
          <div style={{
            borderRadius: '16px', padding: '24px',
            background: 'linear-gradient(135deg, #0f2318 0%, #1a3a2a 100%)',
            color: '#fff', textAlign: 'center',
          }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.5, fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>
              Your corpus
            </p>
            <p style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-body)', margin: 0, color: '#F4C430', lineHeight: 1.1 }}>
              {fmt(corpus)}
            </p>
          </div>

          {/* 3 stat chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { l: 'Invested', v: fmt(invested), bg: '#F8F7F4', c: '#374151' },
              { l: 'Returns', v: fmt(corpus - invested), bg: '#F0FDF4', c: '#16A34A' },
              { l: 'Multiplier', v: `${multiplier}x`, bg: '#FFF5F0', c: '#e8622a' },
            ].map(x => (
              <div key={x.l} style={{ borderRadius: '12px', padding: '12px 10px', background: x.bg, border: '1px solid #E8E4DE', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>{x.l}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: x.c, fontFamily: 'var(--font-body)', margin: 0 }}>{x.v}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} /><stop offset="95%" stopColor="#16A34A" stopOpacity={0} /></linearGradient>
                  <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fontFamily: 'var(--font-body)' }} tickLine={false} axisLine={false} tickFormatter={v => `Y${v}`} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-body)' }} tickLine={false} axisLine={false} tickFormatter={fmtShort} width={40} />
                <Tooltip contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 12, borderRadius: 10, border: '1px solid #E8E4DE' }} formatter={(v) => [fmt(Number(v) || 0), '']} labelFormatter={v => `Year ${v}`} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
                <Area type="monotone" dataKey="invested" name="Invested" stroke="#2563EB" fill="url(#sg2)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="corpus" name="Corpus" stroke="#16A34A" fill="url(#sg1)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <KnowledgeBox>
        <strong>The 1% difference rule:</strong> A 12% return turns ₹10K/mo into ₹1.76 Cr in 20 years. At 11%? ₹1.51 Cr. That ₹25L difference is your fund manager's expense ratio. Choose index funds.
      </KnowledgeBox>
    </div>
  );
}

// ─── Calculator 2 — Inflation Reality Check ───────────────────────────
function InflationCalc() {
  const [amount, setAmount] = useState(100000);
  const [yr, setYr]         = useState(20);
  const [infl, setInfl]     = useState(6);

  const futureRequired = useMemo(
    () => Math.round(amount * Math.pow(1 + infl / 100, yr)),
    [amount, yr, infl]
  );
  const realValue = useMemo(
    () => Math.round(amount / Math.pow(1 + infl / 100, yr)),
    [amount, yr, infl]
  );
  const powerLoss = Math.round((1 - realValue / amount) * 100);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        {/* Inputs */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>
              What will your money be worth?
            </h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
              Inflation is the tax no one voted for.
            </p>
          </div>

          <NumberInput
            label="Amount today"
            value={amount} min={1000} max={100000000}
            onChange={setAmount}
            parsedDisplay={n => fmt(n)}
            hint="e.g. 1L, 5L, 10L"
          />
          <NumberInput
            label="Years ahead"
            value={yr} min={1} max={50}
            onChange={setYr}
            hint="e.g. 10, 20, 30 (in years)"
          />
          <NumberInput
            label="Inflation rate"
            value={infl} min={1} max={20}
            onChange={setInfl}
            parsedDisplay={n => `${n}% p.a.`}
            hint="e.g. 6 (India avg is 6–7% p.a.)"
          />
        </div>

        {/* Results */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Two cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ borderRadius: '14px', padding: '20px 16px', background: '#F8F7F4', border: '1px solid #E8E4DE', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>Today's value</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#374151', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(amount)}</p>
            </div>
            <div style={{
              borderRadius: '14px', padding: '20px 16px', textAlign: 'center',
              background: 'linear-gradient(135deg, #e8622a, #f5856a)',
            }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', margin: '0 0 8px' }}>Future equivalent</p>
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-body)', margin: 0 }}>{fmt(futureRequired)}</p>
            </div>
          </div>

          {/* Summary */}
          <div style={{ borderRadius: '14px', padding: '18px', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <p style={{ fontSize: '14px', color: '#78350F', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.65 }}>
              Your <strong>{fmt(amount)}</strong> today will feel like <strong>{fmt(realValue)}</strong> in {yr} years. That is a <strong>{powerLoss}% loss</strong> in purchasing power at {infl}% annual inflation.
            </p>
          </div>

          {/* Visual bar */}
          <div style={{ borderRadius: '10px', background: '#F0EDE8', height: '10px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '10px',
              width: `${Math.max(5, 100 - powerLoss)}%`,
              background: 'linear-gradient(90deg, #16A34A, #86EFAC)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: '-8px 0 0', textAlign: 'center' }}>
            Real purchasing power remaining: {100 - powerLoss}%
          </p>
        </div>
      </div>

      <KnowledgeBox>
        <strong>The chai test:</strong> A cup of chai was ₹5 in 2005. Today it is ₹25. That is 8% annual inflation on chai alone. Your retirement corpus needs to keep pace. Most people's plans don't.
      </KnowledgeBox>
    </div>
  );
}

// ─── Calculator 3 — FD vs Mutual Fund ────────────────────────────────
function FDvsMFCalc() {
  const [amount, setAmount] = useState(1000000);
  const [yr, setYr]         = useState(20);
  const [fdRate, setFdRate] = useState(7);
  const [mfRate, setMfRate] = useState(12);

  const { fdValue, mfValue, data } = useMemo(() => {
    const fd = Math.round(amount * Math.pow(1 + fdRate / 100, yr));
    const mf = Math.round(amount * Math.pow(1 + mfRate / 100, yr));
    const pts: { year: number; fd: number; mf: number }[] = [];
    for (let y = 0; y <= yr; y++) {
      pts.push({
        year: y,
        fd:   Math.round(amount * Math.pow(1 + fdRate / 100, y)),
        mf:   Math.round(amount * Math.pow(1 + mfRate / 100, y)),
      });
    }
    return { fdValue: fd, mfValue: mf, data: pts };
  }, [amount, yr, fdRate, mfRate]);

  const diff = mfValue - fdValue;
  const diffPct = fdValue > 0 ? Math.round((diff / fdValue) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        {/* Inputs */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>
              Is your FD really safe?
            </h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-body)', margin: 0 }}>
              Spoiler: your FD is losing to inflation. Quietly.
            </p>
          </div>

          <NumberInput
            label="Investment amount"
            value={amount} min={1000} max={100000000}
            onChange={setAmount}
            parsedDisplay={n => fmt(n)}
            hint="e.g. 1L, 5L, 10L"
          />
          <NumberInput
            label="Duration (years)"
            value={yr} min={1} max={40}
            onChange={setYr}
            hint="e.g. 10, 20, 30 (in years)"
          />
          <NumberInput
            label="FD interest rate"
            value={fdRate} min={1} max={20}
            onChange={setFdRate}
            parsedDisplay={n => `${n}% p.a.`}
            hint="e.g. 7 (SBI FD: ~7%, senior citizen: ~7.5%)"
          />
          <NumberInput
            label="MF expected return"
            value={mfRate} min={1} max={30}
            onChange={setMfRate}
            parsedDisplay={n => `${n}% p.a.`}
            hint="e.g. 12. Equity MFs: 12–14%, FD: 6–8%"
          />
        </div>

        {/* Results */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Two comparison cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ borderRadius: '14px', padding: '18px 14px', background: '#EFF6FF', border: '1px solid #93C5FD', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#1D4ED8', fontFamily: 'var(--font-body)', margin: '0 0 6px', fontWeight: 700 }}>FD Final Value</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A5F', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>{fmt(fdValue)}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0 }}>at {fdRate}% p.a.</p>
            </div>
            <div style={{ borderRadius: '14px', padding: '18px 14px', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #86EFAC', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#15803D', fontFamily: 'var(--font-body)', margin: '0 0 6px', fontWeight: 700 }}>MF Final Value</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#14532D', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>{fmt(mfValue)}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: 0 }}>at {mfRate}% p.a.</p>
            </div>
          </div>

          {/* Difference card */}
          <div style={{ borderRadius: '14px', padding: '18px', background: '#0f2318', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>MF gives you more</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#F4C430', fontFamily: 'var(--font-body)', margin: '0 0 4px' }}>{fmt(diff)}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', margin: 0 }}>That is {diffPct}% more wealth over {yr} years</p>
          </div>

          {/* Chart */}
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fontFamily: 'var(--font-body)' }} tickLine={false} axisLine={false} tickFormatter={v => `Y${v}`} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-body)' }} tickLine={false} axisLine={false} tickFormatter={fmtShort} width={44} />
                <Tooltip contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 12, borderRadius: 10, border: '1px solid #E8E4DE' }} formatter={(v) => [fmt(Number(v) || 0), '']} labelFormatter={v => `Year ${v}`} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
                <Line type="monotone" dataKey="fd" name="FD" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mf" name="Mutual Fund" stroke="#16A34A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <KnowledgeBox>
        <strong>The FD illusion:</strong> ₹10 lakh in FD at 7% for 20 years = ₹38.7 lakh. The same in a Nifty index fund at 12% = ₹96.5 lakh. The difference: ₹57.8 lakh. Also known as the cost of playing it safe.
      </KnowledgeBox>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────
const TABS = [
  { id: 0, label: 'SIP Growth' },
  { id: 1, label: 'Inflation Reality' },
  { id: 2, label: 'FD vs MF' },
];

// ─── Page ─────────────────────────────────────────────────────────────
export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-background font-body">
      <Helmet>
        <title>Retirement Calculators – SIP, Corpus & Inflation | CorpusCalc</title>
        <meta name="description" content="Free retirement calculators for Indians. Calculate your SIP, corpus goal, and inflation-adjusted returns." />
        <link rel="canonical" href="https://corpuscalc.com/calculators" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2318 0%, #1c3d2a 60%, #0f2318 100%)', padding: '52px 24px 44px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', margin: '0 0 12px', lineHeight: 1.2 }}>
            Retirement Calculators
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Numbers don't lie. People just avoid looking at them.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E4DE', padding: '0 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '8px', padding: '14px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 22px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                background: activeTab === tab.id ? '#e8622a' : '#F5F3F0',
                color: activeTab === tab.id ? '#fff' : '#6B7280',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator content */}
      <div className="container py-10">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ borderRadius: '16px', border: '1px solid #E8E4DE', background: '#fff', padding: '28px 24px', boxShadow: '0 2px 16px rgba(15,35,24,0.06)' }}>
            {activeTab === 0 && <SIPCalc />}
            {activeTab === 1 && <InflationCalc />}
            {activeTab === 2 && <FDvsMFCalc />}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: '36px', borderRadius: '16px', background: '#F8F7F4', border: '1px solid #E8E4DE', padding: '24px 28px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f2318', fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>
              Ready for a complete retirement plan?
            </p>
            <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'var(--font-body)', margin: '0 0 18px', lineHeight: 1.6 }}>
              These calculators are just the start. CorpusCalc builds your full decade-by-decade plan, complete with drawdown strategy and kids goals.
            </p>
            <a
              href="/plan"
              style={{
                display: 'inline-block', padding: '11px 28px', borderRadius: '12px',
                background: '#0f2318', color: '#fff', fontSize: '14px', fontWeight: 700,
                fontFamily: 'var(--font-body)', textDecoration: 'none',
              }}
            >
              Build my plan →
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
