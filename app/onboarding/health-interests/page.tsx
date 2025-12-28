'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Base44Shell from '@/components/onboarding/Base44Shell'
import InviteStyleButton from '@/components/ui/InviteStyleButton'
import { getNextStep } from '@/lib/onboarding'

type ProfileData = {
  health_interests?: string[]
}

const TOTAL_STEPS = 3

const OPTIONS = [
  'ADHD',
  'Anxiety',
  'Autism / neurodivergent',
  'Depression',
  'OCD',
  'PTSD',
  'Panic attacks',
  'Social anxiety',
  'Bipolar',
  'Body image',
  'Disordered eating / binge eating',
  'Eating disorder',
  'Weight concerns',
  'Addiction / recovery',
  'Trauma',
  'Grief / loss',
  'Sleep issues / insomnia',
  'Chronic fatigue',
  'Chronic pain',
  'Migraines / headaches',
  'Hormonal health',
  'PCOS',
  'Endometriosis',
  'Fertility / trying to conceive',
  'Pregnancy',
  'Postpartum',
  'Menopause / perimenopause',
  'Gut health / digestion',
  'IBS / IBD',
  'Autoimmune conditions',
  'Thyroid health',
  'Diabetes / blood sugar',
  'Weight loss',
  'Nutrition',
  'Disordered eating recovery',
  'Fitness / exercise',
  'Strength training',
  'Cardio / endurance',
  'Yoga / pilates',
  'Injury recovery',
  'Physical therapy',
  'Longevity',
  'Supplements',
  'Functional medicine',
  'Holistic health',
  'Sexual health / libido',
  'Heart health / blood pressure',
  'Asthma',
  'Allergies',
  'Skin / acne',
  'Eczema / psoriasis',
  'Long COVID',
  'Cancer',
  'General wellness',
  'Stress / burnout',
  'Loneliness / connection',
  'Productivity / focus',
  'Biohacking',
  'Other',
]

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ')

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
  const searchParams = useSearchParams()
  const nextParam: string | null = searchParams.get('next')

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (userErr || !user) {
        setLoading(false)
        router.replace(`/onboarding/auth?next=${encodeURIComponent(pathname)}`)
        return
      }

      const { data, error: dbErr } = await supabase
        .from('user_profiles')
        .select('profile_data')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cancelled) return

      if (dbErr) {
        setError(dbErr.message)
        setLoading(false)
        return
      }

      const pd = (data?.profile_data ?? {}) as ProfileData
      setSelected(dedupePreserveOrder(pd.health_interests ?? []))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [pathname, router, supabase])

  const canContinue = selected.length > 0 && !loading && !saving
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

    const lower = v.toLowerCase()
    const exists = selected.some((x) => x.toLowerCase() === lower)
    if (!exists) setSelected((prev) => [...prev, v])
    setCustom('')
  }

  async function onContinue() {
    if (!canContinue) return
    setSaving(true)
    setError(null)

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      setSaving(false)
      router.replace(`/onboarding/auth?next=${encodeURIComponent(pathname)}`)
      return
    }

    const health_interests = dedupePreserveOrder(selected)

    const { data: existingRow, error: readErr } = await supabase
      .from('user_profiles')
      .select('profile_data')
      .eq('user_id', user.id)
      .maybeSingle()

    if (readErr) {
      setSaving(false)
      setError(readErr.message)
      return
    }

    const existingData = (existingRow?.profile_data ?? {}) as Record<string, unknown>
    const newProfileData = { ...existingData, health_interests }

    const { error: upsertErr } = await supabase.from('user_profiles').upsert(
      {
        user_id: user.id,
        onboarding_step: 'health-interests',
        profile_data: newProfileData,
      },
      { onConflict: 'user_id' }
    )

    if (upsertErr) {
      setSaving(false)
      setError(upsertErr.message)
      return
    }

    const safeNext = nextParam && nextParam.startsWith('/onboarding/') ? nextParam : null
    router.push(safeNext ?? getNextStep(pathname))
  }

  const pills = dedupePreserveOrder([...OPTIONS, ...selected.filter((x) => !OPTIONS.includes(x))])

  return (
    <Base44Shell
      step={3}
      totalSteps={TOTAL_STEPS}
      title="What topics are you currently interested in?"
      subtitle="This shapes what you'll see."
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
        {error ? (
          <div
            style={{
              marginBottom: 16,
              borderRadius: 12,
              border: '1px solid #FCA5A5',
              background: '#FEF2F2',
              padding: '10px 12px',
              fontSize: 13,
              color: '#B91C1C',
              textAlign: 'left',
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ marginBottom: 12, fontSize: 13, color: '#6B625D' }}>Select all that apply</div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {pills.map((label) => {
            const active = selected.includes(label)
            const isCustom = !OPTIONS.includes(label)

            return (
              <button
                key={label}
                type="button"
                onClick={() => toggle(label)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 9999,
                  padding: '10px 16px',
                  fontSize: 16,
                  border: `1px solid ${active ? '#EBE7E0' : '#FFFFFF'}`,
                  background: active ? '#D9D2C9' : '#F9F8F6',
                  color: '#2D2926',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{label}</span>

                {isCustom ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(label)
                    }}
                    role="button"
                    aria-label={`Remove ${label}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: 9999,
                      backgroundColor: 'rgba(45, 41, 38, 0.1)',
                      color: '#2D2926',
                      fontSize: 14,
                      lineHeight: 1,
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Add your own */}
        <div style={{ marginTop: 18, maxWidth: 600, marginInline: 'auto', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Add your own…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (addEnabled) addCustom()
                }
              }}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                border: '1px solid #EBE7E0',
                padding: '0 14px',
                outline: 'none',
                background: '#FDFDFD',
                color: '#2D2926',
                fontSize: 16,
                boxSizing: 'border-box',
              }}
            />

            <InviteStyleButton
              canSubmit={addEnabled}
              onClick={addCustom}
              style={{
                height: 44,
                width: 'auto',
                padding: '0 14px',
                borderRadius: 12,
                fontSize: 16,
                whiteSpace: 'nowrap',
              }}
            >
              Add
            </InviteStyleButton>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 600 }}>
            <InviteStyleButton canSubmit={canContinue} loading={saving} onClick={onContinue}>
              {saving ? 'Saving…' : 'Continue'}
            </InviteStyleButton>
          </div>
        </div>
      </div>
    </Base44Shell>
  )
}