'use client'

import React from 'react'
import Base44Shell from '@/components/onboarding/Base44Shell'

export default function Page() {
  const step = 1
  const totalSteps = 1

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Home"
      subtitle="Placeholder. Next: show pending Kins, notifications, and the feed."
    >
      <div
        className="rounded-2xl p-5 text-sm text-stone-700"
        style={{
          background: 'rgba(255,255,255,0.65)',
          border: '1px solid rgba(255,255,255,0.85)',
        }}
      >
        Home is not built yet.
      </div>
    </Base44Shell>
  )
}
