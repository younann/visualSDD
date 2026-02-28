import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import { nodeTypes } from './CustomNodes';
import type { MermaidBlock } from '../../types/spec';

interface DiagramCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  activeDiagram: MermaidBlock | null;
  diagrams: MermaidBlock[];
  onSelectDiagram: (block: MermaidBlock) => void;
  onAddNode: (label: string) => void;
}

export function DiagramCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  activeDiagram,
  diagrams,
  onSelectDiagram,
  onAddNode,
}: DiagramCanvasProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Diagram tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-900 border-b border-gray-800">
        {diagrams.map((block) => (
          <button
            key={block.id}
            onClick={() => onSelectDiagram(block)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              activeDiagram?.id === block.id
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {block.type === 'architecture' ? 'Architecture' : 'Flow'}: {block.id}
          </button>
        ))}
        <button
          onClick={() => {
            const label = window.prompt('Node label:');
            if (label) onAddNode(label);
          }}
          className="ml-auto text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800"
        >
          + Add Node
        </button>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1">
        {activeDiagram ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-950"
          >
            <Background color="#374151" gap={20} />
            <Controls className="!bg-gray-800 !border-gray-700 !text-gray-300 [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700" />
            <MiniMap
              nodeColor="#3b82f6"
              maskColor="rgba(0,0,0,0.7)"
              className="!bg-gray-900 !border-gray-800"
            />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>Select a diagram tab above or create a new spec</p>
          </div>
        )}
      </div>
    </div>
  );
}
