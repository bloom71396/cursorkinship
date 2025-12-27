'use client'

import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  canSubmit?: boolean
  loading?: boolean
}

export default function InviteStyleButton({
  canSubmit = true,
  loading = false,
  children,
  ...props
}: Props) {
  const disabled = !canSubmit || loading
  const activeColor = disabled ? '#D9D2C9' : '#FDFDFD'
  const pressedColor = '#D9D2C9'

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      disabled={disabled}

      // 🔒 hard override browser :active / tap styles
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = pressedColor
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = activeColor
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = activeColor
        }
      }}

      style={{
        height: '48px',
        width: '100%',
        backgroundColor: activeColor,
        color: '#2D2926',
        borderRadius: '9999px',
        border: '1px solid #EBE7E0',
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: '400',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        opacity: loading ? 0.85 : 1,
        transition: 'background 120ms ease',
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  )
}
