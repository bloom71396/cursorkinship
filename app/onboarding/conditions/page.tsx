// app/onboarding/conditions/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const CONDITIONS = [
  // Mental / neurological
  'Anxiety',
  'Depression',
  'ADHD',
  'Bipolar disorder',
  'PTSD',
  'OCD',
  'Autism spectrum',
  'Eating disorder (past or present)',
  'Sleep disorder',
  'Migraines',

  // Hormonal / reproductive
  'PCOS',
  'Endometriosis',
  'Hormonal imbalance',
  'Thyroid condition',
  'Fertility challenges',
  'Perimenopause / menopause',
  'Irregular periods',

  // Metabolic / cardiovascular
  'Obesity',
  'Diabetes / prediabetes',
  'Insulin resistance',
  'High blood pressure',
  'High cholesterol',
  'Metabolic syndrome',

  // Gastro / autoimmune
  'IBS',
  'Crohn’s disease',
  'Ulcerative colitis',
  'Celiac disease',
  'Autoimmune condition',
  'Food intolerances',

  // Chronic / physical
  'Chronic pain',
  'Fibromyalgia',
  'Joint or mobility issues',
  'Back or spine issues',
  'Chronic fatigue',
  'Long COVID',

  // Sensory
  'Deaf / hard of hearing',
  'Visually impaired / low vision',

  // Other
  'Cancer (current or past)',
  'Heart condition',
  'Respiratory condition (asthma, etc.)',
  'Neurological condition',
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

    // prevent dupes vs existing options and selected (case-insensitive)
    const lower = v.toLowerCase()
    const existsInSelected = selected.some((x) => x.toLowerCase() === lower)
    const existsInDefaults = CONDITIONS.some((x) => x.toLowerCase() === lower)

    if (!existsInSelected) {
      // store the user-entered string (even if it matches a default) but avoid duplicates
      setSelected((prev) => [...prev, v])
    } else if (existsInDefaults && !selected.includes(CONDITIONS.find((x) => x.toLowerCase() === lower) || '')) {
      // no-op; kept for clarity
    }

    setCustom('')
  }

  async function onContinue() {
    if (!canContinue) return

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: { health_conditions: selected },
    })

    if (res?.ok) router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Health conditions"
      subtitle="Select any that apply. You can also add your own."
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {CONDITIONS.map((label) => {
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

          {/* render custom selections as pills too (same pattern as other pages) */}
          {selected
            .filter((x) => !CONDITIONS.includes(x))
            .map((label) => {
              const isOn = selected.includes(label)
              return (
                <button
                  key={`custom-${label}`}
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

        {/* Add your own (bottom, same as your other pages) */}
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
                background: addEnabled ? '#3A3F45' : '#F1EDE8', // lighter charcoal (not harsh black)
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

          <div style={{ marginTop: 8, fontSize: 12, color: '#6B6B6B', textAlign: 'left' }}>
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
