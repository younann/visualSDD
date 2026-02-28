interface StatusBarProps {
  specCount: number;
  activeSpec: string | null;
  lastSync: Date | null;
}

export function StatusBar({ specCount, activeSpec, lastSync }: StatusBarProps) {
  const syncText = lastSync
    ? `Last sync: ${lastSync.toLocaleTimeString()}`
    : 'Watching...';

  return (
    <footer className="h-7 bg-gray-900 border-t border-gray-800 px-4 flex items-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Watching specs/
      </span>
      <span>{specCount} spec{specCount !== 1 ? 's' : ''}</span>
      {activeSpec && <span>Editing: {activeSpec}</span>}
      <span className="ml-auto">{syncText}</span>
    </footer>
  );
}
