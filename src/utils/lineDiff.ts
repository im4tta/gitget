import type { DiffLine, Hunk } from '../types'

export function lineDiff(aLines: string[], bLines: string[]): DiffLine[] {
  const m = aLines.length
  const n = bLines.length

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = aLines[i - 1] === bLines[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const result: DiffLine[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      result.push({ type: 'same', contentA: aLines[i - 1], contentB: bLines[j - 1], lineNumA: i, lineNumB: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'add', contentA: null, contentB: bLines[j - 1], lineNumA: null, lineNumB: j })
      j--
    } else {
      result.push({ type: 'del', contentA: aLines[i - 1], contentB: null, lineNumA: i, lineNumB: null })
      i--
    }
  }

  result.reverse()
  return result
}

export function buildHunks(diff: DiffLine[], context = 3): Hunk[] {
  const hunks: Hunk[] = []

  const regions: { start: number; end: number }[] = []
  let inRegion = false
  let regionStart = 0

  for (let i = 0; i < diff.length; i++) {
    if (diff[i].type !== 'same') {
      if (!inRegion) {
        regionStart = Math.max(0, i - context)
        inRegion = true
      }
    } else {
      if (inRegion) {
        regions.push({ start: regionStart, end: Math.min(diff.length, i + context) })
        inRegion = false
      }
    }
  }
  if (inRegion) {
    regions.push({ start: regionStart, end: diff.length })
  }

  if (regions.length === 0) return []

  const merged: { start: number; end: number }[] = [regions[0]]
  for (let k = 1; k < regions.length; k++) {
    const prev = merged[merged.length - 1]
    if (regions[k].start <= prev.end) {
      prev.end = regions[k].end
    } else {
      merged.push(regions[k])
    }
  }

  for (const { start, end } of merged) {
    const slice = diff.slice(start, end)
    const oldStart = slice.find(l => l.lineNumA !== null)?.lineNumA ?? 1
    const newStart = slice.find(l => l.lineNumB !== null)?.lineNumB ?? 1
    const oldCount = slice.filter(l => l.lineNumA !== null).length
    const newCount = slice.filter(l => l.lineNumB !== null).length

    hunks.push({ oldStart, oldCount, newStart, newCount, lines: slice })
  }

  return hunks
}

export function computeStats(diff: DiffLine[]): { additions: number; deletions: number; unchanged: number } {
  let additions = 0
  let deletions = 0
  let unchanged = 0
  for (const line of diff) {
    if (line.type === 'add') additions++
    else if (line.type === 'del') deletions++
    else unchanged++
  }
  return { additions, deletions, unchanged }
}
