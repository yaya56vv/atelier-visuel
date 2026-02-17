// Client API — Appels REST vers le backend
// Toutes les requêtes passent par le proxy Vite (/api → localhost:8000)

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return undefined as T
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || res.statusText)
  }
  return res.json()
}

// ─── Espaces ─────────────────────────────────────────────

export interface EspaceAPI {
  id: string
  nom: string
  theme: string
  created_at: string
  updated_at: string
  blocs?: BlocAPI[]
  liaisons?: LiaisonAPI[]
}

export async function listEspaces(): Promise<EspaceAPI[]> {
  return request('/espaces/')
}

export async function getEspace(id: string): Promise<EspaceAPI> {
  return request(`/espaces/${id}`)
}

export async function createEspace(nom: string, theme: string): Promise<EspaceAPI> {
  return request('/espaces/', {
    method: 'POST',
    body: JSON.stringify({ nom, theme }),
  })
}

export async function deleteEspace(id: string): Promise<void> {
  return request(`/espaces/${id}`, { method: 'DELETE' })
}

// ─── Blocs ───────────────────────────────────────────────

export interface BlocAPI {
  id: string
  espace_id: string
  x: number
  y: number
  forme: string
  couleur: string
  largeur: number
  hauteur: number
  titre: string | null
  titre_ia: string | null
  resume_ia: string | null
  entites: string | null
  mots_cles: string | null
  created_at: string
  updated_at: string
}

export async function createBloc(data: {
  espace_id: string
  x: number
  y: number
  forme?: string
  couleur?: string
  largeur?: number
  hauteur?: number
}): Promise<BlocAPI> {
  return request('/blocs/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBloc(id: string, data: {
  x?: number
  y?: number
  forme?: string
  couleur?: string
  largeur?: number
  hauteur?: number
}): Promise<BlocAPI> {
  return request(`/blocs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteBloc(id: string): Promise<void> {
  return request(`/blocs/${id}`, { method: 'DELETE' })
}

// ─── Liaisons ────────────────────────────────────────────

export interface LiaisonAPI {
  id: string
  espace_id: string
  bloc_source_id: string
  bloc_cible_id: string
  type: string
  created_at: string
}

export async function createLiaison(data: {
  espace_id: string
  bloc_source_id: string
  bloc_cible_id: string
  type?: string
}): Promise<LiaisonAPI> {
  return request('/liaisons/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteLiaison(id: string): Promise<void> {
  return request(`/liaisons/${id}`, { method: 'DELETE' })
}

// ─── Contenus de bloc ────────────────────────────────────

export interface ContenuAPI {
  id: string
  bloc_id: string
  type: string
  contenu: string | null
  metadata: string | null
  ordre: number
  created_at: string
}

export async function getBloc(id: string): Promise<BlocAPI & { contenus: ContenuAPI[] }> {
  return request(`/blocs/${id}`)
}

export async function addContenu(blocId: string, data: {
  type: string
  contenu?: string
  metadata?: string
  ordre?: number
}): Promise<ContenuAPI> {
  return request(`/blocs/${blocId}/contenus`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteContenu(blocId: string, contenuId: string): Promise<void> {
  return request(`/blocs/${blocId}/contenus/${contenuId}`, { method: 'DELETE' })
}

// ─── Configuration IA ────────────────────────────────────

export interface ConfigIAAPI {
  role: string
  mode: string | null
  url: string | null
  modele: string | null
  cle_api: string | null
}

export async function getConfigIA(role: string): Promise<ConfigIAAPI> {
  return request(`/config-ia/${role}`)
}

export async function updateConfigIA(role: string, data: {
  mode: string
  url?: string
  modele?: string
  cle_api?: string
}): Promise<ConfigIAAPI> {
  return request(`/config-ia/${role}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function testIAConnection(role: string): Promise<boolean> {
  try {
    const data = await request<{ ok: boolean }>(`/config-ia/${role}/test`, {
      method: 'POST',
    })
    return data.ok
  } catch {
    return false
  }
}

export async function askIA(espaceId: string, question: string): Promise<string> {
  const data = await request<{ response: string }>('/ia/ask', {
    method: 'POST',
    body: JSON.stringify({ espace_id: espaceId, question }),
  })
  return data.response
}
