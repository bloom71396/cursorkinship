'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import Base44Shell from '@/components/onboarding/Base44Shell'
import { getStepNumber, getTotalSteps } from '@/lib/onboarding'
import { saveProgress } from '@/lib/saveProgress'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function Page() {
  const pathname = usePathname()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function finish() {
    setSaving(true)
    setError(null)
    const res = await saveProgress(supabase, { step: 'kins', stepPath: pathname, complete: true })
    if (!res.ok) setError(res.error)
    setSaving(false)
  }

  return (
    <Base44Shell
      step={getStepNumber(pathname)}
      totalSteps={getTotalSteps()}
      title="All set"
      subtitle="You’re in."
    >
      <div className="w-full h-14 rounded-full border border-stone-900 bg-white text-stone-900 text-lg font-medium hover:bg-stone-50 active:scale-[0.99] focus:outline-none">
        <p className="w-full h-14 rounded-full border border-stone-900 bg-white text-stone-900 text-lg font-medium hover:bg-stone-50 active:scale-[0.99] focus:outline-none">Placeholder. Next you’ll route to your feed.</p>

        {error ? <p className="w-full h-14 rounded-full border border-stone-900 bg-white text-stone-900 text-lg font-medium hover:bg-stone-50 active:scale-[0.99] focus:outline-none">{error} : null}

        <button
          type="button"
          onClick={finish}
          disabled={saving}
          className="w-full h-14 rounded-full border border-stone-900 bg-white text-stone-900 text-lg font-medium hover:bg-stone-50 active:scale-[0.99] focus:outline-none"
        >
          {saving ? 'Finishing…' : 'Finish'}
        </button>
      </div>
    </Base44Shell>
  )
}
