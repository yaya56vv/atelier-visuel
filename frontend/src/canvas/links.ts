// Canvas2D — Liaisons
// Courbes de Bézier cubiques, effets lumineux, couleurs sémantiques
// Interdiction : polylignes lissées, déformation sinusoïdale

import { THEME, type ThemeColors } from './theme'
import type { BlocVisuel, LiaisonVisuelle } from './shapes'

/** Point 2D. */
interface Point {
  x: number
  y: number
}

/**
 * Calcule le point d'ancrage optimal sur le bord du bloc
 * en direction d'un point cible. Le contour est intégralement
 * connectable (pas de connecteurs fixes).
 */
function getAnchorPoint(bloc: BlocVisuel, targetX: number, targetY: number): Point {
  const cx = bloc.x + bloc.w / 2
  const cy = bloc.y + bloc.h / 2

  // Vecteur du centre du bloc vers la cible
  const dx = targetX - cx
  const dy = targetY - cy

  if (dx === 0 && dy === 0) {
    return { x: cx, y: bloc.y } // fallback : haut
  }

  // Pour les formes elliptiques (cloud, oval, circle), on intersecte l'ellipse
  // Pour les rectangulaires (rounded-rect, square), on intersecte le rectangle
  const forme = bloc.forme

  if (forme === 'circle') {
    const r = Math.min(bloc.w, bloc.h) / 2
    const dist = Math.sqrt(dx * dx + dy * dy)
    return {
      x: cx + (dx / dist) * r,
      y: cy + (dy / dist) * r,
    }
  }

  if (forme === 'oval' || forme === 'cloud') {
    // Intersection rayon-ellipse
    const rx = bloc.w / 2
    const ry = bloc.h / 2
    const angle = Math.atan2(dy, dx)
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    }
  }

  // Formes rectangulaires (rounded-rect, square)
  const hw = bloc.w / 2
  const hh = bloc.h / 2

  // Trouver l'intersection avec le rectangle
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  let scale: number
  if (absDx * hh > absDy * hw) {
    // Intersection côté gauche ou droite
    scale = hw / absDx
  } else {
    // Intersection côté haut ou bas
    scale = hh / absDy
  }

  return {
    x: cx + dx * scale,
    y: cy + dy * scale,
  }
}

/**
 * Calcule les points de contrôle Bézier cubiques avec tangence réelle.
 * Les points de contrôle sont placés dans la direction perpendiculaire
 * au bord du bloc au point d'ancrage, garantissant la tangence.
 */
function computeBezierControls(
  anchor1: Point,
  bloc1: BlocVisuel,
  anchor2: Point,
  bloc2: BlocVisuel,
): { cp1: Point; cp2: Point } {
  const dx = anchor2.x - anchor1.x
  const dy = anchor2.y - anchor1.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const cpDist = dist * THEME.liaison.controlPointRatio

  // Direction du centre du bloc vers le point d'ancrage = normale sortante
  const cx1 = bloc1.x + bloc1.w / 2
  const cy1 = bloc1.y + bloc1.h / 2
  const nx1 = anchor1.x - cx1
  const ny1 = anchor1.y - cy1
  const len1 = Math.sqrt(nx1 * nx1 + ny1 * ny1) || 1

  const cx2 = bloc2.x + bloc2.w / 2
  const cy2 = bloc2.y + bloc2.h / 2
  const nx2 = anchor2.x - cx2
  const ny2 = anchor2.y - cy2
  const len2 = Math.sqrt(nx2 * nx2 + ny2 * ny2) || 1

  return {
    cp1: {
      x: anchor1.x + (nx1 / len1) * cpDist,
      y: anchor1.y + (ny1 / len1) * cpDist,
    },
    cp2: {
      x: anchor2.x + (nx2 / len2) * cpDist,
      y: anchor2.y + (ny2 / len2) * cpDist,
    },
  }
}

/**
 * Dessine le glow lumineux de la liaison.
 */
function drawLiaisonGlow(
  ctx: CanvasRenderingContext2D,
  anchor1: Point,
  cp1: Point,
  cp2: Point,
  anchor2: Point,
  colors: ThemeColors,
  selected: boolean,
) {
  ctx.save()
  ctx.shadowColor = colors.glow
  ctx.shadowBlur = selected ? THEME.liaison.glowBlurSelected : THEME.liaison.glowBlur
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.beginPath()
  ctx.moveTo(anchor1.x, anchor1.y)
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, anchor2.x, anchor2.y)
  ctx.strokeStyle = colors.glow
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

/**
 * Dessine le trait principal de la liaison avec style selon le type.
 */
function drawLiaisonStroke(
  ctx: CanvasRenderingContext2D,
  anchor1: Point,
  cp1: Point,
  cp2: Point,
  anchor2: Point,
  colors: ThemeColors,
  type: string,
  selected: boolean,
) {
  const typeStyle = THEME.liaison.types[type] || THEME.liaison.types.simple
  const widthBonus = typeStyle.widthBonus || 0
  const baseWidth = selected ? THEME.liaison.widthSelected : THEME.liaison.width

  ctx.save()

  ctx.beginPath()
  ctx.moveTo(anchor1.x, anchor1.y)
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, anchor2.x, anchor2.y)

  ctx.strokeStyle = selected ? colors.glow : colors.border
  ctx.lineWidth = baseWidth + widthBonus
  ctx.globalAlpha = typeStyle.opacity

  if (typeStyle.dash.length > 0) {
    ctx.setLineDash(typeStyle.dash)
  }

  ctx.stroke()
  ctx.restore()
}

/**
 * Dessine une liaison complète entre deux blocs.
 * Retourne true si la liaison a été dessinée.
 */
export function drawLiaison(
  ctx: CanvasRenderingContext2D,
  liaison: LiaisonVisuelle,
  blocs: Map<string, BlocVisuel>,
  selectedBlocIds: Set<string>,
): boolean {
  const source = blocs.get(liaison.sourceId)
  const cible = blocs.get(liaison.cibleId)
  if (!source || !cible) return false

  const colors = THEME.colors[liaison.couleur]
  if (!colors) return false

  // Déterminer si la liaison est sélectionnée (un des blocs connectés est sélectionné)
  const selected = selectedBlocIds.has(liaison.sourceId) || selectedBlocIds.has(liaison.cibleId)

  // Règle d'affichage : seules les liaisons des blocs sélectionnés sont visibles,
  // SAUF les liaisons ancrées qui sont toujours visibles
  if (!selected && liaison.type !== 'ancree') return false

  // Points d'ancrage sur les bords des blocs
  const targetSource = { x: cible.x + cible.w / 2, y: cible.y + cible.h / 2 }
  const targetCible = { x: source.x + source.w / 2, y: source.y + source.h / 2 }

  const anchor1 = getAnchorPoint(source, targetSource.x, targetSource.y)
  const anchor2 = getAnchorPoint(cible, targetCible.x, targetCible.y)

  // Points de contrôle Bézier avec tangence réelle
  const { cp1, cp2 } = computeBezierControls(anchor1, source, anchor2, cible)

  // Rendu : glow d'abord, trait ensuite
  drawLiaisonGlow(ctx, anchor1, cp1, cp2, anchor2, colors, selected)
  drawLiaisonStroke(ctx, anchor1, cp1, cp2, anchor2, colors, liaison.type, selected)

  return true
}

/**
 * Dessine toutes les liaisons.
 * Les liaisons ancrées sont toujours dessinées.
 * Les autres seulement si un bloc connecté est sélectionné.
 */
export function drawAllLiaisons(
  ctx: CanvasRenderingContext2D,
  liaisons: LiaisonVisuelle[],
  blocs: BlocVisuel[],
  selectedBlocIds: Set<string>,
) {
  const blocMap = new Map<string, BlocVisuel>()
  for (const b of blocs) {
    blocMap.set(b.id, b)
  }

  // Dessiner d'abord les liaisons non-ancrées, puis les ancrées au-dessus
  for (const l of liaisons) {
    if (l.type !== 'ancree') {
      drawLiaison(ctx, l, blocMap, selectedBlocIds)
    }
  }
  for (const l of liaisons) {
    if (l.type === 'ancree') {
      drawLiaison(ctx, l, blocMap, selectedBlocIds)
    }
  }
}
