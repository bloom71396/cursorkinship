'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import Pill from '@/components/ui/Pill'

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
        {/* Pills (now uses shared <Pill /> so the outline matches life-stage) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
            justifyItems: 'center',
          }}
        >
          {AGE_RANGES.map((label) => (
            <Pill
              key={label}
              label={label}
              selected={selected === label}
              onToggle={() => setSelected(label)}
            />
          ))}
        </div>

        {/* Continue (uses shared button styling) */}
        <div style={{ marginTop: 24 }}>
          <InviteStyleButton canSubmit={canContinue} onClick={onContinue}>
            Continue
          </InviteStyleButton>
        </div>
      </div>
    </Base44Shell>
  )
}
