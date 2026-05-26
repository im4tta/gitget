import { useState, useCallback } from 'react'

interface CompareInputProps {
  label: string
  loading: boolean
  defaultBranch?: string
  onLoad: (url: string, branch?: string) => void
}

export function CompareInput({ label, loading, defaultBranch, onLoad }: CompareInputProps) {
  const [value, setValue] = useState('')
  const [branch, setBranch] = useState(defaultBranch ?? 'main')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) onLoad(value.trim(), branch)
  }, [value, branch, onLoad])

  const handleTry = useCallback((example: string) => {
    setValue(example)
    setBranch('main')
    onLoad(example, 'main')
  }, [onLoad])

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            placeholder="owner/repo or https://github.com/..."
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              const parsed = tryParseBranch(e.target.value)
              if (parsed) setBranch(parsed)
            }}
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <span className="text-xs font-medium">branch:</span>
          <input
            className="flex-1 max-w-40 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </div>
      </form>
      <div className="flex gap-1.5 mt-1.5">
        <span className="text-xs text-gray-400">Try:</span>
        <button type="button" onClick={() => handleTry('facebook/react')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">facebook/react</button>
        <button type="button" onClick={() => handleTry('vitejs/vite')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">vitejs/vite</button>
        <button type="button" onClick={() => handleTry('tailwindlabs/tailwindcss')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">tailwindlabs/tailwindcss</button>
      </div>
    </div>
  )
}

function tryParseBranch(url: string): string | null {
  const trimmed = url.trim()
  try {
    const u = new URL(trimmed)
    if (u.hostname === 'github.com') {
      const parts = u.pathname.replace(/^\//, '').split('/')
      if (parts.length >= 4 && parts[2] === 'tree') return parts[3]
    }
  } catch { /* not a URL */ }
  return null
}
