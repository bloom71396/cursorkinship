'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import Pill from '@/components/ui/Pill'

const DEFAULT_OPTIONS = [
  // Relationship / living situation
  "Single city life",
  "Single / Dating",
  "In a couple",
  "Married / Long-term partnered",
  "Living with roommates",
  "Living alone",
  "Living with parents / moved back home",

  // Big milestones
  "Pre-wedding",
  "Aesthetic goals",
  "Recently moved to a new city",

  // School / work
  "College student",
  "Grad student",
  "Gap year",
  "Early career",
  "Career-focused",
  "Career pivot",
  "Going back to school",
  "Remote / hybrid worker",

  // Parenting & family
  "Pregnant",
  "Trying to conceive / fertility journey",
  "Postpartum",
  "New parent",
  "Single parent",
  "Parenting young kids",
  "Parenting teens",
  "Empty nester",

  // Caregiving / later life
  "Caregiver for parent",
  "Caregiver for partner or child",
  "Perimenopause / menopause",
  "Retirement / semi-retirement",
]

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(() => {
    // Show defaults + customs (customs appear selected + removable)
    const set = new Set<string>(DEFAULT_OPTIONS)
    custom.forEach((c) => set.add(c))
    return Array.from(set)
  }, [custom])

  function toggleOption(label: string) {
    setSelected((prev) => {
      const has = prev.includes(label)
      return has ? prev.filter((x) => x !== label) : [...prev, label]
    })
    if (error) setError(null)
  }

  function addCustom() {
    const v = customInput.trim()
    if (!v) return
    if (custom.includes(v) || DEFAULT_OPTIONS.includes(v)) {
      // Still select it if it already exists
      setSelected((prev) => (prev.includes(v) ? prev : [...prev, v]))
      setCustomInput('')
      return
    }
    setCustom((prev) => [...prev, v])
    setSelected((prev) => (prev.includes(v) ? prev : [...prev, v]))
    setCustomInput('')
    if (error) setError(null)
  }

  function removeCustom(label: string) {
    setCustom((prev) => prev.filter((x) => x !== label))
    setSelected((prev) => prev.filter((x) => x !== label))
  }

  const canSubmit = selected.length > 0 && !saving

  async function onContinue() {
    if (!canSubmit) return
    setSaving(true)
    setError(null)

    const next = getNextStep(pathname)

    const res = await saveProgress({
      onboarding_step_path: next,
      profile_data: {
        life_stage_selected: selected,
        life_stage_custom: custom,
      },
    })

    if (!res.ok) {
      setError(res.error)
      setSaving(false)
      return
    }

    router.push(next)
  }

  return (
    <Base44Shell
      step={getStepNumber(pathname)}
      totalSteps={getTotalSteps()}
      title="What best describes your life right now?"
      subtitle="People in the same life stage tend to get each other quickly."
    >
      <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ width: '100%', padding: '26px', boxSizing: 'border-box', background: 'transparent' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {options.map((label) => {
              const isSelected = selected.includes(label)
              const isCustom = custom.includes(label)
              return (
                <Pill
                  key={label}
                  label={label}
                  selected={isSelected}
                  onToggle={() => toggleOption(label)}
                  onRemove={isCustom ? () => removeCustom(label) : undefined}
                />
              )
            })}
          </div>

          <div style={{ marginTop: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917', marginBottom: '10px' }}>
              Don’t see yourself? Add your own.
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value)
                  if (error) setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustom()
                  }
                }}
                placeholder="Type and press Enter"
                style={{
                  height: '48px',
                  flex: '1 1 320px',
                  minWidth: '260px',
                  backgroundColor: '#FDFDFD',
                  border: '1px solid #EBE7E0',
                  borderRadius: '12px',
                  padding: '0 16px',
                  fontSize: '14px',
                  color: '#2D2926',
                  boxSizing: 'border-box',
                }}
              />

              <button
                type="button"
                onClick={addCustom}
                style={{
                  height: '48px',
                  padding: '0 18px',
                  backgroundColor: '#FDFDFD',
                  color: '#2D2926',
                  borderRadius: '12px',
                  border: '1px solid #EBE7E0',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 400,
                  transition: 'background 120ms ease',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = '#D9D2C9'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = '#FDFDFD'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FDFDFD'
                }}
              >
                Add
              </button>
            </div>

            {error ? (
              <p style={{ marginTop: '10px', fontSize: '13px', color: '#b91c1c' }}>{error}</p>
            ) : null}

            <div style={{ marginTop: '18px' }}>
              <InviteStyleButton canSubmit={canSubmit} loading={saving} onClick={onContinue}>
                {saving ? 'Saving…' : 'Continue'}
              </InviteStyleButton>
            </div>
          </div>
        </div>
      </div>
    </Base44Shell>
  )
}
