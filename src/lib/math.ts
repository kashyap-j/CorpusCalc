// ═══════════════════════════════════════════════════
// CORPUSCALC — MATH ENGINE (TypeScript port)
// Ported from corpuscalc_v2_wizard.html <script> block.
// All logic is preserved exactly — only types added.
// ═══════════════════════════════════════════════════

// ── Interfaces ───────────────────────────────────────────────────────────────

export type SIPMode = 'none' | 'salary' | 'fixed' | 'flat';
export type InstrumentType = 'i' | 'g'; // i = debt/income, g = equity/growth
export type InvMode = 'quick' | 'detailed';
export type ExpMode = 'quick' | 'detailed';
export type AddIncMode = 'quick' | 'detailed';

export interface Instrument {
  id: string;
  t: InstrumentType;
  n: string;   // label / name
  a: number;   // amount ₹
  r: number;   // return % per year
}

export interface PhaseMonthlyExpenses {
  rent: number;
  emi: number;
  groc: number;
  trav: number;
  util: number;
  ent: number;
  hlth: number;
  hh: number;
  other: number;
}

export interface PhaseYearlyExpenses {
  hol: number;
  ins: number;
  gad: number;
  clo: number;
  cins: number;
  don: number;
  rep: number;
  oy: number;
}

export interface Phase {
  from: number;
  to: number;
  mo: PhaseMonthlyExpenses;
  yr: PhaseYearlyExpenses;
  infl: number;
  userEdited: boolean;
}

export interface SimPhaseRow {
  y: number;
  age: number;
  annExp: number;
  interest: number;
  net: number;
  debt: number;
  eqStart: number;
  eqAfterNet: number;
  eqEnd: number;
  unfunded: number;
  total: number;
}

export interface SimPhaseResult {
  si: Instrument[];         // starting instruments for next phase
  rows: SimPhaseRow[];
  iE: number;               // debt ending balance
  gE: number;               // equity ending balance
  end: number;              // total ending balance
  evDep: boolean;           // equity depleted?
  fdYr: number;             // year equity first depleted
  fdAge: number;            // age equity first depleted
  bothDep: boolean;         // both equity AND debt gone?
  bdYr: number;
  bdAge: number;
  totUnf: number;           // total unfunded amount
  debtIntPerYr: number;
  eqRate: number;
  stoppedAtYr: number;
  totalYears: number;
}

export interface Kid {
  id: string;
  name: string;
  age: number;
  eduInfl: number;
  inclUG: boolean;
  ugStartAge: number;
  ugAnnCost: number;
  ugDur: number;
  inclPG: boolean;
  pgStartAge: number;
  pgAnnCost: number;
  pgDur: number;
  inclMar: boolean;
  marAge: number;
  marBudget: number;
}

export type KidGoalType = 'ug' | 'pg' | 'mar';

export interface KidGoalResult {
  yearsUntil: number;
  futureCorpus: number;
  monthlySIP: number;
  currentCost: number;
  kidName: string;
  type: string;
  icon: string;
  kid: Kid;
}

export interface ComputeResult {
  existGrown: number;
  sipC: number;
  totalCorpus: number;
  moAtRet: number;
  yrAtRet: number;
  annAtRet: number;
  reqCorpus: number;
  mult: number;
  gap: number;
  onTrack: boolean;
  pct: number;
  neededFlat: number;
  years: number;
  dur: number;
}

export interface ComputeTab2Result {
  eG: number;
  sC: number;
  totalCorpus: number;
  moAtRet: number;
  reqCorpus: number;
  mult: number;
  gap: number;
  onTrack: boolean;
  pct: number;
  neededFlat: number;
  years: number;
  dur: number;
}

/** The full planner state — mirrors S in the original. */
export interface PlannerState {
  step: number;

  // Step 1 — Profile
  name: string;
  age: number;
  retAge: number;
  lifeE: number;

  // Step 2 — Financial Picture
  invMode: InvMode;
  invQuick: number;
  invMF: number;
  invEQ: number;
  invPF: number;
  invDT: number;
  invGR: number;
  salaryMonthly: number;
  salaryGrowth: number;
  addIncMode: AddIncMode;
  addIncQuick: number;
  addIncRental: number;
  addIncOther: number;

  // Step 3 — Expenses
  expMode: ExpMode;
  expQMo: number;
  expQYr: number;
  expRent: number;
  expEMI: number;
  expGroc: number;
  expTrav: number;
  expUtil: number;
  expEnt: number;
  expHlth: number;
  expHH: number;
  expOMo: number;
  expHol: number;
  expIns: number;
  expGad: number;
  expClo: number;
  expCins: number;
  expDon: number;
  expRep: number;
  expOYr: number;

  // Step 4 — Investment Planning
  sipAmt: number;
  sipMode: SIPMode;
  sipFixed: number;
  sipReturn: number;
  inflation: number;

  // Step 6 — Deploy & Phases
  dep: Instrument[];
  phases: Phase[];
  phDep: Record<number, Instrument[]>;
  phView: string;
  phExpMode: Record<number, ExpMode>;
  phOpen: Record<number, boolean>;
  phInflAdj: Record<number, boolean>;

  // Tab switching
  tab: number;
  discDismissed: boolean;

  // Tab 2 — Kids Goals
  kids: Kid[];
  retSipAmt: number;
  retSipMode: SIPMode;
  retSipFixed: number;

  _id: number;
  _kidId: number;
}

// ── Formatters ───────────────────────────────────────────────────────────────

/** Format ₹ number with Indian short suffixes: Cr / L / K */
export const fmt = (n: number): string => {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 10000000) return s + '\u20b9' + (a / 10000000).toFixed(2) + 'Cr';
  if (a >= 100000)   return s + '\u20b9' + (a / 100000).toFixed(2) + 'L';
  if (a >= 1000)     return s + '\u20b9' + (a / 1000).toFixed(1) + 'K';
  return s + '\u20b9' + Math.round(a).toLocaleString('en-IN');
};

/** Short format without ₹ symbol */
export const fS = (n: number): string => {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 10000000) return s + (a / 10000000).toFixed(2) + ' Cr';
  if (a >= 100000)   return s + (a / 100000).toFixed(2) + ' L';
  return s + Math.round(a / 1000) + 'K';
};

/** Format percentage to 1 decimal place */
export const fmtPct = (n: number): string => n.toFixed(1) + '%';

/** Format stored number back to a short input-friendly string (e.g. "2.5L", "50K") */
export function fmtInput(n: number): string {
  if (!n || n === 0) return '';
  if (n >= 10000000) return (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + 'Cr';
  if (n >= 100000)   return (n / 100000).toFixed(2).replace(/\.?0+$/, '')   + 'L';
  if (n >= 1000)     return (n / 1000).toFixed(1).replace(/\.?0+$/, '')     + 'K';
  return String(n);
}

// ── Smart Amount Parser ───────────────────────────────────────────────────────

/**
 * Accepts "2L", "56k", "1.5Cr", "1,50,000", "rupees 500" etc.
 * Returns the numeric value in ₹.
 */
export function parseAmt(val: string | number | null | undefined): number {
  if (val === '' || val === null || val === undefined) return 0;
  const s = String(val).trim().toLowerCase()
    .replace(/,/g, '')
    .replace(/rupees?/g, '')
    .replace(/\s+/g, '')
    .replace(/lakhs?/g, 'l')
    .replace(/lacs?/g, 'l')
    .replace(/crores?/g, 'cr')
    .replace(/thousands?/g, 'k');
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  if (s.endsWith('cr')) return Math.round(n * 10000000);
  if (s.endsWith('l'))  return Math.round(n * 100000);
  if (s.endsWith('k'))  return Math.round(n * 1000);
  return Math.round(n);
}

// ── Core Math Engines (pure — no state dependency) ───────────────────────────

/**
 * SIP corpus — month by month (most accurate, handles growing SIP).
 * @param growthMode 'salary' | 'fixed' | 'flat'
 * @param growthParam salary growth % OR fixed annual increase ₹
 */
export function calcSIPCorpus(
  monthlySIP: number,
  years: number,
  annReturnPct: number,
  growthMode: string,
  growthParam: number
): number {
  if (years <= 0 || monthlySIP <= 0) return 0;
  const monthRate = annReturnPct / 100 / 12;
  let corpus = 0;
  let curSIP = monthlySIP;

  for (let m = 0; m < years * 12; m++) {
    // Add SIP at start of month, then compound
    corpus = (corpus + curSIP) * (1 + monthRate);

    // Increase SIP at each full year boundary
    if ((m + 1) % 12 === 0) {
      const yr = (m + 1) / 12;
      if (yr < years) {
        if (growthMode === 'salary') {
          curSIP = monthlySIP * Math.pow(1 + growthParam / 100, yr);
        } else if (growthMode === 'fixed') {
          // growthParam = fixed annual increase ₹
          curSIP = monthlySIP + (growthParam / 12) * yr;
        }
      }
    }
  }
  return corpus;
}

/**
 * Needed monthly SIP for a target (flat SIP, reverse calculation).
 */
export function neededSIP(target: number, years: number, annReturnPct: number): number {
  if (years <= 0 || target <= 0) return 0;
  const r = annReturnPct / 100 / 12;
  const n = years * 12;
  if (r === 0) return target / n;
  return target / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

/**
 * Phase simulation — THE CORRECT ENGINE.
 * Debt: principal CONSTANT, interest covers expenses.
 * Equity: (start ± net) × (1 + rate) each year.
 */
export function simPhase(ph: Phase, instr: Instrument[]): SimPhaseResult {
  const py = ph.to - ph.from;
  const inf = ph.infl / 100;
  const mS = Object.values(ph.mo).reduce((s, v) => s + (isNaN(+v) ? 0 : +v), 0);
  const yS = Object.values(ph.yr).reduce((s, v) => s + (isNaN(+v) ? 0 : +v), 0);

  const inc = instr.filter(i => i.t === 'i');
  const grw = instr.filter(i => i.t === 'g');

  const totalDebt    = inc.reduce((s, i) => s + i.a, 0);
  const debtIntPerYr = inc.reduce((s, i) => s + i.a * (i.r / 100), 0); // CONSTANT

  let equityBal = grw.reduce((s, i) => s + i.a, 0);
  const origEquity = equityBal;
  const eqRate = (grw.length && equityBal > 0)
    ? grw.reduce((s, i) => s + i.a * (i.r / 100), 0) / equityBal
    : 0.12;

  const rows: SimPhaseRow[] = [];
  let evDep = false, fdYr = -1, fdAge = -1, totUnf = 0;
  let bothDep = false, bdYr = -1, bdAge = -1;
  let stoppedAtYr = py;
  let debtRemaining = totalDebt;

  for (let y = 0; y < py; y++) {
    const inflF  = Math.pow(1 + inf, y);
    const annExp = (mS * 12 + yS) * inflF;
    const interest = debtIntPerYr; // always on original principal
    const net    = interest - annExp;
    const eqStart = equityBal;
    let unfunded = 0;

    if (net >= 0) {
      // Interest fully covers expenses — surplus goes to equity
      equityBal = (eqStart + net) * (1 + eqRate);
    } else {
      const deficit = Math.abs(net);
      if (eqStart >= deficit) {
        // Equity covers the deficit
        equityBal = (eqStart - deficit) * (1 + eqRate);
      } else {
        // Equity is insufficient — drain it
        const remainingDeficit = deficit - eqStart;
        equityBal = 0;
        if (!evDep) { evDep = true; fdYr = y + 1; fdAge = ph.from + y; }
        // Now try to use debt principal to cover remaining deficit
        if (debtRemaining >= remainingDeficit) {
          debtRemaining -= remainingDeficit;
        } else {
          // Debt also insufficient — truly depleted
          unfunded = remainingDeficit - debtRemaining;
          totUnf  += unfunded;
          debtRemaining = 0;
          if (!bothDep) { bothDep = true; bdYr = y + 1; bdAge = ph.from + y; }
          stoppedAtYr = y + 1;
          rows.push({ y: y + 1, age: ph.from + y, annExp, interest, net, debt: debtRemaining, eqStart, eqAfterNet: 0, eqEnd: 0, unfunded, total: 0 });
          break; // stop — both gone
        }
      }
    }
    const eqAfterNet = net >= 0 ? eqStart + net : Math.max(eqStart - Math.abs(net), 0);
    rows.push({ y: y + 1, age: ph.from + y, annExp, interest, net, debt: debtRemaining, eqStart, eqAfterNet, eqEnd: equityBal, unfunded, total: debtRemaining + equityBal });
  }

  const si: Instrument[] = [
    ...inc.map(i => ({ ...i, a: debtRemaining * (totalDebt > 0 ? i.a / totalDebt : 1 / Math.max(inc.length, 1)) })),
    ...grw.map(i => ({ ...i, a: origEquity > 0 ? equityBal * (i.a / origEquity) : equityBal / Math.max(grw.length, 1) })),
  ];

  return {
    si, rows,
    iE: debtRemaining, gE: equityBal,
    end: debtRemaining + equityBal,
    evDep, fdYr, fdAge,
    bothDep, bdYr, bdAge,
    totUnf, debtIntPerYr, eqRate, stoppedAtYr, totalYears: py,
  };
}

// ── State-Derived Helpers ─────────────────────────────────────────────────────

export function totInv(S: PlannerState): number {
  return S.invMode === 'quick' ? S.invQuick : S.invMF + S.invEQ + S.invPF + S.invDT;
}

export function totMoExp(S: PlannerState): number {
  if (S.expMode === 'quick') return S.expQMo;
  return S.expRent + S.expEMI + S.expGroc + S.expTrav + S.expUtil + S.expEnt + S.expHlth + S.expHH + S.expOMo;
}

export function totYrExp(S: PlannerState): number {
  if (S.expMode === 'quick') return S.expQYr;
  return S.expHol + S.expIns + S.expGad + S.expClo + S.expCins + S.expDon + S.expRep + S.expOYr;
}

export function addIncome(S: PlannerState): number {
  return S.addIncMode === 'quick' ? S.addIncQuick : S.addIncRental + S.addIncOther;
}

export function totMoIncome(S: PlannerState): number {
  return S.salaryMonthly + addIncome(S);
}

export function totAnnIncome(S: PlannerState): number {
  return totMoIncome(S) * 12;
}

export function totAnnExp(S: PlannerState): number {
  return totMoExp(S) * 12 + totYrExp(S);
}

export function moSurplus(S: PlannerState): number {
  return totMoIncome(S) - totMoExp(S) - totYrExp(S) / 12;
}

/** Years to retirement */
export function ytr(S: PlannerState): number {
  return Math.max(S.retAge - S.age, 0);
}

/** Retirement duration */
export function retDur(S: PlannerState): number {
  return Math.max(S.lifeE - S.retAge, 0);
}

// ── Main Corpus Computation ───────────────────────────────────────────────────

export function compute(S: PlannerState): ComputeResult {
  const years = ytr(S), dur = retDur(S);
  const invRaw = totInv(S), moRaw = totMoExp(S), yrRaw = totYrExp(S);

  // NaN guards — old persisted state may be missing fields added after first use
  const inv          = Number.isFinite(invRaw)        ? invRaw        : 0;
  const mo           = Number.isFinite(moRaw)         ? moRaw         : 0;
  const yr           = Number.isFinite(yrRaw)         ? yrRaw         : 0;
  const invGR        = Number.isFinite(S.invGR)       ? S.invGR       : 10;
  const sipAmt       = Number.isFinite(S.sipAmt)      ? S.sipAmt      : 0;
  const sipReturn    = Number.isFinite(S.sipReturn)   ? S.sipReturn   : 12;
  const inflation    = Number.isFinite(S.inflation)   ? S.inflation   : 6;
  const salaryGrowth = Number.isFinite(S.salaryGrowth)? S.salaryGrowth: 7;
  const sipFixed     = Number.isFinite(S.sipFixed)    ? S.sipFixed    : 0;

  // Existing investments grown
  const existGrown = inv * Math.pow(1 + invGR / 100, years);

  // SIP corpus (month by month, handles growth mode)
  const sipC = calcSIPCorpus(
    sipAmt, years, sipReturn,
    S.sipMode === 'salary' ? 'salary' : S.sipMode === 'fixed' ? 'fixed' : 'flat',
    S.sipMode === 'salary' ? salaryGrowth : sipFixed
  );

  const totalCorpus = existGrown + sipC;

  // Monthly & annual expenses at retirement (inflation adjusted)
  const moAtRet = mo  * Math.pow(1 + inflation / 100, years);
  const yrAtRet = yr  * Math.pow(1 + inflation / 100, years);
  // ★ CORPUS SIZED ON MONTHLY EXPENSES ONLY (× 12)
  // Yearly one-time expenses vary with life stage — planned decade-by-decade in Step 6.
  const annForCorpus = moAtRet * 12;

  const mult = dur > 30 ? 35 : dur > 20 ? 30 : 25;
  const reqCorpus = annForCorpus * mult;

  const gap = reqCorpus - totalCorpus;
  const onTrack = gap <= 0;
  const pct = reqCorpus > 0 ? Math.min(totalCorpus / reqCorpus * 100, 100) : 0;

  // Needed SIP (flat, for guidance)
  const neededFlat = neededSIP(Math.max(reqCorpus - existGrown, 0), years, sipReturn);

  return {
    existGrown, sipC, totalCorpus, moAtRet, yrAtRet, annAtRet: annForCorpus,
    reqCorpus, mult, gap, onTrack, pct, neededFlat, years, dur,
  };
}

// ── Phase Builder ─────────────────────────────────────────────────────────────

/**
 * Build retirement phases from state.
 * Returns the phases array (caller should assign to S.phases).
 */
export function buildPhases(S: PlannerState): Phase[] {
  if (!S.retAge || !S.lifeE || S.retAge >= S.lifeE) return S.phases;
  const yrs = ytr(S), inf = S.inflation;
  const bands: [number, number][] = [];
  let a = S.retAge;
  while (a < S.lifeE) { const b = Math.min(a + 10, S.lifeE); bands.push([a, b]); a = b; }

  const moBase = totMoExp(S), yrBase = totYrExp(S);

  return bands.map(([from, to], i) => {
    const existing = S.phases.find(p => p.from === from && p.to === to && p.userEdited);
    if (existing) return existing;

    const iF = Math.pow(1 + inf / 100, yrs + i * 10);
    const g  = (k: keyof PlannerState, base: number, adj?: number) =>
      Math.round((S.expMode === 'quick' ? moBase * base : ((S[k] as number) || 0)) * iF * (adj || 1));
    const gy = (k: keyof PlannerState, base: number) =>
      Math.round((S.expMode === 'quick' ? yrBase * base : ((S[k] as number) || 0)) * iF);

    const mo: PhaseMonthlyExpenses = {
      rent:  g('expRent', 0.30),
      emi:   i > 0 ? 0 : g('expEMI', 0.15),
      groc:  g('expGroc', 0.20),
      trav:  i > 0 ? g('expTrav', 0.10, 0.4) : g('expTrav', 0.10),
      util:  g('expUtil', 0.05),
      ent:   g('expEnt',  0.05),
      hlth:  g('expHlth', 0.05, i > 0 ? 1 + i * 0.8 : 1),
      hh:    g('expHH',   0.05),
      other: g('expOMo',  0.05),
    };
    const yr: PhaseYearlyExpenses = {
      hol:  gy('expHol', 0.40), ins:  gy('expIns', 0.20),
      gad:  gy('expGad', 0.10), clo:  gy('expClo', 0.10),
      cins: gy('expCins', 0.10), don: gy('expDon', 0.05),
      rep:  gy('expRep', 0.05), oy:   gy('expOYr', 0),
    };
    return { from, to, mo, yr, infl: inf, userEdited: false };
  });
}

// ── Phase Inflation Adjustment ────────────────────────────────────────────────

/**
 * Apply Phase 1 expenses inflated forward to phIdx.
 * Returns the adjusted mo/yr objects (caller mutates S.phases[phIdx]).
 */
export function applyPhaseInflAdj(
  phIdx: number,
  phases: Phase[],
  inflation: number
): { mo: PhaseMonthlyExpenses; yr: PhaseYearlyExpenses } {
  const ph1 = phases[0];
  const inflExtra = Math.pow(1 + inflation / 100, phIdx * 10);
  const adjMo = {} as PhaseMonthlyExpenses;
  const adjYr = {} as PhaseYearlyExpenses;

  for (const k of Object.keys(ph1.mo) as (keyof PhaseMonthlyExpenses)[]) {
    let v = Math.round(ph1.mo[k] * inflExtra);
    if (phIdx > 0 && k === 'emi') v = 0;
    if (phIdx > 0 && k === 'trav') v = Math.round(ph1.mo['trav'] * inflExtra * 0.4);
    if (phIdx > 0 && k === 'hlth') v = Math.round(ph1.mo['hlth'] * inflExtra * (1 + phIdx * 0.8));
    adjMo[k] = v;
  }
  for (const k of Object.keys(ph1.yr) as (keyof PhaseYearlyExpenses)[]) {
    adjYr[k] = Math.round(ph1.yr[k] * inflExtra);
  }
  return { mo: adjMo, yr: adjYr };
}

// ── Allocation Helper ─────────────────────────────────────────────────────────

/** Returns unallocated corpus (positive = under-allocated, negative = over) */
export function unallocatedCorpus(S: PlannerState): number {
  const r = compute(S);
  const depTotal = S.dep.reduce((s, d) => s + d.a, 0);
  return r.totalCorpus - depTotal;
}

// ── Kids Goals ────────────────────────────────────────────────────────────────

export function kidGoalCalc(
  kid: Kid,
  type: KidGoalType,
  inflation: number,
  sipReturn: number
): Omit<KidGoalResult, 'kidName' | 'type' | 'icon' | 'kid'> {
  let kidEventAge: number, currentCost: number, infl: number;

  if (type === 'ug') {
    kidEventAge = kid.ugStartAge || 18;
    currentCost = (isNaN(+kid.ugAnnCost) ? 0 : +kid.ugAnnCost) * (kid.ugDur || 4);
    infl = kid.eduInfl || 8;
  } else if (type === 'pg') {
    kidEventAge = kid.pgStartAge || 22;
    currentCost = (isNaN(+kid.pgAnnCost) ? 0 : +kid.pgAnnCost) * (kid.pgDur || 2);
    infl = kid.eduInfl || 8;
  } else {
    // marriage
    kidEventAge = kid.marAge || 28;
    currentCost = isNaN(+kid.marBudget) ? 0 : +kid.marBudget;
    infl = inflation;
  }

  const yearsUntil = Math.max(kidEventAge - (kid.age || 0), 1);
  const futureCorpus = currentCost * Math.pow(1 + infl / 100, yearsUntil);
  const monthlySIP = neededSIP(futureCorpus, yearsUntil, sipReturn);
  return { yearsUntil, futureCorpus, monthlySIP, currentCost };
}

export function calcAllKidGoals(S: PlannerState): KidGoalResult[] {
  const goals: KidGoalResult[] = [];
  S.kids.forEach(kid => {
    const nm = kid.name || 'Child';
    if (kid.inclUG && (kid.ugAnnCost || 0) > 0) {
      const g = kidGoalCalc(kid, 'ug', S.inflation, S.sipReturn);
      goals.push({ ...g, kidName: nm, type: 'UG Education', icon: '&#127979;', kid });
    }
    if (kid.inclPG && (kid.pgAnnCost || 0) > 0) {
      const g = kidGoalCalc(kid, 'pg', S.inflation, S.sipReturn);
      goals.push({ ...g, kidName: nm, type: 'PG Education', icon: '&#127891;', kid });
    }
    if (kid.inclMar && (kid.marBudget || 0) > 0) {
      const g = kidGoalCalc(kid, 'mar', S.inflation, S.sipReturn);
      goals.push({ ...g, kidName: nm, type: 'Marriage', icon: '&#128141;', kid });
    }
  });
  return goals;
}

export function totalKidsSIPNeeded(S: PlannerState): number {
  return calcAllKidGoals(S).reduce((s, g) => s + g.monthlySIP, 0);
}

// ── Tab 2 — Retirement Corpus (with separate retSipAmt) ───────────────────────

/**
 * Tab 2 variant of compute() — uses retSipAmt / retSipMode / retSipFixed
 * instead of sipAmt / sipMode / sipFixed.
 * Uses yearly compounding loop (matches original inline calculation in t5).
 */
export function computeTab2(S: PlannerState): ComputeTab2Result | null {
  const deficit = moSurplus(S) < 0;
  if (!S.retSipAmt || deficit) return null;

  const yrs = ytr(S), dur = retDur(S), inv = totInv(S), mo = totMoExp(S);
  const eG = inv * Math.pow(1 + S.invGR / 100, yrs);

  const sC = calcSIPCorpus(
    S.retSipAmt, yrs, S.sipReturn,
    S.retSipMode === 'salary' ? 'salary' : S.retSipMode === 'fixed' ? 'fixed' : 'flat',
    S.retSipMode === 'salary' ? (Number.isFinite(S.salaryGrowth) ? S.salaryGrowth : 7) : (Number.isFinite(S.retSipFixed) ? S.retSipFixed : 0),
  );

  const totC = eG + sC;
  const moR  = mo * Math.pow(1 + S.inflation / 100, yrs);
  const mult = dur > 30 ? 35 : dur > 20 ? 30 : 25;
  const reqC = moR * 12 * mult;
  const gap  = reqC - totC;
  const pct  = reqC > 0 ? Math.min(totC / reqC * 100, 100) : 0;
  const need = neededSIP(Math.max(reqC - eG, 0), yrs, S.sipReturn);

  return {
    eG, sC, totalCorpus: totC, moAtRet: moR,
    reqCorpus: reqC, mult, gap, onTrack: gap <= 0,
    pct, neededFlat: need, years: yrs, dur,
  };
}

// ── Step Validation ───────────────────────────────────────────────────────────

export function canNext(S: PlannerState): boolean {
  const mo = totMoIncome(S) - totMoExp(S) - totYrExp(S) / 12;
  if (S.step === 1) return S.age > 0 && S.retAge > S.age && S.lifeE > S.retAge;
  if (S.step === 2) return S.salaryMonthly > 0;
  if (S.step === 3) return totMoExp(S) > 0;
  if (S.tab === 1) {
    if (S.step === 4) return mo >= 0 && S.sipAmt > 0 && S.sipAmt <= mo * 1.05;
  } else {
    if (S.step === 4) return S.kids.length > 0;
    if (S.step === 5) return mo >= 0 && S.retSipAmt > 0;
  }
  return true;
}
