import type { RepoItem, RepoInfo } from '../types'

const API_BASE = 'https://api.github.com'

export function parseGitHubUrl(input: string): RepoInfo | null {
  let owner: string
  let repo: string
  let branch = 'main'

  const trimmed = input.trim()

  // owner/repo shorthand
  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    [owner, repo] = trimmed.split('/')
    return { owner, repo, branch }
  }

  // Full GitHub URL
  try {
    const url = new URL(trimmed)
    if (url.hostname !== 'github.com') return null
    const path = url.pathname.replace(/^\//, '').replace(/\.git$/, '')
    const parts = path.split('/')
    if (parts.length < 2 || !parts[0] || !parts[1]) return null
    owner = parts[0]
    repo = parts[1]
    branch = parts[3] || 'main'
    return { owner, repo, branch }
  } catch {
    return null
  }
}

export async function fetchDirContents(
  owner: string,
  repo: string,
  path: string,
  signal?: AbortSignal,
): Promise<RepoItem[]> {
  const endpoint = `${API_BASE}/repos/${owner}/${repo}/contents/${path}`
  const res = await fetch(endpoint, {
    headers: { Accept: 'application/vnd.github.v3+json' },
    signal,
  })
  if (!res.ok) {
    const msg = res.status === 403
      ? 'Rate limited. Add a GitHub token or try later.'
      : res.status === 404
        ? 'Repository or path not found.'
        : `GitHub API error: ${res.status}`
    throw new Error(msg)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    return [data as RepoItem]
  }
  return data as RepoItem[]
}

export async function fetchFileContent(url: string): Promise<Blob> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  return res.blob()
}

export async function fetchFileText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`)
  return res.text()
}
