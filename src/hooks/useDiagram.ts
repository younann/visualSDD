import { useState, useCallback, useEffect } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import { parseMermaid } from '../lib/mermaid-parser';
import { serializeToMermaid } from '../lib/mermaid-serializer';
import type { MermaidBlock } from '../types/spec';

export function useDiagram(
  mermaidBlock: MermaidBlock | null,
  onMermaidChange: (blockId: string, newSource: string) => void
) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');

  // Parse Mermaid source into React Flow nodes/edges
  useEffect(() => {
    if (!mermaidBlock) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const parsed = parseMermaid(mermaidBlock.raw);
    setNodes(parsed.nodes);
    setEdges(parsed.edges);
    const dir = parsed.direction === 'BT' ? 'TB' : parsed.direction === 'RL' ? 'LR' : parsed.direction;
    setDirection(dir as 'TB' | 'LR');
  }, [mermaidBlock]);

  // Sync visual changes back to Mermaid
  const syncToMermaid = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      if (!mermaidBlock) return;
      const newSource = serializeToMermaid(updatedNodes, updatedEdges, direction);
      onMermaidChange(mermaidBlock.id, newSource);
    },
    [mermaidBlock, direction, onMermaidChange]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        // Only sync on drag stop (position changes)
        const hasDrag = changes.some((c) => c.type === 'position' && c.dragging === false);
        if (hasDrag) {
          syncToMermaid(updated, edges);
        }
        return updated;
      });
    },
    [edges, syncToMermaid]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        syncToMermaid(nodes, updated);
        return updated;
      });
    },
    [nodes, syncToMermaid]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        const updated = addEdge({ ...connection, type: 'smoothstep' }, eds);
        syncToMermaid(nodes, updated);
        return updated;
      });
    },
    [nodes, syncToMermaid]
  );

  const addNode = useCallback(
    (label: string) => {
      const id = `node_${Date.now()}`;
      const newNode: Node = {
        id,
        data: { label },
        position: { x: 100, y: 100 },
        type: 'default',
      };
      setNodes((nds) => {
        const updated = [...nds, newNode];
        syncToMermaid(updated, edges);
        return updated;
      });
    },
    [edges, syncToMermaid]
  );

  return {
    nodes,
    edges,
    direction,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  };
}
