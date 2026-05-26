import { useState, useCallback, useRef } from 'react'
import type { RepoItem, Hunk, DiffStats } from '../types'
import { lineDiff, buildHunks, computeStats } from '../utils/lineDiff'
import { fetchFileText } from '../api/github'
import { useRepoTree } from '../hooks/useRepoTree'
import { CompareInput } from '../components/CompareInput'
import { ComparePanel } from '../components/ComparePanel'
import { DiffViewer } from '../components/DiffViewer'

export default function ComparePage() {
  const left = useRepoTree()
  const right = useRepoTree()

  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [diffLoading, setDiffLoading] = useState(false)
  const [diffError, setDiffError] = useState<string | null>(null)
  const [hunks, setHunks] = useState<Hunk[]>([])
  const [stats, setStats] = useState<DiffStats | null>(null)

  const prevKeyRef = useRef<string | null>(null)

  const syncToggleDir = useCallback(async (path: string, origin: 'left' | 'right') => {
    const key = `${left.repo?.owner ?? ''}/${left.repo?.repo ?? ''}@${left.repo?.branch ?? ''}|${right.repo?.owner ?? ''}/${right.repo?.repo ?? ''}@${right.repo?.branch ?? ''}`
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key
      setSelectedFile(null)
      setHunks([])
      setStats(null)
      setDiffError(null)
      return
    }

    const source = origin === 'left' ? left : right
    const target = origin === 'left' ? right : left

    await source.toggleDir(path)

    if (target.repo && target.treeData[path] === undefined) {
      await target.toggleDir(path)
    }
  }, [left, right])

  const handleSelectFile = useCallback(async (path: string, side: 'left' | 'right') => {
    const key = `${left.repo?.owner ?? ''}/${left.repo?.repo ?? ''}@${left.repo?.branch ?? ''}|${right.repo?.owner ?? ''}/${right.repo?.repo ?? ''}@${right.repo?.branch ?? ''}`
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key
      setSelectedFile(null)
      setHunks([])
      setStats(null)
      setDiffError(null)
      return
    }

    setSelectedFile(path)
    setDiffLoading(true)
    setDiffError(null)
    setHunks([])
    setStats(null)

    const sideA = side === 'left' ? left : right
    const sideB = side === 'left' ? right : left

    const findFile = (tree: Record<string, RepoItem[]>, targetPath: string): RepoItem | null => {
      for (const items of Object.values(tree)) {
        const found = items.find(i => i.path === targetPath && i.type === 'file')
        if (found) return found
      }
      return null
    }

    const aItem = findFile(sideA.treeData, path)
    const bItem = findFile(sideB.treeData, path)

    if (!aItem?.download_url || !bItem?.download_url) {
      setDiffError('File not found in both repos or has no download URL')
      setDiffLoading(false)
      return
    }

    try {
      const [aText, bText] = await Promise.all([
        fetchFileText(aItem.download_url),
        fetchFileText(bItem.download_url),
      ])
      const aLines = aText.split('\n')
      const bLines = bText.split('\n')
      const diff = lineDiff(aLines, bLines)
      setHunks(buildHunks(diff))
      setStats(computeStats(diff))
    } catch (err: unknown) {
      if (err instanceof Error) setDiffError(err.message)
    } finally {
      setDiffLoading(false)
    }
  }, [left, right])

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Compare</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
          Compare files between two GitHub repos (or the same repo on different branches)
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <CompareInput label="Repository A" loading={left.loading} defaultBranch={left.repo?.branch} onLoad={left.loadRepo} />
        <CompareInput label="Repository B" loading={right.loading} defaultBranch={right.repo?.branch} onLoad={right.loadRepo} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ComparePanel
          repo={left.repo}
          treeData={left.treeData}
          expandedPaths={left.expandedPaths}
          loadingPaths={left.loadingPaths}
          loading={left.loading}
          error={left.error}
          otherTreeData={right.treeData}
          selectedFile={selectedFile}
          onToggleDir={(path) => syncToggleDir(path, 'left')}
          onSelectFile={(path) => handleSelectFile(path, 'left')}
        />
        <ComparePanel
          repo={right.repo}
          treeData={right.treeData}
          expandedPaths={right.expandedPaths}
          loadingPaths={right.loadingPaths}
          loading={right.loading}
          error={right.error}
          otherTreeData={left.treeData}
          selectedFile={selectedFile}
          onToggleDir={(path) => syncToggleDir(path, 'right')}
          onSelectFile={(path) => handleSelectFile(path, 'right')}
        />
      </div>

      {selectedFile && (
        <div>
          <DiffViewer
            hunks={hunks}
            stats={stats}
            filename={selectedFile}
            loading={diffLoading}
            error={diffError}
          />
        </div>
      )}
    </div>
  )
}
