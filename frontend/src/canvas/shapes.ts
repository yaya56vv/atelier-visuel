// Canvas2D — Formes pré-programmées
// Gélule 3D bombée avec reflets réalistes — 4 couches de gradient
// Transplantation du rendu visuel de Pensée Libérée v1
// Nuage, rectangle arrondi, carré, ovale, cercle

import { THEME, lightenRGB, darkenRGB } from './theme'

export type Forme = 'cloud' | 'rounded-rect' | 'square' | 'oval' | 'circle'
export type Couleur = 'green' | 'orange' | 'yellow' | 'blue' | 'violet' | 'mauve'
export type TypeLiaison = 'simple' | 'logique' | 'tension' | 'ancree'

export interface LiaisonVisuelle {
  id: string
  sourceId: string
  cibleId: string
  type: TypeLiaison
  couleur: Couleur
}

export interface BlocVisuel {
  id: string
  x: number
  y: number
  w: number
  h: number
  forme: Forme
  couleur: Couleur
  titre: string
  sousTitre?: string  // resume_ia ou extrait du contenu
  contentTypes?: string[]  // types de contenus (pdf, image, texte...) pour icônes indicatrices
  selected: boolean
}

// ═══════════════════════════════════════════════════════════════
// TRACÉ DES FORMES
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// RENDU MULTICOUCHE — Gélule 3D bombée
// ═══════════════════════════════════════════════════════════════

/**
 * Couche 4 (fond) : Teinte colorée — la couleur sémantique du bloc.
 * Radial gradient centré légèrement en haut, s'estompant vers du noir.
 */
function drawTintLayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme, rgb: string) {
  const t = THEME.bloc.tint
  const cx = x + w * t.cx
  const cy = y + h * t.cy
  const rx = w * t.radiusX
  const ry = h * t.radiusY
  const r = Math.max(rx, ry)

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grad.addColorStop(0, `rgba(${rgb}, ${t.opacityCenter})`)
  grad.addColorStop(0.38, `rgba(${rgb}, ${t.opacityMid})`)
  grad.addColorStop(0.65, `rgba(${rgb}, ${t.opacityOuter})`)
  grad.addColorStop(1, `rgba(0,0,0, ${t.opacityEdge})`)

  tracePath(ctx, x, y, w, h, forme)
  ctx.fillStyle = grad
  ctx.fill()
}

/**
 * Couche 3 : Ombre de courbure en bas — donne la profondeur 3D.
 */
function drawCurvatureShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme) {
  const s = THEME.bloc.curvatureShadow
  const grad = ctx.createLinearGradient(x, y, x, y + h)
  grad.addColorStop(0, 'transparent')
  grad.addColorStop(s.startAt, 'transparent')
  grad.addColorStop(0.78, `rgba(0,0,0, ${s.opacityMid})`)
  grad.addColorStop(1, `rgba(0,0,0, ${s.opacityEnd})`)

  ctx.save()
  tracePath(ctx, x, y, w, h, forme)
  ctx.clip()
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

/**
 * Couche 2 : Éclairage diffus du haut — lumière ambiante douce.
 */
function drawDiffuseLight(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme) {
  const d = THEME.bloc.diffuse
  // Gradient linéaire à 165° (approximé par un gradient du coin haut-gauche)
  const grad = ctx.createLinearGradient(x, y, x + w * 0.3, y + h * 0.6)
  grad.addColorStop(0, `rgba(255,255,255, ${d.opacityTop})`)
  grad.addColorStop(0.38, `rgba(255,255,255, ${d.opacityMid})`)
  grad.addColorStop(d.fadeAt, 'transparent')

  ctx.save()
  tracePath(ctx, x, y, w, h, forme)
  ctx.clip()
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

/**
 * Couche 1 (dessus) : Reflet spéculaire concentré — source lumière haut-gauche.
 */
function drawSpecularHighlight(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme) {
  const sp = THEME.bloc.specular
  const hl = THEME.bloc.highlight

  ctx.save()
  tracePath(ctx, x, y, w, h, forme)
  ctx.clip()

  // Reflet principal
  const hx = x + w * sp.cx
  const hy = y + h * sp.cy
  const hrx = w * sp.radiusX
  const hry = h * sp.radiusY
  const hr = Math.max(hrx, hry)

  const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr)
  grad.addColorStop(0, `rgba(255,255,255, ${sp.opacityCenter})`)
  grad.addColorStop(0.45, `rgba(255,255,255, ${sp.opacityMid})`)
  grad.addColorStop(0.72, 'transparent')

  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)

  // Highlight secondaire (plus large, plus flou)
  const hlX = x + w * hl.left
  const hlY = y + h * hl.top
  const hlW = w * hl.width
  const hlH = h * hl.height
  const hlCx = hlX + hlW * hl.cx
  const hlCy = hlY + hlH * hl.cy
  const hlR = Math.max(hlW, hlH)

  ctx.filter = `blur(${hl.blur}px)`
  const grad2 = ctx.createRadialGradient(hlCx, hlCy, 0, hlCx, hlCy, hlR)
  grad2.addColorStop(0, `rgba(255,255,255, ${hl.opacityCenter})`)
  grad2.addColorStop(0.32, `rgba(255,255,255, ${hl.opacityMid})`)
  grad2.addColorStop(0.58, `rgba(255,255,255, ${hl.opacityOuter})`)
  grad2.addColorStop(0.78, 'transparent')

  ctx.fillStyle = grad2
  ctx.fillRect(hlX, hlY, hlW, hlH)
  ctx.filter = 'none'

  ctx.restore()
}

/**
 * Contre-reflet bas — lumière réfléchie par la surface sous le bloc.
 */
function drawCounterReflection(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme) {
  const cr = THEME.bloc.counterReflection

  ctx.save()
  tracePath(ctx, x, y, w, h, forme)
  ctx.clip()

  const crX = x + w * cr.leftMargin
  const crW = w * (1 - 2 * cr.leftMargin)
  const crH = h * cr.height
  const crY = y + h * (1 - cr.bottom) - crH

  ctx.filter = `blur(${cr.blur}px)`
  const grad = ctx.createLinearGradient(crX, crY + crH, crX, crY)
  grad.addColorStop(0, `rgba(255,255,255, ${cr.opacityBottom})`)
  grad.addColorStop(0.65, `rgba(255,255,255, ${cr.opacityMid})`)
  grad.addColorStop(1, 'transparent')

  ctx.fillStyle = grad
  ctx.fillRect(crX, crY, crW, crH)
  ctx.filter = 'none'

  ctx.restore()
}

/**
 * Ombres complexes — élévation externe, rim light, ombres internes.
 */
function drawShadows(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme, rgb: string, selected: boolean) {
  const sh = THEME.bloc.shadow
  const sel = THEME.bloc.selection

  ctx.save()

  // Ombre externe d'élévation
  ctx.shadowColor = `rgba(0,0,0, ${sh.elevation1.opacity})`
  ctx.shadowBlur = sh.elevation1.blur
  ctx.shadowOffsetY = sh.elevation1.y
  tracePath(ctx, x, y, w, h, forme)
  ctx.fillStyle = 'rgba(0,0,0,0.01)'
  ctx.fill()

  // Sous-glow coloré (flottement)
  ctx.shadowColor = `rgba(${rgb}, ${sh.colorGlow.opacity})`
  ctx.shadowBlur = sh.colorGlow.blur
  ctx.shadowOffsetY = sh.colorGlow.y
  tracePath(ctx, x, y, w, h, forme)
  ctx.fill()

  // Halo doré si sélectionné
  if (selected) {
    ctx.shadowColor = `rgba(${sel.color}, ${sel.glowOpacity})`
    ctx.shadowBlur = sel.glowBlur
    ctx.shadowOffsetY = 0
    tracePath(ctx, x, y, w, h, forme)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Bordure avec rim light en haut.
 */
function drawBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Forme, rgb: string, selected: boolean) {
  const b = THEME.bloc.border
  const sel = THEME.bloc.selection

  tracePath(ctx, x, y, w, h, forme)

  if (selected) {
    ctx.strokeStyle = `rgba(${sel.color}, 1)`
    ctx.lineWidth = b.widthSelected
  } else {
    ctx.strokeStyle = `rgba(${rgb}, ${b.colorOpacity})`
    ctx.lineWidth = b.width
  }
  ctx.stroke()

  // Rim light en haut (lèvre lumineuse) — simulé par un arc partiel blanc
  ctx.save()
  tracePath(ctx, x, y, w, h, forme)
  ctx.clip()

  const rimGrad = ctx.createLinearGradient(x, y, x, y + h * 0.15)
  rimGrad.addColorStop(0, `rgba(255,255,255, ${b.topColorWhiteOpacity})`)
  rimGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = rimGrad
  ctx.lineWidth = 1.5
  tracePath(ctx, x, y, w, h, forme)
  ctx.stroke()

  ctx.restore()
}

/**
 * Texte (titre + sous-titre optionnel) centré dans le bloc avec ombre portée.
 */
function drawText(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, titre: string, sousTitre?: string) {
  if (!titre && !sousTitre) return

  ctx.save()
  ctx.shadowColor = THEME.text.shadowColor
  ctx.shadowBlur = THEME.text.shadowBlur
  ctx.textAlign = 'center'

  const maxW = w - THEME.text.padding * 2
  const cx = x + w / 2
  const cy = y + h / 2

  if (titre && sousTitre) {
    // Titre au-dessus du centre, sous-titre en dessous
    ctx.fillStyle = THEME.text.color
    ctx.font = THEME.text.font
    ctx.textBaseline = 'bottom'
    let displayTitle = titre
    while (ctx.measureText(displayTitle).width > maxW && displayTitle.length > 3) {
      displayTitle = displayTitle.slice(0, -4) + '...'
    }
    ctx.fillText(displayTitle, cx, cy - 2)

    // Sous-titre plus petit et semi-transparent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = '11px "Segoe UI", system-ui, sans-serif'
    ctx.textBaseline = 'top'
    let displaySub = sousTitre
    while (ctx.measureText(displaySub).width > maxW && displaySub.length > 3) {
      displaySub = displaySub.slice(0, -4) + '...'
    }
    ctx.fillText(displaySub, cx, cy + 3)
  } else {
    // Titre seul centré
    ctx.fillStyle = THEME.text.color
    ctx.font = THEME.text.font
    ctx.textBaseline = 'middle'
    let display = titre || sousTitre || ''
    while (ctx.measureText(display).width > maxW && display.length > 3) {
      display = display.slice(0, -4) + '...'
    }
    ctx.fillText(display, cx, cy)
  }

  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════
// CONNECTEURS
// ═══════════════════════════════════════════════════════════════

/** Calcule les 4 points de connexion sur le contour visible de la forme. */
export function getConnectorPoints(bloc: BlocVisuel): { px: number; py: number }[] {
  const cx = bloc.x + bloc.w / 2
  const cy = bloc.y + bloc.h / 2

  switch (bloc.forme) {
    case 'circle': {
      const r = Math.min(bloc.w, bloc.h) / 2
      return [
        { px: cx, py: cy - r },     // haut
        { px: cx + r, py: cy },     // droite
        { px: cx, py: cy + r },     // bas
        { px: cx - r, py: cy },     // gauche
      ]
    }
    case 'oval':
    case 'cloud': {
      const rx = bloc.w / 2
      const ry = bloc.h / 2
      return [
        { px: cx, py: cy - ry },    // haut
        { px: cx + rx, py: cy },    // droite
        { px: cx, py: cy + ry },    // bas
        { px: cx - rx, py: cy },    // gauche
      ]
    }
    case 'rounded-rect':
    case 'square':
    default:
      return [
        { px: cx, py: bloc.y },              // haut
        { px: bloc.x + bloc.w, py: cy },     // droite
        { px: cx, py: bloc.y + bloc.h },     // bas
        { px: bloc.x, py: cy },              // gauche
      ]
  }
}

/** Dessine les points de connexion sur le contour visible du bloc. */
export function drawConnectors(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rgb: string, bloc?: BlocVisuel) {
  const c = THEME.connector
  const brightRgb = lightenRGB(rgb, 40)

  // Si on a le bloc, utiliser les points précis sur le contour
  const points = bloc ? getConnectorPoints(bloc) : [
    { px: x + w / 2, py: y },
    { px: x + w, py: y + h / 2 },
    { px: x + w / 2, py: y + h },
    { px: x, py: y + h / 2 },
  ]

  for (const { px, py } of points) {
    ctx.save()
    ctx.shadowColor = `rgba(${rgb}, ${c.glowOpacity})`
    ctx.shadowBlur = c.glowBlur

    ctx.beginPath()
    ctx.arc(px, py, c.radius, 0, Math.PI * 2)

    // Gradient radial pour un aspect glossy
    const grad = ctx.createRadialGradient(px - 1, py - 1, 0, px, py, c.radius)
    grad.addColorStop(0, `rgba(${brightRgb}, 1)`)
    grad.addColorStop(1, `rgba(${rgb}, ${c.fillOpacity})`)

    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = `rgba(${brightRgb}, ${c.borderOpacity})`
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  }
}

// ═══════════════════════════════════════════════════════════════
// POIGNÉES DE RESIZE
// ═══════════════════════════════════════════════════════════════

const RESIZE_HANDLE = {
  size: 7,        // taille du carré de poignée
  color: '255,160,60',  // orange vif — distinct de la forme
  opacity: 0.8,
  borderOpacity: 0.95,
}

/** Calcule les 8 positions de poignées de resize sur le contour visible de la forme. */
function getResizeHandlePositions(bloc: BlocVisuel): { px: number; py: number }[] {
  const { x, y, w, h, forme } = bloc
  const cx = x + w / 2
  const cy = y + h / 2

  switch (forme) {
    case 'circle': {
      const r = Math.min(w, h) / 2
      // 8 points équidistants sur le cercle (à 45° d'intervalle)
      return [
        { px: cx + r * Math.cos(-3 * Math.PI / 4), py: cy + r * Math.sin(-3 * Math.PI / 4) }, // nw
        { px: cx, py: cy - r },                                                                 // n
        { px: cx + r * Math.cos(-Math.PI / 4), py: cy + r * Math.sin(-Math.PI / 4) },           // ne
        { px: cx + r, py: cy },                                                                  // e
        { px: cx + r * Math.cos(Math.PI / 4), py: cy + r * Math.sin(Math.PI / 4) },             // se
        { px: cx, py: cy + r },                                                                  // s
        { px: cx + r * Math.cos(3 * Math.PI / 4), py: cy + r * Math.sin(3 * Math.PI / 4) },     // sw
        { px: cx - r, py: cy },                                                                  // w
      ]
    }
    case 'oval':
    case 'cloud': {
      const rx = w / 2
      const ry = h / 2
      // 8 points sur l'ellipse
      const angles = [-3*Math.PI/4, -Math.PI/2, -Math.PI/4, 0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI]
      return angles.map(a => {
        const cosA = Math.cos(a)
        const sinA = Math.sin(a)
        const d = Math.sqrt((cosA*cosA)/(rx*rx) + (sinA*sinA)/(ry*ry))
        return { px: cx + cosA / d, py: cy + sinA / d }
      })
    }
    case 'rounded-rect':
    case 'square':
    default:
      return [
        { px: x, py: y },             // nw
        { px: cx, py: y },            // n
        { px: x + w, py: y },         // ne
        { px: x + w, py: cy },        // e
        { px: x + w, py: y + h },     // se
        { px: cx, py: y + h },        // s
        { px: x, py: y + h },         // sw
        { px: x, py: cy },            // w
      ]
  }
}

/** Dessine les 8 poignées de resize sur le contour visible du bloc. */
function drawResizeHandles(ctx: CanvasRenderingContext2D, bloc: BlocVisuel) {
  const s = RESIZE_HANDLE.size
  const hs = s / 2
  const rgb = RESIZE_HANDLE.color
  const handles = getResizeHandlePositions(bloc)

  for (const { px, py } of handles) {
    ctx.save()
    ctx.fillStyle = `rgba(${rgb}, ${RESIZE_HANDLE.opacity})`
    ctx.strokeStyle = `rgba(255,255,255, ${RESIZE_HANDLE.borderOpacity})`
    ctx.lineWidth = 1
    ctx.fillRect(px - hs, py - hs, s, s)
    ctx.strokeRect(px - hs, py - hs, s, s)
    ctx.restore()
  }
}

// ═══════════════════════════════════════════════════════════════
// BOUTON FORME/COULEUR (carré haut-droite)
// ═══════════════════════════════════════════════════════════════

/** Taille et position du bouton forme/couleur. */
export const SHAPE_BUTTON = {
  size: 14,
  offset: 6,      // distance depuis le coin haut-droite du bloc
  hitPadding: 4,   // marge de clic supplémentaire
}

/** Retourne la position du bouton forme/couleur (coordonnées monde).
 * Positionné à l'intérieur de la forme visible, pas du rectangle englobant.
 */
export function getShapeButtonPos(bloc: BlocVisuel): { bx: number; by: number } {
  const s = SHAPE_BUTTON.size
  const off = SHAPE_BUTTON.offset
  const cx = bloc.x + bloc.w / 2
  const cy = bloc.y + bloc.h / 2

  switch (bloc.forme) {
    case 'circle': {
      // Dans le quart haut-droit du cercle
      const r = Math.min(bloc.w, bloc.h) / 2
      const angle = -Math.PI / 4  // 45° haut-droite
      const margin = r * 0.35
      return {
        bx: cx + margin * Math.cos(angle) - s / 2,
        by: cy + margin * Math.sin(angle) - s / 2,
      }
    }

    case 'oval':
    case 'cloud': {
      // Dans le quart haut-droit de l'ellipse
      const rx = bloc.w / 2
      const ry = bloc.h / 2
      return {
        bx: cx + rx * 0.4 - s / 2,
        by: cy - ry * 0.45 - s / 2,
      }
    }

    case 'rounded-rect':
    case 'square':
    default: {
      // Coin haut-droite classique (marche bien pour les rectangles)
      return {
        bx: bloc.x + bloc.w - off - s,
        by: bloc.y + off,
      }
    }
  }
}

/** Hit-test du bouton forme/couleur. */
export function hitTestShapeButton(bloc: BlocVisuel, wx: number, wy: number): boolean {
  const { bx, by } = getShapeButtonPos(bloc)
  const pad = SHAPE_BUTTON.hitPadding
  return wx >= bx - pad && wx <= bx + SHAPE_BUTTON.size + pad
      && wy >= by - pad && wy <= by + SHAPE_BUTTON.size + pad
}

/** Dessine le bouton carré en haut à droite du bloc. */
function drawShapeButton(ctx: CanvasRenderingContext2D, bloc: BlocVisuel, rgb: string) {
  const { bx, by } = getShapeButtonPos(bloc)
  const s = SHAPE_BUTTON.size
  const r = 3 // rayon des coins arrondis

  ctx.save()

  // Fond semi-transparent
  ctx.beginPath()
  ctx.moveTo(bx + r, by)
  ctx.lineTo(bx + s - r, by)
  ctx.quadraticCurveTo(bx + s, by, bx + s, by + r)
  ctx.lineTo(bx + s, by + s - r)
  ctx.quadraticCurveTo(bx + s, by + s, bx + s - r, by + s)
  ctx.lineTo(bx + r, by + s)
  ctx.quadraticCurveTo(bx, by + s, bx, by + s - r)
  ctx.lineTo(bx, by + r)
  ctx.quadraticCurveTo(bx, by, bx + r, by)
  ctx.closePath()

  ctx.fillStyle = `rgba(${rgb}, 0.35)`
  ctx.fill()
  ctx.strokeStyle = `rgba(255,255,255, 0.45)`
  ctx.lineWidth = 1
  ctx.stroke()

  // Icône : mini-forme du bloc au centre
  const iconSize = 6
  const icx = bx + s / 2
  const icy = by + s / 2

  ctx.fillStyle = `rgba(${rgb}, 0.9)`
  ctx.strokeStyle = `rgba(255,255,255, 0.7)`
  ctx.lineWidth = 0.8

  drawMiniShape(ctx, icx, icy, iconSize, bloc.forme)

  ctx.restore()
}

/** Dessine une mini-représentation de la forme (pour l'icône du bouton). */
function drawMiniShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, forme: Forme) {
  ctx.beginPath()
  switch (forme) {
    case 'cloud': {
      const steps = 20
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2
        const wobble = 1 + 0.15 * Math.sin(angle * 3)
        const px = cx + size * wobble * Math.cos(angle) * 0.9
        const py = cy + size * wobble * Math.sin(angle) * 0.7
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }
    case 'rounded-rect': {
      const rr = 2
      ctx.roundRect(cx - size, cy - size * 0.65, size * 2, size * 1.3, rr)
      break
    }
    case 'square': {
      ctx.rect(cx - size * 0.7, cy - size * 0.7, size * 1.4, size * 1.4)
      break
    }
    case 'oval': {
      ctx.ellipse(cx, cy, size, size * 0.65, 0, 0, Math.PI * 2)
      break
    }
    case 'circle': {
      ctx.arc(cx, cy, size * 0.75, 0, Math.PI * 2)
      break
    }
  }
  ctx.fill()
  ctx.stroke()
}

// ═══════════════════════════════════════════════════════════════
// ICÔNES INDICATRICES DE CONTENUS
// ═══════════════════════════════════════════════════════════════

/** Mapping type de contenu → icône vectorielle dessinée sur le canvas. */
const CONTENT_ICON_CONFIG = {
  iconSize: 14,
  spacing: 3,
  bottomMargin: 8,
  pillPadding: 4,
  pillRadius: 7,
  pillOpacity: 0.55,
  iconOpacity: 0.9,
} as const

/** Types de contenus et leur représentation visuelle. */
const CONTENT_TYPE_ICONS: Record<string, { draw: (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => void; color: string }> = {
  pdf: {
    color: '255,120,80',
    draw: (ctx, cx, cy, s) => {
      // Document avec coin plié
      const hs = s / 2
      const fold = s * 0.3
      ctx.beginPath()
      ctx.moveTo(cx - hs, cy - hs)
      ctx.lineTo(cx + hs - fold, cy - hs)
      ctx.lineTo(cx + hs, cy - hs + fold)
      ctx.lineTo(cx + hs, cy + hs)
      ctx.lineTo(cx - hs, cy + hs)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Pli
      ctx.beginPath()
      ctx.moveTo(cx + hs - fold, cy - hs)
      ctx.lineTo(cx + hs - fold, cy - hs + fold)
      ctx.lineTo(cx + hs, cy - hs + fold)
      ctx.stroke()
    },
  },
  image: {
    color: '120,200,255',
    draw: (ctx, cx, cy, s) => {
      // Cadre image avec montagne
      const hs = s / 2
      ctx.strokeRect(cx - hs, cy - hs, s, s)
      // Petite montagne
      ctx.beginPath()
      ctx.moveTo(cx - hs + 1, cy + hs - 1)
      ctx.lineTo(cx - 1, cy)
      ctx.lineTo(cx + 2, cy + 2)
      ctx.lineTo(cx + hs - 1, cy - 1)
      ctx.lineTo(cx + hs - 1, cy + hs - 1)
      ctx.closePath()
      ctx.fill()
      // Soleil
      ctx.beginPath()
      ctx.arc(cx + hs * 0.35, cy - hs * 0.3, s * 0.12, 0, Math.PI * 2)
      ctx.fill()
    },
  },
  video_ref: {
    color: '255,80,80',
    draw: (ctx, cx, cy, s) => {
      // Triangle play
      const hs = s / 2
      ctx.beginPath()
      ctx.moveTo(cx - hs * 0.5, cy - hs * 0.7)
      ctx.lineTo(cx + hs * 0.7, cy)
      ctx.lineTo(cx - hs * 0.5, cy + hs * 0.7)
      ctx.closePath()
      ctx.fill()
    },
  },
  url: {
    color: '150,180,255',
    draw: (ctx, cx, cy, s) => {
      // Chaînon de lien
      const r = s * 0.25
      ctx.beginPath()
      ctx.arc(cx - r, cy, r, Math.PI * 0.5, Math.PI * 1.5)
      ctx.lineTo(cx, cy - r)
      ctx.arc(cx + r, cy, r, Math.PI * 1.5, Math.PI * 0.5)
      ctx.lineTo(cx, cy + r)
      ctx.stroke()
    },
  },
  fichier: {
    color: '180,180,200',
    draw: (ctx, cx, cy, s) => {
      // Trombone / clip
      const hs = s / 2
      ctx.strokeRect(cx - hs * 0.6, cy - hs, s * 0.6, s)
      ctx.beginPath()
      ctx.moveTo(cx + hs * 0.3, cy - hs * 0.3)
      ctx.lineTo(cx + hs * 0.3, cy + hs * 0.5)
      ctx.stroke()
    },
  },
  citation: {
    color: '200,170,255',
    draw: (ctx, cx, cy, s) => {
      // Guillemets
      const hs = s / 2
      ctx.font = `bold ${s}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('\u201C', cx, cy - 1)
    },
  },
  audio: {
    color: '180,140,255',
    draw: (ctx, cx, cy, s) => {
      // Onde sonore (3 arcs croissants)
      const hs = s / 2
      ctx.beginPath()
      ctx.arc(cx - hs * 0.2, cy, hs * 0.25, -Math.PI * 0.5, Math.PI * 0.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx - hs * 0.2, cy, hs * 0.5, -Math.PI * 0.5, Math.PI * 0.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx - hs * 0.2, cy, hs * 0.75, -Math.PI * 0.5, Math.PI * 0.5)
      ctx.stroke()
    },
  },
  code: {
    color: '100,220,180',
    draw: (ctx, cx, cy, s) => {
      // Chevrons < />
      const hs = s / 2
      ctx.beginPath()
      ctx.moveTo(cx - hs * 0.3, cy - hs * 0.5)
      ctx.lineTo(cx - hs * 0.8, cy)
      ctx.lineTo(cx - hs * 0.3, cy + hs * 0.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + hs * 0.3, cy - hs * 0.5)
      ctx.lineTo(cx + hs * 0.8, cy)
      ctx.lineTo(cx + hs * 0.3, cy + hs * 0.5)
      ctx.stroke()
    },
  },
  docx: {
    color: '80,160,255',
    draw: (ctx, cx, cy, s) => {
      // Document Word (W)
      const hs = s / 2
      ctx.strokeRect(cx - hs * 0.7, cy - hs, s * 0.7, s)
      ctx.font = `bold ${s * 0.5}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('W', cx, cy + 1)
    },
  },
}

/** Dessine les icônes indicatrices des types de contenus en bas du bloc. */
function drawContentIcons(ctx: CanvasRenderingContext2D, bloc: BlocVisuel) {
  const types = bloc.contentTypes
  if (!types || types.length === 0) return

  // Filtrer : ne pas afficher 'texte' ni 'note' (c'est le contenu de base)
  const displayTypes = types.filter(t => t !== 'texte' && t !== 'note' && t !== 'tableau')
  if (displayTypes.length === 0) return

  const cfg = CONTENT_ICON_CONFIG
  const totalWidth = displayTypes.length * (cfg.iconSize + cfg.spacing) - cfg.spacing + cfg.pillPadding * 2
  const startX = bloc.x + bloc.w / 2 - totalWidth / 2 + cfg.pillPadding
  const iconY = bloc.y + bloc.h - cfg.bottomMargin

  ctx.save()

  // Fond pill semi-transparent pour les icônes
  const pillX = bloc.x + bloc.w / 2 - totalWidth / 2
  const pillH = cfg.iconSize + cfg.pillPadding * 2
  const pillY = iconY - cfg.iconSize / 2 - cfg.pillPadding

  ctx.beginPath()
  const r = cfg.pillRadius
  ctx.moveTo(pillX + r, pillY)
  ctx.lineTo(pillX + totalWidth - r, pillY)
  ctx.quadraticCurveTo(pillX + totalWidth, pillY, pillX + totalWidth, pillY + r)
  ctx.lineTo(pillX + totalWidth, pillY + pillH - r)
  ctx.quadraticCurveTo(pillX + totalWidth, pillY + pillH, pillX + totalWidth - r, pillY + pillH)
  ctx.lineTo(pillX + r, pillY + pillH)
  ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r)
  ctx.lineTo(pillX, pillY + r)
  ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY)
  ctx.closePath()
  ctx.fillStyle = `rgba(0, 0, 0, ${cfg.pillOpacity})`
  ctx.fill()

  // Dessiner chaque icône
  for (let i = 0; i < displayTypes.length; i++) {
    const type = displayTypes[i]
    const iconDef = CONTENT_TYPE_ICONS[type] || CONTENT_TYPE_ICONS['fichier']
    const icx = startX + i * (cfg.iconSize + cfg.spacing) + cfg.iconSize / 2
    const icy = iconY

    ctx.save()
    ctx.fillStyle = `rgba(${iconDef.color}, ${cfg.iconOpacity})`
    ctx.strokeStyle = `rgba(${iconDef.color}, ${cfg.iconOpacity})`
    ctx.lineWidth = 1
    iconDef.draw(ctx, icx, icy, cfg.iconSize * 0.7)
    ctx.restore()
  }

  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════
// RENDU COMPLET D'UN BLOC
// ═══════════════════════════════════════════════════════════════

/** Dessine un bloc complet avec tous ses effets visuels — 4 couches + ombres + bordure. */
export function drawBloc(ctx: CanvasRenderingContext2D, bloc: BlocVisuel) {
  const { x, y, w, h, forme, couleur, titre, selected } = bloc
  const colors = THEME.colors[couleur]
  if (!colors) return

  const rgb = colors.rgb

  // Ordre de rendu (du plus profond au plus superficiel) :
  // 1. Ombres externes
  drawShadows(ctx, x, y, w, h, forme, rgb, selected)
  // 2. Teinte colorée (fond)
  drawTintLayer(ctx, x, y, w, h, forme, rgb)
  // 3. Ombre de courbure
  drawCurvatureShadow(ctx, x, y, w, h, forme)
  // 4. Éclairage diffus
  drawDiffuseLight(ctx, x, y, w, h, forme)
  // 5. Reflet spéculaire
  drawSpecularHighlight(ctx, x, y, w, h, forme)
  // 6. Contre-reflet bas
  drawCounterReflection(ctx, x, y, w, h, forme)
  // 7. Bordure + rim light
  drawBorder(ctx, x, y, w, h, forme, rgb, selected)
  // 8. Texte (titre + sous-titre)
  drawText(ctx, x, y, w, h, titre, bloc.sousTitre)
  // 8b. Icônes indicatrices de contenus (pdf, image, vidéo...)
  drawContentIcons(ctx, bloc)
  // 9. Bouton forme/couleur (toujours visible)
  drawShapeButton(ctx, bloc, rgb)
  // 10. Poignées de resize (uniquement si sélectionné)
  if (selected) {
    drawResizeHandles(ctx, bloc)
  }
  // 11. Connecteurs (uniquement si sélectionné)
  if (selected) {
    drawConnectors(ctx, x, y, w, h, rgb, bloc)
  }
}

// ═══════════════════════════════════════════════════════════════
// RENDU CONSTELLATION — Point lumineux (zoom < 0.4)
// ═══════════════════════════════════════════════════════════════

/** Seuils de zoom pour les niveaux de détail */
export const ZOOM_LOD = {
  constellation: 0.4,  // En dessous : points lumineux
  minimal: 0.7,        // En dessous : titres seuls
  // Au-dessus : rendu complet
} as const

/**
 * Dessine un bloc comme un point lumineux coloré — mode constellation.
 * Inspiré du Graph View d'Obsidian : halo diffus + noyau brillant.
 * Les blocs sélectionnés pulsent avec un halo doré.
 */
export function drawBlocConstellation(ctx: CanvasRenderingContext2D, bloc: BlocVisuel, time: number) {
  const colors = THEME.colors[bloc.couleur]
  if (!colors) return

  const rgb = colors.rgb
  const cx = bloc.x + bloc.w / 2
  const cy = bloc.y + bloc.h / 2

  // Taille du point proportionnelle à la surface du bloc (perception de masse)
  const area = bloc.w * bloc.h
  const baseRadius = Math.max(4, Math.min(14, Math.sqrt(area) / 12))

  // Pulsation douce pour les blocs sélectionnés
  const pulse = bloc.selected
    ? 1 + 0.15 * Math.sin(time / 400)
    : 1
  const radius = baseRadius * pulse

  ctx.save()

  // Couche 1 : Halo diffus large (ambiance)
  const glowRadius = radius * 4
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius)
  glowGrad.addColorStop(0, `rgba(${rgb}, 0.25)`)
  glowGrad.addColorStop(0.4, `rgba(${rgb}, 0.08)`)
  glowGrad.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
  ctx.fill()

  // Couche 2 : Noyau lumineux
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  const brightRgb = lightenRGB(rgb, 80)
  coreGrad.addColorStop(0, `rgba(${brightRgb}, 1)`)
  coreGrad.addColorStop(0.5, `rgba(${rgb}, 0.85)`)
  coreGrad.addColorStop(1, `rgba(${rgb}, 0.3)`)
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()

  // Couche 3 : Éclat blanc central (point de brillance)
  const sparkRadius = radius * 0.35
  const sparkGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sparkRadius)
  sparkGrad.addColorStop(0, 'rgba(255,255,255, 0.9)')
  sparkGrad.addColorStop(1, 'rgba(255,255,255, 0)')
  ctx.fillStyle = sparkGrad
  ctx.beginPath()
  ctx.arc(cx, cy, sparkRadius, 0, Math.PI * 2)
  ctx.fill()

  // Halo doré si sélectionné
  if (bloc.selected) {
    const sel = THEME.bloc.selection
    ctx.shadowColor = `rgba(${sel.color}, ${sel.glowOpacity})`
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${sel.color}, 0.3)`
    ctx.fill()
    ctx.shadowBlur = 0
  }

  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════
// RENDU MINIMAL — Titres seuls (0.4 <= zoom < 0.7)
// ═══════════════════════════════════════════════════════════════

/**
 * Dessine un bloc simplifié : forme légère + titre uniquement.
 * Pas de multicouche 3D, juste assez pour identifier le bloc.
 */
export function drawBlocMinimal(ctx: CanvasRenderingContext2D, bloc: BlocVisuel) {
  const { x, y, w, h, forme, couleur, titre, selected } = bloc
  const colors = THEME.colors[couleur]
  if (!colors) return

  const rgb = colors.rgb

  ctx.save()

  // Fond coloré simple avec opacité réduite
  tracePath(ctx, x, y, w, h, forme)
  ctx.fillStyle = `rgba(${rgb}, 0.18)`
  ctx.fill()

  // Bordure colorée fine
  tracePath(ctx, x, y, w, h, forme)
  if (selected) {
    const sel = THEME.bloc.selection
    ctx.strokeStyle = `rgba(${sel.color}, 0.8)`
    ctx.lineWidth = 2
    // Halo doré discret
    ctx.shadowColor = `rgba(${sel.color}, 0.4)`
    ctx.shadowBlur = 15
  } else {
    ctx.strokeStyle = `rgba(${rgb}, 0.4)`
    ctx.lineWidth = 1
  }
  ctx.stroke()
  ctx.shadowBlur = 0

  // Titre uniquement — plus grand que le rendu complet pour compenser le dézoom
  if (titre) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = THEME.text.color
    ctx.font = '14px "Segoe UI", system-ui, sans-serif'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 3

    const maxW = w - 12
    let display = titre
    while (ctx.measureText(display).width > maxW && display.length > 3) {
      display = display.slice(0, -4) + '...'
    }
    ctx.fillText(display, x + w / 2, y + h / 2)
  }

  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════
// HIT-TEST
// ═══════════════════════════════════════════════════════════════

/** Vérifie si un point est à l'intérieur d'un bloc. */
/**
 * Vérifie si un point (coordonnées monde) est à l'intérieur d'un bloc.
 * Utilise un hit-test géométrique pur (pas ctx.isPointInPath) pour éviter
 * les problèmes de transformation Canvas.
 */
export function isPointInBloc(_ctx: CanvasRenderingContext2D, bloc: BlocVisuel, px: number, py: number): boolean {
  const { x, y, w, h, forme } = bloc

  switch (forme) {
    case 'circle': {
      const cx = x + w / 2
      const cy = y + h / 2
      const r = Math.min(w, h) / 2
      const dx = px - cx
      const dy = py - cy
      return dx * dx + dy * dy <= r * r
    }

    case 'oval':
    case 'cloud': {
      // Test d'inclusion dans une ellipse
      const cx = x + w / 2
      const cy = y + h / 2
      const rx = w / 2
      const ry = h / 2
      const dx = (px - cx) / rx
      const dy = (py - cy) / ry
      return dx * dx + dy * dy <= 1
    }

    case 'rounded-rect':
    case 'square':
    default: {
      // Rectangle simple (les coins arrondis sont négligés pour le hit-test)
      return px >= x && px <= x + w && py >= y && py <= y + h
    }
  }
}
