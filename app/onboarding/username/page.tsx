'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import InviteStyleButton from '@/components/ui/InviteStyleButton'

const INPUT_STYLE: React.CSSProperties = {
  height: '48px',
  width: '100%',
  backgroundColor: 'white',
  border: '1px solid #e7e5e4',
  borderRadius: '12px',
  padding: '0 16px',
  fontSize: '14px',
  color: '#44403c',
  boxSizing: 'border-box',
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 0 &&
    !saving

  async function onContinue() {
    if (!canSubmit) return
    setSaving(true)
    setError(null)

    const res = await saveProgress(supabase, {
      step: 'username',
      stepPath: pathname,
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
      },
    })

    if (!res.ok) {
      setError(res.error)
      setSaving(false)
      return
    }

    router.push(getNextStep(pathname))
  }

  return (
    <Base44Shell
      step={getStepNumber(pathname)}
      totalSteps={getTotalSteps()}
      title="Your name"
      subtitle="This helps people recognize you."
    >
      <div style={{ width: '100%', maxWidth: '341px', marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          placeholder="First name"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value)
            if (error) setError(null)
          }}
          autoComplete="given-name"
          style={INPUT_STYLE}
        />

        <input
          placeholder="Last name"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value)
            if (error) setError(null)
          }}
          autoComplete="family-name"
          style={INPUT_STYLE}
        />

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            if (error) setError(null)
          }}
          autoComplete="username"
          style={INPUT_STYLE}
        />

        {error ? (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#b91c1c', marginTop: '4px' }}>
            {error}
          </p>
        ) : null}

        <InviteStyleButton canSubmit={canSubmit} loading={saving} onClick={onContinue}>
          {saving ? 'Saving…' : 'Continue'}
        </InviteStyleButton>
      </div>
    </Base44Shell>
  )
}
