// Fenêtre d'édition de bloc — Ouverte par double-clic sur un bloc
// Zone texte, import, gestion contenus internes
// Dépôt direct : glisser fichier sur bloc, coller contenu

import { useState, useEffect, useCallback, useRef } from 'react'
import * as api from '../api'
import type { ContenuAPI } from '../api'

interface BlocEditorProps {
  blocId: string
  onClose: () => void
}

const TYPE_LABELS: Record<string, string> = {
  texte: 'Texte',
  note: 'Note',
  url: 'URL',
  citation: 'Citation',
}

export default function BlocEditor({ blocId, onClose }: BlocEditorProps) {
  const [contenus, setContenus] = useState<ContenuAPI[]>([])
  const [titre, setTitre] = useState('')
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState('texte')
  const [dragOver, setDragOver] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Charger le bloc et ses contenus
  useEffect(() => {
    api.getBloc(blocId)
      .then(data => {
        setTitre(data.titre_ia || data.titre || `Bloc ${blocId.slice(0, 6)}`)
        setContenus(data.contenus || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [blocId])

  // Ajouter un contenu texte
  const handleAdd = useCallback(async () => {
    const text = newText.trim()
    if (!text) return
    const created = await api.addContenu(blocId, {
      type: newType,
      contenu: text,
      ordre: contenus.length,
    })
    setContenus(prev => [...prev, created])
    setNewText('')
  }, [blocId, newText, newType, contenus.length])

  // Supprimer un contenu
  const handleDelete = useCallback(async (contenuId: string) => {
    await api.deleteContenu(blocId, contenuId)
    setContenus(prev => prev.filter(c => c.id !== contenuId))
  }, [blocId])

  // Dépôt direct — drag & drop de fichier
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    // Texte collé
    const text = e.dataTransfer.getData('text/plain')
    if (text) {
      const created = await api.addContenu(blocId, {
        type: 'texte',
        contenu: text,
        ordre: contenus.length,
      })
      setContenus(prev => [...prev, created])
      return
    }

    // Fichiers
    for (const file of Array.from(e.dataTransfer.files)) {
      const type = file.type.startsWith('image/') ? 'image' : 'fichier'
      const created = await api.addContenu(blocId, {
        type,
        contenu: file.name,
        metadata: JSON.stringify({ size: file.size, type: file.type }),
        ordre: contenus.length,
      })
      setContenus(prev => [...prev, created])
    }
  }, [blocId, contenus.length])

  // Coller (Ctrl+V)
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (!panelRef.current?.contains(document.activeElement)) return
      const text = e.clipboardData?.getData('text/plain')
      if (text) {
        api.addContenu(blocId, {
          type: 'texte',
          contenu: text,
          ordre: contenus.length,
        }).then(created => {
          setContenus(prev => [...prev, created])
        })
      }
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [blocId, contenus.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
    if (e.key === 'Escape') onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        ref={panelRef}
        style={{
          ...styles.panel,
          borderColor: dragOver ? 'rgba(80, 200, 120, 0.6)' : 'rgba(80, 80, 120, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* En-tête */}
        <div style={styles.header}>
          <span style={styles.title}>{titre}</span>
          <button onClick={onClose} style={styles.closeBtn}>x</button>
        </div>

        {loading ? (
          <div style={styles.loading}>Chargement...</div>
        ) : (
          <>
            {/* Liste des contenus */}
            <div style={styles.contenus}>
              {contenus.length === 0 && (
                <div style={styles.empty}>
                  Aucun contenu. Ajoutez du texte, collez ou glissez un fichier.
                </div>
              )}
              {contenus.map(c => (
                <div key={c.id} style={styles.contenuItem}>
                  <span style={styles.contenuType}>
                    {TYPE_LABELS[c.type] || c.type}
                  </span>
                  <span style={styles.contenuText}>
                    {c.contenu ? (c.contenu.length > 100 ? c.contenu.slice(0, 100) + '...' : c.contenu) : '(vide)'}
                  </span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={styles.deleteBtn}
                    title="Supprimer"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>

            {/* Zone d'ajout */}
            <div style={styles.addZone}>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={styles.typeSelect}
              >
                <option value="texte">Texte</option>
                <option value="note">Note</option>
                <option value="url">URL</option>
                <option value="citation">Citation</option>
              </select>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nouveau contenu..."
                style={styles.textarea}
                rows={3}
              />
              <button onClick={handleAdd} style={styles.addBtn}>Ajouter</button>
            </div>

            {/* Zone de dépôt */}
            {dragOver && (
              <div style={styles.dropHint}>
                Déposez ici
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: 480,
    maxHeight: '80vh',
    background: 'rgba(18, 18, 30, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(80, 80, 120, 0.2)',
  },
  title: {
    color: 'rgba(200, 200, 220, 0.9)',
    fontSize: 14,
    fontWeight: 500,
  },
  closeBtn: {
    background: 'transparent',
    color: 'rgba(160, 160, 180, 0.6)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
  },
  loading: {
    color: 'rgba(140, 140, 160, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
  contenus: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 300,
  },
  empty: {
    color: 'rgba(140, 140, 160, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    padding: 16,
    lineHeight: 1.5,
  },
  contenuItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '6px 8px',
    background: 'rgba(30, 30, 50, 0.5)',
    borderRadius: 4,
    border: '1px solid rgba(60, 60, 90, 0.2)',
  },
  contenuType: {
    color: 'rgba(80, 200, 120, 0.7)',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    flexShrink: 0,
    marginTop: 2,
  },
  contenuText: {
    flex: 1,
    color: 'rgba(200, 200, 220, 0.8)',
    fontSize: 12,
    lineHeight: 1.4,
    wordBreak: 'break-word' as const,
  },
  deleteBtn: {
    background: 'transparent',
    color: 'rgba(200, 100, 100, 0.6)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    flexShrink: 0,
  },
  addZone: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 10,
    borderTop: '1px solid rgba(80, 80, 120, 0.2)',
  },
  typeSelect: {
    background: 'rgba(30, 30, 50, 0.8)',
    color: 'rgba(200, 200, 220, 0.9)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 12,
    outline: 'none',
    width: 100,
  },
  textarea: {
    background: 'rgba(30, 30, 50, 0.8)',
    color: 'rgba(220, 220, 230, 0.9)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 4,
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
    resize: 'vertical',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  addBtn: {
    background: 'rgba(60, 160, 90, 0.3)',
    color: 'rgba(80, 200, 120, 0.9)',
    border: '1px solid rgba(80, 200, 120, 0.3)',
    borderRadius: 4,
    padding: '6px 12px',
    fontSize: 12,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  dropHint: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(60, 160, 90, 0.15)',
    color: 'rgba(80, 200, 120, 0.9)',
    fontSize: 16,
    fontWeight: 500,
    borderRadius: 8,
    pointerEvents: 'none',
  },
}
