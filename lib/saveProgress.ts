// lib/saveProgress.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

export type SaveProgressPayload = {
  onboarding_step_path?: string
  profile_data?: Record<string, any>
  onboarding_complete?: boolean

  // Allow callers to pass extra keys (e.g. `step`) without TypeScript errors.
  // We will ignore anything we don't use.
  [key: string]: any
}

type SaveProgressResult =
  | { ok: true }
  | { ok: false; error: string; details?: any }

function isSupabaseClient(x: any): x is SupabaseClient {
  return !!x && typeof x === 'object' && typeof x.from === 'function'
}

// Overloads
export async function saveProgress(payload: SaveProgressPayload): Promise<SaveProgressResult>
export async function saveProgress(
  client: SupabaseClient,
  payload: SaveProgressPayload
): Promise<SaveProgressResult>

// Implementation
export async function saveProgress(
  arg1: SaveProgressPayload | SupabaseClient,
  arg2?: SaveProgressPayload
): Promise<SaveProgressResult> {
  const client = isSupabaseClient(arg1) ? arg1 : getSupabaseBrowserClient()
  const payload = (isSupabaseClient(arg1) ? arg2 : arg1) as SaveProgressPayload

  if (!payload) return { ok: false, error: 'Missing payload' }

  const { onboarding_step_path, profile_data = {}, onboarding_complete } = payload

  const { data: auth, error: authErr } = await client.auth.getUser()
  if (authErr) return { ok: false, error: authErr.message, details: authErr }
  const user = auth?.user
  if (!user) return { ok: false, error: 'No authenticated user' }

  // Merge profile_data
  const { data: existingRow, error: readErr } = await client
    .from('user_profiles')
    .select('profile_data')
    .eq('user_id', user.id)
    .maybeSingle()

  if (readErr) return { ok: false, error: readErr.message, details: readErr }

  const mergedProfileData = {
    ...(existingRow?.profile_data ?? {}),
    ...(profile_data ?? {}),
  }

  const upsertPayload: Record<string, any> = {
    user_id: user.id,
    profile_data: mergedProfileData,
  }

  if (typeof onboarding_step_path === 'string') {
    upsertPayload.onboarding_step_path = onboarding_step_path
  }
  if (typeof onboarding_complete === 'boolean') {
    upsertPayload.onboarding_complete = onboarding_complete
  }

  const { error: upsertErr } = await client
    .from('user_profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })

  if (upsertErr) return { ok: false, error: upsertErr.message, details: upsertErr }

  return { ok: true }
}
    