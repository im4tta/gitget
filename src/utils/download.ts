import JSZip from 'jszip'
import { fetchFileContent } from '../api/github'

interface SelectedFile {
  path: string
  downloadUrl: string
}

export async function downloadSelected(
  files: SelectedFile[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const zip = new JSZip()
  let completed = 0

  for (const file of files) {
    try {
      const blob = await fetchFileContent(file.downloadUrl)
      zip.file(file.path, blob)
    } catch {
      console.warn(`Skipped: ${file.path}`)
    }
    completed++
    onProgress?.(completed, files.length)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'files.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
