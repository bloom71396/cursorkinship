import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const code = String(body?.code || '').trim().toUpperCase()
    const next = typeof body?.next === 'string' ? body.next : '/onboarding/auth'

    if (!code) return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url) return NextResponse.json({ error: 'MISSING_ENV_URL' }, { status: 500 })
    if (!key) return NextResponse.json({ error: 'MISSING_ENV_SECRET_KEY' }, { status: 500 })

    const supabase = createClient(url, key, { auth: { persistSession: false } })

    const { data: row, error: fetchErr } = await supabase
      .from('invite_codes')
      .select('code,is_active,is_unlimited,used_at')
      .eq('code', code)
      .maybeSingle()

    if (fetchErr) {
      return NextResponse.json({ error: 'SUPABASE_FETCH_ERROR', detail: fetchErr.message }, { status: 500 })
    }

    if (!row) return NextResponse.json({ error: 'CODE_NOT_FOUND' }, { status: 400 })
    if (!row.is_active) return NextResponse.json({ error: 'CODE_INACTIVE' }, { status: 400 })

    if (!row.is_unlimited && row.used_at) {
      return NextResponse.json({ error: 'CODE_ALREADY_USED' }, { status: 400 })
    }

    if (!row.is_unlimited) {
      const { error: updErr } = await supabase
        .from('invite_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('code', code)
        .is('used_at', null)

      if (updErr) {
        return NextResponse.json({ error: 'SUPABASE_UPDATE_ERROR', detail: updErr.message }, { status: 500 })
      }
    }

    const redirect = next.startsWith('/') ? next : '/onboarding/auth'
    const res = NextResponse.json({ ok: true, redirect })

    res.cookies.set('invite_ok', '1', {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return res
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 })
  }
}
