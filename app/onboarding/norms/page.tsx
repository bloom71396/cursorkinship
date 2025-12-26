'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

type Norm = {
  icon: string
  title: string
  description: string
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const norms: Norm[] = [
    {
      icon: '✓',
      title: 'Vetted people only',
      description:
        "Every member joins with an invite code, so you're surrounded by real people — not random internet strangers.",
    },
    {
      icon: '🎭',
  title: 'Anonymous by default',
      description:
        "Your identity is never disclosed. In Kinship, you're only known as your chosen alias, so you can share openly without being exposed.",
    },
    {
      icon: '🛡️',
      title: 'No hidden agendas',
      description:
        'Recommendations stay honest. Providers and brands must disclose roles or affiliations, and self-promotion is not allowed.',
    },
  ]

  async function onContinue() {
    if (saving) return
    setSaving(true)
    setError(null)

    const res = await saveProgress(supabase, {
      step: 'norms',
      stepPath: pathname,
      data: { norms_ack: true },
    })

    if (!res.ok) {
      setError(res.error)
      setSaving(false)
      return
    }

    router.push(getNextStep(pathname))
  }

  const canSubmit = !saving

  return (
    <Base44Shell
      step={getStepNumber(pathname)}
      totalSteps={getTotalSteps()}
      title="Why Kinship is Different"
      subtitle="What makes connections here trustworthy"
    >
      <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
        <div
          className="glass-card"
          style={{
            width: '100%',
            padding: '30px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr',
              columnGap: '14px',
              rowGap: '22px',
              alignItems: 'start',
              textAlign: 'left',
            }}
          >
            {norms.map((n) => (
              <React.Fragment key={n.title}>
                <div
                  aria-hidden="true"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '9999px',
                    background: 'rgba(34, 38, 42, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    lineHeight: 1,
                    marginTop: '2px',
                  }}
                >
                  {n.icon}
                </div>

                <div>
                  <div style={{ fontSize: '16px', color: '#1c1917', marginBottom: '6px' }}>
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#57534e',
                      lineHeight: 1.55,
                      maxWidth: '470px',
                    }}
                  >
                    {n.description}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {error ? (
            <p style={{ fontSize: '13px', color: '#b91c1c', marginTop: '16px', textAlign: 'center' }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onContinue}
            disabled={!canSubmit}
            style={{
              height: '48px',
              width: '100%',
              backgroundColor: canSubmit ? '#22262A' : '#B6B0AA',
              color: 'white',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '14px',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontWeight: '400',
              opacity: saving ? 0.85 : 1,
              marginTop: '22px',
            }}
          >
            {saving ? 'Saving…' : 'Enter Kinship'}
          </button>
        </div>
      </div>
    </Base44Shell>
  )
}
