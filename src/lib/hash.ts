import type { PlannerState } from './math';

/** SHA-256 of the full planner state JSON. Used as the idempotency key sent to the
 *  generate-plan-insight Edge Function — the function returns HTTP 429 if the same
 *  hash is seen within a 24-hour window. */
export async function computePlanHash(plannerState: PlannerState): Promise<string> {
  const msgBuffer = new TextEncoder().encode(JSON.stringify(plannerState));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
