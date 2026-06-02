<div align="center">

# gitget

**Browse any GitHub repo and download only the files you need.**

No more downloading 100 MB zips for a single config file.

<br>

![React 19](https://img.shields.io/badge/react-19-58c4dc?logo=react)
![Vite](https://img.shields.io/badge/vite-8-646cff?logo=vite)
![TypeScript](https://img.shields.io/badge/typescript-6-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/tailwind-4-06b6d4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Usage](#usage)
  - [Routes](#routes)
  - [Input examples](#input-examples)
- [How it works](#how-it-works)
  - [Browse](#browse)
  - [Compare](#compare)
  - [Token & rate limits](#token--rate-limits)
- [Tech stack](#tech-stack)
- [License](#license)

---

## Features

| | |
|---|---|
| 🔍 **Browse** | Explore any public GitHub repo's file tree in your browser |
| ✅ **Select** | Pick individual files or whole directories with checkboxes |
| 📦 **Download** | Get a clean `.zip` containing only what you selected |
| 🔁 **Compare** | Diff files between two repos at `/compare` with LCS-based line diff and context hunks |
| 🔎 **File search** | Filter files by name in both Browse and Compare views |
| 🌿 **Branch support** | Specify any branch, tag, or commit; compare across branches |
| 🔒 **Token support** | Add a GitHub token for private repos and higher rate limits |
| 🎨 **Syntax highlighting** | Diff output with language-aware keyword, string, and comment coloring |
| 📋 **Export patches** | Download diffs as `.patch` files |
| ⚡ **Lazy loading** | Directories load on demand — no waiting for the entire tree |
| 🌙 **Dark mode** | Respects your system color scheme |

---

## Quick start

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and paste a GitHub repo URL. That's it.

**Requirements:** Node.js 18+ and npm.

---

## Usage

### Routes

| Page    | Route     | Description                                       |
| ------- | --------- | ------------------------------------------------- |
| Browse  | `/`       | Explore repos, select files, download as `.zip`   |
| Compare | `/compare`| Diff files between two repos side by side         |

### Input examples

| Input                                                        | What happens                       |
| ------------------------------------------------------------ | ---------------------------------- |
| `facebook/react`                                             | Opens react's default branch       |
| `https://github.com/vitejs/vite`                             | Full URL also works                |
| `tailwindlabs/tailwindcss`                                   | Opens tailwind's default branch    |
| `facebook/react` + branch `dev`                             | Opens react's `dev` branch         |
| `facebook/react` (A) vs `facebook/react` branch `dev` (B)   | Cross-branch diff in Compare       |

---

## How it works

### Browse

1. **URL parsing** — Accepts `owner/repo` shorthand or full `https://github.com/...` URLs; branch is auto-detected from `tree/branch` paths.
2. **Branch selection** — A dedicated branch input lets you switch to any branch, tag, or commit.
3. **GitHub Contents API** — Lists repo contents lazily (one directory at a time) with `?ref=` support.
4. **File search** — Filter the tree by filename in real time.
5. **File selection** — Check files individually or use directory checkboxes for batch select.
6. **Client-side bundling** — Selected files are fetched, zipped in-browser with [JSZip](https://stuk.github.io/jszip/), and downloaded — no server needed.

### Compare

1. **Dual repo input** — Paste any owner/repo or full GitHub URL into either panel, each with its own branch selector.
2. **Smart file matching** — Files present in both repos show a `both` badge; expanding a directory on one side auto-loads it on the other.
3. **LCS line diff** — Uses a Longest Common Subsequence algorithm to compute additions, deletions, and unchanged lines.
4. **Context view** — Shows 3 lines of context around changes with `@@` hunk headers, just like `git diff`.
5. **Live stats** — Per-file `+additions` `-deletions` and unchanged counts in the diff header.
6. **Syntax highlighting** — Diff code is highlighted by language (keywords, strings, comments, numbers).
7. **Export `.patch`** — Download any diff as a standard unified-format `.patch` file.

### Token & rate limits

1. By default, the GitHub API limits unauthenticated requests to **60/hour**.
2. Click the gear icon in the nav bar to open Settings.
3. Paste a [GitHub personal access token](https://github.com/settings/tokens) — no scopes needed for public repos; `repo` scope for private.
4. The token is stored in `localStorage` and sent with every API call — no server involved.

---

## Tech stack

| Layer        | Technology                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------- |
| Framework    | [React 19](https://react.dev/)                                                              |
| Routing      | [React Router 7](https://reactrouter.com/)                                                   |
| Build tool   | [Vite 8](https://vite.dev/)                                                                 |
| Language     | [TypeScript 6](https://www.typescriptlang.org/)                                             |
| Styling      | [Tailwind CSS 4](https://tailwindcss.com/)                                                  |
| Bundling     | [JSZip](https://stuk.github.io/jszip/)                                                      |
| API          | [GitHub REST API v3](https://docs.github.com/en/rest/repos/contents) with `?ref=` support   |
| Auth         | Token via `localStorage` + `Authorization: Bearer` header                                  |
| Diff         | LCS-based line diff (DP + backtrack) with 3-line context hunks                              |
| Highlighting | Regex-based syntax highlighting (TS / JS / Python / Rust / Go / Shell + more)               |

---

## License

MIT — see `LICENSE` for details.
