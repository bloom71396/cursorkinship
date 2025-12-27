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
        border: `1px solid ${selected ? '#EBE7E0' : '#FFFFFF'}`,
        backgroundColor: selected ? '#D9D2C9' : '#F9F8F6',
        color: '#2D2926',
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
            backgroundColor: 'rgba(45, 41, 38, 0.1)',
            color: '#2D2926',
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
