import { useEffect, useRef } from 'react'
import { CanvasEngine } from './canvas/engine'
import type { BlocVisuel, LiaisonVisuelle } from './canvas/shapes'

// Blocs de démonstration — aucun sélectionné par défaut (interaction live)
const DEMO_BLOCS: BlocVisuel[] = [
  // Ligne 1 — les 5 formes
  { id: '1', x: 50,  y: 40,  w: 180, h: 110, forme: 'cloud',        couleur: 'green',  titre: 'Nuage vert',     selected: false },
  { id: '2', x: 260, y: 40,  w: 180, h: 110, forme: 'rounded-rect', couleur: 'orange', titre: 'Rect arrondi',   selected: false },
  { id: '3', x: 470, y: 40,  w: 140, h: 140, forme: 'square',       couleur: 'yellow', titre: 'Carré jaune',    selected: false },
  { id: '4', x: 640, y: 40,  w: 190, h: 120, forme: 'oval',         couleur: 'blue',   titre: 'Ovale bleu',     selected: false },
  { id: '5', x: 860, y: 45,  w: 120, h: 120, forme: 'circle',       couleur: 'violet', titre: 'Cercle violet',  selected: false },

  // Ligne 2 — variations
  { id: '6',  x: 50,  y: 210, w: 200, h: 130, forme: 'cloud',        couleur: 'mauve',  titre: 'Nuage mauve',    selected: false },
  { id: '7',  x: 280, y: 210, w: 200, h: 120, forme: 'rounded-rect', couleur: 'blue',   titre: 'Rect bleu',      selected: false },
  { id: '8',  x: 510, y: 210, w: 150, h: 150, forme: 'square',       couleur: 'green',  titre: 'Carré vert',     selected: false },
  { id: '9',  x: 690, y: 210, w: 180, h: 110, forme: 'oval',         couleur: 'orange', titre: 'Ovale orange',   selected: false },
  { id: '10', x: 900, y: 220, w: 100, h: 100, forme: 'circle',       couleur: 'yellow', titre: 'Cercle jaune',   selected: false },
]

// Liaisons de démonstration — les 4 types
const DEMO_LIAISONS: LiaisonVisuelle[] = [
  // Simple : Nuage vert → Rect arrondi
  { id: 'l1', sourceId: '1', cibleId: '2', type: 'simple',  couleur: 'yellow' },
  // Logique : Carré jaune → Ovale bleu
  { id: 'l2', sourceId: '3', cibleId: '4', type: 'logique', couleur: 'blue' },
  // Tension : Rect arrondi → Carré jaune
  { id: 'l3', sourceId: '2', cibleId: '3', type: 'tension', couleur: 'orange' },
  // Ancrée : Cercle violet → Ovale bleu (toujours visible)
  { id: 'l4', sourceId: '5', cibleId: '4', type: 'ancree',  couleur: 'violet' },
  // Ancrée : Nuage mauve → Rect bleu (toujours visible)
  { id: 'l7', sourceId: '6', cibleId: '7', type: 'ancree',  couleur: 'mauve' },
  // Simple : Carré vert → Ovale orange
  { id: 'l5', sourceId: '8', cibleId: '9', type: 'simple',  couleur: 'green' },
  // Logique : Ovale orange → Cercle jaune
  { id: 'l6', sourceId: '9', cibleId: '10', type: 'logique', couleur: 'orange' },
]

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasEngine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new CanvasEngine(canvas)
    engineRef.current = engine
    engine.setBlocs(DEMO_BLOCS)
    engine.setLiaisons(DEMO_LIAISONS)
    engine.start()

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.destroy()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        cursor: 'default',
      }}
    />
  )
}

export default App
