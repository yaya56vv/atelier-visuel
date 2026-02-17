import { useEffect, useRef, useState } from 'react'
import { CanvasEngine } from './canvas/engine'
import type { BlocVisuel, LiaisonVisuelle } from './canvas/shapes'
import TopBar from './components/TopBar'
import SidePanel from './components/SidePanel'
import BottomBar from './components/BottomBar'
import ConsoleIA from './components/ConsoleIA'

// Blocs de démonstration — interaction live
const DEMO_BLOCS: BlocVisuel[] = [
  { id: '1', x: 50,  y: 40,  w: 180, h: 110, forme: 'cloud',        couleur: 'green',  titre: 'Nuage vert',     selected: false },
  { id: '2', x: 260, y: 40,  w: 180, h: 110, forme: 'rounded-rect', couleur: 'orange', titre: 'Rect arrondi',   selected: false },
  { id: '3', x: 470, y: 40,  w: 140, h: 140, forme: 'square',       couleur: 'yellow', titre: 'Carré jaune',    selected: false },
  { id: '4', x: 640, y: 40,  w: 190, h: 120, forme: 'oval',         couleur: 'blue',   titre: 'Ovale bleu',     selected: false },
  { id: '5', x: 860, y: 45,  w: 120, h: 120, forme: 'circle',       couleur: 'violet', titre: 'Cercle violet',  selected: false },
  { id: '6',  x: 50,  y: 210, w: 200, h: 130, forme: 'cloud',        couleur: 'mauve',  titre: 'Nuage mauve',    selected: false },
  { id: '7',  x: 280, y: 210, w: 200, h: 120, forme: 'rounded-rect', couleur: 'blue',   titre: 'Rect bleu',      selected: false },
  { id: '8',  x: 510, y: 210, w: 150, h: 150, forme: 'square',       couleur: 'green',  titre: 'Carré vert',     selected: false },
  { id: '9',  x: 690, y: 210, w: 180, h: 110, forme: 'oval',         couleur: 'orange', titre: 'Ovale orange',   selected: false },
  { id: '10', x: 900, y: 220, w: 100, h: 100, forme: 'circle',       couleur: 'yellow', titre: 'Cercle jaune',   selected: false },
]

const DEMO_LIAISONS: LiaisonVisuelle[] = [
  { id: 'l1', sourceId: '1', cibleId: '2', type: 'simple',  couleur: 'yellow' },
  { id: 'l2', sourceId: '3', cibleId: '4', type: 'logique', couleur: 'blue' },
  { id: 'l3', sourceId: '2', cibleId: '3', type: 'tension', couleur: 'orange' },
  { id: 'l4', sourceId: '5', cibleId: '4', type: 'ancree',  couleur: 'violet' },
  { id: 'l7', sourceId: '6', cibleId: '7', type: 'ancree',  couleur: 'mauve' },
  { id: 'l5', sourceId: '8', cibleId: '9', type: 'simple',  couleur: 'green' },
  { id: 'l6', sourceId: '9', cibleId: '10', type: 'logique', couleur: 'orange' },
]

const DEMO_ESPACES = [
  { id: 'esp1', nom: 'Espace de travail' },
  { id: 'esp2', nom: 'Brouillon' },
]

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasEngine | null>(null)
  const [showConsole, setShowConsole] = useState(false)
  const [espaceActifId, setEspaceActifId] = useState<string>('esp1')
  const [espaces, setEspaces] = useState(DEMO_ESPACES)

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

  const handleRecenter = () => {
    const engine = engineRef.current
    if (!engine) return
    engine.setPan(0, 0)
    engine.setZoom(1)
  }

  const handleZoomIn = () => {
    const engine = engineRef.current
    if (!engine) return
    const state = engine.getState()
    engine.setZoom(Math.min(5, state.zoom * 1.2))
  }

  const handleZoomOut = () => {
    const engine = engineRef.current
    if (!engine) return
    const state = engine.getState()
    engine.setZoom(Math.max(0.1, state.zoom / 1.2))
  }

  const handleCreateEspace = (nom: string) => {
    const id = `esp-${Date.now()}`
    setEspaces(prev => [...prev, { id, nom }])
    setEspaceActifId(id)
  }

  return (
    <>
      {/* Canvas plein écran */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100vw',
          height: '100vh',
          cursor: 'default',
        }}
      />

      {/* UI React par-dessus */}
      <TopBar
        espaces={espaces}
        espaceActifId={espaceActifId}
        onSelectEspace={setEspaceActifId}
        onCreateEspace={handleCreateEspace}
      />
      <SidePanel />
      <BottomBar
        onRecenter={handleRecenter}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleIA={() => setShowConsole(v => !v)}
        iaActive={showConsole}
      />
      <ConsoleIA
        visible={showConsole}
        onClose={() => setShowConsole(false)}
      />
    </>
  )
}

export default App
