import { useMemo } from 'react'

interface Props {
  selectedCount: number
  downloading: boolean
  progress: { done: number; total: number } | null
  onDownload: () => void
}

export function DownloadBar({ selectedCount, downloading, progress, onDownload }: Props) {
  const totalSize = useMemo(() => {
    if (selectedCount === 0) return ''
    if (selectedCount === 1) return '1 file'
    return `${selectedCount} files`
  }, [selectedCount])

  if (selectedCount === 0 && !downloading) return null

  const progressPct = progress ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {downloading
            ? `Downloading... ${progress?.done ?? 0}/${progress?.total ?? 0}`
            : `${totalSize} selected`}
        </span>
        {downloading && progress && (
          <div className="flex-1 max-w-xs h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading || selectedCount === 0}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {downloading ? 'Downloading...' : `Download Selected`}
        </button>
      </div>
    </div>
  )
}
