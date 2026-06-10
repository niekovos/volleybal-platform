import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const body = await request.json().catch(() => null)
  const actie = body?.actie as 'accept' | 'decline' | undefined

  if (!actie || !['accept', 'decline'].includes(actie)) {
    return NextResponse.json({ error: 'Geef actie: accept of decline' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Fetch invite via public read policy (no service client needed)
  const { data: invite, error: fetchErr } = await supabase
    .from('aanvoerder_uitnodigingen')
    .select('id, team_id, type, status, van_id, expires_at')
    .eq('token', token)
    .single()

  if (!invite || fetchErr) return NextResponse.json({ error: 'Uitnodiging niet gevonden' }, { status: 404 })
  if (invite.status !== 'open') return NextResponse.json({ error: 'Deze uitnodiging is al verwerkt.' }, { status: 409 })
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Deze uitnodiging is verlopen.' }, { status: 410 })
  }

  if (actie === 'decline') {
    await supabase.from('aanvoerder_uitnodigingen').update({ status: 'afgewezen' }).eq('id', invite.id)
    return NextResponse.json({ ok: true, redirect: '/standen' })
  }

  // Accept: mark invite as accepted
  const { error: invErr } = await supabase
    .from('aanvoerder_uitnodigingen')
    .update({ status: 'geaccepteerd' })
    .eq('id', invite.id)

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 })

  // Preserve existing naam if the profile already exists
  const { data: existing } = await supabase
    .from('gebruiker_profielen')
    .select('naam')
    .eq('id', user.id)
    .single()

  const naam = existing?.naam || user.email?.split('@')[0] || 'Aanvoerder'

  // Upsert profile — user can update own row via "Profiel bijwerken" RLS policy
  const { error: upsertErr } = await supabase
    .from('gebruiker_profielen')
    .upsert({ id: user.id, naam, rol: 'aanvoerder', team_id: invite.team_id }, { onConflict: 'id' })

  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 })

  // For overdracht: demote the previous captain (requires service role to update another user's row)
  if (invite.type === 'overdracht' && invite.van_id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = createServiceClient()
      await sb.from('gebruiker_profielen').update({ rol: 'speler', team_id: null }).eq('id', invite.van_id)
    } catch {
      // Non-critical — accept succeeds even if demotion fails
    }
  }

  return NextResponse.json({ ok: true, redirect: '/aanvoerder' })
}
