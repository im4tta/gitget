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
