'use client'

import { usePathname, useRouter } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getNextStep, getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import InviteStyleButton from '@/components/ui/InviteStyleButton'

function titleFor(stepKey: string) {
  const map: Record<string, string> = {
    'norms': 'Preferences',
    'life-stage': 'Life stage',
    'age-range': 'Age range',
    'location-region': 'Location',
    'intent': 'What brings you here?',
    'health-interests': 'Interests',
    'conditions': 'Conditions',
    'identity': 'Identity',
    'languages': 'Languages',
    'provider': 'Providers',
    'contacts': 'Contacts',
    'pick-kins': 'Pick your Kins',
  }
  return map[stepKey] || 'Onboarding'
}

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()

  const stepKey = pathname.split('/').pop() || ''
  const title = titleFor(stepKey)

  async function onContinue() {
    const res = await saveProgress(supabase, { step: stepKey, stepPath: pathname })
    if (!res.ok) return
    router.push(getNextStep(pathname))
  }

  return (
    <Base44Shell
      step={getStepNumber(pathname)}
      totalSteps={getTotalSteps()}
      title={title}
      subtitle="Placeholder wired for save + next."
    >
      <div style={{ width: '100%', maxWidth: '341px', marginTop: '48px' }}>
        <InviteStyleButton canSubmit onClick={onContinue}>
          Continue
        </InviteStyleButton>
      </div>
    </Base44Shell>
  )
}
