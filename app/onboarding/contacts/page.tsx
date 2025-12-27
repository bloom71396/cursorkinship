'use client'

import React, { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const CARD: React.CSSProperties = {
  width: '100%',
  maxWidth: 760,
  margin: '0 auto',
  padding: 24,
  borderRadius: 18,
  border: '1px solid transparent',
  background: 'transparent',
  boxSizing: 'border-box',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 12,
  border: '1px solid #EBE7E0',
  padding: '12px 14px',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  resize: 'none',
  background: '#FDFDFD',
}

function primaryBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    height: 48,
    width: '100%',
    borderRadius: 999,
    background: enabled ? '#FDFDFD' : '#D9D2C9',
    color: '#2D2926',
    border: '1px solid #EBE7E0',
    fontSize: 15,
    fontWeight: 500,
    cursor: enabled ? 'pointer' : 'default',
    transition: 'background 120ms ease',
  }
}

function secondaryLinkStyle(enabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: enabled ? '#6B6B6B' : '#9B958E',
    fontSize: 13,
    cursor: enabled ? 'pointer' : 'default',
    padding: 10,
  }
}

function softBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    height: 48,
    width: '100%',
    borderRadius: 999,
    background: '#FDFDFD',
    color: '#2D2926',
    border: '1px solid #EBE7E0',
    fontSize: 15,
    fontWeight: 500,
    cursor: enabled ? 'pointer' : 'default',
    transition: 'background 120ms ease',
  }
}

function parsePhones(text: string): string[] {
  const raw = text
    .split(/[\n,;]+/g)
    .map((s) => s.trim())
    .filter(Boolean)

  const normalized = raw
    .map((s) => s.replace(/[^\d+]/g, ''))
    .filter((s) => s.replace(/[^\d]/g, '').length >= 7)

  return Array.from(new Set(normalized)).slice(0, 200)
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [phoneText, setPhoneText] = useState('')

  async function saveHashedContacts(phones: string[], source: 'picker' | 'manual') {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const hashes = await Promise.all(phones.map((p) => sha256Hex(`kinship:${p}`)))

      const res = await saveProgress({
        onboarding_step_path: pathname,
        profile_data: {
          contacts_source: source,
          contacts_count: phones.length,
          contacts_hashed: hashes,
        },
      })

      if (!res?.ok) {
        setLoading(false)
        setError('Failed to save. Please try again.')
        return
      }

      setSuccess("Got it — we'll use this to prioritize voices from people you have mutual connections with.")
      setLoading(false)

      setTimeout(() => {
        router.push(nextPath)
      }, 800)
    } catch {
      setLoading(false)
      setError('Failed to save. Please try again.')
    }
  }

  async function onSyncFromContacts() {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const navAny = navigator as any
      if (!('contacts' in navigator) || !navAny.contacts?.select) {
        setLoading(false)
        setShowManual(true)
        setError("Your browser doesn't support one-tap contact sync. You can still add numbers manually.")
        return
      }

      const contacts = await navAny.contacts.select(['tel', 'name'], { multiple: true })
      const allPhones: string[] = []

      for (const c of contacts || []) {
        if (c?.tel?.length) allPhones.push(...c.tel)
      }

      const parsed = parsePhones(allPhones.join('\n'))
      if (parsed.length === 0) {
        setLoading(false)
        setShowManual(true)
        setError('No phone numbers found in selected contacts.')
        return
      }

      await saveHashedContacts(parsed, 'picker')
    } catch {
      setLoading(false)
      setShowManual(true)
      setError('Permission denied or unsupported. You can add numbers manually instead.')
    }
  }

  async function onSaveManual() {
    const parsed = parsePhones(phoneText)
    if (parsed.length === 0) {
      setError('Please enter at least one phone number.')
      return
    }
    await saveHashedContacts(parsed, 'manual')
  }

  async function onSkip() {
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: { contacts_skipped: true },
    })

    setLoading(false)
    if (!res?.ok) return
    router.push(nextPath)
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Social Proximity"
      subtitle="Sync your contacts so we can prioritize posts from people you’re mutually connected to. No names, ever."
    >
<div style={{ maxWidth: 760, margin: '0 auto' }}>
{error && (
          <div style={{ width: '100%', maxWidth: 600, margin: '0 auto 10px', color: '#C24141', fontSize: 13 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ width: '100%', maxWidth: 600, margin: '0 auto 10px', color: '#1F7A3A', fontSize: 13 }}>
            {success}
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
          {!showManual && (
            <>
              <button
                type="button"
                onClick={onSyncFromContacts}
                disabled={loading}
                style={primaryBtnStyle(!loading)}
                onMouseDown={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#D9D2C9'
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#FDFDFD'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#FDFDFD'
                  }
                }}
              >
                {loading ? 'Syncing…' : 'Sync from contacts'}
              </button>

              <button
                type="button"
                onClick={() => setShowManual(true)}
                disabled={loading}
                style={secondaryLinkStyle(!loading)}
              >
                Or enter a few numbers manually
              </button>
            </>
          )}

          {showManual && (
            <>
              <textarea
                value={phoneText}
                onChange={(e) => setPhoneText(e.target.value)}
                placeholder="Enter phone numbers (one per line)"
                rows={5}
                style={inputStyle}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#6B6B6B' }}>
                Numbers are hashed for privacy.
              </div>

              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={onSaveManual}
                  disabled={loading || !phoneText.trim()}
                  style={primaryBtnStyle(!loading && !!phoneText.trim())}
                  onMouseDown={(e) => {
                    if (!loading && phoneText.trim()) {
                      e.currentTarget.style.backgroundColor = '#D9D2C9'
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!loading && phoneText.trim()) {
                      e.currentTarget.style.backgroundColor = '#FDFDFD'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && phoneText.trim()) {
                      e.currentTarget.style.backgroundColor = '#FDFDFD'
                    }
                  }}
                >
                  {loading ? 'Saving…' : 'Save contacts'}
                </button>
              </div>
            </>
          )}

          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              style={softBtnStyle(!loading)}
              onMouseDown={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#D9D2C9'
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#FDFDFD'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#FDFDFD'
                }
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </Base44Shell>
  )
}
