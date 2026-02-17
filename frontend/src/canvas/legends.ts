// Canvas2D — Légendes contextuelles
// Affichage couleur/forme au moment de l'interaction uniquement
// Disparition automatique

import { THEME } from './theme'
import type { Couleur, Forme } from './shapes'

// ─── Significations sémantiques ─────────────────────────

const COLOR_MEANINGS: Record<Couleur, string> = {
  green:  'Matière première · Fait, donnée, observation',
  orange: 'Énergie · Problème, friction, question urgente',
  yellow: 'Lumière · Solution, idée, déclic',
  blue:   'Logique · Analyse, argument, structure',
  violet: 'Sens profond · Valeur, principe fondateur',
  mauve:  'Concept · Idée embryonnaire, hypothèse',
}

const SHAPE_MEANINGS: Record<Forme, string> = {
  cloud:        'Intuition vivante · Certitude faible',
  'rounded-rect': 'Idée structurée · Certitude moyenne',
  square:       'Texte fondateur · Certitude haute',
  oval:         'Processus · Certitude variable',
  circle:       'Cœur / Centre · Certitude maximale',
}

// ─── État de la légende ─────────────────────────────────

interface LegendState {
  visible: boolean
  x: number
  y: number
  couleur: Couleur | null
  forme: Forme | null
  opacity: number
  fadeStartTime: number
}

const LEGEND_DURATION = 2000  // ms avant fade
const LEGEND_FADE = 500       // ms de fade out
const LEGEND_OFFSET_Y = -20   // décalage vertical au-dessus du bloc
const LEGEND_PADDING = 8
const LEGEND_FONT = '11px "Segoe UI", system-ui, sans-serif'
const LEGEND_BG = 'rgba(10, 10, 20, 0.85)'
const LEGEND_BORDER_RADIUS = 4

export class LegendManager {
  private state: LegendState = {
    visible: false,
    x: 0,
    y: 0,
    couleur: null,
    forme: null,
    opacity: 1,
    fadeStartTime: 0,
  }

  /** Affiche une légende à la position donnée. */
  show(x: number, y: number, couleur: Couleur, forme: Forme) {
    this.state = {
      visible: true,
      x,
      y: y + LEGEND_OFFSET_Y,
      couleur,
      forme,
      opacity: 1,
      fadeStartTime: performance.now() + LEGEND_DURATION,
    }
  }

  /** Cache la légende immédiatement. */
  hide() {
    this.state.visible = false
  }

  /** Dessine la légende dans le contexte (coordonnées monde). */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.state.visible || !this.state.couleur || !this.state.forme) return

    const now = performance.now()

    // Calcul de l'opacité avec fade
    if (now > this.state.fadeStartTime) {
      const elapsed = now - this.state.fadeStartTime
      this.state.opacity = Math.max(0, 1 - elapsed / LEGEND_FADE)
      if (this.state.opacity <= 0) {
        this.state.visible = false
        return
      }
    }

    const colorText = COLOR_MEANINGS[this.state.couleur]
    const shapeText = SHAPE_MEANINGS[this.state.forme]
    const colors = THEME.colors[this.state.couleur]
    if (!colors || !colorText || !shapeText) return

    ctx.save()
    ctx.globalAlpha = this.state.opacity

    ctx.font = LEGEND_FONT
    const line1Width = ctx.measureText(colorText).width
    const line2Width = ctx.measureText(shapeText).width
    const maxWidth = Math.max(line1Width, line2Width)
    const boxW = maxWidth + LEGEND_PADDING * 2
    const boxH = 36 + LEGEND_PADDING * 2
    const bx = this.state.x - boxW / 2
    const by = this.state.y - boxH

    // Fond
    ctx.fillStyle = LEGEND_BG
    ctx.beginPath()
    ctx.moveTo(bx + LEGEND_BORDER_RADIUS, by)
    ctx.lineTo(bx + boxW - LEGEND_BORDER_RADIUS, by)
    ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + LEGEND_BORDER_RADIUS)
    ctx.lineTo(bx + boxW, by + boxH - LEGEND_BORDER_RADIUS)
    ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - LEGEND_BORDER_RADIUS, by + boxH)
    ctx.lineTo(bx + LEGEND_BORDER_RADIUS, by + boxH)
    ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - LEGEND_BORDER_RADIUS)
    ctx.lineTo(bx, by + LEGEND_BORDER_RADIUS)
    ctx.quadraticCurveTo(bx, by, bx + LEGEND_BORDER_RADIUS, by)
    ctx.closePath()
    ctx.fill()

    // Bordure fine couleur sémantique
    ctx.strokeStyle = colors.glow
    ctx.lineWidth = 1
    ctx.stroke()

    // Texte ligne 1 — couleur
    ctx.fillStyle = colors.glow
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(colorText, this.state.x, by + LEGEND_PADDING)

    // Texte ligne 2 — forme
    ctx.fillStyle = 'rgba(180, 180, 190, 0.8)'
    ctx.fillText(shapeText, this.state.x, by + LEGEND_PADDING + 18)

    ctx.restore()
  }
}
