// Canvas2D — Paramètres visuels externalisés
// Zéro constante codée en dur — tout est ici
// Palette vibrante issue du prototype Pensée Libérée v1
// Clés sémantiques alignées avec les documents A, D, G0, CENTRAL.md

export interface ThemeColors {
  /** Composantes RGB brutes (ex: '30,225,100') — base de tous les calculs */
  rgb: string
  /** Hex pour référence rapide */
  hex: string
  /** Label sémantique (pour légendes) */
  label: string
}

/** Éclaircit une couleur RGB pour les liserés lumineux et reflets */
export function lightenRGB(rgb: string, amount = 55): string {
  return rgb
    .split(',')
    .map(v => Math.min(255, Number(v.trim()) + amount))
    .join(',')
}

/** Assombrit une couleur RGB */
export function darkenRGB(rgb: string, amount = 60): string {
  return rgb
    .split(',')
    .map(v => Math.max(0, Number(v.trim()) - amount))
    .join(',')
}

export const THEME = {
  background: '#0a0a0f',

  // ═══════════════════════════════════════════════════════════
  // PALETTE SÉMANTIQUE — 6 couleurs vibrantes
  // Source de vérité visuelle : Brouillon 1 (Pensée Libérée v1)
  // Source de vérité sémantique : Documents A, D, G0, CENTRAL.md
  // ═══════════════════════════════════════════════════════════
  colors: {
    green: {
      rgb: '30,225,100',
      hex: '#1EE164',
      label: 'Matière première / Relation',
    },
    orange: {
      rgb: '255,138,48',
      hex: '#FF8A30',
      label: 'Énergie / Tension',
    },
    yellow: {
      rgb: '255,214,56',
      hex: '#FFD638',
      label: 'Lumière / Insight',
    },
    blue: {
      rgb: '64,188,255',
      hex: '#40BCFF',
      label: 'Logique / Raison',
    },
    violet: {
      rgb: '162,96,255',
      hex: '#A260FF',
      label: 'Spirituel / Sens',
    },
    mauve: {
      rgb: '215,140,255',
      hex: '#D78CFF',
      label: 'Concept en création',
    },
  } as Record<string, ThemeColors>,

  // ═══════════════════════════════════════════════════════════
  // BLOCS — Gélule 3D bombée multicouche
  // ═══════════════════════════════════════════════════════════
  bloc: {
    /** 4 couches de gradient pour l'effet 3D */
    specular: {
      // Couche 1 : Reflet spéculaire concentré (source lumière haut-gauche)
      cx: 0.28, cy: 0.20,
      radiusX: 0.50, radiusY: 0.32,
      opacityCenter: 0.72,
      opacityMid: 0.28,
    },
    diffuse: {
      // Couche 2 : Éclairage diffus du haut
      angle: 165, // degrés
      opacityTop: 0.38,
      opacityMid: 0.10,
      fadeAt: 0.56, // proportion où ça devient transparent
    },
    curvatureShadow: {
      // Couche 3 : Ombre de courbure en bas
      startAt: 0.55,
      opacityMid: 0.14,
      opacityEnd: 0.32,
    },
    tint: {
      // Couche 4 : Teinte colorée (la couleur du bloc)
      cx: 0.50, cy: 0.36,
      radiusX: 1.40, radiusY: 1.10,
      opacityCenter: 0.52,
      opacityMid: 0.32,
      opacityOuter: 0.14,
      opacityEdge: 0.18, // noir au bord
    },
    /** Pseudo-élément ::before — highlight principal */
    highlight: {
      top: 0.02, left: 0.06,
      width: 0.55, height: 0.36,
      cx: 0.40, cy: 0.40,
      opacityCenter: 0.78,
      opacityMid: 0.32,
      opacityOuter: 0.08,
      blur: 7,
    },
    /** Pseudo-élément ::after — contre-reflet bas */
    counterReflection: {
      bottom: 0.04,
      leftMargin: 0.18,
      height: 0.18,
      opacityBottom: 0.22,
      opacityMid: 0.06,
      blur: 5,
    },
    /** Box-shadow complexe */
    shadow: {
      elevation1: { y: 14, blur: 50, opacity: 0.60 },
      elevation2: { y: 5, blur: 18, opacity: 0.42 },
      colorGlow: { y: 6, blur: 28, opacity: 0.22 },
      rimLightTop: { y: 2, blur: 10, opacity: 0.62 },
      rimLightEdge: { y: 1, blur: 0, opacity: 0.52 },
      innerBottom: { y: -5, blur: 14, opacity: 0.52 },
      innerSide: { x: 5, blur: 14, opacity: 0.22 },
    },
    /** Bordure */
    border: {
      width: 1,
      widthSelected: 2,
      colorOpacity: 0.45,
      topColorWhiteOpacity: 0.38,
    },
    /** Sélection — halo doré */
    selection: {
      color: '255,200,100',
      glowBlur: 35,
      glowOpacity: 0.55,
    },
    /** Hover */
    hover: {
      scale: 1.04,
      translateY: -6,
      colorGlowOpacity: 0.30,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // LIAISONS — Tube lumineux 5 couches avec flux animé
  // ═══════════════════════════════════════════════════════════
  liaison: {
    /** Couche 1 : Halo ambiant large (glow diffus) */
    ambient: {
      width: 16,
      opacity: 0.12,
    },
    /** Couche 2 : Liserés lumineux (bords fins du tube) */
    lisere: {
      width: 8,
      opacity: 0.72,
      lightenAmount: 60,
      glowBlur: 4,
    },
    /** Couche 3 : Corps principal du tube */
    tube: {
      width: 5,
      opacity: 0.68,
    },
    /** Couche 4 : Ligne centrale lumineuse */
    glow: {
      width: 1.5,
      lightenAmount: 60,
      glowBlur1: 5,
      glowBlur2: 12,
    },
    /** Couche 5 : Animation de flux (tirets en mouvement) */
    flow: {
      width: 2.5,
      dashArray: [10, 14] as number[],
      animationDuration: 1.8, // secondes
      lightenAmount: 60,
      opacity: 0.88,
    },
    /** Sélection — halo doré pulsé */
    selection: {
      width: 14,
      color: '255,200,100',
      opacity: 0.55,
      glowBlur: 8,
      pulseMin: 0.35,
      pulseMax: 0.70,
      pulseDuration: 1.3, // secondes
    },
    /** Liaison en cours de création (tirets animés) */
    drawing: {
      width: 5,
      dashArray: [8, 5] as number[],
      opacity: 0.9,
      glowBlur: 10,
    },
    /** Points de contrôle Bézier */
    controlPointFactor1: 0.3,
    controlPointFactor2: 0.7,
    controlPointPerpFactor: 0.15,
    /** Styles visuels par type de liaison */
    types: {
      simple: {
        dash: [] as number[],
        opacityMultiplier: 1.0,
      },
      logique: {
        dash: [8, 4],
        opacityMultiplier: 1.0,
      },
      tension: {
        dash: [3, 3],
        opacityMultiplier: 1.0,
      },
      ancree: {
        dash: [] as number[],
        opacityMultiplier: 1.0,
        widthBonus: 1,
      },
    } as Record<string, { dash: number[]; opacityMultiplier: number; widthBonus?: number }>,
  },

  // ═══════════════════════════════════════════════════════════
  // CONNECTEURS
  // ═══════════════════════════════════════════════════════════
  connector: {
    radius: 6,
    fillOpacity: 0.9,
    borderOpacity: 0.6,
    glowBlur: 10,
    glowOpacity: 0.6,
    // En V1 les connecteurs héritent la couleur du bloc
  },

  // ═══════════════════════════════════════════════════════════
  // TEXTE
  // ═══════════════════════════════════════════════════════════
  text: {
    color: 'rgba(255, 255, 255, 0.92)',
    font: '13px "Segoe UI", system-ui, sans-serif',
    padding: 16,
    lineHeight: 18,
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowBlur: 4,
  },

  // ═══════════════════════════════════════════════════════════
  // TAILLES PAR DÉFAUT
  // ═══════════════════════════════════════════════════════════
  defaultWidth: 200,
  defaultHeight: 120,
  minWidth: 80,
  minHeight: 50,
} as const
