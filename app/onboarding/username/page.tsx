'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

/* ---------- WORD BANKS ---------- */

const DESCRIPTORS = [
  'Quiet','Bold','Gentle','Curious','Honest','Calm','Sharp','Warm','Soft','Clever','Patient','Brave','Witty','Serene',
  'Grounded','Playful','Direct','Thoughtful','Steady','Chill','Bright','Sincere','Nimble','Radiant','Classic','Modern',
  'Lowkey','Open','Fearless','True','Rare','Easy','Clean','Subtle','Focused','Wild','Tender','Loyal','Kind','Crisp',
  'Electric','Golden','Silver','Midnight','Morning','Dusk','Dawn','AfterHours','Offline','Analog',
]

const ROLES = [
  'Listener','Builder','Explorer','Observer','Creator','Caretaker','Navigator','Strategist','Connector','Researcher',
  'Dreamer','Doer','Planner','Tinkerer','Runner','Reader','Host','Guide','Maker','Editor',
]

const CONCEPTS = [
  'Balance','Focus','Motion','Signal','Context','Perspective','Momentum','Intent','Pattern','Presence','Instinct','Thread',
  'Calm','Clarity','Energy','Ritual','Routine','Depth','Edge','Flow','Rhythm','Taste','Sense','Timing','Craft',
  'Meaning','Grace','Spark','North','Orbit','Proof','Practice','Wonder',
]

const OBJECTS = [
  'Notebook','Studio','Corner','Desk','Window','Archive','Atlas','Compass','Draft','Index','Margin','Playlist','Inbox',
  'Calendar','Map','Camera','Library','Journal','Skylight','Blueprint','Toolkit','Café','Bookshop','Bench','Loft','Garden',
  'Workshop','Signal','Router','Portal','Ledger','Shelf','Canvas',
]

const PLACES = [
  'Uptown','Downtown','Midtown','Brooklyn','Queens','SoHo','NoHo','EastSide','WestSide','Harlem','Tribeca',
]

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function maybeSuffix() {
  if (Math.random() > 0.3) return ''
  return ` ${randInt(100, 9999)}`
}
function generateAlias(): string {
  const pattern = randInt(0, 6)
  let base = ''
  switch (pattern) {
    case 0: base = `${pick(DESCRIPTORS)} ${pick(OBJECTS)}`; break
    case 1: base = `${pick(DESCRIPTORS)} ${pick(ROLES)}`; break
    case 2: base = `${pick(ROLES)} of ${pick(CONCEPTS)}`; break
    case 3: base = `${pick(CONCEPTS)} ${pick(OBJECTS)}`; break
    case 4: base = `${pick(DESCRIPTORS)} ${pick(CONCEPTS)}`; break
    case 5: base = `${pick(PLACES)} ${pick(OBJECTS)}`; break
    default: base = `${pick(DESCRIPTORS)} ${pick(OBJECTS)} ${pick(OBJECTS)}`
  }
  return `${base}${maybeSuffix()}`.replace(/\s+/g, ' ').trim()
}

/* ---------- STYLES ---------- */

const CARD: React.CSSProperties = {
  width: '100%',
  maxWidth: 760,
  margin: '0 auto',
  padding: 24,
  borderRadius: 18,
}

const inputStyle: React.CSSProperties = {
  height: 44,
  width: '100%',
  borderRadius: 12,
  border: '1px solid #EBE7E0',
  padding: '0 14px',
  fontSize: 16,
  outline: 'none',
  background: '#FDFDFD',
}

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  color: '#4B4B4B',
  marginBottom: 6,
  fontWeight: 500,
}

const shuffleBtnStyle: React.CSSProperties = {
  height: 44,
  padding: '0 14px',
  borderRadius: 12,
  border: '1px solid #EBE7E0',
  background: '#FDFDFD',
  fontSize: 16,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

/* ---------- HELPERS ---------- */

async function isAliasTaken(alias: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('anonymous_username', alias)
    .limit(1)
  return !!data && data.length > 0
}

async function getAvailableAlias(maxTries = 8): Promise<string> {
  for (let i = 0; i < maxTries; i++) {
    const candidate = generateAlias()
    if (!(await isAliasTaken(candidate))) return candidate
  }
  return `${generateAlias()} ${randInt(1000, 9999)}`
}

/* ---------- PAGE ---------- */

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [alias, setAlias] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setAlias(await getAvailableAlias(6))
      setLoading(false)
    })()
  }, [])

  const canContinue =
    firstName.trim() &&
    lastName.trim() &&
    alias.trim() &&
    !loading

  async function onShuffle() {
    setError('')
    setLoading(true)
    setAlias(await getAvailableAlias(6))
    setLoading(false)
  }

  async function onContinue() {
    if (!canContinue) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    const trimmedAlias = alias.trim()
    if (await isAliasTaken(trimmedAlias)) {
      setLoading(false)
      setError('That alias is taken. Try shuffling or tweak it a bit.')
      return
    }

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        anonymous_username: trimmedAlias,
      },
    })

    setLoading(false)
    if (res?.ok) router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Your alias"
      subtitle="Your real name stays private. Others only see your alias."
    >
      <div style={CARD}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>First name *</div>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Last name *</div>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={labelStyle}>Alias *</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={alias} onChange={(e) => setAlias(e.target.value)} style={inputStyle} />
              <button type="button" onClick={onShuffle} style={shuffleBtnStyle} disabled={loading}>
                {loading ? '…' : 'Pick for me'}
              </button>
            </div>
          </div>

          {error && <div style={{ color: '#C24141', fontSize: 13, marginTop: 6 }}>{error}</div>}

          <div style={{ marginTop: 18 }}>
            <InviteStyleButton canSubmit={!!canContinue} onClick={onContinue}>
              Continue
            </InviteStyleButton>
          </div>
        </div>
      </div>
    </Base44Shell>
  )
}
