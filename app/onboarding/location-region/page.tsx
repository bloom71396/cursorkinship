// app/onboarding/location/page.tsx
'use client'

import React, { useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'

const CITY_OPTIONS = [
  'New York City',
  'Los Angeles',
  'San Francisco',
  'Chicago',
  'Miami',
  'Austin',
  'Boston',
  'Washington, DC',
  'Seattle',
  'Philadelphia',
]

const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  'New York City': [
    'Upper East Side',
    'Upper West Side',
    'Midtown',
    'Chelsea',
    'West Village',
    'Greenwich Village',
    'East Village',
    'SoHo',
    'Tribeca',
    'Lower East Side',
    'Harlem',
    'Williamsburg',
    'Greenpoint',
    'DUMBO',
    'Brooklyn Heights',
    'Park Slope',
    'Carroll Gardens',
    'Fort Greene',
    'Prospect Heights',
    'Crown Heights',
    'Long Island City',
    'Astoria',
  ],
  'Los Angeles': [
    'Hollywood',
    'West Hollywood',
    'Beverly Grove',
    'Beverly Hills',
    'Santa Monica',
    'Venice',
    'Culver City',
    'Silver Lake',
    'Echo Park',
    'Los Feliz',
    'Brentwood',
    'Downtown LA',
  ],
  'San Francisco': [
    'Mission',
    'SOMA',
    'Noe Valley',
    'Castro',
    'Hayes Valley',
    'Marina',
    'Pacific Heights',
    'Richmond',
    'Sunset',
    'North Beach',
  ],
  Chicago: ['Lincoln Park', 'Lakeview', 'Wicker Park', 'Logan Square', 'West Loop', 'River North', 'Gold Coast'],
  Miami: ['Brickell', 'Wynwood', 'Design District', 'Coconut Grove', 'South Beach', 'Mid-Beach'],
  Austin: ['Downtown', 'East Austin', 'South Congress', 'Zilker', 'Clarksville', 'Hyde Park'],
  Boston: ['Back Bay', 'Beacon Hill', 'South End', 'Seaport', 'Cambridge', 'Somerville'],
  'Washington, DC': ['Dupont Circle', 'Georgetown', 'Capitol Hill', 'Navy Yard', 'Adams Morgan', 'U Street'],
  Seattle: ['Capitol Hill', 'Queen Anne', 'Ballard', 'Fremont', 'Belltown', 'South Lake Union'],
  Philadelphia: ['Rittenhouse', 'Fishtown', 'Northern Liberties', 'Old City', 'University City'],
}

function norm(s: string) {
  return (s || '').trim().toLowerCase()
}

function clean(s: string) {
  return (s || '').trim().replace(/\s+/g, ' ')
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  const totalSteps = getTotalSteps()
  const step = getStepNumber(pathname)
  const nextPath = useMemo(() => getNextStep(pathname), [pathname])

  // City
  const [cityInput, setCityInput] = useState('')
  const [citySelected, setCitySelected] = useState('') // set only when user picks a suggestion or commits
  const [cityFocused, setCityFocused] = useState(false)

  // Neighborhood
  const [neighborhoodInput, setNeighborhoodInput] = useState('')
  const [neighborhoodSelected, setNeighborhoodSelected] = useState('')
  const [neighborhoodFocused, setNeighborhoodFocused] = useState(false)

  const cityBoxRef = useRef<HTMLDivElement | null>(null)
  const neighborhoodBoxRef = useRef<HTMLDivElement | null>(null)

  // IMPORTANT: city is considered “set” as soon as user types (not only after selection)
  const activeCity = useMemo(() => {
    const typed = clean(cityInput)
    const selected = clean(citySelected)
    return selected || typed
  }, [cityInput, citySelected])

  const citySuggestions = useMemo(() => {
    const q = norm(cityInput)
    const list = !q ? CITY_OPTIONS : CITY_OPTIONS.filter((c) => norm(c).includes(q))
    // If they already selected an exact match, no need to spam the list
    if (citySelected && norm(citySelected) === norm(cityInput)) return []
    return list.slice(0, 10)
  }, [cityInput, citySelected])

  const neighborhoodsForCity = useMemo(() => {
    // Only show known neighborhoods if the city matches one of our known cities (selected OR exact typed match)
    const exactCity =
      CITY_OPTIONS.find((c) => norm(c) === norm(activeCity)) ||
      CITY_OPTIONS.find((c) => norm(c) === norm(citySelected))
    if (!exactCity) return []
    return NEIGHBORHOODS_BY_CITY[exactCity] ?? []
  }, [activeCity, citySelected])

  const neighborhoodSuggestions = useMemo(() => {
    if (!clean(cityInput)) return []
    const base = neighborhoodsForCity
    if (!base.length) return []
    const q = norm(neighborhoodInput)
    const list = !q ? base : base.filter((n) => norm(n).includes(q))
    if (neighborhoodSelected && norm(neighborhoodSelected) === norm(neighborhoodInput)) return []
    return list.slice(0, 12)
  }, [cityInput, neighborhoodsForCity, neighborhoodInput, neighborhoodSelected])

  const canContinue = clean(cityInput).length > 0 || clean(citySelected).length > 0

  function commitCity(value?: string) {
    const v = clean(value ?? cityInput)
    if (!v) return
    setCitySelected(v)
    setCityInput(v)
    // Reset neighborhood when city commits/changes
    setNeighborhoodSelected('')
    setNeighborhoodInput('')
  }

  function commitNeighborhood(value?: string) {
    const v = clean(value ?? neighborhoodInput)
    if (!v) return
    setNeighborhoodSelected(v)
    setNeighborhoodInput(v)
  }

  async function onContinue() {
    if (!canContinue) return

    const city = clean(activeCity)
    const neighborhood = clean(neighborhoodSelected || neighborhoodInput)

    const res = await saveProgress({
      onboarding_step_path: pathname,
      profile_data: {
        city: city || null,
        neighborhood: neighborhood || null,
      },
    })

    if (!res.ok) return
    router.push(nextPath)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    borderRadius: 14,
    border: '1px solid #EBE7E0',
    background: '#FDFDFD',
    padding: '0 14px',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#2D2926',
    marginBottom: 8,
  }

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    zIndex: 50,
    background: '#FDFDFD',
    border: '1px solid #EBE7E0',
    borderRadius: 14,
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  }

  const optionStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 14,
    cursor: 'pointer',
    color: '#2D2926',
    background: '#FDFDFD',
  }

  return (
    <Base44Shell
      step={step}
      totalSteps={totalSteps}
      title="Where are you based?"
      subtitle="So recommendations and people are local, relevant and realistic."
    >
      <div
        style={{
          width: '100%',
          maxWidth: 760,
          margin: '0 auto',
          padding: 24,
          borderRadius: 18,
          border: '1px solid transparent',
          background: 'transparent',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
          {/* City */}
          <div style={labelStyle}>City or town</div>

          <div ref={cityBoxRef} style={{ position: 'relative' }}>
            <input
              value={cityInput}
              onChange={(e) => {
                const v = e.target.value
                setCityInput(v)
                // typing means it's not “selected” anymore
                if (citySelected && norm(v) !== norm(citySelected)) setCitySelected('')
              }}
              onFocus={() => setCityFocused(true)}
              onBlur={() => {
                // On blur, keep whatever they typed (manual is allowed).
                setCityFocused(false)
                if (clean(cityInput)) commitCity()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitCity()
                }
              }}
              placeholder="Start typing…"
              style={inputStyle}
              autoComplete="address-level2"
            />

            {cityFocused && citySuggestions.length > 0 && (
              <div style={dropdownStyle}>
                {citySuggestions.map((c) => (
                  <div
                    key={c}
                    onMouseDown={(e) => {
                      // onMouseDown so blur doesn't fire first
                      e.preventDefault()
                      commitCity(c)
                      setCityFocused(false)
                    }}
                    style={optionStyle}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 8, fontSize: 12.5, color: 'rgba(0,0,0,0.55)' }}>
            Pick a suggestion, or type anything and press Enter.
          </div>

          {/* Neighborhood */}
          <div style={{ marginTop: 16 }}>
            <div style={labelStyle}>
              Neighborhood <span style={{ fontWeight: 400, color: 'rgba(0,0,0,0.55)' }}>(optional)</span>
            </div>

            <div ref={neighborhoodBoxRef} style={{ position: 'relative' }}>
              <input
                value={neighborhoodInput}
                onChange={(e) => {
                  const v = e.target.value
                  setNeighborhoodInput(v)
                  if (neighborhoodSelected && norm(v) !== norm(neighborhoodSelected)) setNeighborhoodSelected('')
                }}
                onFocus={() => setNeighborhoodFocused(true)}
                onBlur={() => {
                  setNeighborhoodFocused(false)
                  // Only commit if they typed something
                  if (clean(neighborhoodInput)) commitNeighborhood()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (!clean(cityInput) && !clean(citySelected)) return
                    commitNeighborhood()
                  }
                }}
                placeholder={clean(cityInput) || clean(citySelected) ? 'Start typing…' : 'Type a city first'}
                disabled={!clean(cityInput) && !clean(citySelected)}
                style={{
                  ...inputStyle,
                  background: clean(cityInput) || clean(citySelected) ? '#FDFDFD' : '#F9F8F6',
                  border: '1px solid #EBE7E0',
                }}
                autoComplete="address-level3"
              />

              {neighborhoodFocused && neighborhoodSuggestions.length > 0 && (
                <div style={dropdownStyle}>
                  {neighborhoodSuggestions.map((n) => (
                    <div
                      key={n}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        commitNeighborhood(n)
                        setNeighborhoodFocused(false)
                      }}
                      style={optionStyle}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {clean(cityInput) && neighborhoodsForCity.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: 'rgba(0,0,0,0.55)' }}>
                No neighborhood list for this city yet. Type anything and press Enter.
              </div>
            )}
          </div>
        </div>

        {/* Continue button (life-stage: grey -> black when enabled) */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            style={{
              height: 48,
              width: '100%',
              maxWidth: 600,
              borderRadius: 999,
              background: canContinue ? '#FDFDFD' : '#D9D2C9',
              color: '#2D2926',
              border: '1px solid #EBE7E0',
              fontSize: 15,
              fontWeight: 500,
              cursor: canContinue ? 'pointer' : 'default',
              transition: 'background 120ms ease',
            }}
            onMouseDown={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = '#D9D2C9'
              }
            }}
            onMouseUp={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = '#FDFDFD'
              }
            }}
            onMouseLeave={(e) => {
              if (canContinue) {
                e.currentTarget.style.backgroundColor = '#FDFDFD'
              }
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </Base44Shell>
  )
}
