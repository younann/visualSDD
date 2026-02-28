import express from 'express';
import cors from 'cors';
import { watch } from 'chokidar';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const SPECS_DIR = path.resolve(process.cwd(), 'specs');

// Ensure specs directory exists
if (!fs.existsSync(SPECS_DIR)) {
  fs.mkdirSync(SPECS_DIR, { recursive: true });
}

// REST API: List spec files
app.get('/api/specs', (_req, res) => {
  const files = fs.readdirSync(SPECS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({
      name: f.replace('.md', ''),
      path: path.join(SPECS_DIR, f),
    }));
  res.json(files);
});

// REST API: Read a spec file
app.get('/api/specs/:name', (req, res) => {
  const filePath = path.join(SPECS_DIR, `${req.params.name}.md`);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Spec not found' });
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  res.json({ name: req.params.name, content, path: filePath });
});

// REST API: Save a spec file
let ignoreNextChange: string | null = null;

app.put('/api/specs/:name', (req, res) => {
  const filePath = path.join(SPECS_DIR, `${req.params.name}.md`);
  ignoreNextChange = filePath;
  fs.writeFileSync(filePath, req.body.content, 'utf-8');
  res.json({ ok: true });
});

// REST API: Create a new spec file
app.post('/api/specs', (req, res) => {
  const { name, content } = req.body;
  const filePath = path.join(SPECS_DIR, `${name}.md`);
  if (fs.existsSync(filePath)) {
    res.status(409).json({ error: 'Spec already exists' });
    return;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  res.json({ ok: true, path: filePath });
});

// WebSocket: broadcast file changes
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected' }));
});

function broadcast(data: object) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// File watcher
const watcher = watch(path.join(SPECS_DIR, '*.md'), {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
});

watcher.on('change', (filePath) => {
  if (ignoreNextChange === filePath) {
    ignoreNextChange = null;
    return;
  }
  const name = path.basename(filePath, '.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  broadcast({ type: 'spec-changed', name, content });
});

watcher.on('add', (filePath) => {
  const name = path.basename(filePath, '.md');
  broadcast({ type: 'spec-added', name });
});

watcher.on('unlink', (filePath) => {
  const name = path.basename(filePath, '.md');
  broadcast({ type: 'spec-removed', name });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`VisualSDD server running on http://localhost:${PORT}`);
  console.log(`Watching specs in: ${SPECS_DIR}`);
});
