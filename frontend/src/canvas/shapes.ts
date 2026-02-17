// Canvas2D — Formes pré-programmées
// Nuage, rectangle arrondi, carré, ovale, cercle
// Effets visuels : volume, brillance, ombres, halos

import { THEME, type ThemeColors } from './theme'

export type Forme = 'cloud' | 'rounded-rect' | 'square' | 'oval' | 'circle'
export type Couleur = 'green' | 'orange' | 'yellow' | 'blue' | 'violet' | 'mauve'

export interface BlocVisuel {
  id: string
  x: number
  y: number
  w: number
  h: number
  forme: Forme
  couleur: Couleur
  titre: string
  selected: boolean
}

/** Trace le path d'une forme dans le contexte sans le remplir ni le tracer. */
function tracePath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme) {
  const cx = x + w / 2
  const cy = y + h / 2

  ctx.beginPath()

  switch (forme) {
    case 'cloud': {
      // Forme organique de type nuage — ellipse irrégulière avec des bosses
      const rx = w / 2
      const ry = h / 2
      const steps = 60
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2
        // Ondulation douce pour effet nuage
        const wobble = 1 + 0.08 * Math.sin(angle * 3) + 0.05 * Math.cos(angle * 5)
        const px = cx + rx * wobble * Math.cos(angle)
        const py = cy + ry * wobble * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }

    case 'rounded-rect': {
      const radius = Math.min(w, h) * 0.2
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + w - radius, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
      ctx.lineTo(x + w, y + h - radius)
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
      ctx.lineTo(x + radius, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      break
    }

    case 'square': {
      const radius = Math.min(w, h) * 0.1
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + w - radius, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
      ctx.lineTo(x + w, y + h - radius)
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
      ctx.lineTo(x + radius, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      break
    }

    case 'oval': {
      ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2)
      ctx.closePath()
      break
    }

    case 'circle': {
      const r = Math.min(w, h) / 2
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.closePath()
      break
    }
  }
}

/** Dessine le glow (halo lumineux) autour du bloc. */
function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme, colors: ThemeColors, selected: boolean) {
  ctx.save()
  ctx.shadowColor = colors.glow
  ctx.shadowBlur = selected ? THEME.glowBlurSelected : THEME.glowBlur
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  tracePath(ctx, x, y, w, h, forme)
  ctx.fillStyle = 'rgba(0,0,0,0.01)' // fill invisible pour activer le shadow
  ctx.fill()
  ctx.restore()
}

/** Dessine le remplissage avec gradient radial pour effet 3D/volume. */
function drawFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme, colors: ThemeColors) {
  const cx = x + w / 2
  const cy = y + h / 2
  const r = Math.max(w, h) * 0.7

  const grad = ctx.createRadialGradient(cx - w * 0.15, cy - h * 0.2, 0, cx, cy, r)
  grad.addColorStop(0, colors.fill)
  grad.addColorStop(1, colors.fillGradientEnd)

  tracePath(ctx, x, y, w, h, forme)
  ctx.fillStyle = grad
  ctx.fill()
}

/** Dessine le reflet glossy en haut du bloc. */
function drawGlossy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme) {
  ctx.save()

  // Clipper à la forme du bloc
  tracePath(ctx, x, y, w, h, forme)
  ctx.clip()

  // Gradient blanc en haut, transparent en bas
  const glossyH = h * THEME.glossyHeight
  const grad = ctx.createLinearGradient(x, y, x, y + glossyH)
  grad.addColorStop(0, `rgba(255, 255, 255, ${THEME.glossyOpacity})`)
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, glossyH)

  ctx.restore()
}

/** Dessine la bordure du bloc. */
function drawBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme, colors: ThemeColors, selected: boolean) {
  tracePath(ctx, x, y, w, h, forme)
  ctx.strokeStyle = selected ? colors.glow : colors.border
  ctx.lineWidth = selected ? THEME.borderWidthSelected : THEME.borderWidth
  ctx.stroke()
}

/** Dessine le texte (titre) centré dans le bloc. */
function drawText(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, titre: string) {
  if (!titre) return

  ctx.save()
  ctx.fillStyle = THEME.text.color
  ctx.font = THEME.text.font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Troncature si trop long
  const maxW = w - THEME.text.padding * 2
  let display = titre
  while (ctx.measureText(display).width > maxW && display.length > 3) {
    display = display.slice(0, -4) + '...'
  }

  ctx.fillText(display, x + w / 2, y + h / 2)
  ctx.restore()
}

/** Dessine les points de connexion sur les bords du bloc. */
export function drawConnectors(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const { radius, fill, border, glowColor, glowBlur } = THEME.connector
  const cx = x + w / 2
  const cy = y + h / 2

  const points = [
    { px: cx, py: y },           // haut
    { px: x + w, py: cy },       // droite
    { px: cx, py: y + h },       // bas
    { px: x, py: cy },           // gauche
  ]

  for (const { px, py } of points) {
    ctx.save()
    ctx.shadowColor = glowColor
    ctx.shadowBlur = glowBlur

    ctx.beginPath()
    ctx.arc(px, py, radius, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = border
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  }
}

/** Dessine un bloc complet avec tous ses effets visuels. */
export function drawBloc(ctx: CanvasRenderingContext2D, bloc: BlocVisuel) {
  const { x, y, w, h, forme, couleur, titre, selected } = bloc
  const colors = THEME.colors[couleur]
  if (!colors) return

  drawGlow(ctx, x, y, w, h, forme, colors, selected)
  drawFill(ctx, x, y, w, h, forme, colors)
  drawGlossy(ctx, x, y, w, h, forme)
  drawBorder(ctx, x, y, w, h, forme, colors, selected)
  drawText(ctx, x, y, w, h, titre)

  if (selected) {
    drawConnectors(ctx, x, y, w, h)
  }
}

/** Hit-test : vérifie si un point est à l'intérieur d'un bloc. */
export function isPointInBloc(ctx: CanvasRenderingContext2D, bloc: BlocVisuel, px: number, py: number): boolean {
  tracePath(ctx, bloc.x, bloc.y, bloc.w, bloc.h, bloc.forme)
  return ctx.isPointInPath(px, py)
}
