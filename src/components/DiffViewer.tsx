import { useMemo } from 'react'
import type { Hunk, DiffStats } from '../types'

interface DiffViewerProps {
  hunks: Hunk[]
  stats: DiffStats | null
  filename: string
  loading: boolean
  error: string | null
}

export function DiffViewer({ hunks, stats, filename, loading, error }: DiffViewerProps) {
  const lang = useMemo(() => detectLang(filename), [filename])

  const handleExportPatch = () => {
    const lines: string[] = []
    lines.push(`--- a/${filename}`)
    lines.push(`+++ b/${filename}`)
    for (const hunk of hunks) {
      lines.push(`@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`)
      for (const line of hunk.lines) {
        if (line.type === 'add') lines.push('+' + (line.contentB ?? ''))
        else if (line.type === 'del') lines.push('-' + (line.contentA ?? ''))
        else lines.push(' ' + (line.contentA ?? ''))
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.replace(/\//g, '-') + '.patch'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        Computing diff...
      </div>
    )
  }

  if (hunks.length === 0 && stats) {
    return (
      <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        Files are identical ({stats.unchanged} lines unchanged)
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        Select a file in both repos to see the diff
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 text-sm">
        <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{filename}</span>
        <span className="text-green-600 dark:text-green-400 font-medium">+{stats.additions}</span>
        <span className="text-red-600 dark:text-red-400 font-medium">-{stats.deletions}</span>
        <span className="text-gray-400">{stats.unchanged} unchanged</span>
        <button
          onClick={handleExportPatch}
          className="ml-auto text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Export .patch
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[13px] leading-5">
          <tbody>
            {hunks.map((hunk, hunkIdx) => (
              <HunkBlock key={hunkIdx} hunk={hunk} lang={lang} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HunkBlock({ hunk, lang }: { hunk: Hunk; lang: string }) {
  return (
    <>
      <tr>
        <td colSpan={4} className="px-4 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-mono border-b border-gray-200 dark:border-gray-700">
          @@ -{hunk.oldStart},{hunk.oldCount} +{hunk.newStart},{hunk.newCount} @@
        </td>
      </tr>
      {hunk.lines.map((line, i) => {
        let bgColor = ''
        let prefix = ' '
        let textColor = 'text-gray-900 dark:text-gray-100'
        const content = line.type === 'same' ? line.contentA : line.type === 'del' ? line.contentA : line.contentB

        if (line.type === 'add') {
          bgColor = 'bg-green-50 dark:bg-green-950/30'
          prefix = '+'
          textColor = 'text-green-800 dark:text-green-300'
        } else if (line.type === 'del') {
          bgColor = 'bg-red-50 dark:bg-red-950/30'
          prefix = '-'
          textColor = 'text-red-800 dark:text-red-300'
        }

        return (
          <tr key={i} className={bgColor}>
            <td className="w-[3.5rem] text-right px-2 text-gray-400 dark:text-gray-500 select-none border-r border-gray-200 dark:border-gray-700">
              {line.lineNumA ?? ''}
            </td>
            <td className="w-[3.5rem] text-right px-2 text-gray-400 dark:text-gray-500 select-none border-r border-gray-200 dark:border-gray-700">
              {line.lineNumB ?? ''}
            </td>
            <td className={`w-5 text-center select-none ${line.type === 'add' ? 'text-green-600 dark:text-green-400' : ''} ${line.type === 'del' ? 'text-red-600 dark:text-red-400' : ''} text-gray-400`}>
              {prefix}
            </td>
            <td className={`px-2 whitespace-pre-wrap break-all ${textColor}`}>
              <HighlightedCode code={content ?? ''} lang={lang} />
            </td>
          </tr>
        )
      })}
    </>
  )
}

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const html = useMemo(() => highlight(code, lang), [code, lang])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function detectLang(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'ts', tsx: 'tsx', js: 'js', jsx: 'jsx', json: 'json',
    py: 'py', rs: 'rs', go: 'go', java: 'java', c: 'c', cpp: 'cpp',
    h: 'c', hpp: 'cpp', cs: 'cs', rb: 'rb', php: 'php', swift: 'swift',
    kt: 'kt', scala: 'scala', sql: 'sql', sh: 'sh', bash: 'sh',
    yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini', cfg: 'ini',
    css: 'css', scss: 'scss', html: 'html', xml: 'xml', svg: 'xml',
    md: 'md', r: 'r', lua: 'lua', pl: 'pl', dart: 'dart',
  }
  return map[ext] ?? ''
}

const KEYWORDS = {
  ts: 'abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield',
  js: 'async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|false|finally|for|function|if|import|in|instanceof|let|new|null|of|return|static|super|switch|this|throw|true|try|typeof|undefined|var|void|while|with|yield',
  py: 'False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield',
  rs: 'as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|union|unsafe|use|where|while',
  go: 'break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var',
  sh: 'case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while',
}

function highlight(code: string, lang: string): string {
  if (!lang) return escapeHtml(code)
  const escaped = escapeHtml(code)

  const kw = KEYWORDS[lang as keyof typeof KEYWORDS] ?? ''
  const kwPattern = kw ? `\\b(${kw})\\b` : ''

  const patterns: { pattern: string; cls: string }[] = []
  if (kwPattern) patterns.push({ pattern: kwPattern, cls: 'kw' })

  // Strings
  patterns.push({ pattern: '("(?:[^"\\\\]|\\\\.)*")', cls: 'str' })
  patterns.push({ pattern: "('(?:[^'\\\\]|\\\\.)*')", cls: 'str' })
  patterns.push({ pattern: '(`(?:[^`\\\\]|\\\\.)*`)', cls: 'str' })

  // Comments
  if (['ts', 'js', 'tsx', 'jsx', 'rs', 'go', 'java', 'c', 'cpp', 'cs', 'swift', 'kt', 'scala', 'dart'].includes(lang)) {
    patterns.push({ pattern: '(//[^\n]*)', cls: 'cm' })
    patterns.push({ pattern: '(/\\*[\\s\\S]*?\\*/)', cls: 'cm' })
  }
  if (['py', 'rb', 'pl', 'sh', 'r', 'lua'].includes(lang)) {
    patterns.push({ pattern: '(#[^\n]*)', cls: 'cm' })
  }
  if (['py'].includes(lang)) {
    patterns.push({ pattern: '("""[\\s\\S]*?""")', cls: 'cm' })
    patterns.push({ pattern: "('''[\\s\\S]*?''')", cls: 'cm' })
  }

  // Numbers
  patterns.push({ pattern: '(\\b\\d+(?:\\.\\d+)?\\b)', cls: 'num' })

  // Function calls (word followed by parenthesis)
  patterns.push({ pattern: '(\\b[a-zA-Z_$][\\w$]*)(?=\\s*\\()', cls: 'fn' })

  let result = escaped
  for (const { pattern, cls } of patterns) {
    result = result.replace(new RegExp(pattern, 'g'), (match) => {
      const color = cls === 'kw' ? '#c678dd' : cls === 'str' ? '#98c379' : cls === 'cm' ? '#5c6370' : cls === 'num' ? '#d19a66' : cls === 'fn' ? '#61afef' : ''
      return `<span style="color:${color}">${match}</span>`
    })
  }

  return result
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
