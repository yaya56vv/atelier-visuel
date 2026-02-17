// Panneau latéral gauche — Explorateur documentaire, recherche, filtres
// Ligne verticale discrète, déploiement par cliquer-tirer vers le centre
// Jamais modale, jamais popup, jamais overlay opaque
// Vue Liste synchronisée avec le graphe

import { useState, useRef, useCallback, useMemo } from 'react'
import type { BlocVisuel } from '../canvas/shapes'

interface SidePanelProps {
  blocs: BlocVisuel[]
  selectedBlocId: string | null
  onSelectBloc: (blocId: string) => void
}

const MIN_WIDTH = 4
const MAX_WIDTH = 320
const SNAP_THRESHOLD = 40

const COULEUR_DOTS: Record<string, string> = {
  green: '#64A050',
  orange: '#C88C32',
  yellow: '#C8B43C',
  blue: '#4664A0',
  violet: '#824696',
  mauve: '#965082',
}

const FORME_LABELS: Record<string, string> = {
  cloud: 'Intuition',
  'rounded-rect': 'Structuré',
  square: 'Fondateur',
  oval: 'Processus',
  circle: 'Centre',
}

export default function SidePanel({ blocs, selectedBlocId, onSelectBloc }: SidePanelProps) {
  const [width, setWidth] = useState(MIN_WIDTH)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'titre' | 'couleur' | 'forme'>('titre')
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
      setWidth(prev => prev < SNAP_THRESHOLD ? MIN_WIDTH : Math.max(200, prev))
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  // Filtrage et tri
  const filteredBlocs = useMemo(() => {
    let result = [...blocs]

    // Filtrage par recherche
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.titre.toLowerCase().includes(q) ||
        b.couleur.toLowerCase().includes(q) ||
        b.forme.toLowerCase().includes(q)
      )
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === 'titre') return a.titre.localeCompare(b.titre)
      if (sortBy === 'couleur') return a.couleur.localeCompare(b.couleur)
      return a.forme.localeCompare(b.forme)
    })

    return result
  }, [blocs, search, sortBy])

  return (
    <aside style={{ ...styles.panel, width }}>
      {/* Poignée de redimensionnement */}
      <div
        style={styles.handle}
        onMouseDown={onMouseDown}
        title="Tirer pour déployer"
      />

      {isOpen && (
        <div style={styles.content}>
          {/* Recherche */}
          <input
            type="text"
            placeholder="Rechercher (titre, couleur, forme)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          {/* Barre de tri */}
          <div style={styles.sortBar}>
            <span style={styles.sortLabel}>Trier :</span>
            {(['titre', 'couleur', 'forme'] as const).map(key => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                style={{
                  ...styles.sortBtn,
                  color: sortBy === key ? 'rgba(80, 200, 120, 0.9)' : 'rgba(140, 140, 160, 0.6)',
                }}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Liste des blocs */}
          <div style={styles.list}>
            {filteredBlocs.length === 0 && (
              <div style={styles.empty}>
                {blocs.length === 0 ? 'Aucun bloc' : 'Aucun résultat'}
              </div>
            )}
            {filteredBlocs.map(bloc => (
              <div
                key={bloc.id}
                onClick={() => onSelectBloc(bloc.id)}
                style={{
                  ...styles.item,
                  background: bloc.id === selectedBlocId
                    ? 'rgba(60, 160, 90, 0.15)'
                    : 'rgba(30, 30, 50, 0.3)',
                  borderColor: bloc.id === selectedBlocId
                    ? 'rgba(80, 200, 120, 0.3)'
                    : 'rgba(60, 60, 90, 0.2)',
                }}
              >
                {/* Pastille couleur */}
                <span style={{
                  ...styles.dot,
                  background: COULEUR_DOTS[bloc.couleur] || '#666',
                }} />
                <div style={styles.itemContent}>
                  <span style={styles.itemTitle}>
                    {bloc.titre || `Bloc ${bloc.id.slice(0, 6)}`}
                  </span>
                  <span style={styles.itemMeta}>
                    {FORME_LABELS[bloc.forme] || bloc.forme}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Compteur */}
          <div style={styles.counter}>
            {filteredBlocs.length} / {blocs.length} blocs
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
    gap: 6,
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
  sortBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  sortLabel: {
    color: 'rgba(140, 140, 160, 0.5)',
    fontSize: 10,
  },
  sortBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 10,
    cursor: 'pointer',
    padding: '2px 4px',
    textTransform: 'capitalize' as const,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  empty: {
    color: 'rgba(140, 140, 160, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 4,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    overflow: 'hidden',
  },
  itemTitle: {
    display: 'block',
    color: 'rgba(200, 200, 220, 0.9)',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  itemMeta: {
    display: 'block',
    color: 'rgba(140, 140, 160, 0.5)',
    fontSize: 10,
  },
  counter: {
    color: 'rgba(140, 140, 160, 0.4)',
    fontSize: 10,
    textAlign: 'center',
    paddingTop: 4,
  },
}
