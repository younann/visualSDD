Scan this project for markdown files (`.md`) that contain mermaid diagram blocks (` ```mermaid `).

1. Search recursively for `.md` files containing ` ```mermaid ` blocks
2. For each file found, count the number of mermaid blocks
3. Display a summary table:
   - File path
   - Number of mermaid diagrams
   - First diagram type (graph TD, flowchart LR, etc.)
4. Ask which directory or files to visualize
5. Run `npx visualsdd <chosen-path>` to launch the visual editor

If no mermaid diagrams are found, suggest creating a spec file with a sample mermaid diagram.
