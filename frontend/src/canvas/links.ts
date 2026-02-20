// Canvas2D — Liaisons
// Tube fin avec liserés fluorescents nets + flux intérieur visible
// Courbes de Bézier cubiques — ancrage précis sur le contour des formes

import { THEME, lightenRGB } from './theme'
import type { BlocVisuel, LiaisonVisuelle, Forme } from './shapes'

interface Point { x: number; y: number }

// ═══════════════════════════════════════════════════════════════
// GÉOMÉTRIE — Ancrage précis sur le contour des formes
// ═══════════════════════════════════════════════════════════════

/**
 * Calcule le point d'ancrage précis sur le contour visible de la forme,
 * pas sur le rectangle englobant.
 */
function getAnchorPoint(bloc: BlocVisuel, targetX: number, targetY: number): Point {
  const cx = bloc.x + bloc.w / 2
  const cy = bloc.y + bloc.h / 2
  const dx = targetX - cx
  const dy = targetY - cy

  if (dx === 0 && dy === 0) return { x: cx, y: bloc.y }

  const angle = Math.atan2(dy, dx)

  switch (bloc.forme) {
    case 'circle': {
      const r = Math.min(bloc.w, bloc.h) / 2
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    }

    case 'oval': {
      // Ellipse pure — intersection rayon/ellipse
      const rx = bloc.w / 2
      const ry = bloc.h / 2
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const denom = Math.sqrt((cosA * cosA) / (rx * rx) + (sinA * sinA) / (ry * ry))
      return { x: cx + cosA / denom, y: cy + sinA / denom }
    }

    case 'cloud': {
      // Nuage irrégulier — ellipse + wobble identique à tracePath
      const rx = bloc.w / 2
      const ry = bloc.h / 2
      const wobble = 1 + 0.08 * Math.sin(angle * 3) + 0.05 * Math.cos(angle * 5)
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const denom = Math.sqrt((cosA * cosA) / (rx * rx) + (sinA * sinA) / (ry * ry))
      return { x: cx + cosA * wobble / denom, y: cy + sinA * wobble / denom }
    }

    case 'rounded-rect':
    case 'square':
    default: {
      // Rectangle — intersection rayon/rectangle
      const hw = bloc.w / 2
      const hh = bloc.h / 2
      const absCos = Math.abs(Math.cos(angle))
      const absSin = Math.abs(Math.sin(angle))

      let t: number
      if (absCos * hh > absSin * hw) {
        // Touche un côté vertical
        t = hw / absCos
      } else {
        // Touche un côté horizontal
        t = hh / absSin
      }
      return { x: cx + Math.cos(angle) * t, y: cy + Math.sin(angle) * t }
    }
  }
}

/**
 * Calcule les points de contrôle Bézier cubiques.
 * Courbure naturelle avec composante perpendiculaire.
 */
function computeBezierControls(p1: Point, p2: Point): { cp1: Point; cp2: Point } {
  const L = THEME.liaison
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return {
    cp1: {
      x: p1.x + dx * L.controlPointFactor1 + dy * L.controlPointPerpFactor,
      y: p1.y + dy * L.controlPointFactor1 - dx * L.controlPointPerpFactor,
    },
    cp2: {
      x: p1.x + dx * L.controlPointFactor2 - dy * L.controlPointPerpFactor,
      y: p1.y + dy * L.controlPointFactor2 + dx * L.controlPointPerpFactor,
    },
  }
}

// ═══════════════════════════════════════════════════════════════
// RENDU — Tube fin avec liserés fluorescents
// ═══════════════════════════════════════════════════════════════

function traceBezier(ctx: CanvasRenderingContext2D, a1: Point, cp1: Point, cp2: Point, a2: Point) {
  ctx.beginPath()
  ctx.moveTo(a1.x, a1.y)
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, a2.x, a2.y)
}

/**
 * Couche 1 : Liserés fluorescents nets — deux traits fins de chaque côté.
 * C'est le contour visible principal de la liaison.
 */
function drawLiseres(
  ctx: CanvasRenderingContext2D,
  a1: Point, cp1: Point, cp2: Point, a2: Point,
  rgb: string,
) {
  const brightRgb = lightenRGB(rgb, 80)

  ctx.save()
  // Trait externe (le "tube")
  traceBezier(ctx, a1, cp1, cp2, a2)
  ctx.strokeStyle = `rgba(${brightRgb}, 0.7)`
  ctx.lineWidth = 4
  ctx.stroke()

  // Trait interne sombre (creuse le tube pour donner l'effet de deux liserés)
  traceBezier(ctx, a1, cp1, cp2, a2)
  ctx.strokeStyle = `rgba(0, 0, 0, 0.55)`
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.restore()
}

/**
 * Couche 2 : Flux intérieur — tirets animés réguliers qui parcourent la liaison.
 * Pas de pulsation, pas de changement d'opacité — juste un mouvement constant.
 */
function drawFlowAnimation(
  ctx: CanvasRenderingContext2D,
  a1: Point, cp1: Point, cp2: Point, a2: Point,
  rgb: string,
  time: number,
) {
  const brightRgb = lightenRGB(rgb, 50)

  // Animation régulière et constante
  const totalDash = 10 + 14  // dash + gap
  const speed = 40  // pixels par seconde
  const dashOffset = -(time / 1000 * speed) % totalDash

  ctx.save()
  traceBezier(ctx, a1, cp1, cp2, a2)
  ctx.strokeStyle = `rgba(${brightRgb}, 0.85)`
  ctx.lineWidth = 1.5
  ctx.setLineDash([10, 14])
  ctx.lineDashOffset = dashOffset
  ctx.stroke()
  ctx.restore()
}

/**
 * Halo doré — uniquement pour les liaisons sélectionnées.
 * Pas de pulsation, juste un glow fixe.
 */
function drawSelectionGlow(
  ctx: CanvasRenderingContext2D,
  a1: Point, cp1: Point, cp2: Point, a2: Point,
) {
  const sel = THEME.liaison.selection

  ctx.save()
  ctx.shadowColor = `rgba(${sel.color}, 0.8)`
  ctx.shadowBlur = 6

  traceBezier(ctx, a1, cp1, cp2, a2)
  ctx.strokeStyle = `rgba(${sel.color}, 0.5)`
  ctx.lineWidth = 8
  ctx.stroke()
  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════
// API PUBLIQUE
// ═══════════════════════════════════════════════════════════════

/**
 * Mode de visibilité des liaisons :
 * - 'selection' : comportement par défaut (liaisons du bloc sélectionné + ancrées)
 * - 'all' : toutes les liaisons visibles
 * - Couleur spécifique ('green','orange',...) : uniquement les liaisons de cette couleur
 */
export type LiaisonVisibilityMode = 'selection' | 'all' | string

export function drawLiaison(
  ctx: CanvasRenderingContext2D,
  liaison: LiaisonVisuelle,
  blocs: Map<string, BlocVisuel>,
  selectedBlocIds: Set<string>,
  time: number,
  visibilityMode: LiaisonVisibilityMode = 'selection',
): boolean {
  const source = blocs.get(liaison.sourceId)
  const cible = blocs.get(liaison.cibleId)
  if (!source || !cible) return false

  const colors = THEME.colors[liaison.couleur]
  if (!colors) return false

  const rgb = colors.rgb
  const selected = selectedBlocIds.has(liaison.sourceId) || selectedBlocIds.has(liaison.cibleId)

  // Visibilité selon le mode
  if (visibilityMode === 'selection') {
    // Comportement par défaut : ancrées toujours, les autres si un bloc connecté est sélectionné
    if (!selected && liaison.type !== 'ancree') return false
  } else if (visibilityMode === 'all') {
    // Toutes les liaisons visibles
  } else {
    // Filtre par couleur : seules les liaisons de cette couleur
    if (liaison.couleur !== visibilityMode) return false
  }

  // Points d'ancrage PRÉCIS sur le contour des formes
  const sourceCx = source.x + source.w / 2
  const sourceCy = source.y + source.h / 2
  const cibleCx = cible.x + cible.w / 2
  const cibleCy = cible.y + cible.h / 2

  const anchor1 = getAnchorPoint(source, cibleCx, cibleCy)
  const anchor2 = getAnchorPoint(cible, sourceCx, sourceCy)

  const { cp1, cp2 } = computeBezierControls(anchor1, anchor2)

  // Appliquer le dash du type de liaison
  const typeStyle = THEME.liaison.types[liaison.type] || THEME.liaison.types.simple

  // Rendu (du plus profond au plus superficiel) :

  // Halo doré si sélectionné
  if (selected) {
    drawSelectionGlow(ctx, anchor1, cp1, cp2, anchor2)
  }

  // 1. Liserés fluorescents nets
  ctx.save()
  if (typeStyle.dash.length > 0) {
    // Pour les liaisons en pointillés, appliquer le dash sur les liserés aussi
    ctx.setLineDash(typeStyle.dash)
  }
  drawLiseres(ctx, anchor1, cp1, cp2, anchor2, rgb)
  ctx.restore()

  // 2. Flux intérieur animé
  drawFlowAnimation(ctx, anchor1, cp1, cp2, anchor2, rgb, time)

  return true
}

export function drawAllLiaisons(
  ctx: CanvasRenderingContext2D,
  liaisons: LiaisonVisuelle[],
  blocs: BlocVisuel[],
  selectedBlocIds: Set<string>,
  time: number,
  visibilityMode: LiaisonVisibilityMode = 'selection',
  highlightedBlocIds?: Set<string>,
) {
  const blocMap = new Map<string, BlocVisuel>()
  for (const b of blocs) blocMap.set(b.id, b)

  const searchActive = highlightedBlocIds && highlightedBlocIds.size > 0

  // Passe 1 : liaisons non-ancrées
  for (const l of liaisons) {
    if (l.type !== 'ancree') {
      if (searchActive) {
        const oneLit = highlightedBlocIds.has(l.sourceId) || highlightedBlocIds.has(l.cibleId)
        if (!oneLit) { ctx.globalAlpha = 0.04; }
      }
      drawLiaison(ctx, l, blocMap, selectedBlocIds, time, visibilityMode)
      if (searchActive) ctx.globalAlpha = 1
    }
  }
  // Passe 2 : liaisons ancrées
  for (const l of liaisons) {
    if (l.type === 'ancree') {
      if (searchActive) {
        const oneLit = highlightedBlocIds.has(l.sourceId) || highlightedBlocIds.has(l.cibleId)
        if (!oneLit) { ctx.globalAlpha = 0.04; }
      }
      drawLiaison(ctx, l, blocMap, selectedBlocIds, time, visibilityMode)
      if (searchActive) ctx.globalAlpha = 1
    }
  }

  // Détecter si un filtre couleur de liaisons est actif
  const liaisonColorFilter = (visibilityMode !== 'selection' && visibilityMode !== 'all') ? visibilityMode : null
  const needGlow = searchActive || liaisonColorFilter !== null

  // Passe 3 : GLOW DORÉ sur les liaisons illuminées
  // Dessiné PAR-DESSUS tout le reste pour un éclat maximal
  if (needGlow) {
    const GOLD = '255,200,80'
    const pulse = 0.7 + 0.3 * Math.sin(time / 500)

    for (const l of liaisons) {
      // En mode filtre couleur : seules les liaisons de cette couleur brillent
      // En mode recherche : seules les liaisons connectées à un bloc illuminé brillent
      if (liaisonColorFilter) {
        if (l.couleur !== liaisonColorFilter) continue
      }
      if (searchActive && !liaisonColorFilter) {
        const oneLit = highlightedBlocIds!.has(l.sourceId) || highlightedBlocIds!.has(l.cibleId)
        if (!oneLit) continue
      }

      const source = blocMap.get(l.sourceId)
      const cible = blocMap.get(l.cibleId)
      if (!source || !cible) continue

      // Intensité : full si filtre couleur, ou si les deux blocs sont illuminés
      const bothLit = liaisonColorFilter
        ? true
        : (highlightedBlocIds?.has(l.sourceId) && highlightedBlocIds?.has(l.cibleId)) || false

      // Ancres précises sur le contour
      const sourceCx = source.x + source.w / 2
      const sourceCy = source.y + source.h / 2
      const cibleCx = cible.x + cible.w / 2
      const cibleCy = cible.y + cible.h / 2
      const a1 = getAnchorPoint(source, cibleCx, cibleCy)
      const a2 = getAnchorPoint(cible, sourceCx, sourceCy)
      const L = THEME.liaison
      const dx = a2.x - a1.x
      const dy = a2.y - a1.y
      const cp1 = { x: a1.x + dx * L.controlPointFactor1 + dy * L.controlPointPerpFactor,
                    y: a1.y + dy * L.controlPointFactor1 - dx * L.controlPointPerpFactor }
      const cp2 = { x: a1.x + dx * L.controlPointFactor2 - dy * L.controlPointPerpFactor,
                    y: a1.y + dy * L.controlPointFactor2 + dx * L.controlPointPerpFactor }

      ctx.save()

      // Glow large doré (halo extérieur)
      ctx.shadowColor = `rgba(${GOLD}, ${bothLit ? 0.9 : 0.5})`
      ctx.shadowBlur = bothLit ? 18 : 10
      traceBezier(ctx, a1, cp1, cp2, a2)
      ctx.strokeStyle = `rgba(${GOLD}, ${(bothLit ? 0.6 : 0.3) * pulse})`
      ctx.lineWidth = bothLit ? 6 : 4
      ctx.stroke()

      // Coeur lumineux blanc-doré étroit
      ctx.shadowBlur = 0
      traceBezier(ctx, a1, cp1, cp2, a2)
      ctx.strokeStyle = `rgba(255, 230, 150, ${(bothLit ? 0.85 : 0.45) * pulse})`
      ctx.lineWidth = bothLit ? 2.5 : 1.5
      ctx.stroke()

      ctx.restore()
    }
  }
}
