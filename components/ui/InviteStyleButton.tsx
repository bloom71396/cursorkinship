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
  const activeColor = disabled ? '#B6B0AA' : '#22262A'

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      disabled={disabled}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = activeColor
        e.currentTarget.style.opacity = '0.92'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = activeColor
        e.currentTarget.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = activeColor
        e.currentTarget.style.opacity = '1'
      }}
      style={{
        height: '48px',
        width: '100%',
        backgroundColor: activeColor,
        color: 'white',
        borderRadius: '9999px',
        border: 'none',
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: '400',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        opacity: loading ? 0.85 : 1,
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  )
}
