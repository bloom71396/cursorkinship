// app/onboarding/intent/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const INTENT_OPTIONS = [
  'Find trusted provider recommendations',
  'Ask for advice from people in similar life stages',
  'Share my go-to recommendations',
  'Discover local gems (food, wellness, services)',
  'Get help with a specific situation (move, breakup, new job, etc.)',
  'Meet people nearby who “get it”',
  'Build a circle I actually trust',
  'Just browsing for now',
]

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

const pillsWrap: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 8,
}

function pillStyle(isOn: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 999,
    border: isOn ? '1px solid #22262A' : '1px solid #C9C1B8',
    background: isOn ? '#22262A' : '#fff',
    color: isOn ? '#fff' : '#22262A',
    fontSize: 13,
    lineHeight: 1.1,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  }
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
}

function addBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    height: 44,
    padding: '0 14px',
    borderRadius: 12,
    border: '1px solid #C9C1B8',
    background: enabled ? '#3A3F45' : '#F1EDE8',
    color: enabled ? '#FFFFFF' : '#8F887F',
    fontSize: 14,
    cursor: enabled ? 'pointer' : 'default',
    transition: 'background 120ms ease, color 120ms ease',
    whiteSpace: 'nowrap',
  }
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
  const canAdd = custom.trim().length > 0

  function toggle(label: string) {
    const normalized = label.trim().replace(/\s+/g, ' ')
    if (!normalized) return
    setSelected((prev) =>
      prev.includes(normalized) ? prev.filter((x) => x !== normalized) : [...prev, normalized]
    )
  }

  function addCustom() {
    const normalized = custom.trim().replace(/\s+/g, ' ')
    if (!normalized) return
    if (!selected.includes(normalized)) setSelected((prev) => [...prev, normalized])
    setCustom('')
  }

  async function onContinue() {
    if (!canContinue) return

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: { intent: selected },
    })

    if (!res?.ok) return
    router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="What brings you to Kinship?"
      subtitle="Pick all that apply. You can always change this later."
    >
      <div style={CARD}>
        <div style={pillsWrap}>
          {INTENT_OPTIONS.map((label) => {
            const isOn = selected.includes(label)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggle(label)}
                style={pillStyle(isOn)}
              >
                {label}
              </button>
            )
          })}

          {selected
            .filter((x) => !INTENT_OPTIONS.includes(x))
            .map((label) => {
              const isOn = selected.includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggle(label)}
                  style={pillStyle(isOn)}
                >
                  {label}
                </button>
              )
            })}
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 600 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Add your own…"
                style={inputStyle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustom()
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!canAdd}
                style={addBtnStyle(canAdd)}
              >
                Add
              </button>
            </div>
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
      </div>
    </Base44Shell>
  )
}
