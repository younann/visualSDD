import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { parseSpecFile } from '../lib/markdown-parser';
import type { ParsedSpec, SpecFile } from '../types/spec';

const API_BASE = '/api';
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${wsProtocol}//${window.location.host}/ws`;

export function useSpecFiles() {
  const [specList, setSpecList] = useState<SpecFile[]>([]);
  const [activeSpec, setActiveSpec] = useState<ParsedSpec | null>(null);
  const [activeSpecName, setActiveSpecName] = useState<string | null>(null);

  // Fetch spec list
  const fetchSpecList = useCallback(async () => {
    const res = await fetch(`${API_BASE}/specs`);
    const files = await res.json();
    setSpecList(files);
  }, []);

  // Load a specific spec
  const loadSpec = useCallback(async (name: string) => {
    const res = await fetch(`${API_BASE}/specs/${name}`);
    const { content, path } = await res.json();
    const parsed = parseSpecFile(path, content);
    setActiveSpec(parsed);
    setActiveSpecName(name);
  }, []);

  // Save spec content back to file
  const saveSpec = useCallback(async (name: string, content: string) => {
    await fetch(`${API_BASE}/specs/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  }, []);

  // Handle WebSocket messages for live updates
  useWebSocket(WS_URL, (data: unknown) => {
    const msg = data as { type: string; name?: string; content?: string };
    if (msg.type === 'spec-changed' && msg.name === activeSpecName && msg.content) {
      const parsed = parseSpecFile(activeSpec?.filePath ?? '', msg.content);
      setActiveSpec(parsed);
    }
    if (msg.type === 'spec-added' || msg.type === 'spec-removed') {
      fetchSpecList();
    }
  });

  useEffect(() => {
    fetchSpecList();
  }, [fetchSpecList]);

  return {
    specList,
    activeSpec,
    activeSpecName,
    loadSpec,
    saveSpec,
    refreshList: fetchSpecList,
  };
}
