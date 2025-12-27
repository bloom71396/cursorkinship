'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { assignTopKins } from '@/lib/kinMatching'

const CARD: React.CSSProperties = {
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
  padding: 24,
  borderRadius: 18,
  boxSizing: 'border-box',
}

const gridWrap: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 18,
  justifyContent: 'center',
}

const tile: React.CSSProperties = {
  position: 'relative',
  borderRadius: 18,
  overflow: 'hidden',
  border: '1px solid #EBE7E0',
  background: '#F9F8F6',
  aspectRatio: '1 / 1', // <-- square tiles
}

const bgImg: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transform: 'scale(1.02)',
}

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 45%, rgba(0,0,0,0.65) 100%)',
}

const content: React.CSSProperties = {
  position: 'absolute',
  left: 16,
  right: 16,
  bottom: 16,
  color: '#FFFFFF',
}

const title: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  lineHeight: '22px',
  letterSpacing: '-0.01em',
  marginBottom: 8,
  textShadow: '0 1px 10px rgba(0,0,0,0.35)',
}

const desc: React.CSSProperties = {
  fontSize: 13,
  lineHeight: '18px',
  opacity: 0.92,
  textShadow: '0 1px 10px rgba(0,0,0,0.35)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

function badgeStyle(kind: 'high' | 'medium' | 'low'): React.CSSProperties {
  const labelBg = kind === 'high' ? '#FFFFFF' : kind === 'medium' ? '#FFFFFF' : '#FFFFFF'
  const text = '#2D2926'
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 999,
    background: labelBg,
    color: text,
    border: '1px solid rgba(235,231,224,0.9)',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '14px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(6px)',
  }
}

const badgeWrap: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  right: 12,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  pointerEvents: 'none',
}

const lockPill: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.22)',
  border: '1px solid rgba(255,255,255,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF',
  fontSize: 14,
  backdropFilter: 'blur(6px)',
}

function btnStyle(disabled?: boolean): React.CSSProperties {
  return {
    height: 52,
    width: '100%',
    borderRadius: 999,
    background: disabled ? '#D9D2C9' : '#FDFDFD',
    color: '#2D2926',
    border: '1px solid #EBE7E0',
    fontSize: 15,
    fontWeight: 500,
    cursor: disabled ? 'default' : 'pointer',
  }
}

function hashToHue(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h % 360
}

function placeholderDataUri(seed: string) {
  const hue = hashToHue(seed)
  const bg1 = `hsl(${hue}, 30%, 86%)`
  const bg2 = `hsl(${(hue + 22) % 360}, 28%, 95%)`
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bg1}"/>
          <stop offset="1" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#g)"/>
      <circle cx="610" cy="210" r="95" fill="rgba(45,41,38,0.10)"/>
      <circle cx="260" cy="590" r="135" fill="rgba(45,41,38,0.08)"/>
      <rect x="120" y="120" width="220" height="16" rx="8" fill="rgba(45,41,38,0.10)"/>
      <rect x="120" y="160" width="300" height="16" rx="8" fill="rgba(45,41,38,0.08)"/>
    </svg>
  `.trim()
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function pickHeroThumb(thumbs: any, seed: string) {
  if (Array.isArray(thumbs) && thumbs.length) {
    const first = thumbs.find((t) => typeof t === 'string' && t.trim().length > 0)
    if (first) return first
  }
  if (typeof thumbs === 'string' && thumbs.trim()) return thumbs
  return placeholderDataUri(seed)
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  const [profileData, setProfileData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const assigned = useMemo(() => {
    if (!profileData) return []
    return assignTopKins(profileData, 9) // show “so much to explore”
  }, [profileData])

  const matchBadges = useMemo(() => {
    if (!assigned.length) return new Map<string, 'high' | 'medium' | 'low'>()
    const max = Math.max(...assigned.map((k: any) => k.score || 0))
    const map = new Map<string, 'high' | 'medium' | 'low'>()
    for (const k of assigned as any[]) {
      const ratio = max > 0 ? (k.score || 0) / max : 0
      map.set(k.key, ratio >= 0.88 ? 'high' : ratio >= 0.72 ? 'medium' : 'low')
    }
    return map
  }, [assigned])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)

      const { data: auth } = await supabase.auth.getUser()
      const user = auth?.user
      if (!user) {
        if (mounted) setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_data')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!mounted) return
      if (!error) setProfileData((data?.profile_data as any) || {})
      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [supabase])

  async function onContinue() {
    setSaving(true)
    // Keep your existing flow: just advance. (No extra “choose again” UX.)
    setSaving(false)
    router.push(nextPath)
  }

  const renderTile = (k: any) => {
    const kind = matchBadges.get(k.key) || 'medium'
    const seed = String(k.key || k.name || 'kin')
    const hero = pickHeroThumb(k.thumbs, seed)

    const badgeText = kind === 'high' ? 'High match' : kind === 'medium' ? 'Medium match' : 'Low match'

    return (
      <div key={k.key} style={tile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt="" style={bgImg} />
        <div style={overlay} />

        <div style={badgeWrap}>
          <span style={badgeStyle(kind)}>{badgeText}</span>
          <span style={lockPill}>🔒</span>
        </div>

        <div style={content}>
          <div style={title}>{k.name}</div>
          <div style={desc}>{k.subtitle || k.description || 'A vetted corner of Kinship built around shared context.'}</div>
        </div>
      </div>
    )
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Your Kins are taking shape"
      subtitle="These are your first corners of Kinship. Inside each one, we prioritize posts from people who share your life context."
    >
      <div style={CARD}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#6B6560', fontSize: 13 }}>Matching you…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={gridWrap}>{(assigned as any[]).map(renderTile)}</div>

            <button type="button" onClick={onContinue} disabled={saving} style={btnStyle(saving)}>
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </Base44Shell>
  )
}
