'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

const PROVIDER_ROLES = [
  'Therapist',
  'Physician',
  'Nurse Practitioner',
  'Registered Nurse',
  'Doula',
  'Coach',
  'Nutritionist',
  'Other',
]

const inputStyle: React.CSSProperties = {
  height: 44,
  width: '100%',
  borderRadius: 12,
  border: '1px solid #EBE7E0',
  padding: '0 14px',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#FDFDFD',
}

function choiceStyle(active: boolean, disabled?: boolean): React.CSSProperties {
  return {
    height: 48,
    width: '100%',
    borderRadius: 999,
    border: active ? '1px solid #EBE7E0' : '1px solid #FFFFFF',
    background: active ? '#D9D2C9' : '#F9F8F6',
    color: '#2D2926',
    fontSize: 15,
    fontWeight: 500,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.85 : 1,
    transition: 'background 120ms ease, color 120ms ease, border 120ms ease, opacity 120ms ease',
  }
}

type ProviderProfileData = {
  is_provider?: boolean
  provider_role?: string
  provider_locked?: boolean
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

  const [isProvider, setIsProvider] = useState<boolean | null>(null)
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')

  useEffect(() => {
    let cancelled = false

    async function hydrateFromDb() {
      setLoading(true)

      try {
        const supabase = getSupabaseBrowserClient()
        const { data: auth } = await supabase.auth.getUser()
        const user = auth?.user
        if (!user) {
          if (!cancelled) setLoading(false)
          return
        }

        const { data: row } = await supabase
          .from('user_profiles')
          .select('profile_data')
          .eq('user_id', user.id)
          .maybeSingle()

        const pd = (row?.profile_data ?? {}) as ProviderProfileData

        // Only lock after Continue (provider_locked === true)
        const isLocked = pd.provider_locked === true

        if (isLocked) {
          const dbIsProvider = pd.is_provider
          setIsProvider(typeof dbIsProvider === 'boolean' ? dbIsProvider : null)

          if (pd.provider_role) {
            if (PROVIDER_ROLES.includes(pd.provider_role)) {
              setRole(pd.provider_role)
              setCustomRole('')
            } else {
              setRole('Other')
              setCustomRole(pd.provider_role)
            }
          }

          setLocked(true)
        } else {
          setLocked(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    hydrateFromDb()
    return () => {
      cancelled = true
    }
  }, [])

  const canContinue =
    locked ||
    isProvider === false ||
    (isProvider === true && role && (role !== 'Other' || customRole.trim().length > 0))

  async function onContinue() {
    if (!canContinue) return

    // If already locked, do not resave. Just advance.
    if (locked) {
      router.push(nextPath)
      return
    }

    const payload =
      isProvider === true
        ? {
            is_provider: true,
            provider_role: role === 'Other' ? customRole.trim() : role,
            provider_locked: true,
          }
        : {
            is_provider: false,
            provider_locked: true,
          }

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: payload,
    })

    if (!res?.ok) return
    router.push(nextPath)
  }

  const showRoleFields = isProvider === true

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Are you a provider?"
      subtitle="This helps tailor discussions. Your real identity is always private."
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {loading ? (
          <div style={{ height: 140 }} />
        ) : (
          <>
            {/* If not answered yet */}
            {isProvider === null && !locked && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setIsProvider(true)} style={choiceStyle(false)}>
                  Yes
                </button>
                <button type="button" onClick={() => setIsProvider(false)} style={choiceStyle(false)}>
                  No
                </button>
              </div>
            )}

            {/* If answered (or locked state hydrated) */}
            {isProvider !== null && (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <button
                    type="button"
                    onClick={() => (!locked ? setIsProvider(true) : undefined)}
                    style={choiceStyle(isProvider === true, locked)}
                    disabled={locked}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => (!locked ? setIsProvider(false) : undefined)}
                    style={choiceStyle(isProvider === false, locked)}
                    disabled={locked}
                  >
                    No
                  </button>
                </div>

                {/* COPY shows ONLY after Continue (locked) */}
                {locked && (
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: 13,
                      color: '#6B6560',
                      marginBottom: 18,
                    }}
                  >
                    Providers are marked with a badge for trust and transparency.
                  </div>
                )}
              </>
            )}

            {showRoleFields && (
              <div style={{ marginTop: 8 }}>
                <select
                  value={role}
                  onChange={(e) => (!locked ? setRole(e.target.value) : undefined)}
                  style={{
                    ...inputStyle,
                    opacity: locked ? 0.9 : 1,
                    cursor: locked ? 'default' : 'pointer',
                  }}
                  disabled={locked}
                >
                  <option value="">Select your role</option>
                  {PROVIDER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {role === 'Other' && (
                  <div style={{ marginTop: 10 }}>
                    <input
                      value={customRole}
                      onChange={(e) => (!locked ? setCustomRole(e.target.value) : undefined)}
                      placeholder="Specify your role…"
                      style={{
                        ...inputStyle,
                        opacity: locked ? 0.9 : 1,
                        cursor: locked ? 'default' : 'text',
                      }}
                      disabled={locked}
                    />
                  </div>
                )}
              </div>
            )}

            {(isProvider !== null || locked) && (
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!canContinue}
                  style={{
                    height: 48,
                    width: '100%',
                    borderRadius: 999,
                    background: canContinue ? '#FDFDFD' : '#D9D2C9',
                    color: '#2D2926',
                    border: '1px solid #EBE7E0',
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: canContinue ? 'pointer' : 'default',
                    transition: 'background 120ms ease',
                  }}
                >
                  Continue
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Base44Shell>
  )
}
