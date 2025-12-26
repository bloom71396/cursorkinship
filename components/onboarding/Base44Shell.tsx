'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function Base44Shell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: Props) {
  const router = useRouter()

  const safeTotal = Math.max(1, totalSteps || 1)
  const safeStep = Math.min(Math.max(1, step || 1), safeTotal)
  const pct = Math.round((safeStep / safeTotal) * 100)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f4f2',
        padding: '24px 16px 48px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 840,
          margin: '0 auto',
        }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            marginBottom: 12,
            fontSize: 14,
            color: '#6B6F73',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        {/* Progress bar only */}
        <div
          style={{
            height: 8,
            width: '100%',
            borderRadius: 999,
            background: '#E6DFD7', // track
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: '#22262A', // fill
              borderRadius: 999,
              transition: 'width 200ms ease',
            }}
          />
        </div>

        {/* Centered header */}
        <div
          style={{
            textAlign: 'center',
            padding: '0 8px 20px',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.2,
              color: '#22262A',
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                marginTop: 8,
                fontSize: 15,
                color: '#6B6F73',
                lineHeight: 1.35,
                maxWidth: 520,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Page-specific content */}
        {children}
      </div>
    </div>
  )
}
