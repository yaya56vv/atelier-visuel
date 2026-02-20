// Barre inférieure — Enregistrer, recentrer, zoom, IA, réorganiser, stop
// Commandes globales de navigation — les filtres/liaisons sont dans l'explorateur (SidePanel)

import type { ViewScope } from '../stores/blocsStore'

interface BottomBarProps {
  onSave?: () => void
  onRecenter?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onToggleIA?: () => void
  onConfigIA?: () => void
  onReorganiser?: () => void
  onReorganiserGlobal?: () => void
  onSuggererLiaisons?: () => void
  onStop?: () => void
  iaActive?: boolean
  scope?: ViewScope
}

export default function BottomBar({
  onSave,
  onRecenter,
  onZoomIn,
  onZoomOut,
  onToggleIA,
  onConfigIA,
  onReorganiser,
  onReorganiserGlobal,
  onSuggererLiaisons,
  onStop,
  iaActive = false,
  scope = 'espace',
}: BottomBarProps) {
  const isGlobal = scope === 'global'
  return (
    <footer style={styles.bar}>
      <div style={styles.group}>
        <button onClick={onSave} style={styles.btn} title="Enregistrer">
          Sauver
        </button>
        <span style={styles.sep} />
        <button onClick={onRecenter} style={styles.btn} title="Recentrer">
          Recentrer
        </button>
        <span style={styles.sep} />
        <button onClick={onZoomOut} style={styles.btnSmall} title="Zoom -">-</button>
        <button onClick={onZoomIn} style={styles.btnSmall} title="Zoom +">+</button>
      </div>

      <div style={styles.group}>
        <button
          onClick={onToggleIA}
          style={{
            ...styles.btn,
            background: iaActive ? 'rgba(60, 160, 90, 0.3)' : 'transparent',
            color: iaActive ? 'rgba(80, 200, 120, 0.9)' : 'rgba(160, 160, 180, 0.7)',
          }}
          title="IA Observatrice"
        >
          IA
        </button>
        <button onClick={onConfigIA} style={styles.btn} title="Configuration IA">
          Config
        </button>
        {isGlobal ? (
          <>
            <button onClick={onReorganiserGlobal} style={styles.btnReorg} title="Positionner le graphe global (force-directed)">
              ⚡ Global
            </button>
            <button onClick={onSuggererLiaisons} style={styles.btnSuggest} title="Suggestions IA de liaisons inter-espaces">
              🔗 Suggérer
            </button>
          </>
        ) : (
          <button onClick={onReorganiser} style={styles.btnReorg} title="Réorganiser le graphe (force-directed)">
            ⚡
          </button>
        )}
        <span style={styles.sep} />
        <button onClick={onStop} style={styles.btnStop} title="Arrêter">
          Stop
        </button>
      </div>
    </footer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(15, 15, 25, 0.85)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(80, 80, 120, 0.2)',
    zIndex: 100,
    padding: '0 12px',
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    background: 'transparent',
    color: 'rgba(180, 180, 200, 0.8)',
    border: 'none',
    borderRadius: 3,
    padding: '3px 8px',
    fontSize: 11,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  btnSmall: {
    background: 'rgba(40, 40, 60, 0.5)',
    color: 'rgba(180, 180, 200, 0.8)',
    border: '1px solid rgba(80, 80, 120, 0.2)',
    borderRadius: 3,
    width: 22,
    height: 22,
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReorg: {
    background: 'rgba(40, 60, 120, 0.3)',
    color: 'rgba(120, 180, 255, 0.9)',
    border: '1px solid rgba(120, 180, 255, 0.2)',
    borderRadius: 3,
    padding: '3px 8px',
    fontSize: 11,
    cursor: 'pointer',
  },
  btnSuggest: {
    background: 'rgba(120, 60, 40, 0.3)',
    color: 'rgba(255, 200, 100, 0.9)',
    border: '1px solid rgba(255, 200, 100, 0.25)',
    borderRadius: 3,
    padding: '3px 8px',
    fontSize: 11,
    cursor: 'pointer',
  },
  btnStop: {
    background: 'rgba(120, 40, 40, 0.3)',
    color: 'rgba(200, 100, 100, 0.9)',
    border: '1px solid rgba(200, 100, 100, 0.2)',
    borderRadius: 3,
    padding: '3px 8px',
    fontSize: 11,
    cursor: 'pointer',
  },
  sep: {
    width: 1,
    height: 16,
    background: 'rgba(80, 80, 120, 0.2)',
  },
}
