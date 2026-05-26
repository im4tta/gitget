import type { RepoItem, RepoInfo } from '../types'

const API_BASE = 'https://api.github.com'

function authHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem('gitget_token')
    if (token) return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
  } catch { /* localStorage not available */ }
  return { Accept: 'application/vnd.github.v3+json' }
}

export function parseGitHubUrl(input: string): RepoInfo | null {
  let owner: string
  let repo: string
  let branch = 'main'

  const trimmed = input.trim()

  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    [owner, repo] = trimmed.split('/')
    return { owner, repo, branch }
  }

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
  ref?: string,
  signal?: AbortSignal,
): Promise<RepoItem[]> {
  let endpoint = `${API_BASE}/repos/${owner}/${repo}/contents/${path}`
  if (ref) endpoint += `?ref=${encodeURIComponent(ref)}`
  const res = await fetch(endpoint, { headers: authHeaders(), signal })
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
