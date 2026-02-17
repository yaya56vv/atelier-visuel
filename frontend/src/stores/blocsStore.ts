// Store — Gestion des blocs et liaisons de l'espace actif
// Charge depuis l'API, synchronise les modifications

import { useState, useCallback, useEffect, useRef } from 'react'
import type { BlocVisuel, LiaisonVisuelle, Forme, Couleur, TypeLiaison } from '../canvas/shapes'
import type { BlocAPI, LiaisonAPI } from '../api'
import * as api from '../api'

/** Convertit un bloc API en BlocVisuel pour le Canvas. */
function toBlocVisuel(b: BlocAPI): BlocVisuel {
  return {
    id: b.id,
    x: b.x,
    y: b.y,
    w: b.largeur,
    h: b.hauteur,
    forme: b.forme as Forme,
    couleur: b.couleur as Couleur,
    titre: b.titre_ia || b.titre || '',
    selected: false,
  }
}

/** Convertit une liaison API en LiaisonVisuelle pour le Canvas. */
function toLiaisonVisuelle(l: LiaisonAPI): LiaisonVisuelle {
  // Couleur par défaut basée sur le type
  const couleurMap: Record<string, Couleur> = {
    simple: 'blue',
    logique: 'blue',
    tension: 'orange',
    ancree: 'violet',
  }
  return {
    id: l.id,
    sourceId: l.bloc_source_id,
    cibleId: l.bloc_cible_id,
    type: l.type as TypeLiaison,
    couleur: couleurMap[l.type] || 'blue',
  }
}

export function useBlocsStore(espaceActifId: string | null) {
  const [blocs, setBlocs] = useState<BlocVisuel[]>([])
  const [liaisons, setLiaisons] = useState<LiaisonVisuelle[]>([])
  const [loading, setLoading] = useState(false)
  // Debounce des mises à jour de position
  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Charger les blocs et liaisons quand l'espace change
  useEffect(() => {
    if (!espaceActifId) {
      setBlocs([])
      setLiaisons([])
      return
    }

    setLoading(true)
    api.getEspace(espaceActifId)
      .then(data => {
        setBlocs((data.blocs || []).map(toBlocVisuel))
        setLiaisons((data.liaisons || []).map(toLiaisonVisuelle))
      })
      .catch(() => { /* backend pas lancé */ })
      .finally(() => setLoading(false))
  }, [espaceActifId])

  // Créer un bloc
  const createBloc = useCallback(async (x: number, y: number, forme?: Forme, couleur?: Couleur) => {
    if (!espaceActifId) return
    const created = await api.createBloc({
      espace_id: espaceActifId,
      x, y,
      forme, couleur,
    })
    setBlocs(prev => [...prev, toBlocVisuel(created)])
  }, [espaceActifId])

  // Mettre à jour la position d'un bloc (debounced)
  const moveBloc = useCallback((blocId: string, x: number, y: number) => {
    // Annuler le timer précédent pour ce bloc
    const existing = updateTimers.current.get(blocId)
    if (existing) clearTimeout(existing)

    // Debounce 300ms
    const timer = setTimeout(() => {
      api.updateBloc(blocId, { x, y }).catch(() => {})
      updateTimers.current.delete(blocId)
    }, 300)
    updateTimers.current.set(blocId, timer)
  }, [])

  // Mettre à jour la taille d'un bloc (debounced)
  const resizeBloc = useCallback((blocId: string, w: number, h: number) => {
    const key = `resize-${blocId}`
    const existing = updateTimers.current.get(key)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(() => {
      api.updateBloc(blocId, { largeur: w, hauteur: h }).catch(() => {})
      updateTimers.current.delete(key)
    }, 300)
    updateTimers.current.set(key, timer)
  }, [])

  // Supprimer un bloc
  const deleteBloc = useCallback(async (blocId: string) => {
    await api.deleteBloc(blocId)
    setBlocs(prev => prev.filter(b => b.id !== blocId))
    setLiaisons(prev => prev.filter(l => l.sourceId !== blocId && l.cibleId !== blocId))
  }, [])

  // Créer une liaison
  const createLiaison = useCallback(async (sourceId: string, cibleId: string) => {
    if (!espaceActifId) return
    const created = await api.createLiaison({
      espace_id: espaceActifId,
      bloc_source_id: sourceId,
      bloc_cible_id: cibleId,
      type: 'simple',
    })
    setLiaisons(prev => [...prev, toLiaisonVisuelle(created)])
  }, [espaceActifId])

  // Supprimer une liaison
  const deleteLiaison = useCallback(async (liaisonId: string) => {
    await api.deleteLiaison(liaisonId)
    setLiaisons(prev => prev.filter(l => l.id !== liaisonId))
  }, [])

  // Cleanup des timers
  useEffect(() => {
    return () => {
      for (const timer of updateTimers.current.values()) {
        clearTimeout(timer)
      }
    }
  }, [])

  return {
    blocs,
    liaisons,
    loading,
    createBloc,
    moveBloc,
    resizeBloc,
    deleteBloc,
    createLiaison,
    deleteLiaison,
  }
}
