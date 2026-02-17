// Canvas2D — Légendes contextuelles
// Affichage couleur/forme + signification croisée (matrice CENTRAL.md §5.4)
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

// ─── Matrice Couleur × Forme (CENTRAL.md §5.4) ─────────

const MATRIX: Record<Couleur, Record<Forme, string>> = {
  green: {
    cloud: 'Observation floue',
    'rounded-rect': 'Fait établi',
    square: 'Donnée de référence',
    oval: 'Processus factuel',
    circle: 'Pilier factuel',
  },
  orange: {
    cloud: 'Malaise diffus',
    'rounded-rect': 'Problème identifié',
    square: 'Contrainte dure',
    oval: 'Crise en cours',
    circle: 'Tension centrale',
  },
  yellow: {
    cloud: 'Intuition de solution',
    'rounded-rect': 'Solution formulée',
    square: 'Règle de résolution',
    oval: 'Implémentation',
    circle: 'Insight fondateur',
  },
  blue: {
    cloud: 'Hypothèse logique',
    'rounded-rect': 'Argument structuré',
    square: 'Axiome',
    oval: 'Raisonnement',
    circle: 'Cadre logique central',
  },
  violet: {
    cloud: 'Pressentiment de sens',
    'rounded-rect': 'Valeur articulée',
    square: 'Principe fondateur',
    oval: 'Quête de sens',
    circle: 'Conviction profonde',
  },
  mauve: {
    cloud: 'Germe d\'idée',
    'rounded-rect': 'Concept exploré',
    square: 'Convention de travail',
    oval: 'Exploration',
    circle: 'Concept pivot',
  },
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
const LEGEND_FONT_BOLD = 'bold 11px "Segoe UI", system-ui, sans-serif'
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
    const matrixText = MATRIX[this.state.couleur]?.[this.state.forme] || ''
    const colors = THEME.colors[this.state.couleur]
    if (!colors || !colorText || !shapeText) return

    ctx.save()
    ctx.globalAlpha = this.state.opacity

    // Mesurer les 3 lignes
    ctx.font = LEGEND_FONT_BOLD
    const line0Width = ctx.measureText(matrixText).width
    ctx.font = LEGEND_FONT
    const line1Width = ctx.measureText(colorText).width
    const line2Width = ctx.measureText(shapeText).width
    const maxWidth = Math.max(line0Width, line1Width, line2Width)
    const boxW = maxWidth + LEGEND_PADDING * 2
    const boxH = 54 + LEGEND_PADDING * 2  // 3 lignes
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

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    // Ligne 1 — signification croisée (matrice) en gras
    ctx.font = LEGEND_FONT_BOLD
    ctx.fillStyle = colors.glow
    ctx.fillText(matrixText, this.state.x, by + LEGEND_PADDING)

    // Ligne 2 — couleur
    ctx.font = LEGEND_FONT
    ctx.fillStyle = 'rgba(200, 200, 210, 0.7)'
    ctx.fillText(colorText, this.state.x, by + LEGEND_PADDING + 18)

    // Ligne 3 — forme
    ctx.fillStyle = 'rgba(160, 160, 180, 0.6)'
    ctx.fillText(shapeText, this.state.x, by + LEGEND_PADDING + 36)

    ctx.restore()
  }
}
