import type { Node, Edge } from '@xyflow/react';

export interface SpecFrontmatter {
  title: string;
  status: 'draft' | 'review' | 'approved' | 'implemented';
  created: string;
  tags: string[];
  diagrams: DiagramMeta[];
}

export interface DiagramMeta {
  id: string;
  type: 'architecture' | 'flow';
}

export interface MermaidBlock {
  id: string;
  type: 'architecture' | 'flow';
  raw: string;           // original Mermaid source text
  startLine: number;     // line number in .md file where ```mermaid starts
  endLine: number;       // line number where ``` ends
}

export interface ParsedSpec {
  filePath: string;
  frontmatter: SpecFrontmatter;
  content: string;        // full markdown content
  mermaidBlocks: MermaidBlock[];
  htmlContent: string;    // rendered markdown (without mermaid blocks)
}

export interface DiagramData {
  specId: string;
  blockId: string;
  nodes: Node[];
  edges: Edge[];
  mermaidSource: string;
}

export interface SpecFile {
  name: string;
  path: string;
  frontmatter: SpecFrontmatter;
}
