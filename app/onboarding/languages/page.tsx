'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'Mandarin',
  'Cantonese',
  'Hindi',
  'Arabic',
  'Portuguese',
  'Italian',
  'German',
  'Korean',
  'Japanese',
  'Hebrew',
  'Russian',
  'Ukrainian',
  'Polish',
  'Greek',
  'Turkish',
  'Persian (Farsi)',
  'Urdu',
  'Punjabi',
  'Bengali',
  'Tagalog',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Malay',
  'Swahili',
  'Amharic',
  'Yoruba',
  'Igbo',
  'Hausa',
]

function normalize(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const step = getStepNumber(pathname)
  const totalSteps = getTotalSteps()
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  const canContinue = selected.length > 0
  const addEnabled = normalize(custom).length > 0

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    )
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
      profile_data: { languages: selected },
    })

    if (res?.ok) router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Languages"
      subtitle="Select any languages you’re comfortable using."
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {[...LANGUAGES, ...selected.filter((x) => !LANGUAGES.includes(x))].map((label) => {
            const isOn = selected.includes(label)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggle(label)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: isOn ? '1px solid #22262A' : '1px solid #C9C1B8',
                  background: isOn ? '#22262A' : '#fff',
                  color: isOn ? '#fff' : '#22262A',
                  fontSize: 13,
                  lineHeight: 1.1,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Add your own */}
        <div
          style={{
            marginTop: 18,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
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
                border: '1px solid #C9C1B8',
                padding: '0 14px',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff',
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
                border: '1px solid #C9C1B8',
                background: addEnabled ? '#3A3F45' : '#F1EDE8',
                color: addEnabled ? '#fff' : '#6B6B6B',
                fontSize: 14,
                cursor: addEnabled ? 'pointer' : 'default',
                transition: 'background 120ms ease, color 120ms ease',
                whiteSpace: 'nowrap',
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
            disabled={!canContinue}
            onClick={onContinue}
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
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </Base44Shell>
  )
}
