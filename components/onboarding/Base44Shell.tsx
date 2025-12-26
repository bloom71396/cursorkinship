'use client'

import React from 'react'

type Props = {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function Base44Shell({ step, totalSteps, title, subtitle, children }: Props) {
  const pct = totalSteps > 0 ? Math.min(100, Math.max(0, Math.round((step / totalSteps) * 100))) : 0

  return (
    <div className="min-h-screen w-full bg-[#f7f6f4] flex flex-col items-center">
      <div className="w-full max-w-[960px] px-6 pt-10 pb-16">
        {/* Top progress bar */}
        <div className="w-full flex justify-center mb-10">
          <div className="w-full max-w-[720px]">
            <div className="h-[2px] w-full bg-black/10 rounded-full overflow-hidden">
              <div className="h-full bg-black/70" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="w-full flex flex-col items-center text-center">
          <div className="tracking-[0.35em] text-[12px] text-black/50 mb-6">KINSHIP</div>
          <h1 className="text-[44px] leading-[1.06] font-[400] text-[#1c1917]">{title}</h1>
          {subtitle ? (
            <p className="mt-6 text-[18px] leading-[1.4] text-[#57534e] max-w-[720px]">{subtitle}</p>
          ) : null}
        </div>

        {/* Body: centered container, but left-aligned content */}
        <div className="w-full flex justify-center mt-10">
          <div className="w-full max-w-[720px] text-left">{children}</div>
        </div>
      </div>
    </div>
  )
}
