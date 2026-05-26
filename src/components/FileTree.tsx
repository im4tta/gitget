import { useState } from 'react'
import type { RepoItem } from '../types'

interface Props {
  items: RepoItem[]
  treeData: Record<string, RepoItem[]>
  expandedPaths: Set<string>
  selectedFiles: Map<string, string>
  loadingPaths: Set<string>
  onToggleDir: (path: string) => void
  onToggleFile: (item: RepoItem) => void
  onSelectDir: (items: RepoItem[]) => void
  onDeselectDir: (items: RepoItem[]) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts': case 'tsx': return '\uD83D\uDFE6'
    case 'js': case 'jsx': return '\uD83D\uDFE8'
    case 'json': return '\uD83D\uDCCB'
    case 'css': case 'scss': return '\uD83C\uDFA8'
    case 'html': return '\uD83C\uDF10'
    case 'md': return '\uD83D\uDCDD'
    case 'yml': case 'yaml': case 'toml': return '\u2699\uFE0F'
    default: return '\uD83D\uDCC4'
  }
}

export function FileTree(props: Props) {
  const [filter, setFilter] = useState('')

  return (
    <div>
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
      <TreeList {...props} filter={filter} depth={0} />
    </div>
  )
}

function TreeList({ items, treeData, expandedPaths, selectedFiles, loadingPaths, onToggleDir, onToggleFile, onSelectDir, onDeselectDir, filter, depth }: Props & { filter: string; depth: number }) {
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  const filtered = filter ? sorted.filter(i => i.name.toLowerCase().includes(filter.toLowerCase())) : sorted

  if (depth === 0 && filter && filtered.length === 0) {
    return <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">No matches</div>
  }

  return (
    <ul className="space-y-0.5">
      {filtered.map((item) => (
        <TreeNode
          key={item.path}
          item={item}
          treeData={treeData}
          expandedPaths={expandedPaths}
          selectedFiles={selectedFiles}
          loadingPaths={loadingPaths}
          onToggleDir={onToggleDir}
          onToggleFile={onToggleFile}
          onSelectDir={onSelectDir}
          onDeselectDir={onDeselectDir}
          filter={filter}
          depth={depth}
        />
      ))}
    </ul>
  )
}

function TreeNode({
  item, treeData, expandedPaths, selectedFiles, loadingPaths,
  onToggleDir, onToggleFile, onSelectDir, onDeselectDir, filter, depth,
}: { item: RepoItem } & Omit<Props, 'items'> & { filter: string; depth: number }) {
  const isDir = item.type === 'dir'
  const isExpanded = expandedPaths.has(item.path)
  const isLoading = loadingPaths.has(item.path)
  const children = treeData[item.path]
  const isSelected = selectedFiles.has(item.path)

  const childCount = children?.filter((c) => c.type === 'file').length ?? 0
  const selectedChildFiles = children?.filter((c) => c.type === 'file' && selectedFiles.has(c.path)).length ?? 0
  const dirSelectionState = childCount > 0 && selectedChildFiles === childCount ? 'all' : selectedChildFiles > 0 ? 'partial' : 'none'

  const handleDirSelect = () => {
    if (dirSelectionState === 'all' || isSelected) {
      onDeselectDir([item])
    } else {
      onSelectDir([item])
    }
  }

  return (
    <li>
      <div className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 group">
        {isDir ? (
          <>
            <button type="button" onClick={() => onToggleDir(item.path)} className="w-5 h-5 flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
              {isLoading ? (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              )}
            </button>
            <button type="button" onClick={handleDirSelect} className="w-4 h-4 flex items-center justify-center shrink-0">
              <input type="checkbox" checked={dirSelectionState === 'all'} ref={(el) => { if (el) el.indeterminate = dirSelectionState === 'partial' }} onChange={handleDirSelect} className="w-3.5 h-3.5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </button>
            <button type="button" onClick={() => onToggleDir(item.path)} className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-base shrink-0">{'\uD83D\uDCC1'}</span>
              <span className="text-sm truncate text-gray-800 dark:text-gray-200">{item.name}</span>
            </button>
          </>
        ) : (
          <>
            <span className="w-5 h-5 shrink-0" />
            <label className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer py-0.5">
              <input type="checkbox" checked={isSelected} onChange={() => onToggleFile(item)} className="w-3.5 h-3.5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" />
              <span className="text-base shrink-0">{getFileIcon(item.name)}</span>
              <span className="text-sm truncate text-gray-800 dark:text-gray-200">{item.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto shrink-0">{formatSize(item.size)}</span>
            </label>
          </>
        )}
      </div>
      {isDir && isExpanded && children && (
        <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
          <TreeList
            items={children}
            treeData={treeData}
            expandedPaths={expandedPaths}
            selectedFiles={selectedFiles}
            loadingPaths={loadingPaths}
            onToggleDir={onToggleDir}
            onToggleFile={onToggleFile}
            onSelectDir={onSelectDir}
            onDeselectDir={onDeselectDir}
            filter={filter}
            depth={depth + 1}
          />
        </div>
      )}
    </li>
  )
}
