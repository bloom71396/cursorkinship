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

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      disabled={disabled}
      style={{
        height: '48px',
        width: '100%',
        backgroundColor: canSubmit ? '#0f172a' : '#A8A29E',
        color: 'white',
        borderRadius: '9999px',
        border: 'none',
        fontSize: '14px',
        cursor: canSubmit ? 'pointer' : 'not-allowed',
        fontWeight: '400',
        opacity: loading ? 0.85 : 1,
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  )
}
