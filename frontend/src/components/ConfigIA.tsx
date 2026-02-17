// Écran de configuration IA — Choix modèles local/API pour Graphe et Assistant
// Test de connexion intégré, configuration persiste entre sessions

import { useState, useEffect, useCallback } from 'react'
import * as api from '../api'

interface ConfigIAProps {
  onClose: () => void
}

interface RoleConfig {
  mode: 'local' | 'api'
  url: string
  modele: string
  cle_api: string
}

const DEFAULT_CONFIG: RoleConfig = {
  mode: 'local',
  url: 'http://localhost:11434',
  modele: '',
  cle_api: '',
}

function RoleSection({
  role,
  label,
}: {
  role: string
  label: string
}) {
  const [config, setConfig] = useState<RoleConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')

  // Charger la config
  useEffect(() => {
    api.getConfigIA(role)
      .then(data => {
        setConfig({
          mode: (data.mode as 'local' | 'api') || 'local',
          url: data.url || DEFAULT_CONFIG.url,
          modele: data.modele || '',
          cle_api: data.cle_api || '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [role])

  // Sauvegarder
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await api.updateConfigIA(role, {
        mode: config.mode,
        url: config.url || undefined,
        modele: config.modele || undefined,
        cle_api: config.cle_api || undefined,
      })
    } catch {}
    setSaving(false)
  }, [role, config])

  // Tester la connexion
  const handleTest = useCallback(async () => {
    setTestResult('testing')
    // D'abord sauvegarder, puis tester
    await handleSave()
    try {
      const ok = await api.testIAConnection(role)
      setTestResult(ok ? 'ok' : 'fail')
    } catch {
      setTestResult('fail')
    }
  }, [role, handleSave])

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.roleSection}>
      <h3 style={styles.roleTitle}>{label}</h3>

      {/* Mode */}
      <div style={styles.field}>
        <label style={styles.label}>Mode</label>
        <div style={styles.radioGroup}>
          <label style={styles.radio}>
            <input
              type="radio"
              checked={config.mode === 'local'}
              onChange={() => setConfig(c => ({ ...c, mode: 'local', url: 'http://localhost:11434' }))}
            />
            <span>Local (Ollama / LM Studio)</span>
          </label>
          <label style={styles.radio}>
            <input
              type="radio"
              checked={config.mode === 'api'}
              onChange={() => setConfig(c => ({ ...c, mode: 'api', url: '' }))}
            />
            <span>API externe</span>
          </label>
        </div>
      </div>

      {/* URL */}
      <div style={styles.field}>
        <label style={styles.label}>URL</label>
        <input
          type="text"
          value={config.url}
          onChange={(e) => setConfig(c => ({ ...c, url: e.target.value }))}
          placeholder={config.mode === 'local' ? 'http://localhost:11434' : 'https://api.openai.com'}
          style={styles.input}
        />
      </div>

      {/* Modèle */}
      <div style={styles.field}>
        <label style={styles.label}>Modèle</label>
        <input
          type="text"
          value={config.modele}
          onChange={(e) => setConfig(c => ({ ...c, modele: e.target.value }))}
          placeholder={config.mode === 'local' ? 'mistral, llama3...' : 'gpt-4o, claude-3...'}
          style={styles.input}
        />
      </div>

      {/* Clé API (seulement en mode API) */}
      {config.mode === 'api' && (
        <div style={styles.field}>
          <label style={styles.label}>Clé API</label>
          <input
            type="password"
            value={config.cle_api}
            onChange={(e) => setConfig(c => ({ ...c, cle_api: e.target.value }))}
            placeholder="sk-..."
            style={styles.input}
          />
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        <button onClick={handleTest} style={styles.testBtn} disabled={testResult === 'testing'}>
          {testResult === 'testing' ? 'Test...' : 'Tester la connexion'}
        </button>
        {testResult === 'ok' && <span style={styles.testOk}>Connexion OK</span>}
        {testResult === 'fail' && <span style={styles.testFail}>Connexion échouée</span>}
      </div>
    </div>
  )
}

export default function ConfigIA({ onClose }: ConfigIAProps) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div style={styles.header}>
          <span style={styles.headerTitle}>Configuration IA</span>
          <button onClick={onClose} style={styles.closeBtn}>x</button>
        </div>

        <div style={styles.body}>
          <RoleSection role="graphe" label="IA Graphe (indexation)" />
          <RoleSection role="assistant" label="IA Assistant (dialogue)" />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: 500,
    maxHeight: '85vh',
    background: 'rgba(18, 18, 30, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(80, 80, 120, 0.2)',
  },
  headerTitle: {
    color: 'rgba(200, 200, 220, 0.9)',
    fontSize: 14,
    fontWeight: 500,
  },
  closeBtn: {
    background: 'transparent',
    color: 'rgba(160, 160, 180, 0.6)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  roleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 12,
    background: 'rgba(25, 25, 40, 0.6)',
    borderRadius: 6,
    border: '1px solid rgba(60, 60, 90, 0.2)',
  },
  roleTitle: {
    color: 'rgba(80, 200, 120, 0.8)',
    fontSize: 13,
    fontWeight: 500,
    margin: 0,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    color: 'rgba(160, 160, 180, 0.7)',
    fontSize: 11,
  },
  input: {
    background: 'rgba(30, 30, 50, 0.8)',
    color: 'rgba(220, 220, 230, 0.9)',
    border: '1px solid rgba(80, 80, 120, 0.3)',
    borderRadius: 4,
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
  },
  radioGroup: {
    display: 'flex',
    gap: 16,
  },
  radio: {
    color: 'rgba(180, 180, 200, 0.8)',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  saveBtn: {
    background: 'rgba(60, 160, 90, 0.3)',
    color: 'rgba(80, 200, 120, 0.9)',
    border: '1px solid rgba(80, 200, 120, 0.3)',
    borderRadius: 4,
    padding: '5px 12px',
    fontSize: 12,
    cursor: 'pointer',
  },
  testBtn: {
    background: 'rgba(40, 60, 90, 0.4)',
    color: 'rgba(120, 160, 220, 0.9)',
    border: '1px solid rgba(100, 140, 200, 0.3)',
    borderRadius: 4,
    padding: '5px 12px',
    fontSize: 12,
    cursor: 'pointer',
  },
  testOk: {
    color: 'rgba(80, 200, 120, 0.9)',
    fontSize: 11,
  },
  testFail: {
    color: 'rgba(200, 100, 100, 0.9)',
    fontSize: 11,
  },
  loading: {
    color: 'rgba(140, 140, 160, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
}
