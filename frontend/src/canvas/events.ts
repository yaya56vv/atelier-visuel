// Canvas2D — Bus d'événements Canvas ↔ React
// Le Canvas émet des événements que React écoute, et vice versa
// Le Canvas ne connaît pas React, React ne connaît pas les détails du Canvas

// ─── Types d'événements ─────────────────────────────────

export interface CanvasEvents {
  'bloc:select': { blocId: string | null }
  'bloc:open': { blocId: string }
  'bloc:move': { blocId: string; x: number; y: number }
  'bloc:resize': { blocId: string; w: number; h: number }
  'liaison:create': { sourceId: string; cibleId: string }
  'liaison:delete': { liaisonId: string }
  'liaison:recolor': { liaisonId: string; couleur: string }
  'bloc:changeForme': { blocId: string; forme: string }
  'bloc:changeCouleur': { blocId: string; couleur: string }
  'canvas:zoom': { zoom: number }
  'canvas:pan': { offsetX: number; offsetY: number }
}

type EventName = keyof CanvasEvents
type EventPayload<K extends EventName> = CanvasEvents[K]
type EventHandler<K extends EventName> = (payload: EventPayload<K>) => void

// ─── Bus d'événements ───────────────────────────────────

class EventBus {
  private listeners = new Map<string, Set<EventHandler<any>>>()

  /** Écoute un événement. Retourne une fonction de désinscription. */
  on<K extends EventName>(event: K, handler: EventHandler<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  /** Émet un événement vers tous les listeners. */
  emit<K extends EventName>(event: K, payload: EventPayload<K>) {
    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      handler(payload)
    }
  }

  /** Supprime tous les listeners. */
  clear() {
    this.listeners.clear()
  }
}

/** Instance unique du bus d'événements. */
export const canvasBus = new EventBus()
