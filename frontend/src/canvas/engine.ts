// Canvas2D — Moteur de rendu principal
// Responsable du cycle de rendu, gestion du contexte 2D, boucle d'animation

import { THEME } from './theme'
import { drawBloc, type BlocVisuel, type LiaisonVisuelle } from './shapes'
import { drawAllLiaisons } from './links'
import { InteractionManager } from './interactions'

export interface EngineState {
  blocs: BlocVisuel[]
  liaisons: LiaisonVisuelle[]
  offsetX: number
  offsetY: number
  zoom: number
}

export class CanvasEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number | null = null
  private state: EngineState = {
    blocs: [],
    liaisons: [],
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
  }
  private interactions: InteractionManager

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D non supporté')
    this.ctx = ctx
    this.interactions = new InteractionManager(this, canvas, ctx)
  }

  /** Met à jour la liste des blocs à afficher. */
  setBlocs(blocs: BlocVisuel[]) {
    this.state.blocs = blocs
  }

  /** Met à jour la liste des liaisons à afficher. */
  setLiaisons(liaisons: LiaisonVisuelle[]) {
    this.state.liaisons = liaisons
  }

  /** Met à jour le pan (décalage). */
  setPan(x: number, y: number) {
    this.state.offsetX = x
    this.state.offsetY = y
  }

  /** Met à jour le zoom. */
  setZoom(zoom: number) {
    this.state.zoom = zoom
  }

  /** Retourne l'état actuel. */
  getState(): EngineState {
    return this.state
  }

  /** Retourne le gestionnaire d'interactions. */
  getInteractions(): InteractionManager {
    return this.interactions
  }

  /** Redimensionne le canvas au pixel ratio de l'écran. */
  resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
  }

  /** Convertit les coordonnées écran en coordonnées monde. */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (screenX - rect.left - this.state.offsetX) / this.state.zoom,
      y: (screenY - rect.top - this.state.offsetY) / this.state.zoom,
    }
  }

  /** Dessine un frame complet. */
  private render = () => {
    const { ctx, canvas } = this
    const { blocs, liaisons, offsetX, offsetY, zoom } = this.state
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    // Fond
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = THEME.background
    ctx.fillRect(0, 0, w, h)

    // Transformation monde
    ctx.translate(offsetX, offsetY)
    ctx.scale(zoom, zoom)

    // Collecter les IDs des blocs sélectionnés
    const selectedIds = new Set<string>()
    for (const bloc of blocs) {
      if (bloc.selected) selectedIds.add(bloc.id)
    }

    // Dessin des blocs non sélectionnés
    for (const bloc of blocs) {
      if (!bloc.selected) drawBloc(ctx, bloc)
    }

    // Dessin des liaisons
    drawAllLiaisons(ctx, liaisons, blocs, selectedIds)

    // Dessin des blocs sélectionnés au-dessus
    for (const bloc of blocs) {
      if (bloc.selected) drawBloc(ctx, bloc)
    }

    // Rendu du connecteur en cours de création (ligne temporaire)
    const pending = this.interactions.getPendingConnector()
    if (pending) {
      const source = blocs.find(b => b.id === pending.sourceId)
      if (source) {
        const sx = source.x + source.w / 2
        const sy = source.y + source.h / 2
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(pending.endX, pending.endY)
        ctx.strokeStyle = 'rgba(80, 200, 120, 0.6)'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.restore()
      }
    }

    ctx.restore()

    this.animationId = requestAnimationFrame(this.render)
  }

  /** Lance la boucle de rendu et les interactions. */
  start() {
    this.resize()
    this.interactions.attach()
    this.animationId = requestAnimationFrame(this.render)
  }

  /** Arrête la boucle de rendu. */
  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /** Détruit le moteur et les interactions. */
  destroy() {
    this.stop()
    this.interactions.detach()
  }
}
