import { Handle, Position, type NodeProps } from '@xyflow/react';

export function DatabaseNode({ data }: NodeProps) {
  return (
    <div className="bg-green-900/80 border border-green-500/50 rounded-lg px-4 py-2 text-green-200 text-sm shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-green-400" />
      <div className="flex items-center gap-1.5">
        <span className="text-green-400 text-xs">DB</span>
        <span>{String(data?.label ?? '')}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-400" />
    </div>
  );
}

export function DiamondNode({ data }: NodeProps) {
  return (
    <div className="bg-yellow-900/80 border border-yellow-500/50 px-4 py-2 text-yellow-200 text-sm shadow-lg rotate-0 rounded">
      <Handle type="target" position={Position.Top} className="!bg-yellow-400" />
      <div className="flex items-center gap-1.5">
        <span className="text-yellow-400 text-xs">?</span>
        <span>{String(data?.label ?? '')}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-yellow-400" />
    </div>
  );
}

export function DefaultNode({ data }: NodeProps) {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 text-sm shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <span>{String(data?.label ?? '')}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
    </div>
  );
}

export const nodeTypes = {
  default: DefaultNode,
  database: DatabaseNode,
  diamond: DiamondNode,
};
