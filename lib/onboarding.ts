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

export type OnboardingStepPath = (typeof ONBOARDING_STEPS)[number];

export function isValidOnboardingPath(path: string): path is OnboardingStepPath {
  return ONBOARDING_STEPS.includes(path as OnboardingStepPath);
}

export function getStepNumber(path: string): number {
  const index = ONBOARDING_STEPS.indexOf(path as any);
  return index !== -1 ? index + 1 : 1;
}

export function getTotalSteps(): number {
  return ONBOARDING_STEPS.length;
}

export function getNextStep(currentPath: string): string {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentPath as any);
  if (currentIndex !== -1 && currentIndex < ONBOARDING_STEPS.length - 1) {
    return ONBOARDING_STEPS[currentIndex + 1];
  }
  return "/dashboard";
}