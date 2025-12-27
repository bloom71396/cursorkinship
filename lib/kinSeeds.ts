// lib/kinSeeds.ts
// Canonical Kin seeds.
// Names are intentionally specific, ownable, and tied to real-life friction.
// Kins are containers; relevance is handled via prioritization inside.

export type KinSeed = {
    key: string
    name: string
    requires: string[]      // must all be present
    boosts?: string[]       // strengthen relevance
    vibe?: 'light' | 'neutral' | 'serious'
  }
  
  export const KIN_SEEDS: KinSeed[] = [
    // ─────────────────────────
    // YOUNG ADULT / PRESSURE
    // ─────────────────────────
    {
      key: 'nyc_quarter_life_crisis',
      name: 'NYC Quarter-Life Crisis Files',
      requires: ['nyc', 'late_20s'],
      boosts: ['working_full_time', 'anxiety'],
      vibe: 'neutral',
    },
  
    {
      key: 'always_on_never_off',
      name: 'Always On, Never Off',
      requires: ['working_full_time'],
      boosts: ['anxiety', 'late_20s', 'early_30s'],
      vibe: 'neutral',
    },
  
    {
      key: 'no_room_to_screw_up',
      name: 'No Room to Screw Up',
      requires: ['first_gen', 'working_full_time'],
      boosts: ['anxiety', 'late_20s', 'early_30s'],
      vibe: 'neutral',
    },
  
    // ─────────────────────────
    // IDENTITY + ANXIETY
    // ─────────────────────────
    {
      key: 'always_on_alert',
      name: 'Always on Alert',
      requires: ['jewish', 'anxiety'],
      boosts: ['late_20s', 'early_30s'],
      vibe: 'neutral',
    },
  
    // ─────────────────────────
    // HEALTH / INVISIBLE LOAD
    // ─────────────────────────
    {
      key: 'looking_fine_feeling_rough',
      name: 'Looking Fine, Feeling Rough',
      requires: ['chronic_illness'],
      boosts: ['working_full_time'],
      vibe: 'neutral',
    },
  
    {
      key: 'out_of_warranty',
      name: 'Out of Warranty',
      requires: ['aging_body'],
      boosts: ['chronic_pain', 'mobility_or_joint_issues'],
      vibe: 'light',
    },
  
    // ─────────────────────────
    // CAREGIVING
    // ─────────────────────────
    {
      key: 'on_call_always',
      name: 'On Call, Always',
      requires: ['caregiver'],
      boosts: ['working_full_time'],
      vibe: 'neutral',
    },
  
    // ─────────────────────────
    // PARENTHOOD
    // ─────────────────────────
    {
      key: 'year_one_trenches',
      name: 'Year One, In the Trenches',
      requires: ['parent_year_one'],
      boosts: ['first_time_parent', 'postpartum'],
      vibe: 'neutral',
    },
  
    {
      key: 'newbie_mamas',
      name: 'The Newbie Mamas',
      requires: ['first_time_parent'],
      boosts: ['postpartum', 'parent_year_one'],
      vibe: 'neutral',
    },
  
    // ─────────────────────────
    // AGING / “VINTAGE”
    // ─────────────────────────
    {
      key: 'vintage_not_fragile',
      name: 'Vintage, Not Fragile',
      requires: ['vintage'],
      boosts: ['mobility_or_joint_issues', 'arthritis'],
      vibe: 'light',
    },
  
    {
      key: 'gents_and_joints',
      name: 'Gents & Joints',
      requires: ['male', 'mobility_or_joint_issues'],
      boosts: ['arthritis'],
      vibe: 'light',
    },
  
    // ─────────────────────────
    // LOSS
    // ─────────────────────────
    {
      key: 'widowed_still_here',
      name: 'Still Here',
      requires: ['widowed'],
      boosts: ['recent_loss'],
      vibe: 'serious',
    },
  
    // ─────────────────────────
    // MEDICAL-SPECIFIC (EARNS HUMOR)
    // ─────────────────────────
    {
      key: 'the_semi_colons',
      name: 'The Semi-Colons',
      requires: ['colon_surgery_or_issues'],
      vibe: 'neutral',
    },
  ]
  