#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CLI arguments
const args = process.argv.slice(2);
let specsDir = null;
let port = 3001;
let showHelp = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') {
    port = Number(args[++i]);
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp = true;
  } else if (!args[i].startsWith('-')) {
    specsDir = args[i];
  }
}

if (showHelp) {
  console.log(`
  VisualSDD — Visual Spec-Driven Development

  Usage:
    visualsdd [directory] [options]

  Arguments:
    directory          Path to directory containing .md spec files
                       (defaults to ./specs if it exists, otherwise current directory)

  Options:
    -p, --port PORT    Port to run the server on (default: 3001)
    -h, --help         Show this help message

  Examples:
    visualsdd                    # Auto-detect specs in current directory
    visualsdd ./docs/specs       # Use specific directory
    visualsdd --port 8080        # Use custom port
    npx visualsdd ./my-specs     # Run without installing
`);
  process.exit(0);
}

// Auto-detect specs directory
if (!specsDir) {
  if (existsSync(resolve('specs'))) {
    specsDir = resolve('specs');
  } else {
    // Scan current directory for .md files with mermaid blocks
    const cwd = process.cwd();
    const mdFiles = readdirSync(cwd).filter(f => f.endsWith('.md'));
    const hasMermaid = mdFiles.some(f => {
      try {
        const content = readFileSync(join(cwd, f), 'utf-8');
        return content.includes('```mermaid');
      } catch { return false; }
    });
    specsDir = hasMermaid ? cwd : resolve('specs');
  }
} else {
  specsDir = resolve(specsDir);
}

// Resolve static assets path (from the npm package's dist/ folder)
const packageRoot = resolve(__dirname, '..');
const staticDir = join(packageRoot, 'dist');

if (!existsSync(staticDir)) {
  console.error('Error: Built UI assets not found at', staticDir);
  console.error('If developing locally, run: npm run build:ui');
  process.exit(1);
}

// Start the server
const { startServer } = await import('../dist-server/index.js');

console.log(`
  ╔══════════════════════════════════════════╗
  ║           VisualSDD v0.1.0              ║
  ║   Visual Spec-Driven Development        ║
  ╚══════════════════════════════════════════╝
`);

await startServer({ specsDir, port, staticDir });

const url = `http://localhost:${port}`;
console.log(`  Server running at: ${url}`);
console.log(`  Watching specs in: ${specsDir}`);
console.log(`  Press Ctrl+C to stop\n`);

// Auto-open browser
try {
  const { default: open } = await import('open');
  await open(url);
} catch {
  // open package not available, just print the URL
  console.log(`  Open in browser: ${url}\n`);
}
