import { useState } from 'react'

interface CompareInputProps {
  label: string
  loading: boolean
  onLoad: (url: string) => void
}

export function CompareInput({ label, loading, onLoad }: CompareInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) onLoad(value.trim())
  }

  const handleTry = (example: string) => {
    setValue(example)
    onLoad(example)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          placeholder="owner/repo or https://github.com/..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? 'Loading...' : 'Load'}
        </button>
      </form>
      <div className="flex gap-1.5 mt-1.5">
        <span className="text-xs text-gray-400">Try:</span>
        <button
          type="button"
          onClick={() => handleTry('facebook/react')}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          facebook/react
        </button>
        <button
          type="button"
          onClick={() => handleTry('vitejs/vite')}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          vitejs/vite
        </button>
        <button
          type="button"
          onClick={() => handleTry('tailwindlabs/tailwindcss')}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          tailwindlabs/tailwindcss
        </button>
      </div>
    </div>
  )
}
