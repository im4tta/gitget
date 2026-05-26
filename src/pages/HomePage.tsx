import { useState, useCallback, useRef } from 'react'
import type { RepoItem, RepoInfo } from '../types'
import { parseGitHubUrl, fetchDirContents } from '../api/github'
import { downloadSelected } from '../utils/download'
import { RepoInput } from '../components/RepoInput'
import { FileTree } from '../components/FileTree'
import { DownloadBar } from '../components/DownloadBar'

export default function HomePage() {
  const [repo, setRepo] = useState<RepoInfo | null>(null)
  const [treeData, setTreeData] = useState<Record<string, RepoItem[]>>({})
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadRepo = useCallback(async (url: string, branch?: string) => {
    const parsed = parseGitHubUrl(url)
    if (!parsed) {
      setError('Invalid GitHub URL. Use: https://github.com/owner/repo')
      return
    }
    if (branch) parsed.branch = branch
    setError(null)
    setSelectedFiles(new Map())
    setExpandedPaths(new Set())
    setTreeData({})
    setLoading(true)
    setRepo(parsed)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const items = await fetchDirContents(parsed.owner, parsed.repo, '', parsed.branch, controller.signal)
      setTreeData({ '': items })
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleDir = useCallback(async (path: string) => {
    if (!repo) return

    if (expandedPaths.has(path)) {
      setExpandedPaths((prev) => { const n = new Set(prev); n.delete(path); return n })
      return
    }

    if (treeData[path]) {
      setExpandedPaths((prev) => new Set(prev).add(path))
      return
    }

    setLoadingPaths((prev) => new Set(prev).add(path))
    try {
      const items = await fetchDirContents(repo.owner, repo.repo, path, repo.branch)
      setTreeData((prev) => ({ ...prev, [path]: items }))
      setExpandedPaths((prev) => new Set(prev).add(path))
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoadingPaths((prev) => { const n = new Set(prev); n.delete(path); return n })
    }
  }, [repo, expandedPaths, treeData])

  const toggleFile = useCallback((item: RepoItem) => {
    const url = item.download_url
    if (!url) return
    setSelectedFiles((prev) => {
      const next = new Map(prev)
      if (next.has(item.path)) {
        next.delete(item.path)
      } else {
        next.set(item.path, url)
      }
      return next
    })
  }, [])

  const selectDir = useCallback((dirItems: RepoItem[]) => {
    const files = new Map(selectedFiles)
    const descend = (items: RepoItem[]) => {
      for (const item of items) {
        if (item.type === 'file' && item.download_url) {
          files.set(item.path, item.download_url!)
        } else if (item.type === 'dir' && treeData[item.path]) {
          descend(treeData[item.path])
        }
      }
    }
    descend(dirItems)
    setSelectedFiles(files)
  }, [selectedFiles, treeData])

  const deselectDir = useCallback((dirItems: RepoItem[]) => {
    setSelectedFiles((prev) => {
      const next = new Map(prev)
      for (const item of dirItems) {
        for (const key of next.keys()) {
          if (key === item.path || key.startsWith(item.path + '/')) {
            next.delete(key)
          }
        }
      }
      return next
    })
  }, [])

  const handleDownload = useCallback(async () => {
    const files = Array.from(selectedFiles.entries()).map(([path, downloadUrl]) => ({ path, downloadUrl }))
    if (files.length === 0) return

    setDownloading(true)
    setDownloadProgress(null)
    try {
      await downloadSelected(files, (done, total) => setDownloadProgress({ done, total }))
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setDownloading(false)
      setDownloadProgress(null)
    }
  }, [selectedFiles])

  const rootItems = treeData[''] ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">gitget</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Browse a GitHub repo and download only the files you need
        </p>
      </header>

      <RepoInput onLoad={loadRepo} loading={loading} defaultBranch={repo?.branch} />

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {repo && !loading && rootItems.length === 0 && !error && (
        <div className="mt-8 text-center text-gray-400 dark:text-gray-500 text-sm">
          This repository appears to be empty.
        </div>
      )}

      {loading && (
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Loading repository...
        </div>
      )}

      {repo && !loading && rootItems.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
              {repo.owner}/{repo.repo}
            </span>
            <span className="font-mono text-gray-400">{repo.branch}</span>
            <span className="text-gray-300">·</span>
            <span>{selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 max-h-[60vh] overflow-y-auto">
            <FileTree
              items={rootItems}
              treeData={treeData}
              expandedPaths={expandedPaths}
              selectedFiles={selectedFiles}
              loadingPaths={loadingPaths}
              onToggleDir={toggleDir}
              onToggleFile={toggleFile}
              onSelectDir={selectDir}
              onDeselectDir={deselectDir}
            />
          </div>
        </div>
      )}

      <DownloadBar
        selectedCount={selectedFiles.size}
        downloading={downloading}
        progress={downloadProgress}
        onDownload={handleDownload}
      />
    </div>
  )
}
