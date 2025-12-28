'use client'

import React from 'react'

type PillProps = {
  label: string
  selected: boolean
  onToggle: () => void
  onRemove?: () => void
  fullWidth?: boolean
  size?: 'sm' | 'md'
}

export default function Pill({
  label,
  selected,
  onToggle,
  onRemove,
  fullWidth = false,
  size = 'md',
}: PillProps) {
  const padY = size === 'sm' ? 8 : 10
  const padX = size === 'sm' ? 14 : 16
  const fontSize = size === 'sm' ? 15 : 16
  const minHeight = size === 'sm' ? 40 : 44

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: fullWidth ? '100%' : 'auto',
        minHeight: minHeight,
        padding: `${padY}px ${padX}px`,
        borderRadius: 9999,
        border: '2px solid #C9C1B8',
        backgroundColor: selected ? '#D9D2C9' : '#F9F8F6',
        color: '#2D2926',
        fontSize: fontSize,
        lineHeight: 1.1,
        cursor: 'pointer',
        userSelect: 'none',
        textAlign: 'center',
        whiteSpace: fullWidth ? 'normal' : 'nowrap',
        WebkitTapHighlightColor: 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxSizing: 'border-box',
      }}
    >
      <span>{label}</span>

      {onRemove ? (
        <span
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          role="button"
          aria-label={`Remove ${label}`}
          style={{
            width: 18,
            height: 18,
            borderRadius: 9999,
            backgroundColor: 'rgba(45, 41, 38, 0.12)',
            color: '#2D2926',
            fontSize: 14,
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flex: '0 0 auto',
          }}
        >
          ×
        </span>
      ) : null}
    </button>
  )
}
