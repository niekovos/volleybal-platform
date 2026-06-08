'use client'
import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { AppData, Stand, Wedstrijd, Blokkade, Dag } from './types'
import { INITIAL_DATA } from './mock-data'

type Action =
  | { type: 'SET_UITSLAG'; wedstrijdId: string; uitslag: [number, number] }
  | { type: 'CREATE_VERZOEK'; wedstrijdId: string; door: string; aan: string; reden: string; nieuweDatum: string; nieuweTijd: string }
  | { type: 'ACCEPT_VERZOEK'; wedstrijdId: string }
  | { type: 'AFWIJS_VERZOEK'; wedstrijdId: string }
  | { type: 'UPDATE_BESCHIKBAARHEID'; teamId: string; avond: Dag; start: string; blokkades: Blokkade[] }
  | { type: 'UPDATE_TEAMGEGEVENS'; teamId: string; naam: string; tel: string; mail: string; locatie_id: string }
  | { type: 'CREATE_TEAM'; data: Omit<AppData['teams'][string], 'id' | 'hue' | 'blokkades'> }
  | { type: 'UPDATE_TEAM'; teamId: string; data: Partial<AppData['teams'][string]>; oldPouleId: string }
  | { type: 'CREATE_POULE'; competitieId: string; naam: string; niveau: string }
  | { type: 'CREATE_COMPETITIE'; data: Omit<AppData['competities'][string], 'id'> }
  | { type: 'CREATE_LOCATIE'; data: Omit<AppData['locaties'][string], 'id'> }
  | { type: 'UPDATE_LOCATIE'; locatieId: string; data: Partial<AppData['locaties'][string]> }
  | { type: 'UPDATE_STAND'; pouleId: string; teamId: string; vals: Partial<Stand> }

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function reducer(state: AppData, action: Action): AppData {
  const s = deepClone(state)

  switch (action.type) {
    case 'SET_UITSLAG': {
      const w = s.wedstrijden.find((x: Wedstrijd) => x.id === action.wedstrijdId)
      if (w) { w.status = 'gespeeld'; w.uitslag = action.uitslag }
      return s
    }
    case 'CREATE_VERZOEK': {
      const w = s.wedstrijden.find((x: Wedstrijd) => x.id === action.wedstrijdId)
      if (w) {
        w.status = 'verzoek'
        w.verzoek = { door: action.door, aan: action.aan, reden: action.reden, nieuweDatum: action.nieuweDatum, nieuweTijd: action.nieuweTijd }
      }
      return s
    }
    case 'ACCEPT_VERZOEK': {
      const w = s.wedstrijden.find((x: Wedstrijd) => x.id === action.wedstrijdId)
      if (w?.verzoek) {
        w.datum = w.verzoek.nieuweDatum
        w.tijd = w.verzoek.nieuweTijd
        w.status = 'gepland'
        delete w.verzoek
      }
      return s
    }
    case 'AFWIJS_VERZOEK': {
      const w = s.wedstrijden.find((x: Wedstrijd) => x.id === action.wedstrijdId)
      if (w) { w.status = 'gepland'; delete w.verzoek }
      return s
    }
    case 'UPDATE_BESCHIKBAARHEID': {
      const t = s.teams[action.teamId]
      if (t) { t.avond = action.avond; t.start = action.start; t.blokkades = action.blokkades }
      return s
    }
    case 'UPDATE_TEAMGEGEVENS': {
      const t = s.teams[action.teamId]
      if (t) { t.aanvoerder.naam = action.naam; t.aanvoerder.tel = action.tel; t.aanvoerder.mail = action.mail; t.locatie_id = action.locatie_id }
      return s
    }
    case 'CREATE_TEAM': {
      const id = 'team' + Date.now()
      s.teams[id] = { id, hue: Math.floor(Math.random() * 360), blokkades: [], ...action.data }
      if (!s.standen[action.data.poule_id]) s.standen[action.data.poule_id] = []
      s.standen[action.data.poule_id].push({ team_id: id, poule_id: action.data.poule_id, g:0,w:0,v:0,sv:0,st:0,pnt:0 })
      return s
    }
    case 'UPDATE_TEAM': {
      const t = s.teams[action.teamId]
      if (!t) return s
      const { oldPouleId } = action
      const newPouleId = action.data.poule_id || t.poule_id
      Object.assign(t, action.data)
      if (oldPouleId !== newPouleId) {
        s.standen[oldPouleId] = (s.standen[oldPouleId] || []).filter((r: Stand) => r.team_id !== action.teamId)
        if (!s.standen[newPouleId]) s.standen[newPouleId] = []
        s.standen[newPouleId].push({ team_id: action.teamId, poule_id: newPouleId, g:0,w:0,v:0,sv:0,st:0,pnt:0 })
      }
      return s
    }
    case 'CREATE_POULE': {
      const id = 'P' + Date.now().toString().slice(-4)
      s.poules[id] = { id, naam: action.naam, niveau: action.niveau || 'Nieuw', competitie_id: action.competitieId }
      s.standen[id] = []
      const comp = s.competities[action.competitieId]
      if (comp) { if (!comp.poules) comp.poules = []; comp.poules.push(id) }
      return s
    }
    case 'CREATE_COMPETITIE': {
      const id = 'comp' + Date.now().toString().slice(-6)
      s.competities[id] = { id, ...action.data, poules: [] }
      return s
    }
    case 'CREATE_LOCATIE': {
      const id = 'loc' + Date.now().toString().slice(-6)
      s.locaties[id] = { id, ...action.data }
      return s
    }
    case 'UPDATE_LOCATIE': {
      if (s.locaties[action.locatieId]) Object.assign(s.locaties[action.locatieId], action.data)
      return s
    }
    case 'UPDATE_STAND': {
      const rij = (s.standen[action.pouleId] || []).find((r: Stand) => r.team_id === action.teamId)
      if (rij) {
        Object.assign(rij, action.vals)
        s.standen[action.pouleId].sort((a: Stand, b: Stand) => b.pnt - a.pnt || (b.sv - b.st) - (a.sv - a.st))
      }
      return s
    }
    default:
      return s
  }
}

type DataContextType = {
  data: AppData
  dispatch: React.Dispatch<Action>
  teamsByPoule: (pouleId: string) => AppData['teams'][string][]
  wedstrijdenVan: (teamId: string) => Wedstrijd[]
  inkomendVerzoeken: (teamId: string) => Wedstrijd[]
  competitiePoules: (competitieId: string) => AppData['poules'][string][]
  teamsInLocatie: (locatieId: string) => AppData['teams'][string][]
  standPositie: (teamId: string, pouleId: string) => number
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, INITIAL_DATA)

  const teamsByPoule = useCallback((pouleId: string) =>
    Object.values(data.teams).filter(t => t.poule_id === pouleId), [data.teams])

  const wedstrijdenVan = useCallback((teamId: string) =>
    data.wedstrijden.filter(w => w.thuis_id === teamId || w.uit_id === teamId), [data.wedstrijden])

  const inkomendVerzoeken = useCallback((teamId: string) =>
    data.wedstrijden.filter(w => w.status === 'verzoek' && w.verzoek?.aan === teamId), [data.wedstrijden])

  const competitiePoules = useCallback((competitieId: string) => {
    const comp = data.competities[competitieId]
    const pouleIds: string[] = comp?.poules || Object.values(data.poules).filter(p => p.competitie_id === competitieId).map(p => p.id)
    return pouleIds.map(id => data.poules[id]).filter(Boolean)
  }, [data.competities, data.poules])

  const teamsInLocatie = useCallback((locatieId: string) =>
    Object.values(data.teams).filter(t => t.locatie_id === locatieId), [data.teams])

  const standPositie = useCallback((teamId: string, pouleId: string) => {
    const idx = (data.standen[pouleId] || []).findIndex(r => r.team_id === teamId)
    return idx + 1
  }, [data.standen])

  return (
    <DataContext.Provider value={{ data, dispatch, teamsByPoule, wedstrijdenVan, inkomendVerzoeken, competitiePoules, teamsInLocatie, standPositie }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be inside DataProvider')
  return ctx
}
