import type { PlannerState } from './math';

export interface RiskScoreResult {
  score: number;
  label: string;
  ytr: number;
  coreRatio: number;
  satelliteRatio: number;
  contingencyRatio: number;
}

export function computeRiskScore(state: PlannerState, corpus: number, reqCorpus: number): RiskScoreResult {
  const ytr = Math.max(0, state.retAge - state.age);

  let ytrScore = 0;
  if (ytr >= 20) ytrScore = 100;
  else if (ytr >= 10) ytrScore = ((ytr - 10) / 10) * 100;
  else ytrScore = 0;

  let kidsScore = 100;
  const currentYear = new Date().getFullYear();
  if (state.kids && state.kids.length > 0) {
    let nearTermCost = 0;
    for (const kid of state.kids) {
      const goals: { cost: number; year: number }[] = [];
      if (kid.inclUG) goals.push({ cost: kid.ugAnnCost * kid.ugDur, year: currentYear + (kid.ugStartAge - kid.age) });
      if (kid.inclPG) goals.push({ cost: kid.pgAnnCost * kid.pgDur, year: currentYear + (kid.pgStartAge - kid.age) });
      if (kid.inclMar) goals.push({ cost: kid.marBudget, year: currentYear + (kid.marAge - kid.age) });
      for (const { cost, year } of goals) {
        if (year - currentYear <= 5) nearTermCost += cost;
      }
    }
    kidsScore = Math.max(0, 100 - Math.min(1, nearTermCost / 1_000_000) * 100);
  }

  let gapScore = 50;
  if (reqCorpus > 0) {
    gapScore = Math.max(0, Math.min(100, 50 + ((reqCorpus - corpus) / reqCorpus) * 100));
  }

  // Use detailed investment fields; defaults to 30 if all zero (quick mode)
  const equityAmt = state.invMF + state.invEQ;
  const totalDetailed = state.invMF + state.invEQ + state.invPF + state.invDT;
  const equityScore = totalDetailed > 0 ? Math.min(100, (equityAmt / totalDetailed) * 150) : 30;

  const score = Math.round(ytrScore * 0.4 + kidsScore * 0.2 + gapScore * 0.2 + equityScore * 0.2);

  const label =
    score <= 30 ? 'Conservative' :
    score <= 55 ? 'Moderate' :
    score <= 75 ? 'Moderate-Aggressive' :
    'Aggressive';

  const satelliteRatio = ytr > 10 ? Math.min(0.38, 0.19 + score * 0.002) : 0;
  const contingencyRatio = 0.05;
  const coreRatio = 1 - satelliteRatio - contingencyRatio;

  return { score, label, ytr, coreRatio, satelliteRatio, contingencyRatio };
}

export function buildInsightsPrompt(state: PlannerState, r: RiskScoreResult, corpus: number, reqCorpus: number): string {
  const name = state.name || 'the user';
  const income = (state.salaryMonthly + state.addIncQuick).toLocaleString('en-IN');
  const gap = reqCorpus - corpus;
  const hasKids = state.kids && state.kids.length > 0;
  const currentYear = new Date().getFullYear();

  const kidsBlock = hasKids
    ? state.kids.map(k => {
        const years: number[] = [
          ...(k.inclUG ? [currentYear + (k.ugStartAge - k.age)] : []),
          ...(k.inclPG ? [currentYear + (k.pgStartAge - k.age)] : []),
          ...(k.inclMar ? [currentYear + (k.marAge - k.age)] : []),
        ];
        const near = years.filter(y => (y - currentYear) < 8);
        return `Child — goals in years: ${years.join(', ')} | Near-term (<8yr): ${near.length > 0 ? 'YES' : 'no'}`;
      }).join('\n')
    : 'No kids data entered';

  return `You are generating a CorpusCalc Insights report for ${name}.

FINANCIAL DATA (interpret only — do not recalculate):
Age: ${state.age} | Retirement age: ${state.retAge} | YTR: ${r.ytr}
Life expectancy: ${state.lifeE}
Monthly income: ₹${income} | Monthly expenses: ₹${state.expQMo.toLocaleString('en-IN')}
Monthly SIP: ₹${state.sipAmt.toLocaleString('en-IN')}
Projected corpus: ₹${corpus.toLocaleString('en-IN')}
Required corpus: ₹${reqCorpus.toLocaleString('en-IN')}
${gap > 0 ? `SHORTFALL: ₹${gap.toLocaleString('en-IN')}` : `SURPLUS: ₹${Math.abs(gap).toLocaleString('en-IN')}`}
Risk score: ${r.score}/100 — ${r.label}
Existing: MF ₹${state.invMF.toLocaleString('en-IN')} | Equity ₹${state.invEQ.toLocaleString('en-IN')} | PF/PPF ₹${state.invPF.toLocaleString('en-IN')} | Debt/FD ₹${state.invDT.toLocaleString('en-IN')}

KIDS:
${kidsBlock}

ALLOCATION CONTEXT:
Core (${Math.round(r.coreRatio * 100)}%): Nifty 50 Index + Flexi Cap${r.score <= 55 ? ' + Aggressive Hybrid (conservative profile)' : ''}${r.ytr > 10 ? ' + PPF/VPF with 80C caveat' : ''}
Satellite (${Math.round(r.satelliteRatio * 100)}%): ${r.ytr <= 10 ? 'OMIT — YTR too low' : `Mid Cap${r.ytr > 15 ? ' + Small Cap' : ''}${r.score > 75 ? ' + one Sectoral' : ''} + International fund`}
Contingency Corpus (always 5% = ₹${Math.round(state.sipAmt * 0.05).toLocaleString('en-IN')}/mo): Liquid Fund or Money Market Fund — emergency buffer, never touch for retirement.

Generate exactly these 6 sections using markdown headers:
## 1. Verdict
## 2. Core SIP Blueprint
## 3. Satellite Portfolio
## 4. Debt Roadmap
## 5. Kids Goals Alert
## 6. Blind Spots

Rules:
- All ₹ in Indian format (lakhs/crores)
- Section 3: if YTR ≤ 10 write "Not applicable — ${r.ytr} years to retirement is too short for satellite equity."
- Section 5: if no kids data write "No children's goals entered in Step 2."
- Every 80C suggestion must include: "(Only if old tax regime. New regime users: evaluate on returns alone.)"
- India-specific instruments only. No generic global advice.
- Keep each section concise — maximum 5 bullet points per section, no long paragraphs
- Debt Roadmap: bullet points only, no markdown tables
- Blind Spots: maximum 4 items, one line each
- Kids Goals Alert: maximum 3 lines
- No markdown tables anywhere in the response — use bullet points instead`;
}

export function hashPlannerState(state: PlannerState): string {
  const key = JSON.stringify({
    age: state.age,
    retAge: state.retAge,
    sipAmt: state.sipAmt,
    salaryMonthly: state.salaryMonthly,
    expQMo: state.expQMo,
    invMF: state.invMF,
    invDT: state.invDT,
    kids: state.kids,
  });
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(31, h) + key.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(16);
}
