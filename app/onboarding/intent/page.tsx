// app/onboarding/intent/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const INTENT_OPTIONS = [
  'Find provider recommendations I can actually trust',
  'I don’t trust online reviews or random internet advice',
  'I’ve had a bad experience and want to avoid repeating it',
  'Get advice from people who are genuinely like me',
  'Get advice from people who share my background or lived experience',
  'Hear recommendations that don’t require overexplaining my situation',
  'Connect with others in a similar life stage',
  'Find support around something personal or sensitive',
  'I’m tired of trial-and-error and guessing',
  'Get a second opinion that actually feels relevant',
  'Build a small, private community I trust',
  'Share experiences and recommendations that helped me',
  'Just browsing for now',
]

function normalize(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  const canContinue = selected.length > 0
  const addEnabled = normalize(custom).length > 0

  function toggle(label: string) {
    setSelected((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  function remove(label: string) {
    setSelected((prev) => prev.filter((x) => x !== label))
  }

  function addCustom() {
    const v = normalize(custom)
    if (!v) return

    const lower = v.toLowerCase()
    const exists = selected.some((x) => x.toLowerCase() === lower)

    if (!exists) setSelected((prev) => [...prev, v])
    setCustom('')
  }

  async function onContinue() {
    if (!canContinue) return

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: { intent: selected },
    })

    if (!res.ok) return
    router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="What brings you to Kinship?"
      subtitle="Pick all that apply."
    >
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          margin: '0 auto',
          padding: 24,
          borderRadius: 18,
          border: '1px solid transparent',
          background: 'transparent',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {[...INTENT_OPTIONS, ...selected.filter((x) => !INTENT_OPTIONS.includes(x))].map((label) => {
            const isOn = selected.includes(label)
            const isCustom = !INTENT_OPTIONS.includes(label)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggle(label)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: isOn ? '1px solid #EBE7E0' : '1px solid #FFFFFF',
                  background: isOn ? '#D9D2C9' : '#F9F8F6',
                  color: '#2D2926',
                  fontSize: 13,
                  lineHeight: 1.1,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span>{label}</span>
                {isCustom ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(label)
                    }}
                    role="button"
                    aria-label={`Remove ${label}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: 9999,
                      backgroundColor: 'rgba(45, 41, 38, 0.1)',
                      color: '#2D2926',
                      fontSize: 12,
                      lineHeight: 1,
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Add your own */}
        <div style={{ marginTop: 18, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (addEnabled) addCustom()
                }
              }}
              placeholder="Add your own…"
              style={{
                height: 44,
                width: '100%',
                borderRadius: 12,
                border: '1px solid #EBE7E0',
                padding: '0 14px',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                background: '#FDFDFD',
              }}
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!addEnabled}
              style={{
                height: 44,
                padding: '0 14px',
                borderRadius: 12,
                border: '1px solid #EBE7E0',
                background: addEnabled ? '#FDFDFD' : '#D9D2C9',
                color: '#2D2926',
                fontSize: 14,
                cursor: addEnabled ? 'pointer' : 'default',
                transition: 'background 120ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseDown={(e) => {
                if (addEnabled) {
                  e.currentTarget.style.backgroundColor = '#D9D2C9'
                }
              }}
              onMouseUp={(e) => {
                if (addEnabled) {
                  e.currentTarget.style.backgroundColor = '#FDFDFD'
                }
              }}
              onMouseLeave={(e) => {
                if (addEnabled) {
                  e.currentTarget.style.backgroundColor = '#FDFDFD'
                }
              }}
            >
              Add
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: '#6B6B6B' }}>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            style={{
              height: 48,
              width: '100%',
              maxWidth: 600,
              borderRadius: 999,
              background: canContinue ? '#FDFDFD' : '#D9D2C9',
              color: '#2D2926',
              border: '1px solid #EBE7E0',
              fontSize: 15,
              fontWeight: 500,
              cursor: canContinue ? 'pointer' : 'default',
              transition: 'background 120ms ease',
            }}
            onMouseDown={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = '#D9D2C9'
              }
            }}
            onMouseUp={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = '#FDFDFD'
              }
            }}
            onMouseLeave={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = '#FDFDFD'
              }
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </Base44Shell>
  )
}
