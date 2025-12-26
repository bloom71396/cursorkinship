'use client'

import React from 'react'

type PillProps = {
  label: string
  selected?: boolean
  onToggle?: () => void
  onRemove?: () => void
}

export default function Pill({ label, selected = false, onToggle, onRemove }: PillProps) {
  const bg = selected ? '#22262A' : '#ffffff'
  const border = selected ? '#22262A' : '#E6DFD7'
  const text = selected ? '#ffffff' : '#22262A'

  const lockStyles = (el: HTMLButtonElement) => {
    el.style.backgroundColor = bg
    el.style.borderColor = border
    el.style.opacity = '0.94'
  }

  const resetStyles = (el: HTMLButtonElement) => {
    el.style.backgroundColor = bg
    el.style.borderColor = border
    el.style.opacity = '1'
  }

  return (
    <button
      type="button"
      onClick={onToggle}

      /* 🔒 Safari + mobile-safe press handling */
      onPointerDown={(e) => lockStyles(e.currentTarget)}
      onPointerUp={(e) => resetStyles(e.currentTarget)}
      onPointerLeave={(e) => resetStyles(e.currentTarget)}
      onTouchStart={(e) => lockStyles(e.currentTarget)}
      onTouchEnd={(e) => resetStyles(e.currentTarget)}

      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '9999px',
        border: `1px solid ${border}`,
        backgroundColor: bg,
        color: text,
        fontSize: '14px',
        lineHeight: 1,
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      <span>{label}</span>

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
