// Canvas2D — Paramètres visuels externalisés
// Zéro constante codée en dur — tout est ici

export interface ThemeColors {
  fill: string
  fillGradientEnd: string
  border: string
  glow: string
}

export const THEME = {
  background: '#0a0a0f',

  // Couleurs sémantiques — chaque couleur a un fill, un dégradé, un bord, et un glow
  colors: {
    green: {
      fill: 'rgba(60, 100, 50, 0.85)',
      fillGradientEnd: 'rgba(30, 60, 25, 0.9)',
      border: 'rgba(100, 160, 80, 0.6)',
      glow: 'rgba(80, 140, 60, 0.4)',
    },
    orange: {
      fill: 'rgba(140, 90, 30, 0.85)',
      fillGradientEnd: 'rgba(80, 50, 15, 0.9)',
      border: 'rgba(200, 140, 50, 0.6)',
      glow: 'rgba(180, 120, 40, 0.4)',
    },
    yellow: {
      fill: 'rgba(140, 120, 40, 0.85)',
      fillGradientEnd: 'rgba(80, 70, 20, 0.9)',
      border: 'rgba(200, 180, 60, 0.6)',
      glow: 'rgba(180, 160, 50, 0.4)',
    },
    blue: {
      fill: 'rgba(40, 55, 90, 0.85)',
      fillGradientEnd: 'rgba(20, 30, 55, 0.9)',
      border: 'rgba(70, 100, 160, 0.6)',
      glow: 'rgba(60, 90, 150, 0.4)',
    },
    violet: {
      fill: 'rgba(80, 40, 90, 0.85)',
      fillGradientEnd: 'rgba(45, 20, 55, 0.9)',
      border: 'rgba(130, 70, 150, 0.6)',
      glow: 'rgba(120, 60, 140, 0.4)',
    },
    mauve: {
      fill: 'rgba(90, 50, 80, 0.85)',
      fillGradientEnd: 'rgba(50, 25, 45, 0.9)',
      border: 'rgba(150, 80, 130, 0.6)',
      glow: 'rgba(140, 70, 120, 0.4)',
    },
  } as Record<string, ThemeColors>,

  // Effets visuels
  glowBlur: 15,
  glowBlurSelected: 25,
  borderWidth: 1.5,
  borderWidthSelected: 2.5,

  // Reflet glossy
  glossyOpacity: 0.12,
  glossyHeight: 0.45, // proportion du bloc occupée par le reflet

  // Liaisons
  liaison: {
    width: 2,
    widthSelected: 3,
    glowBlur: 12,
    glowBlurSelected: 20,
    glowOpacity: 0.5,
    // Distance des points de contrôle Bézier (proportion de la distance entre blocs)
    controlPointRatio: 0.4,
    // Styles visuels par type de liaison
    types: {
      simple: {
        dash: [] as number[],        // trait continu
        opacity: 0.6,
      },
      logique: {
        dash: [8, 4],               // tirets
        opacity: 0.7,
      },
      tension: {
        dash: [3, 3],               // pointillés courts
        opacity: 0.8,
      },
      ancree: {
        dash: [] as number[],        // trait continu, plus épais
        opacity: 0.9,
        widthBonus: 1,               // épaisseur additionnelle
      },
    } as Record<string, { dash: number[]; opacity: number; widthBonus?: number }>,
  },

  // Connecteurs
  connector: {
    radius: 5,
    fill: 'rgba(80, 200, 120, 0.9)',
    border: 'rgba(60, 160, 90, 0.8)',
    glowColor: 'rgba(80, 200, 120, 0.5)',
    glowBlur: 8,
  },

  // Texte
  text: {
    color: 'rgba(220, 220, 230, 0.9)',
    font: '13px "Segoe UI", system-ui, sans-serif',
    padding: 16,
    lineHeight: 18,
  },

  // Tailles par défaut
  defaultWidth: 200,
  defaultHeight: 120,
  minWidth: 80,
  minHeight: 50,
} as const
