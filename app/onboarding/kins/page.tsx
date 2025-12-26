// app/onboarding/pick-kins/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

type Kin = {
  id: string
  name: string
  description?: string
  member_count?: number
  matchBucket?: 'High' | 'Medium'
  mutualTraits?: string[]
}

// Base44 zip behavior: two sections (For You = High, You May Also Like = Medium)
// You can later replace this list with a Supabase fetch once your `kins` table exists.
const DEFAULT_KINS: Kin[] = [
  {
    id: 'kin-nyc-wellness',
    name: 'NYC Wellness Finds',
    description: 'Studios, practitioners, treatments, and what’s actually worth it.',
    member_count: 0,
    matchBucket: 'High',
    mutualTraits: ['NYC', 'Wellness'],
  },
  {
    id: 'kin-career-reset',
    name: 'Career Reset & New Chapters',
    description: 'New job, breakup, move, identity shift. People who get it.',
    member_count: 0,
    matchBucket: 'High',
    mutualTraits: ['Life change', 'Support'],
  },
  {
    id: 'kin-therapy-talk',
    name: 'Therapy Talk',
    description: 'Finding the right therapist, modalities, and real experiences.',
    member_count: 0,
    matchBucket: 'High',
    mutualTraits: ['Mental health'],
  },
  {
    id: 'kin-food-local-gems',
    name: 'Local Gems: Food + Spots',
    description: 'Saved lists, hidden menus, and “go here, trust me.”',
    member_count: 0,
    matchBucket: 'Medium',
    mutualTraits: ['Local', 'Recommendations'],
  },
  {
    id: 'kin-fitness-accountability',
    name: 'Fitness Accountability',
    description: 'Low-pressure motivation, classes, routines, and wins.',
    member_count: 0,
    matchBucket: 'Medium',
    mutualTraits: ['Goals'],
  },
  {
    id: 'kin-health-navigators',
    name: 'Health Navigators',
    description: 'Doctors, specialists, and how to advocate for yourself.',
    member_count: 0,
    matchBucket: 'Medium',
    mutualTraits: ['Healthcare'],
  },
]

const CARD: React.CSSProperties = {
  width: '100%',
  maxWidth: 760,
  margin: '0 auto',
  padding: 24,
  borderRadius: 18,
  border: '1px solid #E6DFD7',
  background: '#fff',
  boxSizing: 'border-box',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: '#22262A',
  textAlign: 'left',
  margin: '0 0 10px',
}

function chipStyle(bg: string, border: string, color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    color,
    fontSize: 12,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  }
}

function kinCardStyle(selected: boolean): React.CSSProperties {
  return {
    width: '100%',
    textAlign: 'left',
    borderRadius: 16,
    border: selected ? '1px solid #BFA77A' : '1px solid #E6DFD7',
    background: selected ? '#FAF6EF' : '#fff',
    padding: 16,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'border 120ms ease, background 120ms ease',
  }
}

const muted: React.CSSProperties = {
  fontSize: 13,
  color: '#6B6B6B',
  lineHeight: 1.35,
}

const traitWrap: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 10,
}

function traitPill(label: string): React.CSSProperties {
  return {
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid #E6DFD7',
    background: '#FAF8F5',
    color: '#4B4B4B',
    fontSize: 12,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  }
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const { forYou, mayLike } = useMemo(() => {
    const forYou = DEFAULT_KINS.filter((k) => k.matchBucket === 'High')
    const mayLike = DEFAULT_KINS.filter((k) => k.matchBucket === 'Medium')
    return { forYou, mayLike }
  }, [])

  const canContinue = selectedIds.length > 0 && !saving

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function onContinue() {
    if (!canContinue) return
    setSaving(true)

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: {
        requested_kins: selectedIds,
        // optional: store count for quick use
        requested_kins_count: selectedIds.length,
      },
    })

    setSaving(false)
    if (!res?.ok) return

    router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Pick Your Kins"
      subtitle="These aren't generic public groups. They're filled with people we intentionally paired you with based on real similarities."
    >
      <div style={CARD}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {selectedIds.length > 0 && (
              <span style={chipStyle('#FAF6EF', '#E6DFD7', '#7A5A21')}>
                {selectedIds.length} selected
              </span>
            )}
            <span style={chipStyle('#FAF8F5', '#E6DFD7', '#4B4B4B')}>Request access to at least 1</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 18 }}>
          {forYou.length > 0 && (
            <section>
              <div style={sectionTitle}>For You</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {forYou.map((kin) => {
                  const isOn = selectedIds.includes(kin.id)
                  return (
                    <button
                      key={kin.id}
                      type="button"
                      onClick={() => toggle(kin.id)}
                      style={kinCardStyle(isOn)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 500, color: '#22262A' }}>{kin.name}</div>
                          {kin.description && <div style={{ ...muted, marginTop: 6 }}>{kin.description}</div>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <span style={chipStyle(isOn ? '#3A3F45' : '#F1EDE8', '#C9C1B8', isOn ? '#fff' : '#4B4B4B')}>
                            {isOn ? 'Requested' : 'Request'}
                          </span>
                          <span style={{ fontSize: 12, color: '#6B6B6B' }}>
                            {(kin.member_count ?? 0).toLocaleString()} members
                          </span>
                        </div>
                      </div>

                      {kin.mutualTraits && kin.mutualTraits.length > 0 && (
                        <div style={traitWrap}>
                          {kin.mutualTraits.slice(0, 3).map((t) => (
                            <span key={t} style={traitPill(t)}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {mayLike.length > 0 && (
            <section>
              <div style={sectionTitle}>You May Also Like</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mayLike.map((kin) => {
                  const isOn = selectedIds.includes(kin.id)
                  return (
                    <button
                      key={kin.id}
                      type="button"
                      onClick={() => toggle(kin.id)}
                      style={kinCardStyle(isOn)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 500, color: '#22262A' }}>{kin.name}</div>
                          {kin.description && <div style={{ ...muted, marginTop: 6 }}>{kin.description}</div>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <span style={chipStyle(isOn ? '#3A3F45' : '#F1EDE8', '#C9C1B8', isOn ? '#fff' : '#4B4B4B')}>
                            {isOn ? 'Requested' : 'Request'}
                          </span>
                          <span style={{ fontSize: 12, color: '#6B6B6B' }}>
                            {(kin.member_count ?? 0).toLocaleString()} members
                          </span>
                        </div>
                      </div>

                      {kin.mutualTraits && kin.mutualTraits.length > 0 && (
                        <div style={traitWrap}>
                          {kin.mutualTraits.slice(0, 3).map((t) => (
                            <span key={t} style={traitPill(t)}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
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
            {saving
              ? 'Requesting…'
              : `Request access${selectedIds.length > 0 ? ` to ${selectedIds.length} Kin${selectedIds.length > 1 ? 's' : ''}` : ''}`}
          </button>
        </div>

        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#6B6B6B' }}>
          You’ll get a notification when you’re approved. (This helps keep Kins high-quality.)
        </div>
      </div>
    </Base44Shell>
  )
}
