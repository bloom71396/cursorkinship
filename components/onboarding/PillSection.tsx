'use client'

import React from 'react'
import Pill from '@/components/ui/Pill'

type Props = {
  title: string
  options: string[]
  selected: string[]
  onToggle: (label: string) => void

  /**
   * Controls how “chunky” the grid columns are.
   * Life Stage used ~190px. Keep that default for consistency.
   */
  minColWidth?: number

  /**
   * Optional top margin override (Life Stage used 34).
   */
  marginTop?: number
}

export default function PillSection({
  title,
  options,
  selected,
  onToggle,
  minColWidth = 190,
  marginTop = 34,
}: Props) {
  return (
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#9B9086',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginTop,
          marginBottom: 22,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 10,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`,
          gap: 10,
          justifyItems: 'center',
        }}
      >
        {options.map((label) => (
          <div key={label} style={{ width: '100%' }}>
            <Pill label={label} selected={selected.includes(label)} onToggle={() => onToggle(label)} fullWidth />
          </div>
        ))}
      </div>
    </div>
  )
}
