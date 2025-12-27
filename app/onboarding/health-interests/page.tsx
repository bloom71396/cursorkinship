"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import Base44Shell from "@/components/onboarding/Base44Shell"
import MultiSelectPills from "@/components/ui/MultiSelectPills"
import { getNextStep } from "@/lib/onboarding"

type ProfileData = {
  health_interests?: string[]
}

const TOTAL_STEPS = 3

const OPTIONS = [
  "ADHD",
  "Anxiety",
  "Autism / neurodivergent",
  "Depression",
  "OCD",
  "PTSD",
  "Panic attacks",
  "Social anxiety",
  "Bipolar",
  "Body image",
  "Disordered eating / binge eating",
  "Eating disorder",
  "Weight concerns",
  "Addiction / recovery",
  "Trauma",
  "Grief / loss",
  "Sleep issues / insomnia",
  "Chronic fatigue",
  "Chronic pain",
  "Migraines / headaches",
  "Hormonal health",
  "PCOS",
  "Endometriosis",
  "Fertility / trying to conceive",
  "Pregnancy",
  "Postpartum",
  "Menopause / perimenopause",
  "Gut health / digestion",
  "IBS / IBD",
  "Autoimmune conditions",
  "Thyroid health",
  "Diabetes / blood sugar",
  "Weight loss",
  "Nutrition",
  "Disordered eating recovery",
  "Fitness / exercise",
  "Strength training",
  "Cardio / endurance",
  "Yoga / pilates",
  "Injury recovery",
  "Physical therapy",
  "Longevity",
  "Supplements",
  "Functional medicine",
  "Holistic health",
  "Sexual health / libido",
  "Heart health / blood pressure",
  "Asthma",
  "Allergies",
  "Skin / acne",
  "Eczema / psoriasis",
  "Long COVID",
  "Cancer",
  "General wellness",
  "Stress / burnout",
  "Loneliness / connection",
  "Productivity / focus",
  "Biohacking",
  "Other",
]

const normalize = (s: string) => s.trim().replace(/\s+/g, " ")

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
  const nextParam: string | null = searchParams.get("next")

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
        .from("user_profiles")
        .select("profile_data")
        .eq("user_id", user.id)
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

  async function onContinue() {
    if (saving) return
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
      .from("user_profiles")
      .select("profile_data")
      .eq("user_id", user.id)
      .maybeSingle()

    if (readErr) {
      setSaving(false)
      setError(readErr.message)
      return
    }

    const existingData = (existingRow?.profile_data ?? {}) as Record<string, unknown>
    const newProfileData = { ...existingData, health_interests }

    const { error: upsertErr } = await supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        onboarding_step: "health-interests",
        profile_data: newProfileData,
      },
      { onConflict: "user_id" }
    )

    if (upsertErr) {
      setSaving(false)
      setError(upsertErr.message)
      return
    }

    const safeNext =
      nextParam && nextParam.startsWith("/onboarding/") ? nextParam : null

    router.push(safeNext ?? getNextStep(pathname))
  }

  return (
    <Base44Shell
      step={3}
      totalSteps={TOTAL_STEPS}
      title="What topics are you currently interested in?"
      subtitle="This shapes what you'll see."
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <MultiSelectPills
          options={OPTIONS}
          selected={selected}
          onChange={(next) => setSelected(dedupePreserveOrder(next))}
          helperText="Select all that apply."
          allowCustom={true}
          customTitle="Don't see yours? Add your own."
          customPlaceholder="Type and press Enter"
          addButtonText="Add"
        />

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            disabled={loading || saving || selected.length === 0}
            onClick={onContinue}
            style={{
              height: 48,
              width: "100%",
              maxWidth: 600,
              borderRadius: 999,
              background:
                loading || saving || selected.length === 0
                  ? "#D9D2C9"
                  : "#FDFDFD",
              color: "#2D2926",
              border: "1px solid #EBE7E0",
              fontSize: 15,
              fontWeight: 500,
              cursor:
                loading || saving || selected.length === 0
                  ? "not-allowed"
                  : "pointer",
              transition: "background 120ms ease",
            }}
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </Base44Shell>
  )
}
