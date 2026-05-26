import type { Hunk, DiffStats } from '../types'

interface DiffViewerProps {
  hunks: Hunk[]
  stats: DiffStats | null
  filename: string
  loading: boolean
  error: string | null
}

export function DiffViewer({ hunks, stats, filename, loading, error }: DiffViewerProps) {
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        Computing diff...
      </div>
    )
  }

  if (hunks.length === 0 && stats) {
    return (
      <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        Files are identical ({stats.unchanged} lines unchanged)
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        Select a file in both repos to see the diff
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 text-sm">
        <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{filename}</span>
        <span className="text-green-600 dark:text-green-400 font-medium">+{stats.additions}</span>
        <span className="text-red-600 dark:text-red-400 font-medium">-{stats.deletions}</span>
        <span className="text-gray-400">{stats.unchanged} unchanged</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[13px] leading-5">
          <tbody>
            {hunks.map((hunk, hunkIdx) => (
              <HunkBlock key={hunkIdx} hunk={hunk} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HunkBlock({ hunk }: { hunk: Hunk }) {
  return (
    <>
      <tr>
        <td colSpan={4} className="px-4 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-mono border-b border-gray-200 dark:border-gray-700">
          @@ -{hunk.oldStart},{hunk.oldCount} +{hunk.newStart},{hunk.newCount} @@
        </td>
      </tr>
      {hunk.lines.map((line, i) => {
        const gutterWidth = 'w-[3.5rem]'
        let bgColor = ''
        let prefix = ' '
        let textColor = 'text-gray-900 dark:text-gray-100'

        if (line.type === 'add') {
          bgColor = 'bg-green-50 dark:bg-green-950/30'
          prefix = '+'
          textColor = 'text-green-800 dark:text-green-300'
        } else if (line.type === 'del') {
          bgColor = 'bg-red-50 dark:bg-red-950/30'
          prefix = '-'
          textColor = 'text-red-800 dark:text-red-300'
        }

        return (
          <tr key={i} className={bgColor}>
            <td className={`${gutterWidth} text-right px-2 text-gray-400 dark:text-gray-500 select-none border-r border-gray-200 dark:border-gray-700`}>
              {line.lineNumA ?? ''}
            </td>
            <td className={`${gutterWidth} text-right px-2 text-gray-400 dark:text-gray-500 select-none border-r border-gray-200 dark:border-gray-700`}>
              {line.lineNumB ?? ''}
            </td>
            <td className={`w-5 text-center select-none text-gray-400 dark:text-gray-500 ${line.type === 'add' ? 'text-green-600 dark:text-green-400' : ''} ${line.type === 'del' ? 'text-red-600 dark:text-red-400' : ''}`}>
              {prefix}
            </td>
            <td className={`px-2 whitespace-pre-wrap break-all ${textColor}`}>
              {(line.type === 'same' ? line.contentA : line.type === 'del' ? line.contentA : line.contentB) ?? ''}
            </td>
          </tr>
        )
      })}
    </>
  )
}
