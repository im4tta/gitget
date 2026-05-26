import { useState } from 'react'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  if (!open) return null
  return <SettingsModalInner onClose={onClose} />
}

function SettingsModalInner({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('gitget_token') ?? '' } catch { return '' }
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    try {
      if (token) localStorage.setItem('gitget_token', token)
      else localStorage.removeItem('gitget_token')
    } catch { /* ignore */ }
    setSaved(true)
    setTimeout(onClose, 800)
  }

  const handleClear = () => {
    setToken('')
    try { localStorage.removeItem('gitget_token') } catch { /* ignore */ }
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          GitHub Personal Access Token
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Required for private repos and higher rate limits. Create one at{' '}
          <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
            github.com/settings/tokens
          </a>
          {' '}(no scopes needed for public repos; <code>repo</code> scope for private).
        </p>
        <input
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          type="password"
          placeholder="ghp_..."
          value={token}
          onChange={(e) => { setToken(e.target.value); setSaved(false) }}
        />

        {saved && (
          <div className="mt-3 text-sm text-green-600 dark:text-green-400">Token saved.</div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} type="button" className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Save
          </button>
          {token && (
            <button onClick={handleClear} type="button" className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
