<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="gitget">
</p>

<h1 align="center">gitget</h1>

<p align="center">
  <strong>Browse any GitHub repo and download only the files you need</strong>
  <br>
  No more downloading 100 MB zips for a single config file.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-58c4dc?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/vite-8-646cff?logo=vite" alt="Vite 8">
  <img src="https://img.shields.io/badge/typescript-6-3178c6?logo=typescript" alt="TypeScript 6">
  <img src="https://img.shields.io/badge/tailwind-4-06b6d4?logo=tailwindcss" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

<br>

## Features

- **🔍 Browse** — Explore any public GitHub repo's file tree in your browser
- **✅ Select** — Pick individual files or whole directories with checkboxes
- **📦 Download** — Get a clean `.zip` containing only what you selected
- **🔁 Compare** — Diff files between two repos at `/compare` with LCS-based line diff, context hunks, and live stats
- **⚡ Lazy loading** — Directories load on demand; no waiting for the entire tree
- **🌙 Dark mode** — Respects your system color scheme

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and paste a GitHub repo URL. That's it.

| Page | Route | Description |
|---|---|---|
| Browse | `/` | Explore repos, select files, download as `.zip` |
| Compare | `/compare` | Diff files between two repos side by side |

### Examples

| Input | What happens |
|---|---|
| `facebook/react` | Opens react's default branch |
| `https://github.com/vitejs/vite` | Same — full URL also works |
| `tailwindlabs/tailwindcss` | Opens tailwind's default branch |

## How it works

### Browse

1. **URL parsing** — Accepts `owner/repo` shorthand or full `https://github.com/...` URLs
2. **GitHub Contents API** — Lists repo contents lazily (one directory at a time)
3. **File selection** — Check files individually or use directory checkboxes for batch select
4. **Client-side bundling** — Selected files are fetched, zipped in-browser with [JSZip](https://stuk.github.io/jszip/), and downloaded — no server needed

### Compare

1. **Dual repo input** — Paste any owner/repo or full GitHub URL into either panel
2. **Smart file matching** — Files present in both repos show a "both" badge; expanding a directory on one side auto-loads it on the other
3. **LCS line diff** — Uses a Longest Common Subsequence algorithm to compute additions, deletions, and unchanged lines
4. **Context view** — Shows 3 lines of context around changes with `@@` hunk headers, just like `git diff`
5. **Live stats** — Per-file `+additions` `-deletions` and unchanged counts in the diff header

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Build tool | [Vite 8](https://vite.dev/) |
| Language | [TypeScript 6](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Bundling | [JSZip](https://stuk.github.io/jszip/) |
| API | [GitHub REST API v3](https://docs.github.com/en/rest/repos/contents) |
| Diff | LCS-based line diff (DP + backtrack) |

## License

MIT
