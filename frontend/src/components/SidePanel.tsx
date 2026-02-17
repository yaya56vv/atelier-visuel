// Panneau latéral gauche — Explorateur documentaire, recherche, filtres
// Ligne verticale discrète, déploiement par cliquer-tirer vers le centre
// Jamais modale, jamais popup, jamais overlay opaque

import { useState, useRef, useCallback } from 'react'

interface SidePanelProps {
  children?: React.ReactNode
}

const MIN_WIDTH = 4    // Ligne verticale fine
const MAX_WIDTH = 320  // Largeur maximale déployée
const SNAP_THRESHOLD = 40

export default function SidePanel({ children }: SidePanelProps) {
  const [width, setWidth] = useState(MIN_WIDTH)
  const [search, setSearch] = useState('')
  const dragging = useRef(false)

  const isOpen = width > SNAP_THRESHOLD

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const newW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, ev.clientX))
      setWidth(newW)
    }

    const onUp = () => {
      dragging.current = false
      // Snap : fermer si trop petit, ouvrir au min sinon
      setWidth(prev => prev < SNAP_THRESHOLD ? MIN_WIDTH : Math.max(200, prev))
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  return (
    <aside style={{ ...styles.panel, width }}>
      {/* Poignée de redimensionnement */}
      <div
        style={styles.handle}
        onMouseDown={onMouseDown}
        title="Tirer pour déployer"
      />

      {/* Contenu visible uniquement quand ouvert */}
      {isOpen && (
        <div style={styles.content}>
          {/* Recherche */}
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          {/* Zone de contenu */}
          <div style={styles.list}>
            {children || (
              <div style={styles.empty}>
                Aucun bloc dans cet espace
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    top: 40,
    left: 0,
    bottom: 32,
    background: 'rgba(12, 12, 22, 0.88)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid rgba(80, 80, 120, 0.2)',
    zIndex: 90,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    transition: 'none',
  },
  handle: {
    position: 'absolute',
    top: 0,
    right: -3,
    bottom: 0,
    width: 6,
    cursor: 'ew-resize',
    zIndex: 91,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
    gap: 8,
    overflow: 'hidden',
  },
  searchInput: {
    background: 'rgba(30, 30, 50, 0.8)',
    color: 'rgba(220, 220, 230, 0.9)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 4,
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  empty: {
    color: 'rgba(140, 140, 160, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
}
