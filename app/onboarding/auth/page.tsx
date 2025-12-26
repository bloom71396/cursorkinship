// app/onboarding/auth/page.tsx (FULL FILE REPLACEMENT)
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import Base44Shell from "@/components/onboarding/Base44Shell"
import { getNextStep, isValidOnboardingPath, ONBOARDING_STEPS } from "@/lib/onboarding"

const CARD = "rounded-3xl border border-stone-200 bg-white/80 p-6"

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
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
            style={
              mode === "signup"
                ? { borderColor: "#22262A", backgroundColor: "#22262A", color: "white" }
                : { borderColor: "#B6B0AA", backgroundColor: "white", color: "#22262A" }
            }
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
            style={
              mode === "login"
                ? { borderColor: "#22262A", backgroundColor: "#22262A", color: "white" }
                : { borderColor: "#B6B0AA", backgroundColor: "white", color: "#22262A" }
            }
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
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-300"
          />

          <button
            type="button"
            disabled={loading || !email || !password}
            onClick={onSubmit}
            className="w-full rounded-xl px-4 py-2 text-sm font-medium transition"
            style={{
              backgroundColor: loading || !email || !password ? "#B6B0AA" : "#22262A",
              color: loading || !email || !password ? "#A8A29E" : "white",
            }}
          >
            {loading ? "Working…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </div>
      </div>
    </Base44Shell>
  )
}
