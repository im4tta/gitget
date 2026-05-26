import { useState, useCallback } from 'react'
import type { RepoItem, RepoInfo } from '../types'
import { parseGitHubUrl, fetchDirContents } from '../api/github'

export function useRepoTree() {
  const [repo, setRepo] = useState<RepoInfo | null>(null)
  const [treeData, setTreeData] = useState<Record<string, RepoItem[]>>({})
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRepo = useCallback(async (url: string) => {
    const parsed = parseGitHubUrl(url)
    if (!parsed) {
      setError('Invalid GitHub URL. Use: https://github.com/owner/repo')
      return
    }
    setError(null)
    setExpandedPaths(new Set())
    setTreeData({})
    setLoading(true)
    setRepo(parsed)

    try {
      const items = await fetchDirContents(parsed.owner, parsed.repo, '')
      setTreeData({ '': items })
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
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
      const items = await fetchDirContents(repo.owner, repo.repo, path)
      setTreeData((prev) => ({ ...prev, [path]: items }))
      setExpandedPaths((prev) => new Set(prev).add(path))
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoadingPaths((prev) => { const n = new Set(prev); n.delete(path); return n })
    }
  }, [repo, expandedPaths, treeData])

  return {
    repo, treeData, expandedPaths, loadingPaths, loading, error,
    setError, loadRepo, toggleDir, setExpandedPaths, setTreeData,
  }
}
