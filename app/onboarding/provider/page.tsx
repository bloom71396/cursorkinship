// app/onboarding/provider/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const PROVIDER_ROLES = ['Therapist', 'Physician', 'Nurse Practitioner', 'Registered Nurse', 'Doula', 'Coach', 'Nutritionist', 'Other']

const CARD: React.CSSProperties = {
  width: '100%',
  maxWidth: 760,
  margin: '0 auto',
  padding: 24,
  borderRadius: 18,
  border: '1px solid #E6DFD7',
  background: '#fff',
  boxSizing: 'border-box',
}

const inputStyle: React.CSSProperties = {
  height: 44,
  width: '100%',
  borderRadius: 12,
  border: '1px solid #C9C1B8',
  padding: '0 14px',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}

function choiceStyle(active: boolean): React.CSSProperties {
  return {
    height: 48,
    width: '100%',
    borderRadius: 999,
    border: active ? '1px solid #22262A' : '1px solid #C9C1B8',
    background: active ? '#22262A' : '#fff',
    color: active ? '#fff' : '#22262A',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 120ms ease, color 120ms ease, border 120ms ease',
  }
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [isProvider, setIsProvider] = useState<boolean | null>(null)
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')

  const canContinue =
    isProvider === false || (isProvider === true && role && (role !== 'Other' || customRole.trim().length > 0))

  async function onContinue() {
    if (!canContinue) return

    const payload =
      isProvider === true
        ? { is_provider: true, provider_role: role === 'Other' ? customRole.trim() : role }
        : { is_provider: false }

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: payload,
    })

    if (!res?.ok) return
    router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Are you a provider?"
      subtitle="This helps tailor discussions. Your real identity is always private."
    >
<div style={{ maxWidth: 760, margin: '0 auto' }}>
<div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
          {isProvider === null && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setIsProvider(true)} style={choiceStyle(false)}>
                Yes
              </button>
              <button type="button" onClick={() => setIsProvider(false)} style={choiceStyle(false)}>
                No
              </button>
            </div>
          )}

          {isProvider !== null && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button type="button" onClick={() => setIsProvider(true)} style={choiceStyle(isProvider === true)}>
                Yes
              </button>
              <button type="button" onClick={() => setIsProvider(false)} style={choiceStyle(isProvider === false)}>
                No
              </button>
            </div>
          )}

          {isProvider === true && (
            <div style={{ marginTop: 8 }}>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
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
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Specify your role…"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}

          {isProvider !== null && (
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={onContinue}
                disabled={!canContinue}
                style={{
                  height: 48,
                  width: '100%',
                  borderRadius: 999,
                  background: canContinue ? '#22262A' : '#B6B0AA',
                  color: '#fff',
                  border: 'none',
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
        </div>
      </div>
    </Base44Shell>
  )
}
