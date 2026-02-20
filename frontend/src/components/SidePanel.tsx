// Panneau latéral gauche — Explorateur documentaire, recherche, filtres, liaisons
// Barre d'invitation glassmorphique avec flèche quand fermé
// Centre de contrôle pour la visualisation : recherche, filtres couleur/forme, liaisons par thème
// Vue Liste synchronisée avec le graphe

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import type { BlocVisuel, Couleur, TypeLiaison } from '../canvas/shapes'
import type { ViewScope } from '../stores/blocsStore'

type LiaisonVisibility = 'selection' | 'all' | string

/** Filtres spécifiques au mode global */
export interface GlobalFilters {
  espaces: string[]         // IDs d'espaces sélectionnés (vide = tous)
  typesLiaison: string[]    // types filtrés (vide = tous)
  interSeulement: boolean
  poidsMin: number          // 0.0 à 1.0
  validation: string | null // 'valide' | 'en_attente' | 'rejete' | null
}

export const DEFAULT_GLOBAL_FILTERS: GlobalFilters = {
  espaces: [],
  typesLiaison: [],
  interSeulement: false,
  poidsMin: 0.0,
  validation: null,
}

interface SidePanelProps {
  blocs: BlocVisuel[]
  selectedBlocId: string | null
  onSelectBloc: (blocId: string) => void
  liaisonVisibility: LiaisonVisibility
  onLiaisonVisibilityChange: (mode: LiaisonVisibility) => void
  onSearchHighlight: (blocIds: Set<string>) => void
  // V2 : mode global
  scope: ViewScope
  espaces?: { id: string; nom: string; couleur_identite?: string }[]
  globalFilters?: GlobalFilters
  onGlobalFiltersChange?: (filters: GlobalFilters) => void
}

/** Largeur de la barre d'invitation quand le panneau est ferme */
const CLOSED_WIDTH = 24
const MAX_WIDTH = 360
const SNAP_THRESHOLD = 60

/** Palette semantique */
const COULEURS: { key: Couleur; hex: string; rgb: string; label: string }[] = [
  { key: 'green',  hex: '#1EE164', rgb: '30,225,100',  label: 'Matiere / Relation' },
  { key: 'orange', hex: '#FF8A30', rgb: '255,138,48',  label: 'Energie / Tension' },
  { key: 'yellow', hex: '#FFD638', rgb: '255,214,56',  label: 'Lumiere / Insight' },
  { key: 'blue',   hex: '#40BCFF', rgb: '64,188,255',  label: 'Logique / Raison' },
  { key: 'violet', hex: '#A260FF', rgb: '162,96,255',  label: 'Spirituel / Sens' },
  { key: 'mauve',  hex: '#D78CFF', rgb: '215,140,255', label: 'Concept en creation' },
]

const FORME_LABELS: Record<string, string> = {
  cloud: 'Intuition',
  'rounded-rect': 'Structure',
  square: 'Fondateur',
  oval: 'Processus',
  circle: 'Centre',
}

/** Labels des types de liaison pour le filtre global */
const TYPE_LIAISON_LABELS: Record<string, { label: string; couleur: string }> = {
  simple: { label: 'Simple', couleur: 'rgba(160,165,190,0.7)' },
  logique: { label: 'Logique', couleur: 'rgba(64,188,255,0.8)' },
  tension: { label: 'Tension', couleur: 'rgba(255,138,48,0.8)' },
  ancree: { label: 'Ancrée', couleur: 'rgba(162,96,255,0.8)' },
  prolongement: { label: 'Prolongement', couleur: 'rgba(64,188,255,0.7)' },
  fondation: { label: 'Fondation', couleur: 'rgba(162,96,255,0.7)' },
  complementarite: { label: 'Complément.', couleur: 'rgba(30,225,100,0.7)' },
  application: { label: 'Application', couleur: 'rgba(255,214,56,0.7)' },
  analogie: { label: 'Analogie', couleur: 'rgba(64,188,255,0.6)' },
  dependance: { label: 'Dépendance', couleur: 'rgba(215,140,255,0.7)' },
  exploration: { label: 'Exploration', couleur: 'rgba(215,140,255,0.5)' },
}

const VALIDATION_OPTIONS = [
  { key: 'valide', label: 'Validées', couleur: 'rgba(30,225,100,0.7)' },
  { key: 'en_attente', label: 'En attente', couleur: 'rgba(255,214,56,0.7)' },
  { key: 'rejete', label: 'Rejetées', couleur: 'rgba(255,100,80,0.7)' },
]

// CSS injection pour les animations
const KEYFRAMES_ID = 'sidepanel-arrow-keyframes'
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement('style')
  style.id = KEYFRAMES_ID
  style.textContent = `
    @keyframes sidepanel-arrow-pulse {
      0%, 100% { transform: translateX(0px); opacity: 0.5; }
      50% { transform: translateX(3px); opacity: 0.85; }
    }
    @keyframes sidepanel-glow {
      0%, 100% { border-right-color: rgba(180, 200, 255, 0.08); }
      50% { border-right-color: rgba(180, 200, 255, 0.18); }
    }
  `
  document.head.appendChild(style)
}

export default function SidePanel({
  blocs,
  selectedBlocId,
  onSelectBloc,
  liaisonVisibility,
  onLiaisonVisibilityChange,
  onSearchHighlight,
  scope,
  espaces: espacesAll,
  globalFilters,
  onGlobalFiltersChange,
}: SidePanelProps) {
  const isGlobal = scope === 'global'
  const [width, setWidth] = useState(CLOSED_WIDTH)
  const [search, setSearch] = useState('')
  const [filterCouleur, setFilterCouleur] = useState<Couleur | null>(null)
  const [filterForme, setFilterForme] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const dragging = useRef(false)

  const isOpen = width > SNAP_THRESHOLD

  const handleBarClick = () => {
    if (!isOpen) setWidth(300)
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = true

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const newW = Math.max(CLOSED_WIDTH, Math.min(MAX_WIDTH, ev.clientX))
      setWidth(newW)
    }

    const onUp = () => {
      dragging.current = false
      setWidth(prev => prev < SNAP_THRESHOLD ? CLOSED_WIDTH : Math.max(240, prev))
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const handleClose = () => setWidth(CLOSED_WIDTH)

  // Filtrage et tri
  const filteredBlocs = useMemo(() => {
    let result = [...blocs]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.titre.toLowerCase().includes(q) ||
        (b.sousTitre || '').toLowerCase().includes(q) ||
        b.couleur.toLowerCase().includes(q) ||
        b.forme.toLowerCase().includes(q)
      )
    }
    if (filterCouleur) result = result.filter(b => b.couleur === filterCouleur)
    if (filterForme) result = result.filter(b => b.forme === filterForme)
    result.sort((a, b) => a.titre.localeCompare(b.titre))
    return result
  }, [blocs, search, filterCouleur, filterForme])

  // Propager les IDs des blocs filtrés vers le moteur de rendu
  // Quand la recherche ou un filtre est actif, les blocs non-matchés s'estompent dans le graphe
  useEffect(() => {
    const hasActiveFilter = search.trim() || filterCouleur || filterForme
    if (hasActiveFilter) {
      onSearchHighlight(new Set(filteredBlocs.map(b => b.id)))
    } else {
      onSearchHighlight(new Set())  // Pas de filtre = tout normal
    }
  }, [filteredBlocs, search, filterCouleur, filterForme, onSearchHighlight])

  const countByCouleur = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const b of blocs) counts[b.couleur] = (counts[b.couleur] || 0) + 1
    return counts
  }, [blocs])

  // Handlers liaisons
  const isLiaisonsAll = liaisonVisibility === 'all'
  const isLiaisonsColor = liaisonVisibility !== 'selection' && liaisonVisibility !== 'all'
  const isLiaisonsActive = isLiaisonsAll || isLiaisonsColor

  const handleToggleAllLiaisons = () => {
    onLiaisonVisibilityChange(isLiaisonsAll ? 'selection' : 'all')
  }

  const handleLiaisonColorFilter = (color: string) => {
    onLiaisonVisibilityChange(liaisonVisibility === color ? 'all' : color)
  }

  const handleCouleurFilter = (key: Couleur) => {
    setFilterCouleur(prev => prev === key ? null : key)
  }

  return (
    <aside style={{ ...S.panel, width }}>

      {/* BARRE D'INVITATION (ferme) */}
      {!isOpen && (
        <div
          style={{
            ...S.closedBar,
            background: hovered ? 'rgba(20, 22, 40, 0.75)' : 'rgba(15, 17, 32, 0.55)',
            borderRightColor: hovered ? 'rgba(180, 200, 255, 0.2)' : undefined,
          }}
          onClick={handleBarClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title="Ouvrir l'explorateur"
        >
          <span style={S.arrowIcon}>{'\u203A'}</span>
          <span style={S.verticalLabel}>Explorer</span>
          {blocs.length > 0 && <span style={S.badgeCount}>{blocs.length}</span>}
        </div>
      )}

      {/* Poignee de redimensionnement */}
      <div style={S.handle} onMouseDown={onMouseDown} />

      {/* CONTENU DEPLOYE */}
      {isOpen && (
        <div style={S.content}>

          {/* En-tete */}
          <div style={S.header}>
            <span style={S.headerTitle}>Explorateur</span>
            <button onClick={handleClose} style={S.closeBtn} title="Reduire">{'\u2039'}</button>
          </div>

          {/* RECHERCHE */}
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={S.searchInput}
          />

          {/* ══════ FILTRES GRAPHE GLOBAL ══════ */}
          {isGlobal && globalFilters && onGlobalFiltersChange && (
            <div style={S.globalSection}>
              <div style={S.globalSectionTitle}>◉ Filtres Graphe Global</div>

              {/* Multi-sélection espaces */}
              {espacesAll && espacesAll.length > 0 && (
                <div style={S.globalSubSection}>
                  <div style={S.globalSubLabel}>Espaces</div>
                  <div style={S.chipRow}>
                    {espacesAll.map(e => {
                      const isActive = globalFilters.espaces.includes(e.id)
                      return (
                        <button
                          key={e.id}
                          onClick={() => {
                            const next = isActive
                              ? globalFilters.espaces.filter(x => x !== e.id)
                              : [...globalFilters.espaces, e.id]
                            onGlobalFiltersChange({ ...globalFilters, espaces: next })
                          }}
                          style={{
                            ...S.chip,
                            background: isActive ? 'rgba(255,200,100,0.12)' : 'rgba(30,33,55,0.5)',
                            borderColor: isActive ? (e.couleur_identite || 'rgba(255,200,100,0.4)') : 'rgba(70,75,110,0.2)',
                            color: isActive ? 'rgba(240,230,210,0.95)' : 'rgba(160,165,190,0.5)',
                          }}
                        >
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: e.couleur_identite || '#667788',
                            display: 'inline-block', flexShrink: 0,
                          }} />
                          {e.nom}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Inter-espaces seulement */}
              <button
                onClick={() => onGlobalFiltersChange({ ...globalFilters, interSeulement: !globalFilters.interSeulement })}
                style={{
                  ...S.globalToggle,
                  background: globalFilters.interSeulement ? 'rgba(255,200,100,0.12)' : 'rgba(30,33,55,0.4)',
                  color: globalFilters.interSeulement ? 'rgba(255,210,120,1)' : 'rgba(160,165,190,0.5)',
                  borderColor: globalFilters.interSeulement ? 'rgba(255,200,100,0.35)' : 'rgba(70,75,110,0.15)',
                }}
              >
                Inter-espaces seulement
              </button>

              {/* Types de liaison */}
              <div style={S.globalSubSection}>
                <div style={S.globalSubLabel}>Types de liaison</div>
                <div style={S.chipRow}>
                  {Object.entries(TYPE_LIAISON_LABELS).map(([key, { label, couleur }]) => {
                    const isActive = globalFilters.typesLiaison.includes(key)
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          const next = isActive
                            ? globalFilters.typesLiaison.filter(x => x !== key)
                            : [...globalFilters.typesLiaison, key]
                          onGlobalFiltersChange({ ...globalFilters, typesLiaison: next })
                        }}
                        style={{
                          ...S.chip,
                          background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(30,33,55,0.4)',
                          borderColor: isActive ? couleur : 'rgba(70,75,110,0.15)',
                          color: isActive ? couleur : 'rgba(160,165,190,0.4)',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Poids minimum (slider) */}
              <div style={S.globalSubSection}>
                <div style={S.globalSubLabel}>Poids minimum : {globalFilters.poidsMin.toFixed(1)}</div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={globalFilters.poidsMin}
                  onChange={(e) => onGlobalFiltersChange({ ...globalFilters, poidsMin: parseFloat(e.target.value) })}
                  style={S.slider}
                />
              </div>

              {/* Validation */}
              <div style={S.globalSubSection}>
                <div style={S.globalSubLabel}>Validation</div>
                <div style={S.chipRow}>
                  {VALIDATION_OPTIONS.map(v => {
                    const isActive = globalFilters.validation === v.key
                    return (
                      <button
                        key={v.key}
                        onClick={() => onGlobalFiltersChange({
                          ...globalFilters,
                          validation: isActive ? null : v.key,
                        })}
                        style={{
                          ...S.chip,
                          background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(30,33,55,0.4)',
                          borderColor: isActive ? v.couleur : 'rgba(70,75,110,0.15)',
                          color: isActive ? v.couleur : 'rgba(160,165,190,0.4)',
                        }}
                      >
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Reset global */}
              {(globalFilters.espaces.length > 0 || globalFilters.typesLiaison.length > 0 ||
                globalFilters.interSeulement || globalFilters.poidsMin > 0 || globalFilters.validation) && (
                <button
                  onClick={() => onGlobalFiltersChange({ ...DEFAULT_GLOBAL_FILTERS })}
                  style={S.resetBtn}
                >
                  Réinitialiser les filtres globaux
                </button>
              )}
            </div>
          )}

          {/* FILTRES COULEUR */}
          <div style={S.section}>
            <div style={S.sectionTitle}>Couleurs</div>
            <div style={S.colorRow}>
              {COULEURS.map(c => {
                const isSelected = filterCouleur === c.key
                const count = countByCouleur[c.key] || 0
                return (
                  <button
                    key={c.key}
                    onClick={() => handleCouleurFilter(c.key)}
                    style={{
                      ...S.colorBtn,
                      background: isSelected ? `rgba(${c.rgb}, 0.18)` : 'transparent',
                      borderColor: isSelected ? `rgba(${c.rgb}, 0.45)` : 'rgba(60, 60, 90, 0.15)',
                    }}
                    title={`${c.label} (${count} blocs)`}
                  >
                    <span style={{
                      ...S.colorDot,
                      background: count > 0 ? `rgba(${c.rgb}, ${isSelected ? 1 : 0.6})` : `rgba(${c.rgb}, 0.15)`,
                      boxShadow: isSelected ? `0 0 6px rgba(${c.rgb}, 0.5)` : 'none',
                    }} />
                    <span style={{ fontSize: 10, color: isSelected ? `rgba(${c.rgb}, 1)` : 'rgba(140,140,160,0.45)' }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div style={S.formeRow}>
              {Object.entries(FORME_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterForme(prev => prev === key ? null : key)}
                  style={{
                    ...S.formeBtn,
                    color: filterForme === key ? 'rgba(255, 200, 100, 0.9)' : 'rgba(140, 140, 160, 0.45)',
                    background: filterForme === key ? 'rgba(255, 200, 100, 0.08)' : 'transparent',
                  }}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
            {(filterCouleur || filterForme || search) && (
              <button
                onClick={() => { setFilterCouleur(null); setFilterForme(null); setSearch('') }}
                style={S.resetBtn}
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {/* LIAISONS — section mise en valeur */}
          <div style={S.liaisonSection}>
            <div style={S.liaisonSectionTitle}>Liaisons</div>

            {/* Bouton principal toggle */}
            <button
              onClick={handleToggleAllLiaisons}
              style={{
                ...S.liaisonToggle,
                background: isLiaisonsActive ? 'rgba(255, 200, 100, 0.15)' : 'rgba(35, 38, 60, 0.6)',
                color: isLiaisonsActive ? 'rgba(255, 210, 120, 1)' : 'rgba(180, 185, 210, 0.7)',
                borderColor: isLiaisonsActive ? 'rgba(255, 200, 100, 0.35)' : 'rgba(80, 85, 120, 0.25)',
                boxShadow: isLiaisonsActive
                  ? '0 0 12px rgba(255, 200, 100, 0.1), inset 0 0 20px rgba(255, 200, 100, 0.03)'
                  : 'none',
              }}
            >
              {isLiaisonsAll ? 'Toutes les liaisons' : isLiaisonsColor ? 'Filtrees par couleur' : 'Sur selection'}
            </button>

            {/* Grille de couleurs — bien visible */}
            <div style={S.liaisonColorGrid}>
              {COULEURS.map(c => {
                const isActive = liaisonVisibility === c.key
                return (
                  <button
                    key={c.key}
                    onClick={() => handleLiaisonColorFilter(c.key)}
                    style={{
                      ...S.liaisonColorBtn,
                      background: isActive ? `rgba(${c.rgb}, 0.15)` : 'rgba(25, 28, 45, 0.4)',
                      borderColor: isActive ? `rgba(${c.rgb}, 0.5)` : 'rgba(70, 75, 110, 0.15)',
                      boxShadow: isActive
                        ? `0 0 10px rgba(${c.rgb}, 0.2), inset 0 0 15px rgba(${c.rgb}, 0.05)`
                        : 'none',
                    }}
                    title={c.label}
                  >
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: `rgba(${c.rgb}, ${isActive ? 1 : 0.55})`,
                      display: 'inline-block', flexShrink: 0,
                      boxShadow: isActive
                        ? `0 0 8px rgba(${c.rgb}, 0.7), 0 0 2px rgba(${c.rgb}, 1)`
                        : `0 0 3px rgba(${c.rgb}, 0.2)`,
                      transition: 'all 0.2s',
                    }} />
                    <span style={{
                      fontSize: 11, fontWeight: isActive ? 600 : 400,
                      color: isActive ? `rgba(${c.rgb}, 1)` : 'rgba(170, 175, 200, 0.55)',
                      transition: 'all 0.15s',
                    }}>
                      {c.label.split(' / ')[0]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* LISTE DES BLOCS */}
          <div style={S.listHeader}>
            {filteredBlocs.length} / {blocs.length} blocs
          </div>
          <div style={S.list}>
            {filteredBlocs.length === 0 && (
              <div style={S.empty}>{blocs.length === 0 ? 'Espace vide' : 'Aucun resultat'}</div>
            )}
            {filteredBlocs.map(bloc => {
              const c = COULEURS.find(c => c.key === bloc.couleur)
              const rgb = c?.rgb || '140,140,160'
              const isSel = bloc.id === selectedBlocId
              return (
                <div
                  key={bloc.id}
                  onClick={() => onSelectBloc(bloc.id)}
                  style={{
                    ...S.item,
                    background: isSel ? `rgba(${rgb}, 0.1)` : 'rgba(25, 25, 45, 0.2)',
                    borderColor: isSel ? `rgba(${rgb}, 0.35)` : 'rgba(60, 60, 90, 0.1)',
                  }}
                >
                  <span style={{
                    ...S.dot,
                    background: `rgba(${rgb}, ${isSel ? 1 : 0.55})`,
                    boxShadow: isSel ? `0 0 5px rgba(${rgb}, 0.4)` : 'none',
                  }} />
                  <div style={S.itemContent}>
                    <span style={S.itemTitle}>{bloc.titre || `Bloc ${bloc.id.slice(0, 6)}`}</span>
                    {bloc.sousTitre && <span style={S.itemSub}>{bloc.sousTitre}</span>}
                    <span style={S.itemMeta}>{FORME_LABELS[bloc.forme] || bloc.forme}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}

// ======================================================================
// STYLES
// ======================================================================

const S: Record<string, React.CSSProperties> = {

  // -- Panneau principal --
  panel: {
    position: 'fixed', top: 40, left: 0, bottom: 32,
    background: 'rgba(12, 14, 24, 0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(120, 140, 200, 0.1)',
    zIndex: 90, display: 'flex', flexDirection: 'row', overflow: 'hidden',
    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // -- Barre d'invitation (ferme) --
  closedBar: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: CLOSED_WIDTH,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 12, cursor: 'pointer',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(140, 160, 220, 0.1)',
    animation: 'sidepanel-glow 4s ease-in-out infinite',
    transition: 'background 0.3s, border-right-color 0.3s',
    zIndex: 2,
  },
  arrowIcon: {
    fontSize: 18, color: 'rgba(180, 200, 255, 0.55)', fontWeight: 300,
    animation: 'sidepanel-arrow-pulse 2.5s ease-in-out infinite', lineHeight: 1,
  },
  verticalLabel: {
    writingMode: 'vertical-rl' as const, textOrientation: 'mixed' as const,
    fontSize: 9, fontWeight: 500, letterSpacing: '2px',
    color: 'rgba(160, 175, 220, 0.35)', textTransform: 'uppercase' as const,
    userSelect: 'none' as const,
  },
  badgeCount: {
    fontSize: 9, fontWeight: 600, color: 'rgba(180, 200, 255, 0.45)',
    background: 'rgba(80, 100, 160, 0.15)', borderRadius: 8,
    padding: '1px 5px', lineHeight: '14px',
  },

  // -- Poignee --
  handle: {
    position: 'absolute', top: 0, right: -4, bottom: 0, width: 8,
    cursor: 'ew-resize', zIndex: 91,
  },

  // -- Contenu deploye --
  content: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '8px 10px', gap: 4, overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2,
  },
  headerTitle: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
    color: 'rgba(180, 195, 230, 0.6)', textTransform: 'uppercase' as const,
  },
  closeBtn: {
    background: 'transparent', border: 'none', color: 'rgba(160, 170, 200, 0.5)',
    fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },

  // -- Recherche --
  searchInput: {
    background: 'rgba(25, 28, 48, 0.7)', color: 'rgba(220, 220, 230, 0.9)',
    border: '1px solid rgba(100, 110, 160, 0.2)', borderRadius: 6,
    padding: '7px 10px', fontSize: 12, outline: 'none',
    width: '100%', boxSizing: 'border-box' as const,
  },

  // -- Sections generiques --
  section: {
    display: 'flex', flexDirection: 'column' as const, gap: 5,
    padding: '6px 0', borderBottom: '1px solid rgba(80, 90, 130, 0.1)',
  },
  sectionTitle: {
    fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const,
    letterSpacing: '1.2px', color: 'rgba(140, 155, 190, 0.35)',
  },

  // -- Filtres couleur --
  colorRow: { display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' as const },
  colorBtn: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px',
    borderRadius: 10, border: '1px solid', cursor: 'pointer',
    transition: 'all 0.15s', background: 'transparent',
  },
  colorDot: {
    width: 10, height: 10, borderRadius: '50%',
    display: 'inline-block', transition: 'all 0.15s',
  },

  // -- Filtres forme --
  formeRow: { display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' as const },
  formeBtn: {
    border: 'none', borderRadius: 3, padding: '2px 6px',
    fontSize: 10, cursor: 'pointer', transition: 'all 0.15s', background: 'transparent',
  },
  resetBtn: {
    background: 'transparent', border: 'none', color: 'rgba(200, 120, 120, 0.5)',
    fontSize: 10, cursor: 'pointer', padding: '2px 0', textAlign: 'left' as const,
  },

  // -- LIAISONS — section mise en valeur --
  liaisonSection: {
    display: 'flex', flexDirection: 'column' as const, gap: 8,
    padding: '12px 8px', margin: '4px -8px',
    background: 'rgba(25, 28, 50, 0.4)',
    borderRadius: 8,
    border: '1px solid rgba(100, 120, 180, 0.12)',
  },
  liaisonSectionTitle: {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.8px',
    color: 'rgba(210, 220, 250, 0.65)',
  },
  liaisonToggle: {
    border: '1px solid', borderRadius: 6,
    padding: '9px 14px', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.25s',
    textAlign: 'center' as const, width: '100%',
    boxSizing: 'border-box' as const, background: 'transparent',
    letterSpacing: '0.3px',
  },
  liaisonColorGrid: {
    display: 'flex', flexDirection: 'column' as const, gap: 3,
  },
  liaisonColorBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 12px', borderRadius: 6,
    border: '1px solid', cursor: 'pointer',
    transition: 'all 0.2s', background: 'transparent',
  },

  // -- Filtres graphe global --
  globalSection: {
    display: 'flex', flexDirection: 'column' as const, gap: 8,
    padding: '10px 8px', margin: '4px -8px',
    background: 'rgba(255, 200, 100, 0.03)',
    borderRadius: 8,
    border: '1px solid rgba(255, 200, 100, 0.12)',
  },
  globalSectionTitle: {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.6px',
    color: 'rgba(255, 210, 120, 0.7)',
  },
  globalSubSection: {
    display: 'flex', flexDirection: 'column' as const, gap: 4,
  },
  globalSubLabel: {
    fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const,
    letterSpacing: '1px', color: 'rgba(180, 190, 220, 0.4)',
  },
  chipRow: {
    display: 'flex', flexWrap: 'wrap' as const, gap: 4,
  },
  chip: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '3px 8px', borderRadius: 12,
    border: '1px solid', cursor: 'pointer',
    fontSize: 10, fontWeight: 500,
    transition: 'all 0.15s', background: 'transparent',
    lineHeight: '16px',
  },
  globalToggle: {
    border: '1px solid', borderRadius: 6,
    padding: '6px 10px', fontSize: 11, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s',
    textAlign: 'center' as const, width: '100%',
    boxSizing: 'border-box' as const, background: 'transparent',
  },
  slider: {
    width: '100%', accentColor: 'rgba(255, 200, 100, 0.7)',
    height: 4, cursor: 'pointer',
  },

  // -- Liste des blocs --
  listHeader: {
    fontSize: 9, color: 'rgba(140, 155, 190, 0.35)',
    textAlign: 'center' as const, padding: '4px 0 2px',
  },
  list: {
    flex: 1, overflowY: 'auto' as const, overflowX: 'hidden' as const,
    display: 'flex', flexDirection: 'column' as const, gap: 2,
  },
  empty: {
    color: 'rgba(140, 155, 190, 0.4)', fontSize: 11,
    textAlign: 'center' as const, marginTop: 20,
  },
  item: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '5px 8px', borderRadius: 4,
    border: '1px solid', cursor: 'pointer', transition: 'background 0.1s',
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    flexShrink: 0, marginTop: 3, transition: 'all 0.15s',
  },
  itemContent: { flex: 1, overflow: 'hidden' },
  itemTitle: {
    display: 'block', color: 'rgba(200, 205, 225, 0.85)',
    fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const, lineHeight: '16px',
  },
  itemSub: {
    display: 'block', color: 'rgba(160, 165, 190, 0.4)',
    fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const, lineHeight: '14px',
  },
  itemMeta: {
    display: 'block', color: 'rgba(140, 150, 180, 0.3)',
    fontSize: 9, lineHeight: '12px',
  },
}
