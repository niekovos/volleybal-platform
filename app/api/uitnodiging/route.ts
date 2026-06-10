import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.teamId || !body?.type) {
    return NextResponse.json({ error: 'Ontbrekende velden: email, teamId, type' }, { status: 400 })
  }

  const { email, teamId, type } = body as { email: string; teamId: string; type: string }

  if (!['uitnodiging', 'overdracht'].includes(type)) {
    return NextResponse.json({ error: 'Ongeldig type' }, { status: 400 })
  }

  // Verify caller is authorized
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profiel } = await supabase
    .from('gebruiker_profielen')
    .select('rol, team_id')
    .eq('id', user.id)
    .single()

  if (type === 'uitnodiging' && profiel?.rol !== 'organisator') {
    return NextResponse.json({ error: 'Alleen een organisator kan uitnodigingen sturen.' }, { status: 403 })
  }
  if (type === 'overdracht') {
    if (profiel?.rol !== 'aanvoerder' || profiel?.team_id !== teamId) {
      return NextResponse.json({ error: 'Je kunt alleen het aanvoerderschap van je eigen team overdragen.' }, { status: 403 })
    }
  }

  // Verify team exists
  const { data: team } = await supabase.from('teams').select('id').eq('id', teamId).single()
  if (!team) return NextResponse.json({ error: 'Team niet gevonden' }, { status: 404 })

  const sb = createServiceClient()

  // Create invitation record — use service role to bypass potential RLS edge cases
  const { data: invite, error: insertErr } = await sb
    .from('aanvoerder_uitnodigingen')
    .insert({ team_id: teamId, email, type, van_id: user.id })
    .select('token')
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  const inviteUrl = `${origin}/uitnodiging/${invite.token}`

  // Try to send email via Supabase Admin invite (only works for new users)
  let emailSent = false
  try {
    const { error: inviteErr } = await sb.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteUrl,
    })
    emailSent = !inviteErr
  } catch {
    // Service role key not configured or user already exists — fall through
  }

  return NextResponse.json({ token: invite.token, inviteUrl, emailSent })
}
