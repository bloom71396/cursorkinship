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
      title="Life stage"
      subtitle="Pick what best describes your life right now. Select all that apply."
    >
      <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
        <div className="glass-card" style={{ width: '100%', padding: '26px', boxSizing: 'border-box' }}>
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
                  backgroundColor: 'white',
                  border: '1px solid #B6B0AA',
                  borderRadius: '12px',
                  padding: '0 16px',
                  fontSize: '14px',
                  color: '#44403c',
                  boxSizing: 'border-box',
                }}
              />

              <button
                type="button"
                onClick={addCustom}
                style={{
                  height: '48px',
                  padding: '0 18px',
                  backgroundColor: '#22262A',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 400,
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
