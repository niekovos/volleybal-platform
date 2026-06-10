'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/ui/Icon'

export default function SplashPage() {
  const router = useRouter()
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const check = async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()

      setFading(true)
      await new Promise(r => setTimeout(r, 350))

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profiel } = await sb
        .from('gebruiker_profielen')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (profiel?.rol === 'organisator') router.replace('/organisator')
      else if (profiel?.rol === 'aanvoerder') router.replace('/aanvoerder')
      else router.replace('/standen')
    }

    const t = setTimeout(check, 1400)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--primary)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 28,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 26,
        }}
      >
        <Icon name="net" size={54} color="white" />
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 36,
          fontWeight: 800,
          color: 'white',
          margin: 0,
          letterSpacing: -0.6,
        }}
      >
        Volley Assen
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'rgba(255,255,255,0.65)',
          margin: '8px 0 0',
        }}
      >
        Recreatievolleybal Assen e.o.
      </p>
    </div>
  )
}
