import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fmtDag } from '@/lib/utils'

const RESEND_KEY = process.env.RESEND_API_KEY
const FROM = process.env.MAIL_FROM ?? 'Volleybalcompetitie <noreply@volleybalcompetitie.nl>'

async function sendMail(to: string, subject: string, html: string) {
  if (!RESEND_KEY || !to) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  return res.ok
}

function wrap(body: string) {
  return `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
    <div style="background:#3b5bdb;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <h2 style="margin:0;font-size:18px">Volleybalcompetitie</h2>
    </div>
    <div style="background:#f8f9fa;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e9ecef">
      ${body}
    </div>
  </div>`
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.type) return NextResponse.json({ error: 'Missing type' }, { status: 400 })

  if (!RESEND_KEY) return NextResponse.json({ ok: true, skipped: 'no RESEND_API_KEY' })

  const sb = createServiceClient()

  try {
    switch (body.type) {

      case 'uitslag_voorstel': {
        const { data: w } = await sb.from('wedstrijden').select('thuis_id, uit_id, datum').eq('id', body.wedstrijdId).single()
        if (!w) break
        const tegenId = w.thuis_id === body.doorTeamId ? w.uit_id : w.thuis_id
        const [{ data: tEigen }, { data: tTegen }] = await Promise.all([
          sb.from('teams').select('naam').eq('id', body.doorTeamId).single(),
          sb.from('teams').select('naam, aanvoerder_mail').eq('id', tegenId).single(),
        ])
        if (!tTegen?.aanvoerder_mail) break
        await sendMail(
          tTegen.aanvoerder_mail,
          `Uitslag ingediend — ${fmtDag(w.datum)}`,
          wrap(`<p>Hoi,</p>
            <p><strong>${tEigen?.naam}</strong> heeft de uitslag van jullie wedstrijd op <strong>${fmtDag(w.datum)}</strong> ingediend.</p>
            <p>Open het platform om de uitslag te bevestigen of aan te passen.</p>`),
        )
        break
      }

      case 'uitslag_goedgekeurd': {
        const { data: w } = await sb.from('wedstrijden').select('datum, uitslag_thuis, uitslag_uit').eq('id', body.wedstrijdId).single()
        if (!w) break
        const [{ data: tEigen }, { data: tAkkoord }] = await Promise.all([
          sb.from('teams').select('naam, aanvoerder_mail').eq('id', body.doorTeamId).single(),
          sb.from('teams').select('naam').neq('id', body.doorTeamId),
        ])
        if (!tEigen?.aanvoerder_mail) break
        await sendMail(
          tEigen.aanvoerder_mail,
          `Uitslag bevestigd — ${fmtDag(w.datum)}`,
          wrap(`<p>Hoi,</p>
            <p>De uitslag van jullie wedstrijd op <strong>${fmtDag(w.datum)}</strong> is bevestigd: <strong>${w.uitslag_thuis}–${w.uitslag_uit}</strong>.</p>`),
        )
        break
      }

      case 'uitslag_gecorrigeerd': {
        const { data: vz } = await sb.from('uitslag_verzoeken').select('*, wedstrijden(datum)').eq('wedstrijd_id', body.wedstrijdId).eq('status', 'open').single()
        if (!vz) break
        const { data: tTegen } = await sb.from('teams').select('naam, aanvoerder_mail').eq('id', vz.te_bevestigen_door).single()
        const { data: tCorr } = await sb.from('teams').select('naam').eq('id', body.doorTeamId).single()
        if (!tTegen?.aanvoerder_mail) break
        await sendMail(
          tTegen.aanvoerder_mail,
          'Uitslag gecorrigeerd — bevestiging gevraagd',
          wrap(`<p>Hoi,</p>
            <p><strong>${tCorr?.naam}</strong> heeft de ingediende uitslag gecorrigeerd naar <strong>${vz.uitslag_thuis}–${vz.uitslag_uit}</strong>.</p>
            <p>Open het platform om de gecorrigeerde uitslag te bevestigen of opnieuw aan te passen.</p>`),
        )
        break
      }

      case 'uitslag_geescaleerd': {
        const { data: vz } = await sb.from('uitslag_verzoeken').select('*, wedstrijden(datum, thuis_id, uit_id)').eq('id', body.verzoekId).single()
        if (!vz) break
        const { data: orgs } = await sb.from('gebruiker_profielen').select('naam').eq('rol', 'organisator')
        // Email organisators — use a fixed organisator email if configured
        const orgMail = process.env.ORGANISATOR_MAIL
        if (orgMail) {
          await sendMail(
            orgMail,
            'Uitslag geëscaleerd — ingrijpen nodig',
            wrap(`<p>Hoi,</p>
              <p>De teams zijn het niet eens over de uitslag van een wedstrijd. De uitslag is geëscaleerd.</p>
              <p>Ingediend: <strong>${vz.uitslag_thuis}–${vz.uitslag_uit}</strong>. Log in als organisator om de definitieve uitslag in te voeren.</p>`),
          )
        }
        break
      }

      case 'verplaats_goedgekeurd': {
        const { data: w } = await sb.from('wedstrijden').select('datum').eq('id', body.wedstrijdId).single()
        const { data: tDoor } = await sb.from('teams').select('naam, aanvoerder_mail').eq('id', body.doorTeamId).single()
        if (!tDoor?.aanvoerder_mail) break
        await sendMail(
          tDoor.aanvoerder_mail,
          'Verplaatsverzoek goedgekeurd',
          wrap(`<p>Hoi,</p>
            <p>Goed nieuws! Jullie verplaatsverzoek is goedgekeurd. De wedstrijd staat nu ingepland op <strong>${w ? fmtDag(w.datum) : '—'}</strong>.</p>`),
        )
        break
      }

      case 'verplaats_tegenbod': {
        const { data: w } = await sb.from('wedstrijden').select('datum, thuis_id, uit_id').eq('id', body.wedstrijdId).single()
        if (!w) break
        const tegenId = w.thuis_id === body.doorTeamId ? w.uit_id : w.thuis_id
        const [{ data: tDoor }, { data: tTegen }] = await Promise.all([
          sb.from('teams').select('naam').eq('id', body.doorTeamId).single(),
          sb.from('teams').select('naam, aanvoerder_mail').eq('id', tegenId).single(),
        ])
        if (!tTegen?.aanvoerder_mail) break
        await sendMail(
          tTegen.aanvoerder_mail,
          'Nieuw voorstel voor wedstrijdverplaatsing',
          wrap(`<p>Hoi,</p>
            <p><strong>${tDoor?.naam}</strong> heeft een tegenvoorstel gedaan voor het verplaatsen van jullie wedstrijd.</p>
            <p>Open het platform om het voorstel te bekijken en te reageren.</p>`),
        )
        break
      }

      case 'verplaats_nieuw': {
        const { data: w } = await sb.from('wedstrijden').select('datum, thuis_id, uit_id').eq('id', body.wedstrijdId).single()
        if (!w) break
        const tegenId = w.thuis_id === body.doorTeamId ? w.uit_id : w.thuis_id
        const [{ data: tDoor }, { data: tTegen }] = await Promise.all([
          sb.from('teams').select('naam').eq('id', body.doorTeamId).single(),
          sb.from('teams').select('naam, aanvoerder_mail').eq('id', tegenId).single(),
        ])
        if (!tTegen?.aanvoerder_mail) break
        await sendMail(
          tTegen.aanvoerder_mail,
          'Verplaatsverzoek ontvangen',
          wrap(`<p>Hoi,</p>
            <p><strong>${tDoor?.naam}</strong> vraagt om de wedstrijd van <strong>${fmtDag(w.datum)}</strong> te verplaatsen.</p>
            <p>Open het platform om het verzoek te bekijken en te reageren.</p>`),
        )
        break
      }
    }
  } catch (err) {
    console.error('Mail error:', err)
  }

  return NextResponse.json({ ok: true })
}
