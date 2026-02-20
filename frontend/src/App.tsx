import { useEffect, useRef, useState, useCallback } from 'react'
import { CanvasEngine } from './canvas/engine'
import { canvasBus } from './canvas/events'
import TopBar from './components/TopBar'
import SidePanel from './components/SidePanel'
import BottomBar from './components/BottomBar'
import ConsoleIA from './components/ConsoleIA'
import BlocEditor from './components/BlocEditor'
import ConfigIA from './components/ConfigIA'
import { useEspaceStore } from './stores/espaceStore'
import { useBlocsStore } from './stores/blocsStore'
import * as api from './api'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasEngine | null>(null)
  const [showConsole, setShowConsole] = useState(false)
  const [backendOk, setBackendOk] = useState(false)
  const [editBlocId, setEditBlocId] = useState<string | null>(null)
  const [selectedBlocId, setSelectedBlocId] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [liaisonVisibility, setLiaisonVisibility] = useState<string>('selection')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

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

  // Synchroniser le mode de visibilité des liaisons
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.setLiaisonVisibility(liaisonVisibility)
  }, [liaisonVisibility])

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
      canvasBus.on('liaison:delete', ({ liaisonId }) => {
        blocsStore.deleteLiaison(liaisonId)
      }),
      canvasBus.on('liaison:recolor', ({ liaisonId, couleur }) => {
        blocsStore.recolorLiaison(liaisonId, couleur)
      }),
      canvasBus.on('bloc:changeForme', ({ blocId, forme }) => {
        blocsStore.changeBlocForme(blocId, forme)
      }),
      canvasBus.on('bloc:changeCouleur', ({ blocId, couleur }) => {
        blocsStore.changeBlocCouleur(blocId, couleur)
      }),
    ]

    return () => unsubs.forEach(fn => fn())
  }, [backendOk, blocsStore])

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

  // Recherche qui illumine : propager les IDs highlightés au moteur
  const handleSearchHighlight = useCallback((blocIds: Set<string>) => {
    const engine = engineRef.current
    if (!engine) return
    engine.setHighlightedBlocs(blocIds)
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

  // ===== Drag & Drop de fichiers =====
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
      setDragOver(true)

      // Détecter le bloc survolé pour le highlight
      const engine = engineRef.current
      if (engine) {
        const worldPos = engine.screenToWorld(e.clientX, e.clientY)
        const state = engine.getState()
        let hoveredId: string | null = null
        for (const bloc of state.blocs) {
          if (worldPos.x >= bloc.x && worldPos.x <= bloc.x + bloc.w &&
              worldPos.y >= bloc.y && worldPos.y <= bloc.y + bloc.h) {
            hoveredId = bloc.id
            break
          }
        }
        engine.setDragHoverBloc(hoveredId)
      }
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Ne quitter que si on sort réellement du canvas (pas d'un enfant)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const { clientX, clientY } = e
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        setDragOver(false)
        engineRef.current?.setDragHoverBloc(null)
      }
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const engine = engineRef.current
    if (engine) engine.setDragHoverBloc(null)
    if (!engine || !espaceStore.espaceActifId || !backendOk) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Position dans le monde
    const worldPos = engine.screenToWorld(e.clientX, e.clientY)

    // Détecter si on drop sur un bloc existant
    const state = engine.getState()
    let targetBloc: typeof state.blocs[0] | null = null
    for (const bloc of state.blocs) {
      if (
        worldPos.x >= bloc.x && worldPos.x <= bloc.x + bloc.w &&
        worldPos.y >= bloc.y && worldPos.y <= bloc.y + bloc.h
      ) {
        targetBloc = bloc
        break
      }
    }

    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (targetBloc) {
          // Drop sur un bloc existant → ajouter comme contenu
          await api.uploadFileToBloc(targetBloc.id, file)
        } else {
          // Drop sur le canvas → créer un nouveau bloc
          const offsetX = i * 50  // Décaler les blocs si plusieurs fichiers
          const offsetY = i * 50
          await api.uploadFileNewBloc(
            file,
            espaceStore.espaceActifId!,
            worldPos.x + offsetX - 110,
            worldPos.y + offsetY - 70,
          )
        }
      }

      // Rafraîchir le graphe après tous les uploads
      await blocsStore.refreshEspace()
    } catch (err) {
      console.error('[Drop] Erreur upload:', err)
    } finally {
      setUploading(false)
    }
  }, [espaceStore.espaceActifId, backendOk, blocsStore])

  return (
    <>
      <canvas
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'block',
          width: '100vw',
          height: '100vh',
          cursor: dragOver ? 'copy' : 'default',
        }}
      />

      {/* Overlay drag & drop */}
      {dragOver && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255, 200, 80, 0.06)',
          border: '3px dashed rgba(255, 200, 80, 0.4)',
          borderRadius: 12,
          margin: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 500,
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(20, 20, 30, 0.85)',
            color: 'rgba(255, 210, 100, 0.95)',
            padding: '16px 32px',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 500,
            backdropFilter: 'blur(8px)',
          }}>
            Déposer le fichier ici
          </div>
        </div>
      )}

      {/* Indicateur upload en cours */}
      {uploading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(20, 20, 30, 0.9)',
          color: 'rgba(255, 210, 100, 0.95)',
          padding: '16px 32px',
          borderRadius: 12,
          fontSize: 14,
          zIndex: 600,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 200, 80, 0.3)',
        }}>
          Import en cours...
        </div>
      )}

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
        liaisonVisibility={liaisonVisibility}
        onLiaisonVisibilityChange={setLiaisonVisibility}
        onSearchHighlight={handleSearchHighlight}
      />
      <BottomBar
        onRecenter={handleRecenter}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleIA={() => setShowConsole(v => !v)}
        onConfigIA={() => setShowConfig(true)}
        onReorganiser={async () => {
          if (!espaceStore.espaceActifId) return
          await api.reorganiserGraphe(espaceStore.espaceActifId)
          blocsStore.refreshEspace()
        }}
        iaActive={showConsole}
      />
      <ConsoleIA
        visible={showConsole}
        espaceId={espaceStore.espaceActifId}
        onClose={() => setShowConsole(false)}
        onGrapheModified={() => blocsStore.refreshEspace()}
      />

      {/* Configuration IA */}
      {showConfig && (
        <ConfigIA onClose={() => setShowConfig(false)} />
      )}

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
