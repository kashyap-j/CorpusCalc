import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Visit counter ─────────────────────────────────────────────────────────────

/** Atomically increments the visit counter. Call once per /plan page load. */
export async function incrementVisitCounter(): Promise<void> {
  await supabase.rpc('increment_visit_counter');
}

/** Returns the current visit count, or null on error. */
export async function getVisitCount(): Promise<number | null> {
  const { data, error } = await supabase
    .from('visit_counter')
    .select('count')
    .eq('id', 1)
    .single();
  if (error || !data) return null;
  return data.count as number;
}

// ── User plans ────────────────────────────────────────────────────────────────

export interface SavedPlan {
  corpus_result: number;
  updated_at: string;
}

/**
 * Upserts the user's planner inputs and corpus result.
 * One row per user — subsequent calls overwrite the previous save.
 */
export async function saveUserPlan(
  userId: string,
  inputs: object,
  corpusResult: number
): Promise<void> {
  await supabase
    .from('user_plans')
    .upsert(
      { user_id: userId, inputs, corpus_result: corpusResult, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
}

/** Returns the user's saved plan metadata, or null if none exists. */
export async function fetchUserPlan(userId: string): Promise<SavedPlan | null> {
  const { data, error } = await supabase
    .from('user_plans')
    .select('corpus_result, updated_at')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data as SavedPlan;
}
