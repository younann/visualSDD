# VisualSDD — Design Document

**Date:** 2026-02-28
**Status:** Approved

## Vision

VisualSDD turns spec-driven development into a visual, collaborative experience. It bridges the gap between developers (who work in CLIs) and non-developers (who think in diagrams and documents) by providing a shared visual interface for building software specs.

Markdown files with embedded Mermaid diagrams are the single source of truth. A React web UI watches these files and renders them as interactive, editable diagrams. Changes flow bidirectionally — edit the diagram visually and the markdown updates; edit the markdown and the diagram re-renders.

## Target Users

- **Developers** using CLI tools (Claude Code, etc.) who want visual feedback on their specs
- **Non-developers** (PMs, designers, stakeholders) who want to participate in spec creation without touching code
- Both interact with the same spec files through their preferred interface

## Architecture: File-Watcher Model

```
┌──────────────┐         ┌──────────────────────────┐
│  CLI Layer   │         │     Web UI (React)        │
│              │         │                           │
│ • Claude Code│         │ ┌───────────────────────┐ │
│ • Any AI CLI │         │ │  Spec Viewer/Editor   │ │
│ • Manual edit│         │ └───────────────────────┘ │
│              │         │ ┌───────────────────────┐ │
│   Writes     │         │ │  Diagram Canvas       │ │
│   .md files  │         │ │  (React Flow)         │ │
│     │        │         │ └───────────────────────┘ │
│     ▼        │         │ ┌───────────────────────┐ │
│  ┌────────┐  │         │ │  AI Chat Panel        │ │
│  │ specs/ │◄─┼─ file ──┤ │  (proxied via CLI)    │ │
│  │ *.md   │──┼─ watch ─┤ └───────────────────────┘ │
│  └────────┘  │         │ ┌───────────────────────┐ │
│              │         │ │  Spec Navigator       │ │
│              │         │ │  (File tree sidebar)  │ │
└──────────────┘         │ └───────────────────────┘ │
                         └──────────────────────────┘
```

### Key decisions

- **Markdown files are the source of truth** — git-friendly, human-readable, works without the tool
- **File-watcher architecture** — UI watches `specs/` directory via chokidar, no custom protocol
- **AI proxied through CLI** — no separate API key needed, uses existing Claude subscription
- **Local-first** — everything runs on the user's machine, optional sync later

## Spec File Format

```markdown
---
title: User Authentication System
status: draft | review | approved | implemented
created: 2026-02-28
tags: [auth, backend, security]
diagrams:
  - id: arch-overview
    type: architecture
  - id: login-flow
    type: flow
---

# User Authentication System

## Overview
Brief description of what this spec covers...

## Architecture

\```mermaid
graph TD
    Client[Web Client] --> API[API Gateway]
    API --> Auth[Auth Service]
    Auth --> DB[(User DB)]
    Auth --> Cache[(Redis Cache)]
\```

## Login Flow

\```mermaid
flowchart LR
    A[User enters credentials] --> B{Valid?}
    B -->|Yes| C[Generate JWT]
    B -->|No| D[Show error]
    C --> E[Redirect to dashboard]
\```

## Requirements
- Bullet points...

## Tasks
- [ ] Implement auth service
- [ ] Set up database schema
```

## Mermaid <-> React Flow Bridge

### Parsing (Mermaid -> React Flow)

1. `mermaid.parse()` produces an AST with node IDs, labels, edges
2. Map to React Flow format: nodes with auto-layout positions (via dagre), edges with labels
3. React Flow renders the interactive graph

### Serialization (React Flow -> Mermaid)

1. React Flow onChange callback fires on user edits
2. Custom serializer walks nodes + edges
3. Generates valid Mermaid syntax
4. Replaces the Mermaid code block in the .md file
5. File watcher ignores self-triggered changes to prevent loops

### Auto-Layout

- dagre computes initial positions from Mermaid graph structure
- Once user moves a node, positions are stored as metadata
- Subsequent re-parses respect stored positions

### Fidelity table

| Feature | Round-trips | Notes |
|---------|-------------|-------|
| Node labels | Yes | Core |
| Edge connections | Yes | Core |
| Edge labels | Yes | Serialized back |
| Subgraphs | Yes | Mapped to React Flow groups |
| Custom positions | Yes | Stored as metadata |
| Advanced Mermaid CSS | Partially | Some styles may not round-trip |

## UI Layout: 3-Panel Design

```
┌──────────┬──────────────────────────────┬──────────────────┐
│ SPECS    │  Diagram Canvas (React Flow) │  AI Chat         │
│          │  [Architecture] [Flow] tabs  │                  │
│ File     │                              │  > prompt...     │
│ navigator│  Interactive nodes & edges   │  🤖 response...  │
│          │  [+ Add Node] [Style] tools  │                  │
│          ├──────────────────────────────┤                  │
│          │  Markdown Preview / Editor   │                  │
│          │  (CodeMirror)                │                  │
├──────────┴──────────────────────────────┴──────────────────┤
│  Status bar: watching specs/ • count • last sync           │
└───────────────────────────────────────────────────────────┘
```

### Key interactions

- Click a spec in sidebar -> loads in center panel
- Drag a node -> Mermaid code updates in .md file automatically
- Right-click canvas -> add node, connection, subgraph
- Type in AI chat -> AI modifies spec files -> file watcher re-renders
- Edit markdown directly -> diagram updates above
- Toolbar: add node, add edge, auto-layout, zoom, export PNG/SVG

## AI Integration

Two entry points, zero API key configuration:

1. **CLI mode**: User talks to AI in terminal. AI writes/updates .md files. UI reflects changes via file watcher.
2. **UI chat mode**: Chat panel sends requests to local server, which proxies through the running CLI process using the user's existing subscription.

## Diagram Types (v1)

- **Architecture diagrams**: System components, services, databases, and their connections
- **Flow diagrams**: User flows, data flows, decision trees

## Tech Stack

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `@xyflow/react` | Interactive diagram canvas |
| `@dagrejs/dagre` | Automatic graph layout |
| `mermaid` | Parse Mermaid syntax |
| `unified` + `remark` + `rehype` | Markdown parsing/rendering |
| `chokidar` | File system watching |
| `codemirror` | Markdown editor |
| `tailwindcss` | Styling |
| `express` or `fastify` | Local API server |
| `vite` | Build tool + dev server |
| TypeScript | Type safety |

## Project Structure

```
visualsdd/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── DiagramCanvas/
│   │   ├── MarkdownPanel/
│   │   ├── AiChat/
│   │   └── Toolbar/
│   ├── lib/
│   │   ├── mermaid-parser.ts
│   │   ├── mermaid-serializer.ts
│   │   ├── markdown-parser.ts
│   │   ├── file-watcher.ts
│   │   └── auto-layout.ts
│   ├── hooks/
│   │   ├── useSpecFiles.ts
│   │   ├── useDiagram.ts
│   │   └── useAiChat.ts
│   └── types/
│       └── spec.ts
├── server/
│   ├── index.ts
│   ├── file-watcher.ts
│   └── ai-proxy.ts
└── specs/
    └── example.md
```

## Future (not in v1)

- Optional server sync for team collaboration
- Sequence diagrams, ERDs, API contract diagrams
- Export specs to PDF
- Version history / diff view for specs
- Custom diagram node types
