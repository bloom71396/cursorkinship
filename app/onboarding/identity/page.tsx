'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import Pill from '@/components/ui/Pill'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

type Section = {
  key: string
  title: string
  options: string[]
}

const SECTIONS: Section[] = [
  {
    key: 'gender_identity',
    title: 'GENDER IDENTITY',
    options: ['Woman', 'Man', 'Non-binary', 'Transgender', 'Genderqueer', 'Gender non-conforming', 'Agender', 'Intersex'],
  },
  {
    key: 'sexual_orientation',
    title: 'SEXUAL ORIENTATION',
    options: ['Straight / heterosexual', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer'],
  },
  {
    key: 'race_ethnicity',
    title: 'RACE + ETHNICITY',
    options: [
      'Person of color',
      'Black / African diaspora',
      'Latina / Latino / Latine',
      'Asian',
      'South Asian',
      'Middle Eastern / North African',
      'Indigenous',
      'Multiracial',
    ],
  },
  {
    key: 'background',
    title: 'BACKGROUND',
    options: [
      'Immigrant / first-gen',
      'Child of immigrants',
      'First-generation college',
      'Faith-based upbringing',
      'Formerly religious',
      'Military family',
      'Rural background',
      'Caregiver background',
    ],
  },
]

const HEADER_COLOR = '#8A857F'

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [selected, setSelected] = useState<string[]>([])
  const canContinue = selected.length > 0

  function toggle(label: string) {
    setSelected((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  async function onContinue() {
    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: { identity: selected },
    })
    if (!res.ok) return
    router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="What feels true to who you are or what’s shaped you?"
      subtitle="Connect with people you won’t have to overexplain yourself to."
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          margin: '0 auto',
          padding: 24,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: 13, color: '#78716c', marginBottom: 14 }}>Select all that apply</div>

        {SECTIONS.map((section) => (
          <div key={section.key} style={{ marginBottom: 22 }}>
            <div
              style={{
                textAlign: 'center',
                fontSize: 13,
                letterSpacing: '0.08em',
                color: HEADER_COLOR,
                fontWeight: 700,
                marginBottom: 12, // gives breathing room under header
              }}
            >
              {section.title}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 10, // tighter + cleaner than looking “sprayed”
                rowGap: 10,
                maxWidth: 860,
                margin: '0 auto',
              }}
            >
              {section.options.map((label) => (
                <Pill
                  key={label}
                  label={label}
                  selected={selected.includes(label)}
                  onToggle={() => toggle(label)}
                />
              ))}
            </div>
          </div>
        ))}

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
