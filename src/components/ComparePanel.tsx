import { useState } from 'react'
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

export function ComparePanel({
  repo, treeData, expandedPaths, loadingPaths, loading, error, otherTreeData, selectedFile, onToggleDir, onSelectFile,
}: ComparePanelProps) {
  const [filter, setFilter] = useState('')

  const rootItems = treeData[''] ?? []

  const matches = (name: string) => !filter || name.toLowerCase().includes(filter.toLowerCase())

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
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-mono">{repo.owner}/{repo.repo}</span>
            <span className="text-xs text-gray-400 font-mono">{repo.branch}</span>
          </div>
          <div className="relative mb-2">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              placeholder="Search files..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto max-h-[35vh]">
            {rootItems.filter(i => matches(i.name)).length === 0 && filter && (
              <div className="text-xs text-gray-400 px-3 py-2">No matches</div>
            )}
            {rootItems.map((item) =>
              matches(item.name) && (
                <TreeItem
                  key={item.path}
                  item={item}
                  treeData={treeData}
                  expandedPaths={expandedPaths}
                  loadingPaths={loadingPaths}
                  otherTreeData={otherTreeData}
                  selectedFile={selectedFile}
                  onToggleDir={onToggleDir}
                  onSelectFile={onSelectFile}
                  filter={filter}
                  depth={0}
                />
              )
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

function TreeItem({
  item, treeData, expandedPaths, loadingPaths, otherTreeData, selectedFile, onToggleDir, onSelectFile, filter, depth,
}: {
  item: RepoItem
  treeData: Record<string, RepoItem[]>
  expandedPaths: Set<string>
  loadingPaths: Set<string>
  otherTreeData: Record<string, RepoItem[]>
  selectedFile: string | null
  onToggleDir: (path: string) => void
  onSelectFile: (path: string) => void
  filter: string
  depth: number
}) {
  const isExpanded = expandedPaths.has(item.path)
  const isLoading = loadingPaths.has(item.path)
  const existsInOther = fileExistsInOther(item.path, otherTreeData)
  const isSelected = selectedFile === item.path

  const matches = (name: string) => !filter || name.toLowerCase().includes(filter.toLowerCase())

  if (item.type === 'dir') {
    const children = treeData[item.path]
    const filteredChildren = children?.filter(c => matches(c.name))

    return (
      <div key={item.path}>
        <button
          onClick={() => onToggleDir(item.path)}
          className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l8 6-8 6V4z" /></svg>
          <span className="text-gray-500">{'\uD83D\uDCC1'}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
          {isLoading && (
            <svg className="animate-spin h-3 w-3 text-gray-400 ml-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          )}
          {existsInOther && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium ml-auto">both</span>
          )}
        </button>
        {isExpanded && filteredChildren && (
          <div>
            {filteredChildren.map((child) => (
              <TreeItem
                key={child.path}
                item={child}
                treeData={treeData}
                expandedPaths={expandedPaths}
                loadingPaths={loadingPaths}
                otherTreeData={otherTreeData}
                selectedFile={selectedFile}
                onToggleDir={onToggleDir}
                onSelectFile={onSelectFile}
                filter={filter}
                depth={depth + 1}
              />
            ))}
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
