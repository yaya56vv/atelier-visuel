import { useEffect, useRef, useState } from 'react'
import { CanvasEngine } from './canvas/engine'
import { canvasBus } from './canvas/events'
import TopBar from './components/TopBar'
import SidePanel from './components/SidePanel'
import BottomBar from './components/BottomBar'
import ConsoleIA from './components/ConsoleIA'
import BlocEditor from './components/BlocEditor'
import { useEspaceStore } from './stores/espaceStore'
import { useBlocsStore } from './stores/blocsStore'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasEngine | null>(null)
  const [showConsole, setShowConsole] = useState(false)
  const [backendOk, setBackendOk] = useState(false)
  const [editBlocId, setEditBlocId] = useState<string | null>(null)
  const [selectedBlocId, setSelectedBlocId] = useState<string | null>(null)

  const espaceStore = useEspaceStore()
  const blocsStore = useBlocsStore(espaceStore.espaceActifId)

  // Détecter si le backend est disponible
  useEffect(() => {
    fetch('/api/espaces/')
      .then(r => { if (r.ok) setBackendOk(true) })
      .catch(() => {})
  }, [])

  // Initialiser le moteur Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new CanvasEngine(canvas)
    engineRef.current = engine
    engine.start()

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  // Synchroniser les blocs et liaisons avec le moteur
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.setBlocs(blocsStore.blocs)
    engine.setLiaisons(blocsStore.liaisons)
  }, [blocsStore.blocs, blocsStore.liaisons])

  // Écouter les événements du bus pour synchroniser avec l'API
  useEffect(() => {
    if (!backendOk) return

    const unsubs = [
      canvasBus.on('bloc:select', ({ blocId }) => {
        setSelectedBlocId(blocId)
      }),
      canvasBus.on('bloc:move', ({ blocId, x, y }) => {
        blocsStore.moveBloc(blocId, x, y)
      }),
      canvasBus.on('bloc:resize', ({ blocId, w, h }) => {
        blocsStore.resizeBloc(blocId, w, h)
      }),
      canvasBus.on('liaison:create', ({ sourceId, cibleId }) => {
        blocsStore.createLiaison(sourceId, cibleId)
      }),
    ]

    return () => unsubs.forEach(fn => fn())
  }, [backendOk, blocsStore.moveBloc, blocsStore.resizeBloc, blocsStore.createLiaison])

  // Double-clic sur le canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const engine = engineRef.current
    if (!canvas || !engine || !backendOk || !espaceStore.espaceActifId) return

    const handler = (e: MouseEvent) => {
      const state = engine.getState()
      const selectedBloc = state.blocs.find(b => b.selected)

      if (selectedBloc) {
        // Double-clic sur un bloc sélectionné → ouvrir l'éditeur
        setEditBlocId(selectedBloc.id)
      } else {
        // Double-clic dans le vide → créer un nouveau bloc
        const pos = engine.screenToWorld(e.clientX, e.clientY)
        blocsStore.createBloc(pos.x - 100, pos.y - 60)
      }
    }

    canvas.addEventListener('dblclick', handler)
    return () => canvas.removeEventListener('dblclick', handler)
  }, [backendOk, espaceStore.espaceActifId, blocsStore.createBloc])

  // Sélection depuis le SidePanel → centrage + zoom + sélection visuelle
  const handleSelectFromList = (blocId: string) => {
    const engine = engineRef.current
    if (!engine) return
    const bloc = engine.getState().blocs.find(b => b.id === blocId)
    if (!bloc) return

    // Sélectionner visuellement
    for (const b of engine.getState().blocs) b.selected = b.id === blocId
    setSelectedBlocId(blocId)

    // Centrer la vue sur le bloc
    engine.centerOnBloc(bloc)
  }

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

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100vw',
          height: '100vh',
          cursor: 'default',
        }}
      />

      <TopBar
        espaces={espaceStore.espaces}
        espaceActifId={espaceStore.espaceActifId}
        onSelectEspace={espaceStore.selectEspace}
        onCreateEspace={(nom) => espaceStore.createEspace(nom)}
      />
      <SidePanel
        blocs={blocsStore.blocs}
        selectedBlocId={selectedBlocId}
        onSelectBloc={handleSelectFromList}
      />
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

      {/* Éditeur de bloc */}
      {editBlocId && backendOk && (
        <BlocEditor
          blocId={editBlocId}
          onClose={() => setEditBlocId(null)}
        />
      )}

      {/* Indicateur backend */}
      {!backendOk && (
        <div style={{
          position: 'fixed',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(120, 60, 20, 0.9)',
          color: 'rgba(255, 200, 100, 0.9)',
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: 11,
          zIndex: 200,
        }}>
          Backend non connecté — mode démo
        </div>
      )}
    </>
  )
}

export default App
