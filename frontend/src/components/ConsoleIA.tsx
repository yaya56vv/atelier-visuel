// Console IA — Panneau vertical droit, translucide, jamais modale
// Graphe visible derrière, historique en haut, zone de saisie en bas
// Connecté au service IA Assistant via API

import { useState, useRef, useEffect, useCallback } from 'react'
import * as api from '../api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

interface ConsoleIAProps {
  visible: boolean
  espaceId: string | null
  onClose?: () => void
}

export default function ConsoleIA({ visible, espaceId, onClose }: ConsoleIAProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !espaceId || loading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await api.askIA(espaceId, text)
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: response,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errorMsg: Message = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        text: 'Erreur de connexion avec le service IA.',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [input, espaceId, loading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!visible) return null

  return (
    <aside style={styles.panel}>
      {/* En-tête */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Console IA</span>
        <button onClick={onClose} style={styles.closeBtn}>x</button>
      </div>

      {/* Historique */}
      <div ref={listRef} style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            L'assistant IA peut analyser votre espace de pensée.
            {!espaceId && '\n\nSélectionnez un espace d\'abord.'}
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            style={msg.role === 'user' ? styles.msgUser : styles.msgAssistant}
          >
            {msg.role === 'assistant' && (
              <span style={styles.roleLabel}>IA</span>
            )}
            <span style={styles.msgText}>{msg.text}</span>
          </div>
        ))}
        {loading && (
          <div style={styles.msgAssistant}>
            <span style={styles.roleLabel}>IA</span>
            <span style={styles.loading}>Analyse en cours...</span>
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div style={styles.inputZone}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={espaceId ? "Demandez à l'IA..." : "Sélectionnez un espace"}
          style={styles.textarea}
          rows={2}
          disabled={!espaceId || loading}
        />
        <button
          onClick={handleSend}
          style={{
            ...styles.sendBtn,
            opacity: (!espaceId || loading || !input.trim()) ? 0.4 : 1,
          }}
          disabled={!espaceId || loading || !input.trim()}
        >
          {loading ? '...' : 'Envoyer'}
        </button>
      </div>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    top: 40,
    right: 0,
    bottom: 32,
    width: 300,
    background: 'rgba(12, 12, 22, 0.75)',
    backdropFilter: 'blur(16px)',
    borderLeft: '1px solid rgba(80, 80, 120, 0.2)',
    zIndex: 90,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    borderBottom: '1px solid rgba(80, 80, 120, 0.15)',
  },
  headerTitle: {
    color: 'rgba(80, 200, 120, 0.8)',
    fontSize: 12,
    fontWeight: 500,
  },
  closeBtn: {
    background: 'transparent',
    color: 'rgba(160, 160, 180, 0.6)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  empty: {
    color: 'rgba(140, 140, 160, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 1.5,
    whiteSpace: 'pre-line',
  },
  msgUser: {
    alignSelf: 'flex-end',
    background: 'rgba(40, 60, 90, 0.5)',
    color: 'rgba(200, 210, 230, 0.9)',
    borderRadius: '8px 8px 2px 8px',
    padding: '6px 10px',
    fontSize: 12,
    maxWidth: '85%',
    wordBreak: 'break-word' as const,
  },
  msgAssistant: {
    alignSelf: 'flex-start',
    background: 'rgba(30, 50, 40, 0.5)',
    color: 'rgba(200, 220, 210, 0.9)',
    borderRadius: '8px 8px 8px 2px',
    padding: '6px 10px',
    fontSize: 12,
    maxWidth: '85%',
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap',
  },
  roleLabel: {
    display: 'block',
    color: 'rgba(80, 200, 120, 0.6)',
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  msgText: {
    display: 'block',
    lineHeight: 1.4,
  },
  loading: {
    color: 'rgba(80, 200, 120, 0.5)',
    fontStyle: 'italic',
  },
  inputZone: {
    display: 'flex',
    gap: 6,
    padding: 8,
    borderTop: '1px solid rgba(80, 80, 120, 0.15)',
  },
  textarea: {
    flex: 1,
    background: 'rgba(30, 30, 50, 0.8)',
    color: 'rgba(220, 220, 230, 0.9)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 4,
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
    resize: 'none',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
  },
  sendBtn: {
    background: 'rgba(60, 160, 90, 0.3)',
    color: 'rgba(80, 200, 120, 0.9)',
    border: '1px solid rgba(80, 200, 120, 0.3)',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 11,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
}
