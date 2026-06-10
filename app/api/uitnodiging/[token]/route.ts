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

  // Require logged-in user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Fetch the invitation
  const sb = createServiceClient()
  const { data: invite } = await sb
    .from('aanvoerder_uitnodigingen')
    .select('id, team_id, type, status, van_id, expires_at')
    .eq('token', token)
    .single()

  if (!invite) return NextResponse.json({ error: 'Uitnodiging niet gevonden' }, { status: 404 })
  if (invite.status !== 'open') return NextResponse.json({ error: 'Deze uitnodiging is al verwerkt.' }, { status: 409 })
  if (new Date(invite.expires_at) < new Date()) {
    await sb.from('aanvoerder_uitnodigingen').update({ status: 'verlopen' }).eq('id', invite.id)
    return NextResponse.json({ error: 'Deze uitnodiging is verlopen.' }, { status: 410 })
  }

  if (actie === 'decline') {
    await sb.from('aanvoerder_uitnodigingen').update({ status: 'afgewezen' }).eq('id', invite.id)
    return NextResponse.json({ ok: true, redirect: '/standen' })
  }

  // Accept: promote user to aanvoerder, link to team
  await sb.from('gebruiker_profielen').upsert({
    id: user.id,
    naam: user.email?.split('@')[0] ?? 'Aanvoerder',
    rol: 'aanvoerder',
    team_id: invite.team_id,
  }, { onConflict: 'id' })

  // If overdracht: demote the previous captain
  if (invite.type === 'overdracht' && invite.van_id) {
    await sb.from('gebruiker_profielen')
      .update({ rol: 'speler', team_id: null })
      .eq('id', invite.van_id)
  }

  // Mark invite as accepted
  await sb.from('aanvoerder_uitnodigingen').update({ status: 'geaccepteerd' }).eq('id', invite.id)

  return NextResponse.json({ ok: true, redirect: '/aanvoerder' })
}
