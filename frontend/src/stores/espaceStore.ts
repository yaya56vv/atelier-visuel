// Store — Gestion des espaces (IDÉES, CONCEPTION)
// Simple store React avec useState — pas de bibliothèque externe

import { useState, useCallback, useEffect } from 'react'
import * as api from '../api'

export interface Espace {
  id: string
  nom: string
  theme: string
  couleur_identite?: string  // V2 : couleur d'identité graphe global
}

export function useEspaceStore() {
  const [espaces, setEspaces] = useState<Espace[]>([])
  const [espaceActifId, setEspaceActifId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger la liste des espaces au montage
  useEffect(() => {
    api.listEspaces()
      .then(data => {
        setEspaces(data.map(e => ({ id: e.id, nom: e.nom, theme: e.theme, couleur_identite: e.couleur_identite })))
        if (data.length > 0 && !espaceActifId) {
          setEspaceActifId(data[0].id)
        }
      })
      .catch(() => { /* backend pas encore lancé */ })
      .finally(() => setLoading(false))
  }, [])

  const createEspace = useCallback(async (nom: string, theme = 'defaut') => {
    const created = await api.createEspace(nom, theme)
    const espace = { id: created.id, nom: created.nom, theme: created.theme, couleur_identite: created.couleur_identite }
    setEspaces(prev => [espace, ...prev])
    setEspaceActifId(created.id)
    return espace
  }, [])

  const selectEspace = useCallback((id: string) => {
    setEspaceActifId(id)
  }, [])

  return {
    espaces,
    espaceActifId,
    loading,
    createEspace,
    selectEspace,
  }
}
