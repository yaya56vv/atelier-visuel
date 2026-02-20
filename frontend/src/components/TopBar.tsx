// Barre supérieure — Gestion des espaces et thèmes
// Icône des espaces à gauche du titre central (jamais exilée dans le coin)

import { useState } from 'react'

interface TopBarProps {
  espaces: { id: string; nom: string; couleur_identite?: string }[]
  espaceActifId: string | null
  scope: 'espace' | 'global'
  onSelectEspace: (id: string) => void
  onCreateEspace: (nom: string) => void
  onToggleGlobal: () => void
}

export default function TopBar({ espaces, espaceActifId, scope, onSelectEspace, onCreateEspace, onToggleGlobal }: TopBarProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = () => {
    const nom = newName.trim()
    if (!nom) return
    onCreateEspace(nom)
    setNewName('')
    setShowCreate(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') setShowCreate(false)
  }

  return (
    <header style={styles.bar}>
      {/* Sélecteur d'espace à gauche */}
      <div style={styles.left}>
        <select
          value={espaceActifId ?? ''}
          onChange={(e) => onSelectEspace(e.target.value)}
          style={styles.select}
        >
          <option value="" disabled>Choisir un espace</option>
          {espaces.map(esp => (
            <option key={esp.id} value={esp.id}>{esp.nom}</option>
          ))}
        </select>
        <button onClick={() => setShowCreate(!showCreate)} style={styles.btn} title="Nouvel espace">
          +
        </button>
      </div>

      {/* Titre central */}
      <div style={styles.center}>
        <span style={styles.title}>Atelier Visuel</span>
      </div>

      {/* Zone droite — Bouton Graphe Global */}
      <div style={styles.right}>
        <button
          onClick={onToggleGlobal}
          style={{
            ...styles.globalBtn,
            background: scope === 'global' ? 'rgba(255, 200, 100, 0.15)' : 'transparent',
            color: scope === 'global' ? 'rgba(255, 210, 120, 1)' : 'rgba(160, 170, 200, 0.6)',
            borderColor: scope === 'global' ? 'rgba(255, 200, 100, 0.35)' : 'rgba(80, 80, 120, 0.25)',
            boxShadow: scope === 'global' ? '0 0 10px rgba(255, 200, 100, 0.1)' : 'none',
          }}
          title={scope === 'global' ? 'Revenir à l\'espace' : 'Vue graphe global'}
        >
          ◉ Global
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreate && (
        <div style={styles.createOverlay}>
          <input
            autoFocus
            type="text"
            placeholder="Nom du nouvel espace..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
          />
          <button onClick={handleCreate} style={styles.btnCreate}>Créer</button>
          <button onClick={() => setShowCreate(false)} style={styles.btnCancel}>Annuler</button>
        </div>
      )}
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(15, 15, 25, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(80, 80, 120, 0.2)',
    zIndex: 100,
    padding: '0 12px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flex: '0 0 auto',
  },
  center: {
    flex: 1,
    textAlign: 'center',
  },
  right: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  globalBtn: {
    border: '1px solid',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.3px',
    background: 'transparent',
  },
  title: {
    color: 'rgba(200, 200, 220, 0.8)',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 1,
  },
  select: {
    background: 'rgba(30, 30, 50, 0.8)',
    color: 'rgba(200, 200, 220, 0.9)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 12,
    outline: 'none',
    cursor: 'pointer',
  },
  btn: {
    background: 'rgba(60, 160, 90, 0.3)',
    color: 'rgba(80, 200, 120, 0.9)',
    border: '1px solid rgba(80, 200, 120, 0.3)',
    borderRadius: 4,
    width: 26,
    height: 26,
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOverlay: {
    position: 'absolute',
    top: 42,
    left: 12,
    display: 'flex',
    gap: 6,
    background: 'rgba(20, 20, 35, 0.95)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 6,
    padding: 8,
    zIndex: 101,
  },
  input: {
    background: 'rgba(30, 30, 50, 0.8)',
    color: 'rgba(220, 220, 230, 0.9)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 12,
    outline: 'none',
    width: 200,
  },
  btnCreate: {
    background: 'rgba(60, 160, 90, 0.4)',
    color: 'rgba(80, 200, 120, 0.9)',
    border: '1px solid rgba(80, 200, 120, 0.3)',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
  btnCancel: {
    background: 'rgba(80, 30, 30, 0.4)',
    color: 'rgba(200, 120, 120, 0.9)',
    border: '1px solid rgba(200, 120, 120, 0.3)',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
}
