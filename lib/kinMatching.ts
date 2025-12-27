// lib/kinMatching.ts
import { KIN_SEEDS, KinSeed } from './kinSeeds'

type ProfileData = Record<string, any>

function arr(v: any): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean)
  return [String(v).trim()].filter(Boolean)
}

function normalizeToken(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[’']/g, '')
    .replace(/&/g, 'and')
    .replace(/\s+/g, '_')
    .replace(/[^\w_]+/g, '')
}

function uniq(xs: string[]): string[] {
  return Array.from(new Set(xs))
}

/**
 * Map common label language from onboarding → canonical tokens used by kinSeeds.
 * Keep this conservative; it’s better to miss than mis-map.
 */
function applyTokenAliases(tokens: string[]): string[] {
  const out: string[] = []
  for (const t of tokens) {
    out.push(t)

    // Age / stage variants
    if (t.includes('late_20')) out.push('late_20s')
    if (t.includes('early_30')) out.push('early_30s')

    // Work variants
    if (t.includes('full_time')) out.push('working_full_time')
    if (t === 'working') out.push('working_full_time')

    // Location variants
    if (t === 'new_york_city' || t === 'nyc' || t.includes('manhattan') || t.includes('brooklyn') || t.includes('queens')) {
      out.push('nyc')
    }

    // Parenthood variants
    if (t.includes('first_time_mom') || t.includes('first_time_parent')) out.push('first_time_parent')
    if (t.includes('year_one') || t.includes('0_1')) out.push('parent_year_one')
    if (t.includes('post_partum') || t.includes('postpartum')) out.push('postpartum')

    // Health variants (broad)
    if (t.includes('arthritis')) out.push('arthritis')
    if (t.includes('joint') || t.includes('mobility')) out.push('mobility_or_joint_issues')
    if (t.includes('chronic_pain')) out.push('chronic_pain')
    if (t.includes('chronic_illness')) out.push('chronic_illness')
    if (t.includes('menopause')) out.push('menopause')
    if (t.includes('anxiety')) out.push('anxiety')

    // Aging / “vintage”
    if (t.includes('older') || t.includes('senior') || t.includes('retired') || t.includes('60') || t.includes('70')) {
      out.push('vintage')
      out.push('aging_body')
    }

    // Caregiver / loss
    if (t.includes('caregiv')) out.push('caregiver')
    if (t.includes('widow')) out.push('widowed')

    // Identity
    if (t.includes('jewish')) out.push('jewish')
    if (t === 'male' || t === 'man' || t === 'guy') out.push('male')
  }

  return uniq(out)
}

export type UserContext = {
  tokens: string[]
  raw: {
    lifeStages: string[]
    identities: string[]
    conditions: string[]
    location: string[]
    ageRange: string[]
  }
}

export function getUserContext(profile: ProfileData): UserContext {
  const lifeStages = arr(profile.life_stage || profile.lifeStages || profile.life_stage_labels)
  const identities = arr(profile.identities || profile.identity || profile.identity_labels)
  const conditions = arr(profile.conditions || profile.health_conditions || profile.condition_labels)
  const location = arr(profile.city || profile.location_city || profile.neighborhood || profile.location)
  const ageRange = arr(profile.age_range || profile.ageRange)

  const base = [...lifeStages, ...identities, ...conditions, ...location, ...ageRange]
    .map((x) => normalizeToken(String(x)))
    .filter(Boolean)

  const tokens = applyTokenAliases(uniq(base))

  return { tokens, raw: { lifeStages, identities, conditions, location, ageRange } }
}

export type AssignedKin = {
  key: string
  name: string
  score: number
  descriptors: string[] // 2–3 “why” anchors for thumbnail
  vibe?: KinSeed['vibe']
  section: 'Primary' | 'Also Relevant' | 'Keeps Coming Up'
}

function seedQualifies(seed: KinSeed, tokens: string[]) {
  const req = seed.requires.map(normalizeToken)
  const boosts = (seed.boosts || []).map(normalizeToken)

  const hasAllReq = req.every((r) => tokens.includes(r))
  if (!hasAllReq) return { ok: false as const, score: 0, req, boosts }

  // Elegant scoring: heavy weight on requires; modest on boosts.
  let score = 100
  score += req.length * 40
  for (const b of boosts) if (tokens.includes(b)) score += 12

  return { ok: true as const, score, req, boosts }
}

function prettifyToken(t: string) {
  return t.replace(/_/g, ' ')
}

function pickDescriptorsForUI(profile: ProfileData, seed: KinSeed): string[] {
  const ctx = getUserContext(profile)

  const pool = [
    ...ctx.raw.lifeStages,
    ...ctx.raw.identities,
    ...ctx.raw.conditions,
    ...ctx.raw.location,
    ...ctx.raw.ageRange,
  ].filter(Boolean)

  const poolTokens = pool.map((s) => applyTokenAliases([normalizeToken(String(s))])[0]).filter(Boolean)

  const seedTokens = uniq([...seed.requires, ...(seed.boosts || [])].map(normalizeToken))
  const matched = seedTokens.filter((t) => ctx.tokens.includes(t))

  const out: string[] = []
  for (const t of matched) {
    const idx = poolTokens.indexOf(t)
    if (idx >= 0) out.push(String(pool[idx]))
    else out.push(prettifyToken(t))
    if (out.length >= 3) break
  }

  return out
}

function overlapCount(a: string[], b: string[]) {
  const setB = new Set(b)
  let n = 0
  for (const x of a) if (setB.has(x)) n++
  return n
}

export function assignTopKins(profile: ProfileData, maxTotal = 5): AssignedKin[] {
  const ctx = getUserContext(profile)

  const scored = KIN_SEEDS
    .map((seed) => {
      const res = seedQualifies(seed, ctx.tokens)
      if (!res.ok) return null

      const seedReq = seed.requires.map(normalizeToken)
      return {
        seed,
        score: res.score,
        reqTokens: seedReq,
        descriptors: pickDescriptorsForUI(profile, seed),
      }
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.score - a.score)

  if (!scored.length) {
    // Minimal fallback: keep it dignified (no “error”, no “general support” hype).
    return [
      {
        key: 'starting_point',
        name: 'Your Starting Point',
        score: 1,
        descriptors: [],
        vibe: 'neutral',
        section: 'Primary',
      },
    ]
  }

  // 1) Primary = top score
  const primary = scored[0]
  const chosen: AssignedKin[] = [
    {
      key: primary.seed.key,
      name: primary.seed.name,
      score: primary.score,
      descriptors: primary.descriptors,
      vibe: primary.seed.vibe,
      section: 'Primary',
    },
  ]

  // 2) Also Relevant = next best, but avoid near-duplicates of primary (same requires)
  const primaryReq = primary.reqTokens
  const alsoCandidates = scored.slice(1).filter((c) => overlapCount(c.reqTokens, primaryReq) < c.reqTokens.length)
  const also = (alsoCandidates.length ? alsoCandidates : scored.slice(1)).slice(0, Math.min(3, maxTotal - 2))

  for (const a of also) {
    chosen.push({
      key: a.seed.key,
      name: a.seed.name,
      score: a.score,
      descriptors: a.descriptors,
      vibe: a.seed.vibe,
      section: 'Also Relevant',
    })
  }

  // 3) Keeps Coming Up = a “credible surprise”
  // Pick something qualified with:
  // - decent score (not a stretch)
  // - lower overlap with primary + also (feels like breadth)
  const already = new Set(chosen.map((k) => k.key))
  const chosenReqs = uniq(chosen.flatMap((k) => {
    const seed = KIN_SEEDS.find((s) => s.key === k.key)
    return (seed?.requires || []).map(normalizeToken)
  }))

  const teaseCandidate = scored
    .filter((c) => !already.has(c.seed.key))
    .map((c) => {
      const overlap = overlapCount(c.reqTokens, chosenReqs)
      return { ...c, overlap }
    })
    .filter((c) => c.score >= primary.score * 0.65) // credible, not random
    .sort((a, b) => {
      // prefer lower overlap first; then higher score
      if (a.overlap !== b.overlap) return a.overlap - b.overlap
      return b.score - a.score
    })[0]

  if (teaseCandidate && chosen.length < maxTotal) {
    chosen.push({
      key: teaseCandidate.seed.key,
      name: teaseCandidate.seed.name,
      score: teaseCandidate.score,
      descriptors: teaseCandidate.descriptors,
      vibe: teaseCandidate.seed.vibe,
      section: 'Keeps Coming Up',
    })
  }

  // Cap
  return chosen.slice(0, maxTotal)
}
