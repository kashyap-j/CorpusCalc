import { usePlannerStore } from '../../store/plannerStore';
import {
  fmt, fmtPct, compute, buildPhases, simPhase,
  totMoIncome, totMoExp, totYrExp, moSurplus, ytr, retDur,
} from '../../lib/math';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 space-y-0.5">
      <p className="text-xs text-muted-foreground font-body">{label}</p>
      <p className="text-sm font-bold text-foreground font-body">{value}</p>
      {sub && <p className="text-xs text-muted-foreground font-body">{sub}</p>}
    </div>
  );
}

export default function Step7Final() {
  const { state: S } = usePlannerStore();
  const r = compute(S);
  const phases = buildPhases(S);

  const moInc = totMoIncome(S);
  const moExp = totMoExp(S);
  const yrExp = totYrExp(S);
  const surplus = moSurplus(S);
  const years = ytr(S);
  const dur = retDur(S);

  // Build corpus growth chart data (yearly milestones)
  const chartData: { year: number; age: number; corpus: number; target: number }[] = [];
  for (let y = 0; y <= years; y += Math.max(1, Math.floor(years / 10))) {
    const inv = (S.invMode === 'quick' ? S.invQuick : S.invMF + S.invEQ + S.invPF + S.invDT);
    const grown = inv * Math.pow(1 + S.invGR / 100, y);
    // Simple yearly SIP estimate for chart
    const sipC = S.sipAmt > 0
      ? S.sipAmt * 12 * ((Math.pow(1 + S.sipReturn / 100, y) - 1) / (S.sipReturn / 100))
      : 0;
    chartData.push({
      year: y,
      age: S.age + y,
      corpus: Math.round(grown + sipC),
      target: Math.round(r.reqCorpus),
    });
  }
  // Ensure final year is included
  if (chartData[chartData.length - 1]?.year !== years) {
    chartData.push({ year: years, age: S.retAge, corpus: Math.round(r.totalCorpus), target: Math.round(r.reqCorpus) });
  }

  // Phase simulation chain
  const phaseResults = phases.map((ph, i) => {
    let instr = S.dep;
    for (let j = 0; j < i; j++) {
      const res = simPhase(phases[j], j === 0 ? S.dep : (S.phDep[j]?.length ? S.phDep[j] : instr));
      instr = res.si;
    }
    return simPhase(ph, i === 0 ? S.dep : (S.phDep[i]?.length ? S.phDep[i] : instr));
  });

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          {S.name ? `${S.name}'s` : 'Your'} Retirement Report
        </h2>
        <p className="text-sm text-muted-foreground">Complete plan summary. Save or print for your records.</p>
      </div>

      {/* ── Hero ── */}
      <div className="rounded-2xl bg-forest text-primary-foreground p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs opacity-60 font-body">Projected corpus</p>
            <p className="font-display text-3xl font-bold">{fmt(r.totalCorpus)}</p>
          </div>
          <div>
            <p className="text-xs opacity-60 font-body">Required corpus</p>
            <p className="font-display text-3xl font-bold">{fmt(r.reqCorpus)}</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${r.pct}%`, background: r.onTrack ? 'hsl(var(--warm-gold))' : '#f97316' }}
            />
          </div>
          <p className="text-xs opacity-70 font-body">{r.pct.toFixed(0)}% funded · {r.onTrack ? `Surplus ${fmt(Math.abs(r.gap))}` : `Shortfall ${fmt(r.gap)}`}</p>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground font-body">Key Numbers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Metric label="Current age" value={String(S.age)} />
          <Metric label="Retirement age" value={String(S.retAge)} sub={`${years} years to go`} />
          <Metric label="Life expectancy" value={String(S.lifeE)} sub={`${dur} years of retirement`} />
          <Metric label="Monthly income" value={`${fmt(moInc)}/mo`} />
          <Metric label="Monthly expenses" value={`${fmt(moExp + yrExp / 12)}/mo`} />
          <Metric label="Monthly surplus" value={`${fmt(surplus)}/mo`} sub={surplus > 0 ? 'Available for SIP' : 'Deficit'} />
          <Metric label="Monthly SIP" value={`${fmt(S.sipAmt)}/mo`} sub={S.sipMode === 'salary' ? 'Grows with salary' : S.sipMode === 'fixed' ? 'Fixed step-up' : 'Flat'} />
          <Metric label="SIP return rate" value={fmtPct(S.sipReturn)} />
          <Metric label="Inflation assumed" value={fmtPct(S.inflation)} />
          <Metric label="Investment growth" value={fmtPct(S.invGR)} />
          <Metric label="Existing investments" value={fmt(S.invMode === 'quick' ? S.invQuick : S.invMF + S.invEQ + S.invPF + S.invDT)} sub="Today's value" />
          <Metric label="Investments at retirement" value={fmt(r.existGrown)} sub={`Grown at ${S.invGR}%`} />
          <Metric label="SIP corpus" value={fmt(r.sipC)} sub="Total SIP accumulated" />
          <Metric label="Total corpus" value={fmt(r.totalCorpus)} sub="At retirement" />
          <Metric label="Monthly expenses at ret." value={`${fmt(r.moAtRet)}/mo`} sub="Inflation adjusted" />
          <Metric label="Corpus multiplier" value={`×${r.mult}`} sub={`For ${dur}-yr retirement`} />
          <Metric label="Required corpus" value={fmt(r.reqCorpus)} />
          <Metric label="Gap / Surplus" value={r.onTrack ? `+${fmt(Math.abs(r.gap))}` : `−${fmt(r.gap)}`} sub={r.onTrack ? 'Surplus' : 'Shortfall'} />
          <Metric label="Suggested SIP (flat)" value={`${fmt(r.neededFlat)}/mo`} sub="To meet target exactly" />
          <Metric label="Retirement phases" value={String(phases.length)} sub={`${S.retAge}–${S.lifeE}`} />
          <Metric label="Total allocated" value={fmt(S.dep.reduce((s, d) => s + d.a, 0))} sub="In instruments" />
          <Metric label="Debt instruments" value={String(S.dep.filter(d => d.t === 'i').length)} />
          <Metric label="Equity instruments" value={String(S.dep.filter(d => d.t === 'g').length)} />
          <Metric label="Salary growth" value={fmtPct(S.salaryGrowth)} />
          <Metric label="Plan status" value={r.onTrack ? '✓ On Track' : '⚠ Needs Attention'} />
        </div>
      </div>

      {/* ── Corpus Growth Chart ── */}
      {chartData.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground font-body">Corpus Growth</h3>
          <div className="rounded-xl border border-border bg-card p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="age"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v: number) => {
                    if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
                    if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
                    return `${Math.round(v / 1000)}K`;
                  }}
                  width={55}
                />
                <Tooltip
                  formatter={(val) => [fmt(Number(val) || 0), '']}
                  labelFormatter={(label) => `Age ${label}`}
                  contentStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif' }} />
                <Line type="monotone" dataKey="corpus" stroke="hsl(var(--forest))" strokeWidth={2} dot={false} name="Projected corpus" />
                <Line type="monotone" dataKey="target" stroke="hsl(var(--warm-gold))" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Required corpus" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Phase Summary ── */}
      {phases.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground font-body">Phase Summary</h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead className="bg-secondary">
                <tr>
                  {['Phase', 'Ages', 'Ann. Expenses', 'Debt Income', 'Status'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {phases.map((ph, i) => {
                  const res = phaseResults[i];
                  const annExp = res?.rows[0]?.annExp ?? 0;
                  return (
                    <tr key={i} className={res?.bothDep ? 'bg-destructive/5' : ''}>
                      <td className="px-3 py-2.5 font-medium">{i + 1}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{ph.from}–{ph.to}</td>
                      <td className="px-3 py-2.5">{fmt(annExp)}</td>
                      <td className="px-3 py-2.5 text-forest">{fmt(res?.debtIntPerYr ?? 0)}</td>
                      <td className="px-3 py-2.5">
                        {res?.bothDep
                          ? <span className="text-destructive text-xs">⚠ Depleted yr {res.bdYr}</span>
                          : res?.evDep
                          ? <span className="text-warm-gold-dark text-xs">Equity depleted yr {res.fdYr}</span>
                          : <span className="text-forest text-xs">✓ Funded</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Action Plan ── */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground font-body">Action Plan</h3>
        <div className="space-y-2">
          {[
            { done: S.sipAmt > 0, text: `Start a ${fmt(S.sipAmt)}/mo SIP immediately` },
            { done: S.invGR >= 10, text: `Review existing investments (target ${S.invGR}% growth)` },
            { done: r.onTrack, text: r.onTrack ? 'Corpus target is funded — stay the course' : `Increase SIP to ${fmt(r.neededFlat)}/mo to close the shortfall` },
            { done: S.dep.length > 0, text: S.dep.length > 0 ? 'Corpus deployment plan ready' : 'Plan how to deploy corpus across debt/equity at retirement' },
            { done: false, text: 'Review and update this plan every 3 years' },
          ].map((item, i) => (
            <div key={i} className={[
              'rounded-xl px-4 py-3 flex items-start gap-3',
              item.done ? 'bg-forest/10 border border-forest/20' : 'bg-secondary border border-border',
            ].join(' ')}>
              <span className="text-base mt-0.5">{item.done ? '✓' : '○'}</span>
              <p className="text-sm font-body text-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Print */}
      <button
        onClick={() => window.print()}
        className="w-full py-3 rounded-xl bg-secondary border border-border text-sm font-semibold font-body text-foreground hover:bg-secondary/80 transition-colors"
      >
        🖨 Print / Save as PDF
      </button>
    </div>
  );
}
