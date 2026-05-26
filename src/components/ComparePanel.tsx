import type { RepoItem, RepoInfo } from '../types'

export interface ComparePanelProps {
  repo: RepoInfo | null
  treeData: Record<string, RepoItem[]>
  expandedPaths: Set<string>
  loadingPaths: Set<string>
  loading: boolean
  error: string | null
  otherTreeData: Record<string, RepoItem[]>
  selectedFile: string | null
  onToggleDir: (path: string) => void
  onSelectFile: (path: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts': case 'tsx': return '\uD83D\uDFE6'
    case 'js': case 'jsx': return '\uD83D\uDFE8'
    case 'json': return '\uD83D\uDCCB'
    case 'md': return '\uD83D\uDCDD'
    case 'css': case 'scss': case 'less': return '\uD83C\uDFA8'
    case 'html': return '\uD83C\uDF10'
    case 'yml': case 'yaml': case 'toml': return '\u2699\uFE0F'
    case 'svg': return '\uD83D\uDDBC\uFE0F'
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': return '\uD83D\uDDBC\uFE0F'
    case 'py': return '\uD83D\uDC0D'
    case 'rs': return '\uD83E\uDE84'
    case 'go': return '\uD83E\uDD16'
    case 'gitignore': case 'dockerignore': return '\uD83D\uDD11'
    default: return '\uD83D\uDCC4'
  }
}

function fileExistsInOther(path: string, otherTree: Record<string, RepoItem[]>): boolean {
  for (const items of Object.values(otherTree)) {
    if (items.some(i => i.path === path)) return true
  }
  return false
}

function treeItem(
  item: RepoItem,
  treeData: Record<string, RepoItem[]>,
  expandedPaths: Set<string>,
  loadingPaths: Set<string>,
  otherTreeData: Record<string, RepoItem[]>,
  selectedFile: string | null,
  onToggleDir: (path: string) => void,
  onSelectFile: (path: string) => void,
  depth: number,
) {
  const isExpanded = expandedPaths.has(item.path)
  const isLoading = loadingPaths.has(item.path)
  const existsInOther = fileExistsInOther(item.path, otherTreeData)
  const isSelected = selectedFile === item.path

  if (item.type === 'dir') {
    const children = treeData[item.path]
    return (
      <div key={item.path}>
        <button
          onClick={() => onToggleDir(item.path)}
          className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6 4l8 6-8 6V4z" />
          </svg>
          <span className="text-gray-500">{'\uD83D\uDCC1'}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
          {isLoading && (
            <svg className="animate-spin h-3 w-3 text-gray-400 ml-1" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {existsInOther && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium ml-auto">both</span>
          )}
        </button>
        {isExpanded && children && (
          <div>
            {children.map((child) =>
              treeItem(child, treeData, expandedPaths, loadingPaths, otherTreeData, selectedFile, onToggleDir, onSelectFile, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div key={item.path}>
      <button
        onClick={() => onSelectFile(item.path)}
        className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <span className="w-3.5" />
        <span>{getFileIcon(item.name)}</span>
        <span className="text-gray-900 dark:text-gray-100 truncate">{item.name}</span>
        <span className="text-xs text-gray-400 ml-2">{formatSize(item.size)}</span>
        {existsInOther && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium ml-auto">both</span>
        )}
      </button>
    </div>
  )
}

export function ComparePanel({
  repo, treeData, expandedPaths, loadingPaths, loading, error, otherTreeData, selectedFile, onToggleDir, onSelectFile,
}: ComparePanelProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {error && (
        <div className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs mb-2">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-400 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading...
        </div>
      )}
      {repo && !loading && !error && (
        <div>
          <div className="text-xs text-gray-500 mb-2 font-mono">
            {repo.owner}/{repo.repo}
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto max-h-[40vh]">
            {(treeData[''] ?? []).map((item) =>
              treeItem(item, treeData, expandedPaths, loadingPaths, otherTreeData, selectedFile, onToggleDir, onSelectFile, 0)
            )}
          </div>
        </div>
      )}
      {!repo && !loading && !error && (
        <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          Paste a repo URL above
        </div>
      )}
    </div>
  )
}
