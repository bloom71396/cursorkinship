'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const AGE_RANGES = [
  '18–20',
  '21–23',
  '24–26',
  '27–29',
  '30–32',
  '33–35',
  '36–38',
  '39–41',
  '42–45',
  '46–48',
  '49–51',
  '52–54',
  '55–57',
  '58–60',
  '61–63',
  '64–66',
  '67–69',
  '70–72',
  '73–75',
  '76–78',
  '79–81+',
]

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)

  const [selected, setSelected] = useState<string | null>(null)
  const canContinue = !!selected

  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  async function onContinue() {
    if (!selected) return

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: { age_range: selected },
    })

    if (!res.ok) return
    router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="What’s your age range?"
      subtitle="So support feels relatable, not out of touch."
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
        {/* Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {AGE_RANGES.map((label) => {
            const isSelected = selected === label
            return (
              <button
                key={label}
                type="button"
                onClick={() => setSelected(label)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: isSelected ? '1px solid #EBE7E0' : '1px solid #FFFFFF',
                  background: isSelected ? '#D9D2C9' : '#F9F8F6',
                  color: '#2D2926',
                  fontSize: 13,
                  lineHeight: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Continue button – EXACT life-stage behavior */}
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
