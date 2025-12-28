'use client'

import React, { useMemo, useState } from 'react'

type Props = {
  options: string[]
  selected: string[]
  onChange: (nextSelected: string[]) => void
  helperText?: string
  allowCustom?: boolean
  customTitle?: string
  customPlaceholder?: string
  addButtonText?: string
  pillMaxLabelWidth?: number
}

const COLOR_TEXT_PRIMARY = '#2D2926'
const COLOR_PILL_UNSELECTED_BG = '#F9F8F6'
const COLOR_PILL_UNSELECTED_BORDER = '#FFFFFF'
const COLOR_PILL_SELECTED_BG = '#D9D2C9'
const COLOR_PILL_SELECTED_BORDER = '#EBE7E0'
const COLOR_BUTTON_DEFAULT = '#FDFDFD'
const COLOR_BUTTON_ACTIVE = '#D9D2C9'
const COLOR_GREIGE = '#E6DFD7'

export default function MultiSelectPills({
  options,
  selected,
  onChange,
  helperText,
  allowCustom = false,
  customTitle = 'Add your own',
  customPlaceholder = 'Type and press Add',
  addButtonText = 'Add',
  pillMaxLabelWidth = 220,
}: Props) {
  const [customValue, setCustomValue] = useState('')

  const displayOptions = useMemo(() => {
    const custom = selected.filter((x) => !options.includes(x))
    // stable, no dupes
    return Array.from(new Set([...options, ...custom]))
  }, [options, selected])

  const isCustom = (label: string) => {
    return !options.includes(label)
  }

  function toggle(label: string) {
    if (selected.includes(label)) {
      onChange(selected.filter((x) => x !== label))
    } else {
      onChange([...selected, label])
    }
  }

  function remove(label: string) {
    onChange(selected.filter((x) => x !== label))
  }

  const trimmed = customValue.trim()
  const isAddDisabled = !trimmed || selected.includes(trimmed)

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 13, color: '#6B625D' }}>
        Select all that apply
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 0 }}>
        {displayOptions.map((label) => {
          const active = selected.includes(label)
          const custom = isCustom(label)

          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 9999,
                padding: '10px 16px',
                fontSize: 16,
                border: `1px solid ${active ? COLOR_PILL_SELECTED_BORDER : COLOR_PILL_UNSELECTED_BORDER}`,
                background: active ? COLOR_PILL_SELECTED_BG : COLOR_PILL_UNSELECTED_BG,
                color: COLOR_TEXT_PRIMARY,
                cursor: 'pointer',
                transition: 'background 120ms ease, color 120ms ease, border 120ms ease',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span
                style={{
                  maxWidth: pillMaxLabelWidth,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>

              {custom ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(label)
                  }}
                  role="button"
                  aria-label={`Remove ${label}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: 9999,
                    backgroundColor: 'rgba(45, 41, 38, 0.1)',
                    color: COLOR_TEXT_PRIMARY,
                    fontSize: 14,
                    lineHeight: 1,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {allowCustom ? (
        <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${COLOR_GREIGE}` }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: COLOR_TEXT_PRIMARY }}>{customTitle}</div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={customPlaceholder}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                border: `1px solid ${COLOR_GREIGE}`,
                padding: '0 12px',
                outline: 'none',
                background: '#FDFDFD',
                color: COLOR_TEXT_PRIMARY,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAddDisabled) {
                  e.preventDefault()
                  onChange([...selected, trimmed])
                  setCustomValue('')
                }
              }}
            />

            <button
              type="button"
              disabled={isAddDisabled}
              onClick={() => {
                if (isAddDisabled) return
                onChange([...selected, trimmed])
                setCustomValue('')
              }}
              style={{
                height: 44,
                borderRadius: 12,
                padding: '0 14px',
                fontSize: 14,
                background: isAddDisabled ? '#FDFDFD' : COLOR_BUTTON_ACTIVE,
                color: isAddDisabled ? '#9B958E' : COLOR_TEXT_PRIMARY,
                border: `1px solid ${COLOR_PILL_SELECTED_BORDER}`,
                cursor: isAddDisabled ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: isAddDisabled ? 0.6 : 1,
              }}
              onMouseDown={(e) => {
                if (!isAddDisabled) {
                  e.currentTarget.style.backgroundColor = COLOR_BUTTON_ACTIVE
                }
              }}
              onMouseUp={(e) => {
                if (!isAddDisabled) {
                  e.currentTarget.style.backgroundColor = COLOR_BUTTON_ACTIVE
                }
              }}
              onMouseLeave={(e) => {
                if (!isAddDisabled) {
                  e.currentTarget.style.backgroundColor = COLOR_BUTTON_ACTIVE
                }
              }}
            >
              {addButtonText}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
