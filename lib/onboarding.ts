export const ONBOARDING_STEPS = [
  "/onboarding/norms",
  "/onboarding/life-stage",
  "/onboarding/age-range",
  "/onboarding/location-region",
  "/onboarding/intent",
  "/onboarding/health-interests",
  "/onboarding/conditions",
  "/onboarding/identity",
  "/onboarding/languages",
  "/onboarding/provider",
  "/onboarding/contacts",
  "/onboarding/username",
  "/onboarding/pick-kins",
  "/onboarding/kins",
] as const;

export type OnboardingPath = (typeof ONBOARDING_STEPS)[number]

export function getTotalSteps() {
  return ONBOARDING_STEPS.length
}

export function isValidOnboardingPath(path?: string | null): path is OnboardingPath {
  if (!path) return false
  return (ONBOARDING_STEPS as readonly string[]).includes(path)
}

export function getStepNumber(path?: string | null) {
  if (!path) return 1
  const idx = ONBOARDING_STEPS.indexOf(path as OnboardingPath)
  return idx >= 0 ? idx + 1 : 1
}

export function getNextStep(current?: string | null) {
  if (!current) return ONBOARDING_STEPS[0]
  const idx = ONBOARDING_STEPS.indexOf(current as OnboardingPath)
  if (idx < 0) return ONBOARDING_STEPS[0]
  return ONBOARDING_STEPS[Math.min(idx + 1, ONBOARDING_STEPS.length - 1)]
}