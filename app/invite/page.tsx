'use client'

import React, { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => code.trim().length > 0 && !loading, [code, loading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const next = searchParams?.get('next') || '/onboarding/auth'

      const res = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), next }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || 'Invalid invite code.')
        setLoading(false)
        return
      }

      // Successful redeem should set invite_ok cookie server-side
      router.push(data?.redirect || next)
    } catch (err) {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">
      <div style={{ width: '100%', maxWidth: '341px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span className="logo-branding" style={{ marginBottom: '64px' }}>
          KINSHIP
        </span>

        <h1 style={{ fontSize: '36px', marginBottom: '12px', textAlign: 'center', lineHeight: '1.1' }}>
          Welcome to Kinship
        </h1>

        <p style={{ fontSize: '18px', color: '#57534e', marginBottom: '48px', textAlign: 'center' }}>
          Enter your invite code to join
        </p>

        <div
          className="glass-card"
          style={{ width: '100%', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              placeholder="Enter invite code (e.g. ABC12345)"
              className="focus:outline-none"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                if (error) setError(null)
              }}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              style={{
                height: '48px',
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid #E6DFD7',
                borderRadius: '12px',
                padding: '0 16px',
                fontSize: '14px',
                color: '#44403c',
                boxSizing: 'border-box',
              }}
            />

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                height: '48px',
                width: '100%',
                backgroundColor: canSubmit ? '#22262A' : '#B6B0AA',
                color: 'white',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '14px',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontWeight: '400',
                opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </form>

          {error ? (
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#b91c1c', marginTop: '4px' }}>
              {error}
            </p>
          ) : null}

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#78716c', marginTop: '8px' }}>
            Don't have a code? <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Join waitlist</span>
          </p>
        </div>

        <div style={{ marginTop: '100px', fontSize: '11px', color: '#B6B0AA', textAlign: 'center', maxWidth: '280px', lineHeight: '1.6' }}>
          By continuing, you agree to our <span style={{ textDecoration: 'underline' }}>Terms</span> &{' '}
          <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  )
}
