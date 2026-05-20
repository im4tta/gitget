import { useState, type FormEvent } from 'react'

interface Props {
  onLoad: (url: string) => void
  loading: boolean
}

const examples = [
  'https://github.com/facebook/react',
  'https://github.com/vitejs/vite',
  'https://github.com/tailwindlabs/tailwindcss',
]

export function RepoInput({ onLoad, loading }: Props) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (url.trim()) onLoad(url.trim())
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? 'Loading...' : 'Browse'}
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5 items-center text-xs text-gray-500 dark:text-gray-400">
        <span>Try:</span>
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => { setUrl(ex); onLoad(ex) }}
            className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-mono"
          >
            {ex.replace('https://github.com/', '')}
          </button>
        ))}
      </div>
    </div>
  )
}
