// lib/saveProgress.ts
import type { SupabaseClient } from "@supabase/supabase-js";

type SaveProgressArgs = {
  step: string; // e.g. "username"
  stepPath: string; // e.g. "/onboarding/username"
  data?: Record<string, any>;
  complete?: boolean;
};

export async function saveProgress(
  supabase: SupabaseClient,
  args: SaveProgressArgs
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) return { ok: false, error: userErr.message };

  const user = userRes?.user;
  if (!user) return { ok: false, error: "Not authenticated" };

  const payload: Record<string, any> = {
    user_id: user.id,
    onboarding_step: args.step,
    onboarding_step_path: args.stepPath,
    onboarding_complete: !!args.complete,
    updated_at: new Date().toISOString(),
  };

  // Store step payloads inside the existing jsonb "profile" column
  if (args.data && Object.keys(args.data).length > 0) {
    payload.profile = args.data;
  }

  const { error } = await supabase
    .from("user_profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
