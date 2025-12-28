'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import Pill from '@/components/ui/Pill'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const INTENT_OPTIONS = [
  'Connect with people who are genuinely similar to me',
  'Get advice that’s local and actually relevant to where I live',
  'Talk to people in a similar life stage or situation',
  'Ask questions without explaining my entire backstory',
  'Get honest perspectives, not performative internet opinions',
  'Learn from people who’ve already been through this',
  'Sense-check a decision with people I trust',
  'Find recommendations that worked for people like me',
  'Have private conversations about something personal or sensitive',
  'Build an ongoing circle for advice and recommendations',
  'Share experiences that might help someone else',
  'Just browsing for now',
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
    if (!selected.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setSelected((prev) => [...prev, v])
    }
    setCustom('')
  }

  async function onContinue() {
    if (!canContinue) return
    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: { intent: selected },
    })
    if (res?.ok) router.push(nextPath)
  }

  const pills = dedupePreserveOrder([...INTENT_OPTIONS, ...selected.filter((x) => !INTENT_OPTIONS.includes(x))])

  return (
    <Base44Shell step={step} totalSteps={totalSteps} title="What brings you to Kinship?" subtitle="Pick all that apply.">
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, color: '#6B625D' }}>Select all that apply</div>

        {/* Compact grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 10,
            justifyItems: 'stretch',
            alignItems: 'stretch',
            maxWidth: 700,
            margin: '0 auto',
            width: '100%',
          }}
        >
          {pills.map((label) => {
            const active = selected.includes(label)
            const isCustom = !INTENT_OPTIONS.includes(label)

            return (
              <Pill
                key={label}
                label={label}
                selected={active}
                onToggle={() => toggle(label)}
                onRemove={isCustom ? () => remove(label) : undefined}
                fullWidth
              />
            )
          })}
        </div>

        {/* Add row */}
        <div style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && addEnabled) {
                  e.preventDefault()
                  addCustom()
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
                background: '#FDFDFD',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <InviteStyleButton
              canSubmit={addEnabled}
              onClick={addCustom}
              style={{
                height: 44,
                padding: '0 14px',
                borderRadius: 12,
                fontSize: 16,
                whiteSpace: 'nowrap',
                width: 'auto',
              }}
            >
              Add
            </InviteStyleButton>
          </div>
        </div>

        {/* Continue */}
        <div style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
          <InviteStyleButton canSubmit={canContinue} onClick={onContinue}>
            Continue
          </InviteStyleButton>
        </div>
      </div>
    </Base44Shell>
  )
}
