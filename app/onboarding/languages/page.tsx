'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import Pill from '@/components/ui/Pill'
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

function dedupePreserveOrder(list: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const v = normalize(raw)
    const k = v.toLowerCase()
    if (!v) continue
    if (seen.has(k)) continue
    seen.add(k)
    out.push(v)
  }
  return out
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
      profile_data: { languages: dedupePreserveOrder(selected) },
    })

    if (res?.ok) router.push(nextPath)
  }

  const pills = dedupePreserveOrder([...LANGUAGES, ...selected.filter((x) => !LANGUAGES.includes(x))])

  return (
    <Base44Shell step={step} totalSteps={totalSteps} title="Languages" subtitle="So conversations feel natural, not translated.">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ marginBottom: 12, fontSize: 13, color: '#6B625D' }}>Select all that apply</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {pills.map((label) => {
            const isOn = selected.includes(label)
            const isCustom = !LANGUAGES.includes(label)

            return (
              <Pill
                key={label}
                label={label}
                selected={isOn}
                onToggle={() => toggle(label)}
                onRemove={isCustom ? () => remove(label) : undefined}
              />
            )
          })}
        </div>

        {/* Add your own */}
        <div style={{ marginTop: 18, maxWidth: 600, marginInline: 'auto', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                background: '#FDFDFD',
              }}
            />

            <InviteStyleButton
              canSubmit={addEnabled}
              onClick={addCustom}
              style={{ height: 44, width: 'auto', padding: '0 14px', borderRadius: 12, fontSize: 16, whiteSpace: 'nowrap' }}
            >
              Add
            </InviteStyleButton>
          </div>
        </div>

        {/* Continue */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 600 }}>
            <InviteStyleButton canSubmit={canContinue} onClick={onContinue}>
              Continue
            </InviteStyleButton>
          </div>
        </div>
      </div>
    </Base44Shell>
  )
}
