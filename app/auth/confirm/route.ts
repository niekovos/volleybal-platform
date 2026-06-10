import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/standen'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profiel } = await supabase
          .from('gebruiker_profielen')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profiel) {
          await supabase.from('gebruiker_profielen').insert({
            id: user.id,
            naam: user.email?.split('@')[0] ?? 'Gebruiker',
            rol: 'speler',
          })
        }
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=link_verlopen', origin))
}
