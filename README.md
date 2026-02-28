# VisualSDD

**Visual Spec-Driven Development** — Turn your markdown specs into interactive diagrams.

VisualSDD is a local-first companion tool for developers who use Spec-Driven Development (SDD) workflows. If you write specs in markdown with Mermaid diagrams — whether through Claude Code, Cursor, or any AI-assisted workflow — VisualSDD renders them as interactive, editable React Flow diagrams with full bidirectional sync.

Edit visually, and the markdown updates. Edit the markdown, and the diagram updates. Your `.md` files remain the single source of truth.

## Why VisualSDD?

SDD workflows produce great specs, but reading Mermaid code blocks isn't the most intuitive way to understand architecture. VisualSDD bridges that gap:

- **See your architecture** — Mermaid diagrams become draggable, zoomable node graphs
- **Edit visually** — Drag nodes, draw connections, add components without writing Mermaid syntax
- **Stay in sync** — Every visual change writes back to your spec file instantly
- **File-first** — No database, no cloud, no API keys. Your `specs/*.md` files are the source of truth
- **Works with any editor** — Edit specs in VS Code, vim, or any text editor. VisualSDD watches for changes and updates in real-time

## Features

- **Interactive Diagrams** — React Flow canvas with custom node types (services, databases, decision points)
- **Bidirectional Sync** — Visual edits serialize to Mermaid, markdown edits re-render the diagram
- **Live File Watching** — Edit `.md` files externally and see changes reflected instantly via WebSocket
- **Built-in Markdown Editor** — CodeMirror 6 with syntax highlighting and dark theme
- **Multiple Diagrams** — Supports multiple Mermaid blocks per spec with tab switching
- **Spec Management** — Create, browse, and switch between spec files from the sidebar
- **AI Chat Panel** — Placeholder for future AI integration (bring your own LLM)
- **Dark UI** — Purpose-built dark interface designed for developer workflows

## Installation

```bash
# Run directly (no install needed)
npx visualsdd

# Or install globally
npm install -g visualsdd
```

## Quick Start

```bash
# Visualize specs in current directory (auto-detects .md files with mermaid blocks)
npx visualsdd

# Point to a specific directory
npx visualsdd ./docs/specs

# Use a custom port
npx visualsdd --port 8080
```

Your browser opens automatically. The app watches your directory for `.md` file changes in real time.

### Development mode

```bash
git clone https://github.com/younann/visualsdd.git
cd visualsdd
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The app watches the `specs/` directory for `.md` files.

## Usage

### With an existing SDD workflow

If you already have spec files with Mermaid diagrams, drop them in the `specs/` directory:

```
specs/
  auth-system.md
  payment-flow.md
  api-design.md
```

Each `.md` file should have YAML frontmatter and Mermaid code blocks:

```markdown
---
title: Auth System
status: draft
created: 2026-02-28
tags: [auth, backend]
diagrams:
  - id: architecture
    type: architecture
  - id: login-flow
    type: flow
---

# Auth System

## Architecture

\`\`\`mermaid
graph TD
    Client[Web Client] --> API[API Gateway]
    API --> AuthSvc[Auth Service]
    AuthSvc --> DB[(PostgreSQL)]
\`\`\`
```

### Creating new specs

Click **+ New** in the sidebar to create a spec from a template, or create `.md` files directly in the `specs/` folder — they'll appear automatically.

### Diagram interactions

- **Drag nodes** to rearrange — positions don't affect the Mermaid output (layout is auto-computed)
- **Draw edges** by dragging from one node handle to another
- **Add nodes** via the "+ Add Node" button
- **Switch diagrams** using the tabs above the canvas
- **Zoom/pan** with mouse wheel and drag on the canvas background

## Claude Code Integration

VisualSDD includes a `/sdd-visual` slash command for Claude Code. To set it up:

```bash
# Copy the command file to your project
mkdir -p .claude/commands
cp node_modules/visualsdd/commands/sdd-visual.md .claude/commands/
```

Then in Claude Code, type `/sdd-visual` to scan your project for mermaid diagrams and launch the visual editor.

## Architecture

```
specs/*.md          ← Source of truth (markdown + Mermaid)
    ↕ chokidar
server/index.ts     ← Express + WebSocket (file CRUD + change broadcast)
    ↕ REST + WS
src/App.tsx         ← React UI
  ├── Sidebar       ← Spec file navigation
  ├── DiagramCanvas ← React Flow interactive diagram
  ├── MarkdownPanel ← CodeMirror editor
  ├── AiChat        ← AI integration (placeholder)
  └── StatusBar     ← Sync status
```

**Data flow:**
1. Server watches `specs/*.md` with chokidar
2. UI fetches spec content via REST API
3. Markdown parser extracts frontmatter + Mermaid blocks
4. Mermaid parser converts to React Flow nodes/edges with dagre layout
5. Visual edits serialize back to Mermaid and save via API
6. External file changes broadcast via WebSocket for live reload

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Diagrams:** @xyflow/react (React Flow), @dagrejs/dagre
- **Editor:** CodeMirror 6 with markdown support
- **Server:** Express, chokidar, WebSocket (ws)
- **Parsing:** Custom regex-based Mermaid parser, js-yaml

## Project Structure

```
visualsdd/
├── bin/
│   └── visualsdd.js          # CLI entry point
├── commands/
│   └── sdd-visual.md         # Claude Code slash command (distributable)
├── server/
│   └── index.ts              # Express server + file watcher + WebSocket
├── specs/
│   └── example.md            # Example spec file
├── src/
│   ├── components/
│   │   ├── AiChat/           # AI chat panel (placeholder)
│   │   ├── DiagramCanvas/    # React Flow canvas + custom nodes
│   │   ├── MarkdownPanel/    # CodeMirror markdown editor
│   │   ├── Sidebar/          # Spec file browser
│   │   └── StatusBar/        # Status indicators
│   ├── hooks/
│   │   ├── useDiagram.ts     # Diagram state + bidirectional sync
│   │   ├── useSpecFiles.ts   # Spec CRUD + WebSocket updates
│   │   └── useWebSocket.ts   # WebSocket connection management
│   ├── lib/
│   │   ├── auto-layout.ts    # Dagre graph layout
│   │   ├── markdown-parser.ts # Frontmatter + Mermaid extraction
│   │   ├── mermaid-parser.ts  # Mermaid → React Flow conversion
│   │   └── mermaid-serializer.ts # React Flow → Mermaid conversion
│   ├── types/
│   │   └── spec.ts           # TypeScript interfaces
│   ├── App.tsx               # Main app layout
│   ├── main.tsx              # Entry point
│   └── index.css             # Tailwind + React Flow styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server + UI in development mode |
| `npm run dev:ui` | Start only the Vite dev server |
| `npm run dev:server` | Start only the Express server |
| `npm run build` | Build UI and server for production |
| `npm run build:ui` | Build only the React UI |
| `npm run build:server` | Compile only the server |
| `npm start` | Run production server (after build) |

## Roadmap

- [ ] AI-powered spec generation (plug into Claude, GPT, or local models)
- [ ] Subgraph support for Mermaid diagrams
- [ ] Sequence diagram support
- [ ] Export diagrams as PNG/SVG
- [ ] Collaborative editing via CRDT
- [ ] VS Code extension
- [ ] Spec diffing and version history

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Created by [Younan Nwesre](https://github.com/younann)**

This project was vibecoded — the concept, design, and direction are by Younan Nwesre, built through AI-assisted development.
