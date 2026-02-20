// Canvas2D — Interactions
// Drag & drop, zoom, pan, sélection, hit-testing, curseur contextuel
// Création de liaison par glisser de connecteur
// Hit-test des liaisons, menu contextuel couleur

import { THEME, lightenRGB } from './theme'
import { isPointInBloc, hitTestShapeButton, getShapeButtonPos, getConnectorPoints, SHAPE_BUTTON, type BlocVisuel, type LiaisonVisuelle, type Couleur, type Forme } from './shapes'
import type { CanvasEngine } from './engine'

// ─── Types ────────────────────────────────────────────────

type InteractionMode =
  | 'idle'
  | 'pan'
  | 'drag-bloc'
  | 'drag-connector'
  | 'resize'

interface DragState {
  mode: InteractionMode
  startX: number
  startY: number
  blocId: string | null
  startOffsetX: number
  startOffsetY: number
  connectorSourceId: string | null
  connectorEndX: number
  connectorEndY: number
  resizeEdge: string | null
  startW: number
  startH: number
  startBlocX: number
  startBlocY: number
}

// ─── Constantes ───────────────────────────────────────────

const CONNECTOR_HIT_RADIUS = 18    // Zone de clic agrandie pour les connecteurs
const CONNECTOR_SHOW_RADIUS = 40   // Distance à la bordure pour montrer les connecteurs au survol
const BORDER_HIT_WIDTH = 12        // Zone de clic agrandie pour le resize
const LIAISON_HIT_DISTANCE = 12    // Distance max du clic à la courbe pour sélectionner une liaison
const ZOOM_FACTOR = 1.08
const ZOOM_MIN = 0.1
const ZOOM_MAX = 5

// ─── Fonctions utilitaires ────────────────────────────────

/** Vérifie si un point est proche d'un connecteur d'un bloc.
 * Utilise getConnectorPoints de shapes.ts pour un positionnement précis sur le contour.
 */
function hitTestConnector(bloc: BlocVisuel, wx: number, wy: number): boolean {
  for (const { px, py } of getConnectorPoints(bloc)) {
    const dx = wx - px
    const dy = wy - py
    if (dx * dx + dy * dy <= CONNECTOR_HIT_RADIUS * CONNECTOR_HIT_RADIUS) {
      return true
    }
  }
  return false
}

/** Vérifie si la souris est assez proche de la bordure pour voir les connecteurs. */
function isNearBorder(bloc: BlocVisuel, wx: number, wy: number): boolean {
  const { x, y, w, h } = bloc
  const margin = CONNECTOR_SHOW_RADIUS
  // Est-on dans le bloc élargi mais pas trop à l'intérieur ?
  const inOuter = wx >= x - margin && wx <= x + w + margin && wy >= y - margin && wy <= y + h + margin
  const inInner = wx >= x + margin && wx <= x + w - margin && wy >= y + margin && wy <= y + h - margin
  return inOuter && !inInner
}

/** Vérifie si un point est sur la bordure d'un bloc (pour resize).
 * Fonctionne pour toutes les formes : utilise le rectangle englobant
 * car le resize agit toujours sur le bounding box.
 * Zone de hit élargie pour faciliter le ciblage.
 */
function hitTestBorder(bloc: BlocVisuel, wx: number, wy: number): string | null {
  const { x, y, w, h } = bloc
  // Zone de hit plus généreuse : la moitié à l'intérieur, la moitié à l'extérieur
  const outer = BORDER_HIT_WIDTH
  const inner = BORDER_HIT_WIDTH

  // D'abord vérifier qu'on est dans la zone élargie du bloc
  if (wx < x - outer || wx > x + w + outer || wy < y - outer || wy > y + h + outer) return null
  // Et qu'on n'est PAS trop à l'intérieur (sinon c'est un drag, pas un resize)
  const deepInside = wx > x + inner && wx < x + w - inner && wy > y + inner && wy < y + h - inner
  if (deepInside) return null

  // Déterminer quel bord on touche
  const nearLeft = wx <= x + inner
  const nearRight = wx >= x + w - inner
  const nearTop = wy <= y + inner
  const nearBottom = wy >= y + h - inner

  if (nearTop && nearLeft) return 'nw'
  if (nearTop && nearRight) return 'ne'
  if (nearBottom && nearLeft) return 'sw'
  if (nearBottom && nearRight) return 'se'
  if (nearLeft) return 'w'
  if (nearRight) return 'e'
  if (nearTop) return 'n'
  if (nearBottom) return 's'
  return null
}

/**
 * Point le plus proche sur une courbe de Bézier cubique.
 * Échantillonne la courbe et retourne la distance minimale.
 */
function distanceToBezier(
  wx: number, wy: number,
  x1: number, y1: number,
  x2: number, y2: number,
  bloc1: BlocVisuel, bloc2: BlocVisuel,
): number {
  const L = THEME.liaison
  const dx = x2 - x1
  const dy = y2 - y1
  const cx1 = x1 + dx * L.controlPointFactor1 + dy * L.controlPointPerpFactor
  const cy1 = y1 + dy * L.controlPointFactor1 - dx * L.controlPointPerpFactor
  const cx2 = x1 + dx * L.controlPointFactor2 - dy * L.controlPointPerpFactor
  const cy2 = y1 + dy * L.controlPointFactor2 + dx * L.controlPointPerpFactor

  let minDist = Infinity
  const steps = 30
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const invT = 1 - t
    // Bézier cubique
    const bx = invT * invT * invT * x1
      + 3 * invT * invT * t * cx1
      + 3 * invT * t * t * cx2
      + t * t * t * x2
    const by = invT * invT * invT * y1
      + 3 * invT * invT * t * cy1
      + 3 * invT * t * t * cy2
      + t * t * t * y2
    const ddx = wx - bx
    const ddy = wy - by
    const dist = Math.sqrt(ddx * ddx + ddy * ddy)
    if (dist < minDist) minDist = dist
  }
  return minDist
}

/**
 * Hit-test sur les liaisons. Retourne la liaison la plus proche sous le curseur.
 */
function findLiaisonAt(
  wx: number, wy: number,
  liaisons: LiaisonVisuelle[],
  blocs: BlocVisuel[],
  selectedBlocIds: Set<string>,
): LiaisonVisuelle | null {
  const blocMap = new Map<string, BlocVisuel>()
  for (const b of blocs) blocMap.set(b.id, b)

  let closestLiaison: LiaisonVisuelle | null = null
  let closestDist = LIAISON_HIT_DISTANCE

  for (const l of liaisons) {
    // Seules les liaisons visibles sont cliquables
    const isVisible = l.type === 'ancree'
      || selectedBlocIds.has(l.sourceId)
      || selectedBlocIds.has(l.cibleId)
    if (!isVisible) continue

    const source = blocMap.get(l.sourceId)
    const cible = blocMap.get(l.cibleId)
    if (!source || !cible) continue

    const sx = source.x + source.w / 2
    const sy = source.y + source.h / 2
    const tx = cible.x + cible.w / 2
    const ty = cible.y + cible.h / 2

    const dist = distanceToBezier(wx, wy, sx, sy, tx, ty, source, cible)
    if (dist < closestDist) {
      closestDist = dist
      closestLiaison = l
    }
  }

  return closestLiaison
}

/** Retourne le curseur CSS adapté à la zone. */
function getCursor(edge: string | null, overBloc: boolean, overConnector: boolean, overLiaison: boolean): string {
  if (overConnector) return 'crosshair'
  if (overLiaison) return 'pointer'
  if (edge) {
    const map: Record<string, string> = {
      n: 'ns-resize', s: 'ns-resize',
      e: 'ew-resize', w: 'ew-resize',
      nw: 'nwse-resize', se: 'nwse-resize',
      ne: 'nesw-resize', sw: 'nesw-resize',
    }
    return map[edge] || 'default'
  }
  if (overBloc) return 'grab'
  return 'default'
}

// ─── Palette de couleurs pour liaisons (overlay HTML) ─────

function createColorPalette(
  screenX: number,
  screenY: number,
  currentCouleur: Couleur,
  onSelect: (couleur: Couleur) => void,
  onDelete: () => void,
): HTMLDivElement {
  // Supprimer toute palette existante
  document.querySelectorAll('.liaison-palette').forEach(el => el.remove())

  const palette = document.createElement('div')
  palette.className = 'liaison-palette'
  Object.assign(palette.style, {
    position: 'fixed',
    left: `${screenX}px`,
    top: `${screenY}px`,
    transform: 'translate(-50%, -100%) translateY(-8px)',
    background: 'rgba(10, 10, 20, 0.92)',
    backdropFilter: 'blur(15px)',
    borderRadius: '12px',
    border: '1px solid rgba(64, 188, 255, 0.3)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: '2000',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    minWidth: '160px',
  })

  // Les 6 couleurs
  const couleurs: Couleur[] = ['green', 'orange', 'yellow', 'blue', 'violet', 'mauve']
  for (const c of couleurs) {
    const colors = THEME.colors[c]
    const row = document.createElement('div')
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 8px',
      borderRadius: '6px',
      cursor: 'pointer',
      background: c === currentCouleur ? 'rgba(255,200,100,0.15)' : 'transparent',
      border: c === currentCouleur ? '1px solid rgba(255,200,100,0.4)' : '1px solid transparent',
      transition: 'background 0.15s',
    })
    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(255,255,255,0.08)'
    })
    row.addEventListener('mouseleave', () => {
      row.style.background = c === currentCouleur ? 'rgba(255,200,100,0.15)' : 'transparent'
    })

    // Pastille de couleur
    const dot = document.createElement('div')
    Object.assign(dot.style, {
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      background: `rgba(${colors.rgb}, 0.9)`,
      boxShadow: `0 0 8px rgba(${colors.rgb}, 0.5)`,
      flexShrink: '0',
    })

    // Label
    const label = document.createElement('span')
    Object.assign(label.style, {
      color: 'rgba(220, 220, 230, 0.85)',
      fontSize: '11px',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
    })
    label.textContent = colors.label

    row.appendChild(dot)
    row.appendChild(label)
    row.addEventListener('click', (e) => {
      e.stopPropagation()
      onSelect(c)
      palette.remove()
    })
    palette.appendChild(row)
  }

  // Séparateur
  const sep = document.createElement('div')
  Object.assign(sep.style, {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '2px 0',
  })
  palette.appendChild(sep)

  // Bouton supprimer
  const deleteRow = document.createElement('div')
  Object.assign(deleteRow.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  })
  deleteRow.addEventListener('mouseenter', () => {
    deleteRow.style.background = 'rgba(255,80,80,0.15)'
  })
  deleteRow.addEventListener('mouseleave', () => {
    deleteRow.style.background = 'transparent'
  })
  const deleteLabel = document.createElement('span')
  Object.assign(deleteLabel.style, {
    color: 'rgba(255, 100, 100, 0.9)',
    fontSize: '11px',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  })
  deleteLabel.textContent = '✕ Supprimer la liaison'
  deleteRow.appendChild(deleteLabel)
  deleteRow.addEventListener('click', (e) => {
    e.stopPropagation()
    onDelete()
    palette.remove()
  })
  palette.appendChild(deleteRow)

  // Fermer si clic ailleurs
  const closeHandler = (e: MouseEvent) => {
    if (!palette.contains(e.target as Node)) {
      palette.remove()
      document.removeEventListener('mousedown', closeHandler)
    }
  }
  // Délai pour ne pas capturer le clic d'ouverture
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 50)

  document.body.appendChild(palette)
  return palette
}

// ─── Labels des formes ────────────────────────────────────

const FORME_LABELS: Record<Forme, { icon: string; label: string }> = {
  cloud:        { icon: '☁', label: 'Intuition vivante' },
  'rounded-rect': { icon: '▭', label: 'Idée structurée' },
  square:       { icon: '■', label: 'Texte fondateur' },
  oval:         { icon: '⬭', label: 'Processus' },
  circle:       { icon: '●', label: 'Cœur / Centre' },
}

const ALL_FORMES: Forme[] = ['cloud', 'rounded-rect', 'square', 'oval', 'circle']
const ALL_COULEURS: Couleur[] = ['green', 'orange', 'yellow', 'blue', 'violet', 'mauve']

// ─── Popup Forme/Couleur du bloc ─────────────────────────

function createShapeColorPopup(
  screenX: number,
  screenY: number,
  currentForme: Forme,
  currentCouleur: Couleur,
  onForme: (forme: Forme) => void,
  onCouleur: (couleur: Couleur) => void,
): HTMLDivElement {
  document.querySelectorAll('.shape-color-popup, .liaison-palette').forEach(el => el.remove())

  const popup = document.createElement('div')
  popup.className = 'shape-color-popup'
  Object.assign(popup.style, {
    position: 'fixed',
    left: `${screenX + 4}px`,
    top: `${screenY}px`,
    background: 'rgba(10, 10, 20, 0.94)',
    backdropFilter: 'blur(18px)',
    borderRadius: '12px',
    border: '1px solid rgba(255,200,100, 0.25)',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    zIndex: '2000',
    boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
    minWidth: '175px',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  })

  // === SECTION FORMES ===
  const formeTitle = document.createElement('div')
  Object.assign(formeTitle.style, {
    color: 'rgba(255,200,100,0.8)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0 6px 4px',
  })
  formeTitle.textContent = 'Forme'
  popup.appendChild(formeTitle)

  for (const f of ALL_FORMES) {
    const info = FORME_LABELS[f]
    const isCurrent = f === currentForme
    const row = document.createElement('div')
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 6px',
      borderRadius: '6px',
      cursor: 'pointer',
      background: isCurrent ? 'rgba(255,200,100,0.15)' : 'transparent',
      border: isCurrent ? '1px solid rgba(255,200,100,0.35)' : '1px solid transparent',
      transition: 'background 0.12s',
    })
    row.addEventListener('mouseenter', () => {
      if (!isCurrent) row.style.background = 'rgba(255,255,255,0.06)'
    })
    row.addEventListener('mouseleave', () => {
      row.style.background = isCurrent ? 'rgba(255,200,100,0.15)' : 'transparent'
    })

    const icon = document.createElement('span')
    Object.assign(icon.style, { fontSize: '14px', width: '18px', textAlign: 'center' })
    icon.textContent = info.icon

    const label = document.createElement('span')
    Object.assign(label.style, {
      color: isCurrent ? 'rgba(255,220,150,0.95)' : 'rgba(200,200,210,0.8)',
      fontSize: '11px',
    })
    label.textContent = info.label

    row.appendChild(icon)
    row.appendChild(label)
    row.addEventListener('click', (e) => {
      e.stopPropagation()
      onForme(f)
      popup.remove()
    })
    popup.appendChild(row)
  }

  // Séparateur
  const sep = document.createElement('div')
  Object.assign(sep.style, { height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' })
  popup.appendChild(sep)

  // === SECTION COULEURS ===
  const colorTitle = document.createElement('div')
  Object.assign(colorTitle.style, {
    color: 'rgba(255,200,100,0.8)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0 6px 4px',
  })
  colorTitle.textContent = 'Couleur'
  popup.appendChild(colorTitle)

  for (const c of ALL_COULEURS) {
    const colors = THEME.colors[c]
    const isCurrent = c === currentCouleur
    const row = document.createElement('div')
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 6px',
      borderRadius: '6px',
      cursor: 'pointer',
      background: isCurrent ? 'rgba(255,200,100,0.15)' : 'transparent',
      border: isCurrent ? '1px solid rgba(255,200,100,0.35)' : '1px solid transparent',
      transition: 'background 0.12s',
    })
    row.addEventListener('mouseenter', () => {
      if (!isCurrent) row.style.background = 'rgba(255,255,255,0.06)'
    })
    row.addEventListener('mouseleave', () => {
      row.style.background = isCurrent ? 'rgba(255,200,100,0.15)' : 'transparent'
    })

    const dot = document.createElement('div')
    Object.assign(dot.style, {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: `rgba(${colors.rgb}, 0.9)`,
      boxShadow: `0 0 6px rgba(${colors.rgb}, 0.5)`,
      flexShrink: '0',
    })

    const label = document.createElement('span')
    Object.assign(label.style, {
      color: isCurrent ? 'rgba(255,220,150,0.95)' : 'rgba(200,200,210,0.8)',
      fontSize: '11px',
    })
    label.textContent = colors.label

    row.appendChild(dot)
    row.appendChild(label)
    row.addEventListener('click', (e) => {
      e.stopPropagation()
      onCouleur(c)
      popup.remove()
    })
    popup.appendChild(row)
  }

  // Fermer si clic ailleurs
  const closeHandler = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) {
      popup.remove()
      document.removeEventListener('mousedown', closeHandler)
    }
  }
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 50)

  document.body.appendChild(popup)
  return popup
}

// ─── Classe principale ───────────────────────────────────

export class InteractionManager {
  private engine: CanvasEngine
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private drag: DragState = {
    mode: 'idle',
    startX: 0,
    startY: 0,
    blocId: null,
    startOffsetX: 0,
    startOffsetY: 0,
    connectorSourceId: null,
    connectorEndX: 0,
    connectorEndY: 0,
    resizeEdge: null,
    startW: 0,
    startH: 0,
    startBlocX: 0,
    startBlocY: 0,
  }
  private hoveredBlocId: string | null = null
  private selectedLiaisonId: string | null = null
  /** Blocs dont les connecteurs sont visibles (survol proche de la bordure) */
  private showConnectorsFor: Set<string> = new Set()

  // Callbacks
  onBlocSelect?: (blocId: string | null) => void
  onBlocMove?: (blocId: string, x: number, y: number) => void
  onBlocResize?: (blocId: string, w: number, h: number) => void
  onLiaisonCreate?: (sourceId: string, cibleId: string) => void
  onLiaisonDelete?: (liaisonId: string) => void
  onLiaisonRecolor?: (liaisonId: string, couleur: Couleur) => void
  onBlocChangeForme?: (blocId: string, forme: Forme) => void
  onBlocChangeCouleur?: (blocId: string, couleur: Couleur) => void

  constructor(engine: CanvasEngine, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.engine = engine
    this.canvas = canvas
    this.ctx = ctx
  }

  attach() {
    this.canvas.addEventListener('mousedown', this.onMouseDown)
    this.canvas.addEventListener('mousemove', this.onMouseMove)
    this.canvas.addEventListener('mouseup', this.onMouseUp)
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false })
    this.canvas.addEventListener('dblclick', this.onDblClick)
    this.canvas.addEventListener('contextmenu', this.onContextMenu)
  }

  detach() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)
    this.canvas.removeEventListener('wheel', this.onWheel)
    this.canvas.removeEventListener('dblclick', this.onDblClick)
    this.canvas.removeEventListener('contextmenu', this.onContextMenu)
    // Nettoyer toutes les popups
    document.querySelectorAll('.liaison-palette, .shape-color-popup').forEach(el => el.remove())
  }

  getPendingConnector(): { sourceId: string; endX: number; endY: number } | null {
    if (this.drag.mode === 'drag-connector' && this.drag.connectorSourceId) {
      return {
        sourceId: this.drag.connectorSourceId,
        endX: this.drag.connectorEndX,
        endY: this.drag.connectorEndY,
      }
    }
    return null
  }

  getHoveredBlocId(): string | null {
    return this.hoveredBlocId
  }

  getSelectedLiaisonId(): string | null {
    return this.selectedLiaisonId
  }

  /** Retourne les IDs des blocs dont les connecteurs doivent être affichés. */
  getShowConnectorsFor(): Set<string> {
    return this.showConnectorsFor
  }

  // ─── Helpers ─────────────────────────────────────────

  private worldCoords(e: MouseEvent): { wx: number; wy: number } {
    const pos = this.engine.screenToWorld(e.clientX, e.clientY)
    return { wx: pos.x, wy: pos.y }
  }

  private getSelectedBlocIds(): Set<string> {
    const ids = new Set<string>()
    for (const b of this.engine.getState().blocs) {
      if (b.selected) ids.add(b.id)
    }
    return ids
  }

  /**
   * Trouve le bloc sous le curseur.
   * Si skipSelectedId est fourni, ignore ce bloc (pour cycle de sélection en zone de chevauchement).
   */
  private findBlocAt(wx: number, wy: number, skipId?: string): BlocVisuel | null {
    const blocs = this.engine.getState().blocs
    // Ordre de rendu : non-sélectionnés puis sélectionnés
    // Hit-test : sélectionnés d'abord (au-dessus)
    for (let i = blocs.length - 1; i >= 0; i--) {
      if (blocs[i].id === skipId) continue
      if (blocs[i].selected && isPointInBloc(this.ctx, blocs[i], wx, wy)) return blocs[i]
    }
    for (let i = blocs.length - 1; i >= 0; i--) {
      if (blocs[i].id === skipId) continue
      if (!blocs[i].selected && isPointInBloc(this.ctx, blocs[i], wx, wy)) return blocs[i]
    }
    return null
  }

  private findLiaisonAt(wx: number, wy: number): LiaisonVisuelle | null {
    const state = this.engine.getState()
    return findLiaisonAt(wx, wy, state.liaisons, state.blocs, this.getSelectedBlocIds())
  }

  private selectBloc(blocId: string | null) {
    const blocs = this.engine.getState().blocs
    for (const b of blocs) {
      b.selected = b.id === blocId
    }
    this.selectedLiaisonId = null
    this.onBlocSelect?.(blocId)
  }

  // ─── Event Handlers ──────────────────────────────────

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    const { wx, wy } = this.worldCoords(e)

    // Clic droit sur un bloc → ignorer (réservé pour futur menu contextuel bloc)
    const bloc = this.findBlocAt(wx, wy)
    if (bloc) return

    // Clic droit sur une liaison → palette de couleurs
    const liaison = this.findLiaisonAt(wx, wy)
    if (liaison) {
      this.selectedLiaisonId = liaison.id
      createColorPalette(
        e.clientX,
        e.clientY,
        liaison.couleur,
        (couleur) => {
          this.onLiaisonRecolor?.(liaison.id, couleur)
          this.selectedLiaisonId = null
        },
        () => {
          this.onLiaisonDelete?.(liaison.id)
          this.selectedLiaisonId = null
        },
      )
      return
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    const { wx, wy } = this.worldCoords(e)

    // Fermer toute popup ouverte
    document.querySelectorAll('.liaison-palette, .shape-color-popup').forEach(el => el.remove())

    // Clic milieu ou droit → pan (le droit est géré par contextmenu pour les liaisons)
    if (e.button === 1) {
      const state = this.engine.getState()
      this.drag = {
        ...this.drag,
        mode: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: state.offsetX,
        startOffsetY: state.offsetY,
      }
      this.canvas.style.cursor = 'grabbing'
      return
    }

    // Clic gauche uniquement
    if (e.button !== 0) return

    // PRIORITÉ 0 : tester les blocs en premier (un clic sur un bloc ne doit jamais toucher une liaison)
    const bloc = this.findBlocAt(wx, wy)

    if (!bloc) {
      // Pas sur un bloc → tester les liaisons
      const liaison = this.findLiaisonAt(wx, wy)
      if (liaison) {
        this.selectedLiaisonId = liaison.id
        createColorPalette(
          e.clientX,
          e.clientY,
          liaison.couleur,
          (couleur) => {
            this.onLiaisonRecolor?.(liaison.id, couleur)
            this.selectedLiaisonId = null
          },
          () => {
            this.onLiaisonDelete?.(liaison.id)
            this.selectedLiaisonId = null
          },
        )
        return
      }

      // Ni bloc ni liaison → déselectionner + lancer pan
      this.selectBloc(null)
      this.selectedLiaisonId = null
      const state = this.engine.getState()
      this.drag = {
        ...this.drag,
        mode: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: state.offsetX,
        startOffsetY: state.offsetY,
      }
      this.canvas.style.cursor = 'grabbing'
      return
    }

    // Sélection du bloc
    // Si le bloc est déjà sélectionné et qu'il y a un autre bloc en dessous,
    // basculer vers le bloc du dessous (cycle de sélection)
    if (bloc.selected) {
      // Vérifier s'il n'y a pas d'action spécifique (bouton, connecteur, bordure)
      const onButton = hitTestShapeButton(bloc, wx, wy)
      const onConnector = hitTestConnector(bloc, wx, wy)
      const onEdge = hitTestBorder(bloc, wx, wy)
      if (!onButton && !onConnector && !onEdge) {
        const blocDessous = this.findBlocAt(wx, wy, bloc.id)
        if (blocDessous) {
          this.selectBloc(blocDessous.id)
          // Lancer le drag sur le bloc du dessous
          this.drag = {
            ...this.drag,
            mode: 'drag-bloc',
            startX: wx,
            startY: wy,
            blocId: blocDessous.id,
          }
          this.canvas.style.cursor = 'grabbing'
          return
        }
      }
    }
    this.selectBloc(bloc.id)

    // PRIORITÉ 0b : Bouton forme/couleur (carré haut-droite)
    if (hitTestShapeButton(bloc, wx, wy)) {
      // Convertir la position du bouton en coordonnées écran pour positionner la popup
      const { bx, by } = getShapeButtonPos(bloc)
      const state = this.engine.getState()
      const rect = this.canvas.getBoundingClientRect()
      const screenBtnX = bx * state.zoom + state.offsetX + rect.left + SHAPE_BUTTON.size + 4
      const screenBtnY = by * state.zoom + state.offsetY + rect.top

      createShapeColorPopup(
        screenBtnX,
        screenBtnY,
        bloc.forme,
        bloc.couleur,
        (forme) => this.onBlocChangeForme?.(bloc.id, forme),
        (couleur) => this.onBlocChangeCouleur?.(bloc.id, couleur),
      )
      return
    }

    // PRIORITÉ 1 : Sur un connecteur → création liaison
    if (hitTestConnector(bloc, wx, wy)) {
      this.drag = {
        ...this.drag,
        mode: 'drag-connector',
        startX: wx,
        startY: wy,
        connectorSourceId: bloc.id,
        connectorEndX: wx,
        connectorEndY: wy,
      }
      this.canvas.style.cursor = 'crosshair'
      return
    }

    // PRIORITÉ 2 : Sur la bordure → resize
    const edge = hitTestBorder(bloc, wx, wy)
    if (edge) {
      this.drag = {
        ...this.drag,
        mode: 'resize',
        startX: wx,
        startY: wy,
        blocId: bloc.id,
        resizeEdge: edge,
        startW: bloc.w,
        startH: bloc.h,
        startBlocX: bloc.x,
        startBlocY: bloc.y,
      }
      this.canvas.style.cursor = getCursor(edge, false, false, false)
      return
    }

    // PRIORITÉ 3 : Sur le bloc → drag
    this.drag = {
      ...this.drag,
      mode: 'drag-bloc',
      startX: wx,
      startY: wy,
      blocId: bloc.id,
    }
    this.canvas.style.cursor = 'grabbing'
  }

  private onMouseMove = (e: MouseEvent) => {
    const { wx, wy } = this.worldCoords(e)

    // ─── Mode actif ────────────────────────────────
    if (this.drag.mode === 'pan') {
      const dx = e.clientX - this.drag.startX
      const dy = e.clientY - this.drag.startY
      this.engine.setPan(
        this.drag.startOffsetX + dx,
        this.drag.startOffsetY + dy,
      )
      return
    }

    if (this.drag.mode === 'drag-bloc' && this.drag.blocId) {
      const dx = wx - this.drag.startX
      const dy = wy - this.drag.startY
      const bloc = this.engine.getState().blocs.find(b => b.id === this.drag.blocId)
      if (bloc) {
        bloc.x += dx
        bloc.y += dy
        this.drag.startX = wx
        this.drag.startY = wy
      }
      return
    }

    if (this.drag.mode === 'drag-connector') {
      this.drag.connectorEndX = wx
      this.drag.connectorEndY = wy
      return
    }

    if (this.drag.mode === 'resize' && this.drag.blocId && this.drag.resizeEdge) {
      const bloc = this.engine.getState().blocs.find(b => b.id === this.drag.blocId)
      if (!bloc) return

      const dx = wx - this.drag.startX
      const dy = wy - this.drag.startY
      const edge = this.drag.resizeEdge

      let newX = this.drag.startBlocX
      let newY = this.drag.startBlocY
      let newW = this.drag.startW
      let newH = this.drag.startH

      if (edge.includes('e')) newW = Math.max(THEME.minWidth, this.drag.startW + dx)
      if (edge.includes('w')) {
        newW = Math.max(THEME.minWidth, this.drag.startW - dx)
        newX = this.drag.startBlocX + this.drag.startW - newW
      }
      if (edge.includes('s')) newH = Math.max(THEME.minHeight, this.drag.startH + dy)
      if (edge.includes('n')) {
        newH = Math.max(THEME.minHeight, this.drag.startH - dy)
        newY = this.drag.startBlocY + this.drag.startH - newH
      }

      bloc.x = newX
      bloc.y = newY
      bloc.w = newW
      bloc.h = newH
      return
    }

    // ─── Mode idle — hover, curseur, connecteurs ──────────────
    const bloc = this.findBlocAt(wx, wy)
    this.hoveredBlocId = bloc?.id ?? null

    // Mettre à jour la visibilité des connecteurs (survol proche bordure)
    this.showConnectorsFor.clear()
    for (const b of this.engine.getState().blocs) {
      if (b.selected || isNearBorder(b, wx, wy)) {
        this.showConnectorsFor.add(b.id)
      }
    }

    // Vérifier si on survole une liaison
    const liaisonHovered = this.findLiaisonAt(wx, wy)

    if (bloc) {
      // Bouton forme/couleur en priorité
      if (hitTestShapeButton(bloc, wx, wy)) {
        this.canvas.style.cursor = 'pointer'
        return
      }
      const onConnector = this.showConnectorsFor.has(bloc.id) && hitTestConnector(bloc, wx, wy)
      const edge = hitTestBorder(bloc, wx, wy)
      this.canvas.style.cursor = getCursor(edge, true, onConnector, false)
    } else if (liaisonHovered) {
      this.canvas.style.cursor = 'pointer'
    } else {
      this.canvas.style.cursor = 'default'
    }
  }

  private onMouseUp = (e: MouseEvent) => {
    const prevMode = this.drag.mode

    if (prevMode === 'drag-bloc' && this.drag.blocId) {
      const bloc = this.engine.getState().blocs.find(b => b.id === this.drag.blocId)
      if (bloc) {
        this.onBlocMove?.(bloc.id, bloc.x, bloc.y)
      }
    }

    if (prevMode === 'resize' && this.drag.blocId) {
      const bloc = this.engine.getState().blocs.find(b => b.id === this.drag.blocId)
      if (bloc) {
        this.onBlocResize?.(bloc.id, bloc.w, bloc.h)
      }
    }

    if (prevMode === 'drag-connector' && this.drag.connectorSourceId) {
      const { wx, wy } = this.worldCoords(e)
      const target = this.findBlocAt(wx, wy)
      if (target && target.id !== this.drag.connectorSourceId) {
        this.onLiaisonCreate?.(this.drag.connectorSourceId, target.id)
      }
    }

    this.drag.mode = 'idle'
    this.drag.blocId = null
    this.drag.connectorSourceId = null
    this.drag.resizeEdge = null

    const { wx, wy } = this.worldCoords(e)
    const bloc = this.findBlocAt(wx, wy)
    const liaisonHovered = this.findLiaisonAt(wx, wy)
    if (bloc) {
      const onConnector = hitTestConnector(bloc, wx, wy)
      const edge = hitTestBorder(bloc, wx, wy)
      this.canvas.style.cursor = getCursor(edge, true, onConnector, false)
    } else if (liaisonHovered) {
      this.canvas.style.cursor = 'pointer'
    } else {
      this.canvas.style.cursor = 'default'
    }
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const state = this.engine.getState()
    const rect = this.canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const direction = e.deltaY < 0 ? 1 : -1
    const factor = direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, state.zoom * factor))
    const scale = newZoom / state.zoom
    const newOffsetX = mx - (mx - state.offsetX) * scale
    const newOffsetY = my - (my - state.offsetY) * scale
    this.engine.setZoom(newZoom)
    this.engine.setPan(newOffsetX, newOffsetY)
  }

  private onDblClick = (e: MouseEvent) => {
    e.preventDefault()
  }
}
