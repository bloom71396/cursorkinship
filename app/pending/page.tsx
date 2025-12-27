'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'

export default function Page() {
  const router = useRouter()
  const step = 1
  const totalSteps = 1

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="You’re on the list"
      subtitle="We’re building the right groups before opening the doors. You’ll get a notification when you’re in."
    >
      <div className="space-y-4">
        <div
          className="rounded-2xl p-5 text-sm text-stone-700"
          style={{
            background: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(255,255,255,0.85)',
          }}
        >
          While you wait, you can keep exploring.
        </div>

        <button
          type="button"
          onClick={() => router.replace('/home')}
          className="w-full rounded-full h-12 text-base font-normal"
          style={{ background: '#1c1917', color: '#ffffff' }}
        >
          Go to Home
        </button>
      </div>
    </Base44Shell>
  )
}
