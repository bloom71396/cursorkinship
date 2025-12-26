'use client'

import React from 'react'

type PillProps = {
  label: string
  selected?: boolean
  onToggle?: () => void
  onRemove?: () => void // show X when provided
}

export default function Pill({ label, selected = false, onToggle, onRemove }: PillProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '9999px',
        border: '1px solid #e7e5e4',
        backgroundColor: selected ? '#0f172a' : '#ffffff',
        color: selected ? '#ffffff' : '#1c1917',
        fontSize: '14px',
        lineHeight: 1,
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'inline-block' }}>{label}</span>

      {onRemove ? (
        <span
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '9999px',
            backgroundColor: selected ? 'rgba(255,255,255,0.18)' : '#f5f5f4',
            color: selected ? '#ffffff' : '#44403c',
            fontSize: '12px',
            lineHeight: 1,
          }}
          aria-label="Remove"
          role="button"
        >
          ×
        </span>
      ) : null}
    </button>
  )
}
