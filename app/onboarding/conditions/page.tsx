'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import Pill from '@/components/ui/Pill'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const CONDITION_SECTIONS = [
  {
    title: 'Mental health',
    options: [
      'Anxiety',
      'Depression',
      'ADHD',
      'Bipolar disorder',
      'PTSD',
      'OCD',
      'Autism spectrum',
      'Eating disorder (past or present)',
      'Sleep disorder',
    ],
  },
  {
    title: 'Hormonal + reproductive',
    options: [
      'PCOS',
      'Endometriosis',
      'Hormonal imbalance',
      'Thyroid condition',
      'Fertility challenges',
      'Irregular periods',
      'Perimenopause / menopause',
    ],
  },
  {
    title: 'Metabolic + cardiovascular',
    options: [
      'Obesity',
      'Diabetes / prediabetes',
      'Insulin resistance',
      'High blood pressure',
      'High cholesterol',
      'Metabolic syndrome',
    ],
  },
  {
    title: 'Digestive + autoimmune',
    options: [
      'IBS',
      'Crohn’s disease',
      'Ulcerative colitis',
      'Celiac disease',
      'Autoimmune condition',
      'Food intolerances',
    ],
  },
  {
    title: 'Chronic pain + mobility',
    options: [
      'Chronic pain',
      'Fibromyalgia',
      'Joint or mobility issues',
      'Back or spine issues',
      'Chronic fatigue',
      'Long COVID',
      'Migraines',
    ],
  },
  {
    title: 'Sensory + neurological',
    options: [
      'Deaf / hard of hearing',
      'Visually impaired / low vision',
      'Neurological condition',
    ],
  },
  {
    title: 'Serious or long-term conditions',
    options: [
      'Cancer (current or past)',
      'Heart condition',
      'Respiratory condition (asthma, etc.)',
    ],
  },
]

function normalize(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

function uniqPreserve(list: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const v = normalize(raw)
    const k = v.toLowerCase()
    if (!v || seen.has(k)) continue
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
  const [saving, setSaving] = useState(false)

  const canContinue = selected.length > 0 && !saving
  const canAdd = normalize(custom).length > 0

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    )
  }

  function remove(label: string) {
    setSelected((prev) => prev.filter((x) => x !== label))
  }

  function addCustom() {
    const v = normalize(custom)
    if (!v) return

    setSelected((prev) =>
      prev.some((x) => x.toLowerCase() === v.toLowerCase()) ? prev : [...prev, v]
    )
    setCustom('')
  }

  async function onContinue() {
    if (!canContinue) return
    setSaving(true)

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: {
        health_conditions: uniqPreserve(selected),
      },
    })

    if (res?.ok) router.push(nextPath)
    else setSaving(false)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Which of these apply to your life or health history?"
      subtitle="Used to connect you with people who have direct experience."
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 26 }}>
        <div style={{ marginBottom: 14, fontSize: 13, color: '#6B625D', textAlign: 'center' }}>
          Select all that apply
        </div>

        {CONDITION_SECTIONS.map((section) => (
          <div key={section.title}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#9B9086',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginTop: 32,
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

        {/* Custom condition */}
        <div
          style={{
            marginTop: 34,
            paddingTop: 18,
            borderTop: '1px solid #EFEAE4',
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canAdd) {
                  e.preventDefault()
                  addCustom()
                }
              }}
              placeholder="Add your own…"
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
                width: 'auto',
                height: 48,
                padding: '0 16px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Add
            </InviteStyleButton>
          </div>

          <div style={{ marginTop: 22 }}>
            <InviteStyleButton canSubmit={canContinue} loading={saving} onClick={onContinue}>
              {saving ? 'Saving…' : 'Continue'}
            </InviteStyleButton>
          </div>
        </div>
      </div>
    </Base44Shell>
  )
}
