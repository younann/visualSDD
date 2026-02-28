import type { SpecFile } from '../../types/spec';

interface SidebarProps {
  specs: SpecFile[];
  activeSpec: string | null;
  onSelectSpec: (name: string) => void;
  onNewSpec: () => void;
}

export function Sidebar({ specs, activeSpec, onSelectSpec, onNewSpec }: SidebarProps) {
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Specs</span>
        <button
          onClick={onNewSpec}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
        >
          + New
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {specs.map((spec) => (
          <button
            key={spec.name}
            onClick={() => onSelectSpec(spec.name)}
            className={`w-full text-left px-3 py-2 rounded text-sm truncate transition-colors ${
              activeSpec === spec.name
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            {spec.name}
          </button>
        ))}
        {specs.length === 0 && (
          <p className="text-gray-600 text-xs px-3 py-2">No specs yet. Create one!</p>
        )}
      </nav>
    </aside>
  );
}
