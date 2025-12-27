// app/onboarding/auth/page.tsx (FULL FILE REPLACEMENT)
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import Base44Shell from "@/components/onboarding/Base44Shell"
import { getNextStep, isValidOnboardingPath, ONBOARDING_STEPS } from "@/lib/onboarding"

const CARD = "rounded-3xl border-transparent bg-transparent p-6"

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextParam: string = searchParams.get("next") ?? ""

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  )

  const [mode, setMode] = useState<"signup" | "login">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already authed, bounce to next onboarding step
  useEffect(() => {
    let cancelled = false

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return
      if (!user) return

      const decodedNext = (() => {
        try {
          return nextParam ? decodeURIComponent(nextParam) : ""
        } catch {
          return nextParam
        }
      })()

      const safeNext =
        decodedNext && isValidOnboardingPath(decodedNext) ? decodedNext : ONBOARDING_STEPS[0]

      router.replace(safeNext)
    }

    check()
    return () => {
      cancelled = true
    }
  }, [nextParam, router, supabase])

  async function onSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const decodedNext = (() => {
        try {
          return nextParam ? decodeURIComponent(nextParam) : ""
        } catch {
          return nextParam
        }
      })()

      const nextOnboarding =
        decodedNext && decodedNext.startsWith("/onboarding/") ? decodedNext : ONBOARDING_STEPS[0]

      const { error: authErr } =
        mode === "signup"
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password })

      if (authErr) {
        setError(authErr.message)
        setLoading(false)
        return
      }

      // Wait briefly for session to be available, then redirect
      for (let i = 0; i < 8; i++) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) break
        await new Promise((r) => setTimeout(r, 250))
      }

      // Route to next onboarding step (or first step)
      router.replace(isValidOnboardingPath(nextOnboarding) ? nextOnboarding : getNextStep())
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Base44Shell
      step={1}
      totalSteps={1}
      title="Welcome to Kinship"
      subtitle="Create an account to continue."
    >
      <div className={CARD}>
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              borderRadius: '12px',
              border: mode === "signup" ? '1px solid #EBE7E0' : '1px solid #FFFFFF',
              background: mode === "signup" ? '#D9D2C9' : '#F9F8F6',
              color: '#2D2926',
              padding: '8px 12px',
              fontSize: '14px',
            }}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              borderRadius: '12px',
              border: mode === "login" ? '1px solid #EBE7E0' : '1px solid #FFFFFF',
              background: mode === "login" ? '#D9D2C9' : '#F9F8F6',
              color: '#2D2926',
              padding: '8px 12px',
              fontSize: '14px',
            }}
          >
            Log in
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #EBE7E0',
              background: '#FDFDFD',
              padding: '8px 12px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #EBE7E0',
              background: '#FDFDFD',
              padding: '8px 12px',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          <button
            type="button"
            disabled={loading || !email || !password}
            onClick={onSubmit}
            style={{
              width: '100%',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 120ms ease',
              background: loading || !email || !password ? '#D9D2C9' : '#FDFDFD',
              color: '#2D2926',
              border: '1px solid #EBE7E0',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            }}
            onMouseDown={(e) => {
              if (!loading && email && password) {
                e.currentTarget.style.backgroundColor = '#D9D2C9'
              }
            }}
            onMouseUp={(e) => {
              if (!loading && email && password) {
                e.currentTarget.style.backgroundColor = '#FDFDFD'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email && password) {
                e.currentTarget.style.backgroundColor = '#FDFDFD'
              }
            }}
          >
            {loading ? "Working…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </div>
      </div>
    </Base44Shell>
  )
}
