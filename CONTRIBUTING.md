# Contributing to VisualSDD

Thanks for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/visualsdd.git`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Open http://localhost:5173

## Development

The project runs two processes in development:

- **Vite dev server** (port 5173) — serves the React UI with hot reload
- **Express server** (port 3001) — REST API + file watcher + WebSocket

`npm run dev` starts both via `concurrently`.

## Making Changes

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Verify TypeScript compiles: `npx tsc --noEmit`
4. Test manually by running `npm run dev` and checking the UI
5. Commit with a descriptive message
6. Push and open a Pull Request

## Project Structure

- `server/` — Express server, file watching, WebSocket
- `src/lib/` — Core parsers (markdown, mermaid) and serializers
- `src/hooks/` — React hooks for state management
- `src/components/` — UI components
- `specs/` — Spec files (markdown with Mermaid)

## Areas for Contribution

- **Mermaid parser improvements** — Better handling of edge cases (subgraphs, special characters in labels)
- **New diagram types** — Sequence diagrams, state diagrams
- **Export features** — PNG/SVG export of diagrams
- **AI integration** — Connect the AI chat panel to LLM APIs
- **Testing** — Unit tests for parsers and serializers
- **Documentation** — Improve docs, add tutorials

## Code Style

- TypeScript strict mode
- Functional React components with hooks
- Tailwind CSS for styling
- Keep it simple — avoid over-engineering

## Reporting Issues

Use [GitHub Issues](https://github.com/younann/visualsdd/issues) to report bugs or suggest features. Include:

- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (OS, Node version, browser)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
