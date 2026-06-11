'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AppData, CurrentProfile, Stand, Wedstrijd, Blokkade, SpeelavondEntry } from './types'
import { fetchAppData, fetchCurrentProfile } from './supabase/queries'
import { createClient } from './supabase/client'

const EMPTY: AppData = { locaties: {}, competities: {}, poules: {}, teams: {}, wedstrijden: [], standen: {}, uitslag_verzoeken: [] }

type Action =
  | { type: 'SET_UITSLAG'; wedstrijdId: string; uitslag: [number, number] }
  | { type: 'SLUIT_ESCALATIE'; wedstrijdId: string; uitslag: [number, number] }
  | { type: 'STEL_UITSLAG_VOOR'; wedstrijdId: string; uitslag: [number, number]; doorTeamId: string }
  | { type: 'KEUR_UITSLAG_GOED'; verzoekId: string }
  | { type: 'CORRIGEER_UITSLAG'; verzoekId: string; uitslag: [number, number]; doorTeamId: string }
  | { type: 'WIJS_UITSLAG_AF'; verzoekId: string }
  | { type: 'STEL_TEGENBOD_VOOR'; verzoekId: string; doorTeamId: string; reden: string; datum: string; tijd: string }
  | { type: 'CREATE_VERZOEK'; wedstrijdId: string; door: string; aan: string; reden: string; nieuweDatum: string; nieuweTijd: string }
  | { type: 'ACCEPT_VERZOEK'; wedstrijdId: string }
  | { type: 'AFWIJS_VERZOEK'; wedstrijdId: string }
  | { type: 'UPDATE_BESCHIKBAARHEID'; teamId: string; speelavonden: SpeelavondEntry[]; blokkades: Blokkade[] }
  | { type: 'UPDATE_TEAMGEGEVENS'; teamId: string; naam: string; tel: string; mail: string; locatie_id: string }
  | { type: 'CREATE_TEAM'; data: Omit<AppData['teams'][string], 'id' | 'hue' | 'blokkades' | 'avond' | 'start'> & { poule_id: string | null } }
  | { type: 'UPDATE_TEAM'; teamId: string; data: Partial<AppData['teams'][string]>; oldPouleId: string | null }
  | { type: 'DELETE_TEAM'; teamId: string }
  | { type: 'CREATE_POULE'; competitieId: string; naam: string; niveau: string; format: 'enkel' | 'anderhalf' | 'dubbel'; maxSets: number }
  | { type: 'UPDATE_POULE'; pouleId: string; naam: string; niveau: string; format: 'enkel' | 'anderhalf' | 'dubbel'; maxSets: number }
  | { type: 'DELETE_POULE'; pouleId: string }
  | { type: 'CREATE_COMPETITIE'; data: Omit<AppData['competities'][string], 'id'> }
  | { type: 'UPDATE_COMPETITIE'; competitieId: string; naam: string; soort: 'heren' | 'dames' | 'mix'; seizoen: string; startDatum: string; eindDatum: string }
  | { type: 'DELETE_COMPETITIE'; competitieId: string }
  | { type: 'CREATE_LOCATIE'; data: Omit<AppData['locaties'][string], 'id'> }
  | { type: 'UPDATE_LOCATIE'; locatieId: string; data: Partial<AppData['locaties'][string]> }
  | { type: 'UPDATE_STAND'; pouleId: string; teamId: string; vals: Partial<Stand> }

async function executeAction(action: Action): Promise<void> {
  const sb = createClient()

  switch (action.type) {
    case 'SET_UITSLAG':
      await sb.from('wedstrijden').update({
        status: 'gespeeld',
        uitslag_thuis: action.uitslag[0],
        uitslag_uit: action.uitslag[1],
      }).eq('id', action.wedstrijdId)
      break

    case 'SLUIT_ESCALATIE':
      await Promise.all([
        sb.from('wedstrijden').update({
          status: 'gespeeld',
          uitslag_thuis: action.uitslag[0],
          uitslag_uit: action.uitslag[1],
        }).eq('id', action.wedstrijdId),
        sb.from('uitslag_verzoeken').update({ status: 'goedgekeurd' })
          .eq('wedstrijd_id', action.wedstrijdId)
          .in('status', ['open', 'geescaleerd']),
      ])
      break

    case 'STEL_UITSLAG_VOOR': {
      const { data: w } = await sb.from('wedstrijden').select('thuis_id, uit_id').eq('id', action.wedstrijdId).single()
      if (!w) break
      const teBevestigenDoor = w.thuis_id === action.doorTeamId ? w.uit_id : w.thuis_id
      await sb.from('uitslag_verzoeken').insert({
        wedstrijd_id: action.wedstrijdId,
        ingediend_door: action.doorTeamId,
        te_bevestigen_door: teBevestigenDoor,
        uitslag_thuis: action.uitslag[0],
        uitslag_uit: action.uitslag[1],
      })
      try {
        await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'uitslag_voorstel', wedstrijdId: action.wedstrijdId, doorTeamId: action.doorTeamId }) })
      } catch { /* email is best-effort */ }
      break
    }

    case 'KEUR_UITSLAG_GOED': {
      const { data: vz } = await sb.from('uitslag_verzoeken').select('*').eq('id', action.verzoekId).single()
      if (!vz) break
      await Promise.all([
        sb.from('uitslag_verzoeken').update({ status: 'goedgekeurd' }).eq('id', action.verzoekId),
        sb.from('wedstrijden').update({
          status: 'gespeeld',
          uitslag_thuis: vz.uitslag_thuis,
          uitslag_uit: vz.uitslag_uit,
        }).eq('id', vz.wedstrijd_id),
      ])
      try {
        await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'uitslag_goedgekeurd', wedstrijdId: vz.wedstrijd_id, doorTeamId: vz.te_bevestigen_door }) })
      } catch { /* email is best-effort */ }
      break
    }

    case 'CORRIGEER_UITSLAG': {
      const { data: oudVz } = await sb.from('uitslag_verzoeken').select('*').eq('id', action.verzoekId).single()
      if (!oudVz) break
      await sb.from('uitslag_verzoeken').update({ status: 'gecorrigeerd' }).eq('id', action.verzoekId)
      await sb.from('uitslag_verzoeken').insert({
        wedstrijd_id: oudVz.wedstrijd_id,
        ingediend_door: action.doorTeamId,
        te_bevestigen_door: oudVz.ingediend_door,
        uitslag_thuis: action.uitslag[0],
        uitslag_uit: action.uitslag[1],
      })
      try {
        await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'uitslag_gecorrigeerd', wedstrijdId: oudVz.wedstrijd_id, doorTeamId: action.doorTeamId }) })
      } catch { /* email is best-effort */ }
      break
    }

    case 'WIJS_UITSLAG_AF': {
      await sb.from('uitslag_verzoeken').update({ status: 'geescaleerd' }).eq('id', action.verzoekId)
      try {
        await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'uitslag_geescaleerd', verzoekId: action.verzoekId }) })
      } catch { /* email is best-effort */ }
      break
    }

    case 'STEL_TEGENBOD_VOOR': {
      const { data: oudVz } = await sb.from('verplaatsverzoeken').select('*').eq('id', action.verzoekId).single()
      if (!oudVz) break
      await sb.from('verplaatsverzoeken').update({ status: 'beantwoord' }).eq('id', action.verzoekId)
      await sb.from('verplaatsverzoeken').insert({
        wedstrijd_id: oudVz.wedstrijd_id,
        door_team_id: action.doorTeamId,
        aan_team_id: oudVz.door_team_id,
        reden: action.reden,
        nieuwe_datum: action.datum,
        nieuwe_tijd: action.tijd,
        parent_id: action.verzoekId,
      })
      try {
        await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'verplaats_tegenbod', wedstrijdId: oudVz.wedstrijd_id, doorTeamId: action.doorTeamId }) })
      } catch { /* email is best-effort */ }
      break
    }

    case 'CREATE_VERZOEK':
      await Promise.all([
        sb.from('wedstrijden').update({ status: 'verzoek' }).eq('id', action.wedstrijdId),
        sb.from('verplaatsverzoeken').insert({
          wedstrijd_id: action.wedstrijdId,
          door_team_id: action.door,
          aan_team_id: action.aan,
          reden: action.reden,
          nieuwe_datum: action.nieuweDatum,
          nieuwe_tijd: action.nieuweTijd,
        }),
      ])
      try {
        await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'verplaats_nieuw', wedstrijdId: action.wedstrijdId, doorTeamId: action.door }) })
      } catch { /* email is best-effort */ }
      break

    case 'ACCEPT_VERZOEK': {
      const { data: vrz } = await sb
        .from('verplaatsverzoeken')
        .select('id, nieuwe_datum, nieuwe_tijd, door_team_id')
        .eq('wedstrijd_id', action.wedstrijdId)
        .eq('status', 'open')
        .limit(1)
      if (vrz?.[0]) {
        await Promise.all([
          sb.from('wedstrijden').update({
            datum: vrz[0].nieuwe_datum,
            tijd: vrz[0].nieuwe_tijd,
            status: 'gepland',
          }).eq('id', action.wedstrijdId),
          sb.from('verplaatsverzoeken').update({ status: 'goedgekeurd' }).eq('id', vrz[0].id),
        ])
        try {
          await fetch('/api/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'verplaats_goedgekeurd', wedstrijdId: action.wedstrijdId, doorTeamId: vrz[0].door_team_id }) })
        } catch { /* email is best-effort */ }
      }
      break
    }

    case 'AFWIJS_VERZOEK':
      await Promise.all([
        sb.from('wedstrijden').update({ status: 'gepland' }).eq('id', action.wedstrijdId),
        sb.from('verplaatsverzoeken')
          .update({ status: 'afgewezen' })
          .eq('wedstrijd_id', action.wedstrijdId)
          .eq('status', 'open'),
      ])
      break

    case 'UPDATE_BESCHIKBAARHEID': {
      await sb.from('teams').update({ speelavonden: action.speelavonden }).eq('id', action.teamId)
      await sb.from('blokkades').delete().eq('team_id', action.teamId)
      if (action.blokkades.length > 0) {
        await sb.from('blokkades').insert(
          action.blokkades.map(b => ({ team_id: action.teamId, van: b.van, tot: b.tot, reden: b.reden }))
        )
      }
      break
    }

    case 'UPDATE_TEAMGEGEVENS':
      await sb.from('teams').update({
        aanvoerder_naam: action.naam,
        aanvoerder_tel: action.tel,
        aanvoerder_mail: action.mail,
        locatie_id: action.locatie_id,
      }).eq('id', action.teamId)
      break

    case 'CREATE_TEAM': {
      const id = 'team' + Date.now()
      const d = action.data
      const firstAvond = d.speelavonden[0]
      const teamRow: Record<string, unknown> = {
        id, naam: d.naam, kort: d.kort, plaats: d.plaats, adres: d.adres || '',
        hue: Math.floor(Math.random() * 360), locatie_id: d.locatie_id,
        speelavonden: d.speelavonden,
        avond: firstAvond?.dag ?? 'maandag', start_tijd: firstAvond?.tijd ?? '20:00',
        aanvoerder_naam: d.aanvoerder.naam, aanvoerder_tel: d.aanvoerder.tel, aanvoerder_mail: d.aanvoerder.mail,
      }
      if (d.poule_id) teamRow.poule_id = d.poule_id
      await sb.from('teams').insert(teamRow)
      if (d.poule_id) {
        await sb.from('standen').insert({ team_id: id, poule_id: d.poule_id, g: 0, w: 0, v: 0, sv: 0, st: 0, pnt: 0 })
      }
      break
    }

    case 'UPDATE_TEAM': {
      const d = action.data
      const upd: Record<string, unknown> = {}
      if (d.naam !== undefined) upd.naam = d.naam
      if (d.kort !== undefined) upd.kort = d.kort
      if (d.plaats !== undefined) upd.plaats = d.plaats
      if (d.adres !== undefined) upd.adres = d.adres
      if ('poule_id' in d) upd.poule_id = d.poule_id ?? null
      if (d.locatie_id !== undefined) upd.locatie_id = d.locatie_id
      if (d.avond !== undefined) upd.avond = d.avond
      if (d.start !== undefined) upd.start_tijd = d.start
      if (d.speelavonden !== undefined) {
        upd.speelavonden = d.speelavonden
        if (d.speelavonden[0]) {
          upd.avond = d.speelavonden[0].dag
          upd.start_tijd = d.speelavonden[0].tijd
        }
      }
      if (d.aanvoerder !== undefined) {
        upd.aanvoerder_naam = d.aanvoerder.naam
        upd.aanvoerder_tel = d.aanvoerder.tel
        upd.aanvoerder_mail = d.aanvoerder.mail
      }
      await sb.from('teams').update(upd).eq('id', action.teamId)
      if (d.poule_id !== undefined && d.poule_id !== action.oldPouleId) {
        if (action.oldPouleId) {
          await sb.from('standen').delete().eq('team_id', action.teamId).eq('poule_id', action.oldPouleId)
        }
        if (d.poule_id) {
          await sb.from('standen').insert({ team_id: action.teamId, poule_id: d.poule_id, g: 0, w: 0, v: 0, sv: 0, st: 0, pnt: 0 })
        }
      }
      break
    }

    case 'DELETE_TEAM': {
      const { data: matchIds } = await sb
        .from('wedstrijden').select('id')
        .or(`thuis_id.eq.${action.teamId},uit_id.eq.${action.teamId}`)
      if (matchIds?.length) {
        await sb.from('wedstrijden').delete().in('id', matchIds.map(m => m.id))
      }
      await sb.from('teams').delete().eq('id', action.teamId)
      break
    }

    case 'CREATE_POULE': {
      const id = 'P' + Date.now().toString().slice(-4)
      await sb.from('poules').insert({
        id, naam: action.naam, niveau: action.niveau || '',
        competitie_id: action.competitieId, format: action.format, max_sets: action.maxSets,
      })
      break
    }

    case 'UPDATE_POULE':
      await sb.from('poules').update({ naam: action.naam, niveau: action.niveau, format: action.format, max_sets: action.maxSets }).eq('id', action.pouleId)
      break

    case 'DELETE_POULE':
      await sb.from('poules').delete().eq('id', action.pouleId)
      break

    case 'CREATE_COMPETITIE': {
      const id = 'comp' + Date.now().toString().slice(-6)
      const d = action.data
      await sb.from('competities').insert({
        id, naam: d.naam, type: d.type, format: d.format,
        seizoen: d.seizoen, start_datum: d.startDatum, eind_datum: d.eindDatum,
      })
      break
    }

    case 'UPDATE_COMPETITIE':
      await sb.from('competities').update({
        naam: action.naam, type: action.soort, seizoen: action.seizoen,
        start_datum: action.startDatum, eind_datum: action.eindDatum,
      }).eq('id', action.competitieId)
      break

    case 'DELETE_COMPETITIE':
      await sb.from('competities').delete().eq('id', action.competitieId)
      break

    case 'CREATE_LOCATIE': {
      const id = 'loc' + Date.now().toString().slice(-6)
      await sb.from('locaties').insert({ id, ...action.data })
      break
    }

    case 'UPDATE_LOCATIE':
      await sb.from('locaties').update(action.data).eq('id', action.locatieId)
      break

    case 'UPDATE_STAND':
      await sb.from('standen').update(action.vals).eq('team_id', action.teamId).eq('poule_id', action.pouleId)
      break
  }
}

type DataContextType = {
  data: AppData
  loading: boolean
  profile: CurrentProfile | null
  dispatch: (action: Action) => void
  refresh: () => Promise<void>
  teamsByPoule: (pouleId: string) => AppData['teams'][string][]
  wedstrijdenVan: (teamId: string) => Wedstrijd[]
  inkomendVerzoeken: (teamId: string) => Wedstrijd[]
  competitiePoules: (competitieId: string) => AppData['poules'][string][]
  teamsInLocatie: (locatieId: string) => AppData['teams'][string][]
  standPositie: (teamId: string, pouleId: string) => number
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<CurrentProfile | null>(null)

  const refresh = useCallback(async () => {
    const [fresh, prof] = await Promise.all([fetchAppData(), fetchCurrentProfile()])
    setData(fresh)
    setProfile(prof)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const dispatch = useCallback((action: Action) => {
    executeAction(action).then(refresh).catch(console.error)
  }, [refresh])

  const teamsByPoule = useCallback(
    (pouleId: string) => Object.values(data.teams).filter(t => t.poule_id === pouleId),
    [data.teams]
  )

  const wedstrijdenVan = useCallback(
    (teamId: string) => data.wedstrijden.filter(w => w.thuis_id === teamId || w.uit_id === teamId),
    [data.wedstrijden]
  )

  const inkomendVerzoeken = useCallback(
    (teamId: string) => data.wedstrijden.filter(w => w.status === 'verzoek' && w.verzoek?.aan === teamId),
    [data.wedstrijden]
  )

  const competitiePoules = useCallback(
    (competitieId: string) => {
      const comp = data.competities[competitieId]
      const pouleIds: string[] =
        comp?.poules ?? Object.values(data.poules).filter(p => p.competitie_id === competitieId).map(p => p.id)
      return pouleIds.map(id => data.poules[id]).filter(Boolean)
    },
    [data.competities, data.poules]
  )

  const teamsInLocatie = useCallback(
    (locatieId: string) => Object.values(data.teams).filter(t => t.locatie_id === locatieId),
    [data.teams]
  )

  const standPositie = useCallback(
    (teamId: string, pouleId: string) => {
      const idx = (data.standen[pouleId] ?? []).findIndex(r => r.team_id === teamId)
      return idx + 1
    },
    [data.standen]
  )

  return (
    <DataContext.Provider value={{ data, loading, profile, dispatch, refresh, teamsByPoule, wedstrijdenVan, inkomendVerzoeken, competitiePoules, teamsInLocatie, standPositie }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be inside DataProvider')
  return ctx
}
