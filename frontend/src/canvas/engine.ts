// Canvas2D — Moteur de rendu principal
// Responsable du cycle de rendu, gestion du contexte 2D, boucle d'animation

import { THEME } from './theme'
import { drawBloc, drawBlocConstellation, drawBlocMinimal, drawConnectors, ZOOM_LOD, type BlocVisuel, type LiaisonVisuelle } from './shapes'
import { drawAllLiaisons } from './links'
import { InteractionManager } from './interactions'
import { LegendManager } from './legends'
import { canvasBus } from './events'

/**
 * Mode de visibilité des liaisons :
 * - 'selection' : comportement par défaut (liaisons du bloc sélectionné + ancrées)
 * - 'all' : toutes les liaisons visibles
 * - Couleur spécifique ('green','orange',...) : uniquement les liaisons de cette couleur
 */
export type LiaisonVisibility = 'selection' | 'all' | string

export interface EngineState {
  blocs: BlocVisuel[]
  liaisons: LiaisonVisuelle[]
  offsetX: number
  offsetY: number
  zoom: number
  liaisonVisibility: LiaisonVisibility
  /** IDs des blocs illuminés par la recherche (vide = pas de filtre, tout normal) */
  highlightedBlocIds: Set<string>
  /** ID du bloc survolé pendant un drag de fichier (highlight vert) */
  dragHoverBlocId: string | null
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
    liaisonVisibility: 'selection',
    highlightedBlocIds: new Set(),
    dragHoverBlocId: null,
  }
  private interactions: InteractionManager
  private legends: LegendManager

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D non supporté')
    this.ctx = ctx
    this.legends = new LegendManager()
    this.interactions = new InteractionManager(this, canvas, ctx)
    this.wireEvents()
  }

  /** Connecte les callbacks d'interaction au bus d'événements. */
  private wireEvents() {
    this.interactions.onBlocSelect = (blocId) => {
      canvasBus.emit('bloc:select', { blocId })
      // Afficher la légende du bloc sélectionné
      if (blocId) {
        const bloc = this.state.blocs.find(b => b.id === blocId)
        if (bloc) {
          this.legends.show(
            bloc.x + bloc.w / 2,
            bloc.y,
            bloc.couleur,
            bloc.forme,
          )
        }
      } else {
        this.legends.hide()
      }
    }

    this.interactions.onBlocMove = (blocId, x, y) => {
      canvasBus.emit('bloc:move', { blocId, x, y })
    }

    this.interactions.onBlocResize = (blocId, w, h) => {
      canvasBus.emit('bloc:resize', { blocId, w, h })
    }

    this.interactions.onLiaisonCreate = (sourceId, cibleId) => {
      canvasBus.emit('liaison:create', { sourceId, cibleId })
    }

    this.interactions.onLiaisonDelete = (liaisonId) => {
      canvasBus.emit('liaison:delete', { liaisonId })
    }

    this.interactions.onLiaisonRecolor = (liaisonId, couleur) => {
      canvasBus.emit('liaison:recolor', { liaisonId, couleur })
    }

    this.interactions.onBlocChangeForme = (blocId, forme) => {
      canvasBus.emit('bloc:changeForme', { blocId, forme })
    }

    this.interactions.onBlocChangeCouleur = (blocId, couleur) => {
      canvasBus.emit('bloc:changeCouleur', { blocId, couleur })
    }
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

  /** Définit le mode de visibilité des liaisons. */
  setLiaisonVisibility(mode: LiaisonVisibility) {
    this.state.liaisonVisibility = mode
  }

  /** Définit les blocs illuminés par la recherche. Set vide = tout normal. */
  setHighlightedBlocs(ids: Set<string>) {
    this.state.highlightedBlocIds = ids
  }

  /** Définit le bloc survolé pendant un drag de fichier. null = aucun. */
  setDragHoverBloc(blocId: string | null) {
    this.state.dragHoverBlocId = blocId
  }

  /** Retourne l'état actuel. */
  getState(): EngineState {
    return this.state
  }

  /** Retourne le gestionnaire d'interactions. */
  getInteractions(): InteractionManager {
    return this.interactions
  }

  /** Retourne le bus d'événements. */
  getBus() {
    return canvasBus
  }

  /** Redimensionne le canvas au pixel ratio de l'écran. */
  resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
  }

  /** Centre la vue sur un bloc avec un zoom confortable. */
  centerOnBloc(bloc: { x: number; y: number; w: number; h: number }) {
    const rect = this.canvas.getBoundingClientRect()
    const vw = rect.width
    const vh = rect.height
    const cx = bloc.x + bloc.w / 2
    const cy = bloc.y + bloc.h / 2
    const zoom = 1.2
    this.state.zoom = zoom
    this.state.offsetX = vw / 2 - cx * zoom
    this.state.offsetY = vh / 2 - cy * zoom
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

    // Temps courant pour les animations
    const time = performance.now()

    // Déterminer le niveau de détail selon le zoom
    const isConstellation = zoom < ZOOM_LOD.constellation
    const isMinimal = zoom < ZOOM_LOD.minimal

    // Recherche active ? Si oui, les blocs/liaisons non-matchés sont estompés
    const hl = this.state.highlightedBlocIds
    const searchActive = hl.size > 0
    const DIM_ALPHA = 0.18  // opacité des blocs estompés

    // Dessin des liaisons EN DESSOUS de tous les blocs
    // En mode constellation : liaisons très fines et discrètes
    const visMode = this.state.liaisonVisibility

    // Déterminer si un filtre de liaisons par couleur est actif
    const liaisonColorFilter = (visMode !== 'selection' && visMode !== 'all') ? visMode : null

    if (isConstellation) {
      // Liaisons en mode constellation — lignes lumineuses colorées, inspiré Obsidian Graph View
      for (const liaison of liaisons) {
        const source = blocs.find(b => b.id === liaison.sourceId)
        const cible = blocs.find(b => b.id === liaison.cibleId)
        if (!source || !cible) continue

        // Appliquer le filtre de visibilité
        let visible = false
        if (visMode === 'selection') {
          visible = liaison.type === 'ancree'
            || selectedIds.has(source.id)
            || selectedIds.has(cible.id)
        } else if (visMode === 'all') {
          visible = true
        } else {
          visible = liaison.couleur === visMode
        }
        if (!visible) continue

        const colors = THEME.colors[liaison.couleur || source.couleur]
        if (!colors) continue
        const sx = source.x + source.w / 2
        const sy = source.y + source.h / 2
        const tx = cible.x + cible.w / 2
        const ty = cible.y + cible.h / 2

        const oneLit = searchActive && (hl.has(source.id) || hl.has(cible.id))
        const bothLit = searchActive && hl.has(source.id) && hl.has(cible.id)
        // Filtre couleur de liaisons = éclairage doré forcé
        const isColorFiltered = liaisonColorFilter !== null

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(tx, ty)

        if ((searchActive && oneLit) || isColorFiltered) {
          // GLOW DORÉ — liaison illuminée
          const intensity = bothLit || isColorFiltered ? 1.0 : 0.5
          const pulse = 0.7 + 0.3 * Math.sin(time / 500)
          ctx.shadowColor = `rgba(255,200,80, ${0.9 * intensity})`
          ctx.shadowBlur = 14 * intensity
          ctx.strokeStyle = `rgba(255,210,100, ${0.7 * intensity * pulse})`
          ctx.lineWidth = 1.5 + intensity
        } else if (searchActive) {
          // Liaison non-concernée pendant une recherche
          ctx.strokeStyle = `rgba(${colors.rgb}, 0.02)`
          ctx.lineWidth = 0.5
        } else {
          // Mode normal — liaisons bien visibles (inspiré Obsidian)
          ctx.shadowColor = `rgba(${colors.rgb}, 0.4)`
          ctx.shadowBlur = 4
          ctx.strokeStyle = `rgba(${colors.rgb}, 0.55)`
          ctx.lineWidth = 1.2
        }
        ctx.stroke()
        ctx.restore()
      }
    } else {
      drawAllLiaisons(ctx, liaisons, blocs, selectedIds, time, this.state.liaisonVisibility, this.state.highlightedBlocIds)
    }

    // Dessin des blocs selon le niveau de détail
    if (isConstellation) {
      for (const bloc of blocs) {
        const dimmed = searchActive && !hl.has(bloc.id)
        if (dimmed) ctx.globalAlpha = DIM_ALPHA
        drawBlocConstellation(ctx, bloc, time)
        if (dimmed) ctx.globalAlpha = 1
      }
    } else if (isMinimal) {
      for (const bloc of blocs) {
        if (!bloc.selected) {
          const dimmed = searchActive && !hl.has(bloc.id)
          if (dimmed) ctx.globalAlpha = DIM_ALPHA
          drawBlocMinimal(ctx, bloc)
          if (dimmed) ctx.globalAlpha = 1
        }
      }
      for (const bloc of blocs) {
        if (bloc.selected) {
          const dimmed = searchActive && !hl.has(bloc.id)
          if (dimmed) ctx.globalAlpha = DIM_ALPHA
          drawBlocMinimal(ctx, bloc)
          if (dimmed) ctx.globalAlpha = 1
        }
      }
    } else {
      // Mode complet : rendu 3D multicouche
      for (const bloc of blocs) {
        if (!bloc.selected) {
          const dimmed = searchActive && !hl.has(bloc.id)
          if (dimmed) ctx.globalAlpha = DIM_ALPHA
          drawBloc(ctx, bloc)
          if (dimmed) ctx.globalAlpha = 1
        }
      }
      for (const bloc of blocs) {
        if (bloc.selected) {
          const dimmed = searchActive && !hl.has(bloc.id)
          if (dimmed) ctx.globalAlpha = DIM_ALPHA
          drawBloc(ctx, bloc)
          if (dimmed) ctx.globalAlpha = 1
        }
      }

      // Halo vert sur le bloc survolé pendant un drag de fichier
      if (this.state.dragHoverBlocId) {
        const hoverBloc = blocs.find(b => b.id === this.state.dragHoverBlocId)
        if (hoverBloc) {
          const hcx = hoverBloc.x + hoverBloc.w / 2
          const hcy = hoverBloc.y + hoverBloc.h / 2
          const hr = Math.max(hoverBloc.w, hoverBloc.h) * 0.65
          const pulse = 0.5 + 0.15 * Math.sin(time / 350)
          ctx.save()
          ctx.globalAlpha = pulse
          const hgrad = ctx.createRadialGradient(hcx, hcy, 0, hcx, hcy, hr)
          hgrad.addColorStop(0, 'rgba(80, 200, 120, 0.4)')
          hgrad.addColorStop(0.5, 'rgba(80, 200, 120, 0.15)')
          hgrad.addColorStop(1, 'rgba(80, 200, 120, 0)')
          ctx.fillStyle = hgrad
          ctx.beginPath()
          ctx.arc(hcx, hcy, hr, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      // Halo de recherche sur les blocs illuminés (glow bleu-blanc)
      if (searchActive) {
        for (const bloc of blocs) {
          if (!hl.has(bloc.id)) continue
          const colors = THEME.colors[bloc.couleur]
          if (!colors) continue
          const cx = bloc.x + bloc.w / 2
          const cy = bloc.y + bloc.h / 2
          const r = Math.max(bloc.w, bloc.h) * 0.7
          ctx.save()
          ctx.globalAlpha = 0.4 + 0.1 * Math.sin(time / 600)
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
          grad.addColorStop(0, `rgba(${colors.rgb}, 0.35)`)
          grad.addColorStop(0.5, `rgba(${colors.rgb}, 0.1)`)
          grad.addColorStop(1, `rgba(${colors.rgb}, 0)`)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }
    }

    // Connecteurs visibles uniquement en mode complet
    const showConnectors = this.interactions.getShowConnectorsFor()
    if (!isConstellation && !isMinimal) {
      for (const bloc of blocs) {
        if (!bloc.selected && showConnectors.has(bloc.id)) {
          const colors = THEME.colors[bloc.couleur]
          if (colors) drawConnectors(ctx, bloc.x, bloc.y, bloc.w, bloc.h, colors.rgb, bloc)
        }
      }
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
        ctx.strokeStyle = `rgba(${THEME.colors.green.rgb}, 0.6)`
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.restore()
      }
    }

    // Rendu des légendes contextuelles
    this.legends.draw(ctx)

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

  /** Détruit le moteur, les interactions et le bus. */
  destroy() {
    this.stop()
    this.interactions.detach()
    canvasBus.clear()
  }
}
