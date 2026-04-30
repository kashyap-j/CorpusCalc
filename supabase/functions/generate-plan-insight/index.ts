const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001"; // Fast model — insights don't need Sonnet
const MAX_TOKENS = 600;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface PlanState {
  name: string;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyExpenses: number;
  annualExpenses: number;
  salaryIncome: number;
  existingCorpus: number;
  sipAmount: number;
  sipGrowthMode: "flat" | "salary" | "fixed";
  yearsToRetirement: number;
  corpusResult: number;
  requiredCorpus: number;
  gap: number;
}

interface ComputedResult {
  totalCorpus: number;
  reqCorpus: number;
  gap: number;
  pct: number;
  onTrack: boolean;
  years: number;
  dur: number;
  mult: number;
}

interface InsightOutput {
  summary: string;
  diagnostics: unknown[];
  suggestions: unknown[];
}

async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Maps Zustand PlannerState fields → PlanState for the AI prompt
function derivePlanState(raw: unknown, cr?: ComputedResult): PlanState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;

  // curAge is the Zustand field name — s.age / s.currentAge are fallbacks only
  const age = Number(s.curAge ?? s.age ?? s.currentAge ?? 30);
  const retAge = Number(s.retAge ?? s.retirementAge ?? 60);
  const lifeE = Number(s.lifeE ?? s.lifeExpectancy ?? 85);
  const yearsToRet = retAge - age;
  const salary = Number(s.salaryMonthly ?? s.salaryIncome ?? 0);
  const sipAmt = Number(s.sipAmt ?? s.sipAmount ?? 0);
  const sipReturn = Number(s.sipReturn ?? 12);
  const inflation = Number(s.inflation ?? 6);
  const invGR = Number(s.invGR ?? 10);

  const monthlyExp = s.expMode === "quick"
    ? Number(s.expQMo ?? s.monthlyExpenses ?? 0)
    : Number(s.monthlyExpenses ?? 0) || Number(s.expQMo ?? 0);
  const annualExp = s.expMode === "quick"
    ? Number(s.expQYr ?? s.annualExpenses ?? 0)
    : Number(s.annualExpenses ?? 0);

  const existing = s.existingCorpus !== undefined
    ? Number(s.existingCorpus)
    : s.invMode === "quick"
      ? Number(s.invQuick ?? 0)
      : Number(s.invMF ?? 0) + Number(s.invEQ ?? 0) + Number(s.invPF ?? 0) + Number(s.invDT ?? 0);

  // Prefer client-computed values (accurate) over edge-function estimates (simplified)
  let corpusResult: number;
  let requiredCorpus: number;

  if (cr && cr.totalCorpus > 0) {
    corpusResult = cr.totalCorpus;
    requiredCorpus = cr.reqCorpus;
  } else {
    const r = sipReturn / 100 / 12;
    const n = yearsToRet * 12;
    const existingGrown = existing * Math.pow(1 + invGR / 100, yearsToRet);
    const sipCorpus = r > 0 ? sipAmt * ((Math.pow(1 + r, n) - 1) / r) : sipAmt * n;
    corpusResult = Math.round(existingGrown + sipCorpus);
    const moAtRet = monthlyExp * Math.pow(1 + inflation / 100, yearsToRet);
    const retDur = lifeE - retAge;
    const mult = retDur <= 20 ? 25 : retDur <= 30 ? 30 : 35;
    requiredCorpus = Math.round(moAtRet * 12 * mult);
  }

  const sipMode = String(s.sipMode ?? s.sipGrowthMode ?? "flat") as "flat" | "salary" | "fixed";

  return {
    name: String(s.name ?? "User"),
    currentAge: age,
    retirementAge: retAge,
    lifeExpectancy: lifeE,
    monthlyExpenses: monthlyExp,
    annualExpenses: annualExp,
    salaryIncome: salary,
    existingCorpus: existing,
    sipAmount: sipAmt,
    sipGrowthMode: sipMode,
    yearsToRetirement: yearsToRet,
    corpusResult,
    requiredCorpus,
    gap: requiredCorpus - corpusResult,
  };
}

function buildUserMessage(p: PlanState): string {
  const gapLabel = p.gap > 0 ? "SHORTFALL" : "SURPLUS";
  return `Analyse this retirement plan:

Name: ${p.name}
Current age: ${p.currentAge} | Retirement age: ${p.retirementAge} | Life expectancy: ${p.lifeExpectancy}
Years to retirement: ${p.yearsToRetirement}

Monthly expenses today: ₹${p.monthlyExpenses} | Annual one-time expenses: ₹${p.annualExpenses}
Current salary/income: ₹${p.salaryIncome}/month
Existing investments: ₹${p.existingCorpus}
Monthly SIP: ₹${p.sipAmount} (${p.sipGrowthMode} growth)

Corpus projected at retirement: ₹${p.corpusResult}
Corpus required at retirement: ₹${p.requiredCorpus}
Gap: ₹${Math.abs(p.gap)} (${gapLabel})`;
}

const SYSTEM_PROMPT = `You are a retirement planning analyst for Indian personal finance. Respond with valid JSON only — no preamble, no markdown.

Context:
- Indian inflation: 5-7% (healthcare 8-10%)
- Corpus multiplier: 25x/30x/35x based on retirement duration
- SIP CAGR expectation: 10-12% in equity mutual funds

Rules:
- summary: 2 sentences max, 35 words max, use ₹ numbers, address the person by name.
- diagnostics: 3-5 items. Each detail must be max 15 words and include one specific number from the plan.
- EPF rule: If salaryIncome > 0 and existingCorpus seems low for age/salary, flag EPF blind spot by name.
- suggestions: 2-3 items. detail max 15 words. stateDiff must use valid PlannerState field names only.
- Tax rule: If sipAmount < 20% of salaryIncome, suggest NPS 80CCD(1B) ₹50k deduction, step-up SIP, or ELSS 80C.
- Never say "robust", "it's important to", or use corporate jargon.

Schema — use ONLY these field names, no others:
{
  "summary": "string",
  "diagnostics": [{ "type": "critical|warning|positive|info", "title": "max 8 words", "detail": "max 15 words with one number" }],
  "suggestions": [{ "title": "max 8 words", "detail": "max 15 words", "stateDiff": {} }]
}`;

async function callAnthropic(userMessage: string): Promise<InsightOutput> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content: string = data.content?.[0]?.text ?? "";
  const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(cleaned) as InsightOutput;
}

function jsonResp(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "POST") {
    return jsonResp({ error: "method_not_allowed" }, 405);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = await req.json() as Record<string, unknown>;
  } catch {
    return jsonResp({ error: "invalid_json" }, 400);
  }

  const rawPlan = parsed.plannerState ?? parsed.planState;
  const cr = parsed.computedResult as ComputedResult | undefined;
  const planState = derivePlanState(rawPlan, cr);
  if (!planState) {
    return jsonResp({ error: "missing_fields" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResp({ error: "server_misconfigured" }, 500);
  }

  const sbHeaders = {
    "Content-Type": "application/json",
    "apikey": supabaseServiceKey,
    "Authorization": `Bearer ${supabaseServiceKey}`,
  };

  const planHash = typeof parsed.plan_hash === "string"
    ? parsed.plan_hash
    : await generateHash(JSON.stringify(planState));

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const rateRes = await fetch(
    `${supabaseUrl}/rest/v1/plan_insights?plan_hash=eq.${encodeURIComponent(planHash)}&created_at=gt.${encodeURIComponent(since)}&limit=3`,
    { headers: sbHeaders }
  ).catch(() => null);

  if (rateRes?.ok) {
    const rows = await rateRes.json();
    if (Array.isArray(rows) && rows.length >= 3) {
      return jsonResp({ error: "rate_limited", retryAfter: "24h" }, 429);
    }
  }

  const userMessage = buildUserMessage(planState);
  let output: InsightOutput;

  try {
    output = await callAnthropic(userMessage);
  } catch (err) {
    console.error("Anthropic call failed:", err);
    return jsonResp({ error: "ai_unavailable" }, 500);
  }

  const userId = typeof parsed.userId === "string" ? parsed.userId : null;
  await fetch(`${supabaseUrl}/rest/v1/plan_insights`, {
    method: "POST",
    headers: { ...sbHeaders, "Prefer": "return=minimal" },
    body: JSON.stringify({ user_id: userId, plan_hash: planHash, input_summary: planState, output }),
  }).catch((e) => console.error("Insert failed:", e));

  return jsonResp(output);
});
