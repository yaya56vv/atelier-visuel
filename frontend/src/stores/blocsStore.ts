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
    sousTitre: b.resume_ia || undefined,
    contentTypes: b.content_types || [],
    selected: false,
  }
}

/** Convertit une liaison API en LiaisonVisuelle pour le Canvas.
 *  La couleur de la liaison est héritée du bloc source —
 *  une liaison qui part d'un bloc vert est une liaison "matière", etc.
 *  Si le bloc source n'est pas trouvé, fallback par type de liaison.
 */
function toLiaisonVisuelle(l: LiaisonAPI, blocsMap: Map<string, BlocVisuel>): LiaisonVisuelle {
  // Hériter la couleur du bloc source
  const sourceBloc = blocsMap.get(l.bloc_source_id)
  let couleur: Couleur = 'blue'

  if (sourceBloc) {
    couleur = sourceBloc.couleur
  } else {
    // Fallback par type si le bloc source n'est pas trouvé
    const fallback: Record<string, Couleur> = {
      simple: 'blue',
      logique: 'blue',
      tension: 'orange',
      ancree: 'violet',
    }
    couleur = fallback[l.type] || 'blue'
  }

  return {
    id: l.id,
    sourceId: l.bloc_source_id,
    cibleId: l.bloc_cible_id,
    type: l.type as TypeLiaison,
    couleur,
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
        const newBlocs = (data.blocs || []).map(toBlocVisuel)
        setBlocs(newBlocs)
        // Construire la map pour que les liaisons héritent la couleur de leur bloc source
        const blocsMap = new Map(newBlocs.map(b => [b.id, b]))
        setLiaisons((data.liaisons || []).map(l => toLiaisonVisuelle(l, blocsMap)))
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
    // Utiliser les blocs actuels pour la map de couleurs
    setBlocs(currentBlocs => {
      const blocsMap = new Map(currentBlocs.map(b => [b.id, b]))
      setLiaisons(prev => [...prev, toLiaisonVisuelle(created, blocsMap)])
      return currentBlocs  // pas de changement aux blocs
    })
  }, [espaceActifId])

  // Supprimer une liaison
  const deleteLiaison = useCallback(async (liaisonId: string) => {
    await api.deleteLiaison(liaisonId)
    setLiaisons(prev => prev.filter(l => l.id !== liaisonId))
  }, [])

  // Recolorer une liaison (changement local immédiat + sync API si dispo)
  const recolorLiaison = useCallback((liaisonId: string, couleur: string) => {
    setLiaisons(prev => prev.map(l =>
      l.id === liaisonId ? { ...l, couleur: couleur as Couleur } : l
    ))
    // TODO: sync avec API quand l'endpoint existe
  }, [])

  // Changer la forme d'un bloc
  const changeBlocForme = useCallback((blocId: string, forme: string) => {
    setBlocs(prev => prev.map(b =>
      b.id === blocId ? { ...b, forme: forme as Forme } : b
    ))
    api.updateBloc(blocId, { forme }).catch(() => {})
  }, [])

  // Changer la couleur d'un bloc
  const changeBlocCouleur = useCallback((blocId: string, couleur: string) => {
    setBlocs(prev => prev.map(b =>
      b.id === blocId ? { ...b, couleur: couleur as Couleur } : b
    ))
    api.updateBloc(blocId, { couleur }).catch(() => {})
  }, [])

  // Recharger l'espace complet (après actions IA par ex.)
  const refreshEspace = useCallback(async () => {
    if (!espaceActifId) return
    try {
      const data = await api.getEspace(espaceActifId)
      const newBlocs = (data.blocs || []).map(toBlocVisuel)
      setBlocs(newBlocs)
      // Construire la map pour que les liaisons héritent la couleur de leur bloc source
      const blocsMap = new Map(newBlocs.map(b => [b.id, b]))
      setLiaisons((data.liaisons || []).map(l => toLiaisonVisuelle(l, blocsMap)))
    } catch { /* ignore */ }
  }, [espaceActifId])

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
    recolorLiaison,
    changeBlocForme,
    changeBlocCouleur,
    refreshEspace,
  }
}
