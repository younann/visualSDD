import type { Node, Edge } from '@xyflow/react';
import { layoutGraph } from './auto-layout';

interface ParsedMermaid {
  nodes: Node[];
  edges: Edge[];
  direction: 'TB' | 'LR' | 'BT' | 'RL';
}

// Regex patterns for Mermaid flowchart syntax
const DIRECTION_RE = /^(?:graph|flowchart)\s+(TD|TB|LR|RL|BT)/;
const NODE_SHAPE_RE = /^(\w+)(\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\}|\[\(([^)]*)\)\]|\[\[([^\]]*)\]\]|\(\(([^)]*)\)\)|\>([^\]]*)\])?/;
const EDGE_RE = /(\w+)\s*(-->|---|-\.-|==>|-.->|-->\|([^|]*)\||---\|([^|]*)\||--\s*([^-][^|>]*?)\s*-->|--\s*([^-][^|>]*?)\s*---)\s*(\w+)/;
const SUBGRAPH_START_RE = /^subgraph\s+(\w+)\s*(?:\[([^\]]*)\])?/;
const SUBGRAPH_END_RE = /^end$/;

export function parseMermaid(source: string): ParsedMermaid {
  const lines = source.split('\n').map((l) => l.trim()).filter(Boolean);
  let direction: 'TB' | 'LR' | 'BT' | 'RL' = 'TB';

  const nodesMap = new Map<string, Node>();
  const edges: Edge[] = [];
  let edgeCount = 0;

  for (const line of lines) {
    // Parse direction
    const dirMatch = line.match(DIRECTION_RE);
    if (dirMatch) {
      const dir = dirMatch[1] === 'TD' ? 'TB' : dirMatch[1];
      direction = dir as 'TB' | 'LR' | 'BT' | 'RL';
      continue;
    }

    // Skip subgraph lines for now
    if (SUBGRAPH_START_RE.test(line) || SUBGRAPH_END_RE.test(line)) {
      continue;
    }

    // Parse edges (which also define nodes)
    const edgeMatch = line.match(EDGE_RE);
    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const targetId = edgeMatch[7];
      const edgeLabel = edgeMatch[3] || edgeMatch[4] || edgeMatch[5] || edgeMatch[6] || '';

      // Ensure source and target nodes exist
      ensureNode(nodesMap, sourceId, line);
      ensureNode(nodesMap, targetId, line);

      edges.push({
        id: `e-${edgeCount++}`,
        source: sourceId,
        target: targetId,
        label: edgeLabel.trim() || undefined,
        type: 'smoothstep',
      });
      continue;
    }

    // Parse standalone node definitions
    const nodeMatch = line.match(NODE_SHAPE_RE);
    if (nodeMatch && nodeMatch[1] && !nodesMap.has(nodeMatch[1])) {
      const id = nodeMatch[1];
      const label = nodeMatch[3] || nodeMatch[4] || nodeMatch[5] || nodeMatch[6] || nodeMatch[7] || nodeMatch[8] || nodeMatch[9] || id;
      nodesMap.set(id, {
        id,
        data: { label },
        position: { x: 0, y: 0 },
        type: getNodeType(line, id),
      });
    }
  }

  const nodes = Array.from(nodesMap.values());
  const layoutDir = direction === 'BT' ? 'TB' : direction === 'RL' ? 'LR' : direction;
  const layouted = layoutGraph(nodes, edges, layoutDir as 'TB' | 'LR');

  return {
    nodes: layouted.nodes,
    edges: layouted.edges,
    direction,
  };
}

function ensureNode(nodesMap: Map<string, Node>, id: string, line: string): void {
  if (nodesMap.has(id)) return;

  // Try to extract label from the line
  const patterns = [
    new RegExp(`${id}\\[([^\\]]+)\\]`),     // [label]
    new RegExp(`${id}\\(([^)]+)\\)`),         // (label)
    new RegExp(`${id}\\{([^}]+)\\}`),         // {label}
    new RegExp(`${id}\\[\\(([^)]+)\\)\\]`),   // [(label)]
    new RegExp(`${id}\\(\\(([^)]+)\\)\\)`),   // ((label))
  ];

  let label = id;
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      label = match[1];
      break;
    }
  }

  nodesMap.set(id, {
    id,
    data: { label },
    position: { x: 0, y: 0 },
    type: getNodeType(line, id),
  });
}

function getNodeType(line: string, id: string): string {
  // Check for database shape [(label)]
  if (new RegExp(`${id}\\[\\(`).test(line)) return 'database';
  // Check for diamond shape {label}
  if (new RegExp(`${id}\\{`).test(line)) return 'diamond';
  // Default
  return 'default';
}
