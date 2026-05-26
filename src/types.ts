export interface RepoItem {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
  size: number
}

export interface RepoInfo {
  owner: string
  repo: string
  branch: string
}

export interface DiffLine {
  type: 'add' | 'del' | 'same'
  contentA: string | null
  contentB: string | null
  lineNumA: number | null
  lineNumB: number | null
}

export interface Hunk {
  oldStart: number
  oldCount: number
  newStart: number
  newCount: number
  lines: DiffLine[]
}

export interface DiffStats {
  additions: number
  deletions: number
  unchanged: number
}
