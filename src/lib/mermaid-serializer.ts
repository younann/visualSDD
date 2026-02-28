import type { Node, Edge } from '@xyflow/react';

export function serializeToMermaid(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' | 'BT' | 'RL' = 'TB'
): string {
  const lines: string[] = [];
  const dirLabel = direction === 'TB' ? 'TD' : direction;
  lines.push(`graph ${dirLabel}`);

  // Serialize nodes
  for (const node of nodes) {
    const label = String(node.data?.label ?? node.id);
    const shape = getShapeForNode(node);
    lines.push(`    ${node.id}${shape.open}${label}${shape.close}`);
  }

  // Serialize edges
  for (const edge of edges) {
    if (edge.label) {
      lines.push(`    ${edge.source} -->|${edge.label}| ${edge.target}`);
    } else {
      lines.push(`    ${edge.source} --> ${edge.target}`);
    }
  }

  return lines.join('\n');
}

function getShapeForNode(node: Node): { open: string; close: string } {
  switch (node.type) {
    case 'database':
      return { open: '[(', close: ')]' };
    case 'diamond':
      return { open: '{', close: '}' };
    default:
      return { open: '[', close: ']' };
  }
}
