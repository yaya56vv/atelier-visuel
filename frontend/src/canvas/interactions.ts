// Canvas2D — Interactions
// Drag & drop, zoom, pan, sélection, hit-testing, curseur contextuel
// Création de liaison par glisser de connecteur

import { THEME } from './theme'
import { isPointInBloc, type BlocVisuel } from './shapes'
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
  // Pour le pan
  startOffsetX: number
  startOffsetY: number
  // Pour le drag-connector (création liaison)
  connectorSourceId: string | null
  connectorEndX: number
  connectorEndY: number
  // Pour le resize
  resizeEdge: string | null
  startW: number
  startH: number
  startBlocX: number
  startBlocY: number
}

// ─── Constantes ───────────────────────────────────────────

const CONNECTOR_HIT_RADIUS = 12
const BORDER_HIT_WIDTH = 8
const ZOOM_FACTOR = 1.08
const ZOOM_MIN = 0.1
const ZOOM_MAX = 5

// ─── Fonctions utilitaires ────────────────────────────────

/** Vérifie si un point est proche d'un connecteur d'un bloc. */
function hitTestConnector(
  bloc: BlocVisuel,
  wx: number,
  wy: number,
): boolean {
  const cx = bloc.x + bloc.w / 2
  const cy = bloc.y + bloc.h / 2
  const points = [
    { px: cx, py: bloc.y },          // haut
    { px: bloc.x + bloc.w, py: cy }, // droite
    { px: cx, py: bloc.y + bloc.h }, // bas
    { px: bloc.x, py: cy },          // gauche
  ]

  for (const { px, py } of points) {
    const dx = wx - px
    const dy = wy - py
    if (dx * dx + dy * dy <= CONNECTOR_HIT_RADIUS * CONNECTOR_HIT_RADIUS) {
      return true
    }
  }
  return false
}

/** Vérifie si un point est sur la bordure d'un bloc (pour resize). */
function hitTestBorder(
  bloc: BlocVisuel,
  wx: number,
  wy: number,
): string | null {
  const { x, y, w, h } = bloc
  const hw = BORDER_HIT_WIDTH / 2

  const onLeft = wx >= x - hw && wx <= x + hw && wy >= y && wy <= y + h
  const onRight = wx >= x + w - hw && wx <= x + w + hw && wy >= y && wy <= y + h
  const onTop = wy >= y - hw && wy <= y + hw && wx >= x && wx <= x + w
  const onBottom = wy >= y + h - hw && wy <= y + h + hw && wx >= x && wx <= x + w

  if (onTop && onLeft) return 'nw'
  if (onTop && onRight) return 'ne'
  if (onBottom && onLeft) return 'sw'
  if (onBottom && onRight) return 'se'
  if (onLeft) return 'w'
  if (onRight) return 'e'
  if (onTop) return 'n'
  if (onBottom) return 's'
  return null
}

/** Retourne le curseur CSS adapté à la zone. */
function getCursor(edge: string | null, overBloc: boolean, overConnector: boolean): string {
  if (overConnector) return 'crosshair'
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

  // Callback pour notifier les changements (bus d'événements futur)
  onBlocSelect?: (blocId: string | null) => void
  onBlocMove?: (blocId: string, x: number, y: number) => void
  onBlocResize?: (blocId: string, w: number, h: number) => void
  onLiaisonCreate?: (sourceId: string, cibleId: string) => void

  constructor(engine: CanvasEngine, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.engine = engine
    this.canvas = canvas
    this.ctx = ctx
  }

  /** Attache les event listeners au canvas. */
  attach() {
    this.canvas.addEventListener('mousedown', this.onMouseDown)
    this.canvas.addEventListener('mousemove', this.onMouseMove)
    this.canvas.addEventListener('mouseup', this.onMouseUp)
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false })
    this.canvas.addEventListener('dblclick', this.onDblClick)
    // Empêcher le menu contextuel par défaut
    this.canvas.addEventListener('contextmenu', this.onContextMenu)
  }

  /** Détache les event listeners. */
  detach() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)
    this.canvas.removeEventListener('wheel', this.onWheel)
    this.canvas.removeEventListener('dblclick', this.onDblClick)
    this.canvas.removeEventListener('contextmenu', this.onContextMenu)
  }

  /** Retourne l'état de la liaison en cours de création (pour le rendu). */
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

  /** Retourne l'ID du bloc survolé (pour le rendu hover). */
  getHoveredBlocId(): string | null {
    return this.hoveredBlocId
  }

  // ─── Helpers ─────────────────────────────────────────

  private worldCoords(e: MouseEvent): { wx: number; wy: number } {
    const pos = this.engine.screenToWorld(e.clientX, e.clientY)
    return { wx: pos.x, wy: pos.y }
  }

  private findBlocAt(wx: number, wy: number): BlocVisuel | null {
    const blocs = this.engine.getState().blocs
    // Parcours inverse (les sélectionnés sont dessinés au-dessus)
    for (let i = blocs.length - 1; i >= 0; i--) {
      const bloc = blocs[i]
      if (bloc.selected && isPointInBloc(this.ctx, bloc, wx, wy)) return bloc
    }
    for (let i = blocs.length - 1; i >= 0; i--) {
      const bloc = blocs[i]
      if (!bloc.selected && isPointInBloc(this.ctx, bloc, wx, wy)) return bloc
    }
    return null
  }

  private selectBloc(blocId: string | null) {
    const blocs = this.engine.getState().blocs
    for (const b of blocs) {
      b.selected = b.id === blocId
    }
    this.onBlocSelect?.(blocId)
  }

  // ─── Event Handlers ──────────────────────────────────

  private onContextMenu = (e: Event) => {
    e.preventDefault()
  }

  private onMouseDown = (e: MouseEvent) => {
    const { wx, wy } = this.worldCoords(e)

    // Clic milieu ou droit → pan
    if (e.button === 1 || e.button === 2) {
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

    // Clic gauche
    if (e.button !== 0) return

    const bloc = this.findBlocAt(wx, wy)

    if (!bloc) {
      // Clic dans le vide → déselectionner + lancer pan
      this.selectBloc(null)
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
    this.selectBloc(bloc.id)

    // Sur un connecteur → création liaison
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

    // Sur la bordure → resize
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
      this.canvas.style.cursor = getCursor(edge, false, false)
      return
    }

    // Sur le bloc → drag
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

    // ─── Mode idle — hover et curseur ──────────────
    const bloc = this.findBlocAt(wx, wy)
    this.hoveredBlocId = bloc?.id ?? null

    if (bloc) {
      const onConnector = hitTestConnector(bloc, wx, wy)
      const edge = hitTestBorder(bloc, wx, wy)
      this.canvas.style.cursor = getCursor(edge, true, onConnector)
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

    // Remettre le curseur correct
    const { wx, wy } = this.worldCoords(e)
    const bloc = this.findBlocAt(wx, wy)
    if (bloc) {
      const onConnector = hitTestConnector(bloc, wx, wy)
      const edge = hitTestBorder(bloc, wx, wy)
      this.canvas.style.cursor = getCursor(edge, true, onConnector)
    } else {
      this.canvas.style.cursor = 'default'
    }
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()

    const state = this.engine.getState()
    const rect = this.canvas.getBoundingClientRect()

    // Point sous la souris en coordonnées écran relatif au canvas
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // Direction du zoom
    const direction = e.deltaY < 0 ? 1 : -1
    const factor = direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, state.zoom * factor))

    // Recalculer l'offset pour zoomer vers le point sous la souris
    const scale = newZoom / state.zoom
    const newOffsetX = mx - (mx - state.offsetX) * scale
    const newOffsetY = my - (my - state.offsetY) * scale

    this.engine.setZoom(newZoom)
    this.engine.setPan(newOffsetX, newOffsetY)
  }

  private onDblClick = (e: MouseEvent) => {
    // Double-clic sera géré par le bus d'événements (étape 6)
    // Pour l'instant, on ne fait rien de spécial
    e.preventDefault()
  }
}
