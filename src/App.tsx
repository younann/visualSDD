import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './components/Sidebar';
import { DiagramCanvas } from './components/DiagramCanvas';
import { MarkdownPanel } from './components/MarkdownPanel';
import { AiChat } from './components/AiChat';
import { StatusBar } from './components/StatusBar';
import { useSpecFiles } from './hooks/useSpecFiles';
import { useDiagram } from './hooks/useDiagram';
import { replaceMermaidBlock } from './lib/markdown-parser';
import type { MermaidBlock } from './types/spec';

export default function App() {
  const { specList, activeSpec, activeSpecName, loadSpec, saveSpec } = useSpecFiles();
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [activeDiagram, setActiveDiagram] = useState<MermaidBlock | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // When spec loads, select first diagram
  const handleSelectSpec = useCallback(
    async (name: string) => {
      setActiveDiagram(null);
      await loadSpec(name);
    },
    [loadSpec]
  );

  // When active spec changes, auto-select first diagram
  const diagrams = activeSpec?.mermaidBlocks ?? [];
  if (diagrams.length > 0 && !activeDiagram) {
    setActiveDiagram(diagrams[0]);
  }

  // Handle Mermaid changes from diagram canvas
  const handleMermaidChange = useCallback(
    (blockId: string, newSource: string) => {
      if (!activeSpec || !activeSpecName) return;
      const block = activeSpec.mermaidBlocks.find((b) => b.id === blockId);
      if (!block) return;
      const updatedContent = replaceMermaidBlock(activeSpec.content, block, newSource);
      saveSpec(activeSpecName, updatedContent);
      setLastSync(new Date());
    },
    [activeSpec, activeSpecName, saveSpec]
  );

  // Handle markdown editor changes
  const handleMarkdownChange = useCallback(
    (newContent: string) => {
      if (!activeSpecName) return;
      saveSpec(activeSpecName, newContent);
      setLastSync(new Date());
    },
    [activeSpecName, saveSpec]
  );

  const handleNewSpec = useCallback(() => {
    const name = window.prompt('Spec name (no extension):');
    if (!name) return;
    const template = `---
title: ${name}
status: draft
created: ${new Date().toISOString().split('T')[0]}
tags: []
diagrams:
  - id: architecture
    type: architecture
---

# ${name}

## Overview

Describe what this spec covers...

## Architecture

\`\`\`mermaid
graph TD
    A[Component A] --> B[Component B]
\`\`\`

## Requirements

- ...

## Tasks

- [ ] ...
`;
    fetch('/api/specs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content: template }),
    }).then(() => {
      loadSpec(name);
    });
  }, [loadSpec]);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useDiagram(activeDiagram, handleMermaidChange);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-gray-950 text-white">
        {/* Main content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <Sidebar
            specs={specList}
            activeSpec={activeSpecName}
            onSelectSpec={handleSelectSpec}
            onNewSpec={handleNewSpec}
          />

          {/* Center panel */}
          <main className="flex-1 flex flex-col min-w-0">
            {activeSpec ? (
              <>
                {/* Header */}
                <div className="px-4 py-2 bg-gray-900 border-b border-gray-800">
                  <h1 className="text-lg font-semibold text-gray-200">
                    {activeSpec.frontmatter.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      activeSpec.frontmatter.status === 'approved'
                        ? 'bg-green-900/40 text-green-400'
                        : activeSpec.frontmatter.status === 'review'
                        ? 'bg-yellow-900/40 text-yellow-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {activeSpec.frontmatter.status}
                    </span>
                    {activeSpec.frontmatter.tags?.map((tag) => (
                      <span key={tag} className="text-xs text-gray-600">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Diagram canvas */}
                <div className="flex-1 min-h-0">
                  <DiagramCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    activeDiagram={activeDiagram}
                    diagrams={diagrams}
                    onSelectDiagram={setActiveDiagram}
                    onAddNode={addNode}
                  />
                </div>

                {/* Markdown editor */}
                <div className="h-64 border-t border-gray-800">
                  <MarkdownPanel
                    content={activeSpec.content}
                    onChange={handleMarkdownChange}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">VisualSDD</h2>
                  <p className="text-sm">Select a spec from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </main>

          {/* AI Chat */}
          <AiChat
            isCollapsed={chatCollapsed}
            onToggle={() => setChatCollapsed((c) => !c)}
          />
        </div>

        {/* Status bar */}
        <StatusBar
          specCount={specList.length}
          activeSpec={activeSpecName}
          lastSync={lastSync}
        />
      </div>
    </ReactFlowProvider>
  );
}
