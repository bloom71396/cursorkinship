'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import Pill from '@/components/ui/Pill'

const LIFE_STAGE_SECTIONS = [
  {
    title: 'Relationships + social life',
    options: [
      'Single / Dating',
      'Dating again',
      'In a couple',
      'Married / Long-term partnered',
      'Newly engaged',
      'Pre-wedding',
      'Long-distance relationship',
      'Recently ended a relationship',
      'Separated / divorced',
      'Co-parenting',
      'Making new friends as an adult',
      'Rebuilding my social life',
      'Feeling socially anxious / out of practice',
    ],
  },
  {
    title: 'Home + living situation',
    options: [
      'Living alone',
      'Living alone for the first time',
      'Living with roommates',
      'Living with a partner',
      'Moving in with a partner',
      'Moving out / starting over',
      'Living with parents / moved back home',
      'Buying a home',
      'Renting a new place',
      'New apartment setup / nesting',
      'Split time between two places',
      'Caring for someone at home',
    ],
  },
  {
    title: 'City + movement',
    options: [
      'Moved to a new city',
      'Moved to a new neighborhood',
      'Trying to find my people here',
      'Commuter life',
      'Travel-heavy lifestyle',
      'Long distance from family',
      'Gap year',
    ],
  },
  {
    title: 'Work + ambition',
    options: [
      'Early career',
      'Career-focused',
      'Career pivot',
      'Interviewing / job hunting',
      'New job / new team',
      'Remote / hybrid worker',
      'Freelance / self-employed',
      'Building a company',
      'Startup life',
      'Side project era',
      'Burnout / high-stress season',
      'Night shift / non-9-to-5 schedule',
      'Returning to work after time off',
    ],
  },
  {
    title: 'School',
    options: [
      'College student',
      'Grad student',
      'Starting a new program',
      'Finishing school / entering workforce',
      'Balancing school + work',
    ],
  },
  {
    title: 'Family + caregiving',
    options: [
      'Trying to conceive / fertility journey',
      'Egg freezing / fertility planning',
      'Pregnant',
      'Postpartum',
      'New parent',
      'Single parent',
      'Co-parenting',
      'Parenting young kids',
      'Parenting teens',
      'Empty nester',
      'Supporting aging parents',
      'Caregiver for parent',
      'Caregiver for partner or child',
      'Big family transition',
    ],
  },
  {
    title: 'Personal season',
    options: [
      'Mental health focus',
      'Starting therapy / coaching',
      'Healing era',
      'Spiritual journey',
      'Identity exploration',
      'Grief / loss',
      'Sober / sober-curious',
      'Trying to build better habits',
      'Injury recovery',
      'Chronic health management',
      'Hormone / body changes',
      'Perimenopause / menopause',
      'Aesthetic goals',
      'Confidence reset',
      'Retirement / semi-retirement',
    ],
  },
]

function normalize(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

function uniq(list: string[]) {
  const seen = new Set<string>()
  return list.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [saving, setSaving] = useState(false)

  const nextPath = useMemo(() => getNextStep(pathname), [pathname])
  const allDefaults = useMemo(
    () => uniq(LIFE_STAGE_SECTIONS.flatMap((s) => s.options)),
    []
  )

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    )
  }

  function addCustom() {
    const value = normalize(customInput)
    if (!value) return

    if (
      !allDefaults.some((x) => x.toLowerCase() === value.toLowerCase()) &&
      !custom.some((x) => x.toLowerCase() === value.toLowerCase())
    ) {
      setCustom((prev) => [...prev, value])
    }

    setSelected((prev) =>
      prev.some((x) => x.toLowerCase() === value.toLowerCase())
        ? prev
        : [...prev, value]
    )

    setCustomInput('')
  }

  function removeCustom(label: string) {
    setCustom((prev) => prev.filter((x) => x !== label))
    setSelected((prev) => prev.filter((x) => x !== label))
  }

  const canContinue = selected.length > 0 && !saving
  const canAdd = normalize(customInput).length > 0

  async function onContinue() {
    if (!canContinue) return
    setSaving(true)

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: {
        life_stage_selected: selected,
        life_stage_custom: custom,
      },
    })

    if (res.ok) router.push(nextPath)
    else setSaving(false)
  }

  return (
    <Base44Shell
      step={getStepNumber(pathname)}
      totalSteps={getTotalSteps()}
      title="What best describes your life right now?"
      subtitle="People in the same life stage tend to get each other quickly."
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 26 }}>
        {LIFE_STAGE_SECTIONS.map((section) => (
          <div key={section.title}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#9B9086',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginTop: 34,
                marginBottom: 22,
              }}
            >
              {section.title}
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 10,
                justifyItems: 'center',
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

        {custom.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#6B625D',
                marginTop: 34,
                marginBottom: 22,
                textAlign: 'center',
              }}
            >
              Added by you
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 10,
                justifyItems: 'center',
              }}
            >
              {custom.map((label) => (
                <Pill
                  key={label}
                  label={label}
                  selected={selected.includes(label)}
                  onToggle={() => toggle(label)}
                  onRemove={() => removeCustom(label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add custom */}
        <div
          style={{
            marginTop: 34,
            paddingTop: 18,
            borderTop: '1px solid #EFEAE4',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canAdd) {
                  e.preventDefault()
                  addCustom()
                }
              }}
              placeholder="Don't see yourself? Type your own"
              style={{
                height: 48,
                flex: '1 1 0%',
                minWidth: 0,
                backgroundColor: '#FDFDFD',
                border: '1px solid #EBE7E0',
                borderRadius: 12,
                padding: '0 16px',
                fontSize: 16,
              }}
            />

<InviteStyleButton
  canSubmit={canAdd}
  onClick={addCustom}
  style={{
    width: 'auto',          // ← THIS is the missing piece
    height: 48,
    padding: '0 16px',      // keeps it small
    whiteSpace: 'nowrap',
    flexShrink: 0,
  }}
>
  Add
</InviteStyleButton>
          </div>

          <div style={{ marginTop: 20 }}>
            <InviteStyleButton canSubmit={canContinue} loading={saving} onClick={onContinue}>
              {saving ? 'Saving…' : 'Continue'}
            </InviteStyleButton>
          </div>
        </div>
      </div>
    </Base44Shell>
  )
}
