import yaml from 'js-yaml';
import type { ParsedSpec, SpecFrontmatter, MermaidBlock } from '../types/spec';

function parseFrontmatter(content: string): { data: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: content };
  }
  const data = yaml.load(match[1]) as Record<string, unknown>;
  return { data: data ?? {}, body: match[2] };
}

export function parseSpecFile(filePath: string, content: string): ParsedSpec {
  const { data, body } = parseFrontmatter(content);
  const frontmatter = data as unknown as SpecFrontmatter;
  const mermaidBlocks = extractMermaidBlocks(body, frontmatter);

  return {
    filePath,
    frontmatter,
    content,
    mermaidBlocks,
    htmlContent: body,
  };
}

function extractMermaidBlocks(
  body: string,
  frontmatter: SpecFrontmatter
): MermaidBlock[] {
  const lines = body.split('\n');
  const blocks: MermaidBlock[] = [];
  let inMermaid = false;
  let startLine = 0;
  let mermaidLines: string[] = [];
  let blockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (trimmed === '```mermaid') {
      inMermaid = true;
      startLine = i;
      mermaidLines = [];
    } else if (inMermaid && trimmed === '```') {
      const diagramMeta = frontmatter.diagrams?.[blockIndex];
      blocks.push({
        id: diagramMeta?.id ?? `diagram-${blockIndex}`,
        type: diagramMeta?.type ?? 'architecture',
        raw: mermaidLines.join('\n'),
        startLine,
        endLine: i,
      });
      inMermaid = false;
      blockIndex++;
    } else if (inMermaid) {
      mermaidLines.push(lines[i]);
    }
  }

  return blocks;
}

export function replaceMermaidBlock(
  content: string,
  block: MermaidBlock,
  newMermaidSource: string
): string {
  const allLines = content.split('\n');
  const result: string[] = [];
  let inMermaid = false;
  let currentBlock = 0;
  let targetBlockIndex = -1;

  // Find which block index this block corresponds to
  for (let i = 0; i < allLines.length; i++) {
    const trimmed = allLines[i].trim();
    if (trimmed === '```mermaid') {
      if (block.raw === extractRawFromLines(allLines, i)) {
        targetBlockIndex = currentBlock;
      }
      currentBlock++;
    }
  }

  // Now rebuild the content, replacing the target block
  currentBlock = 0;
  for (let i = 0; i < allLines.length; i++) {
    const trimmed = allLines[i].trim();

    if (trimmed === '```mermaid') {
      if (currentBlock === targetBlockIndex) {
        result.push('```mermaid');
        result.push(newMermaidSource);
        inMermaid = true;
        currentBlock++;
        continue;
      }
      currentBlock++;
    }

    if (inMermaid) {
      if (trimmed === '```') {
        result.push('```');
        inMermaid = false;
      }
      // Skip old mermaid lines
      continue;
    }

    result.push(allLines[i]);
  }

  return result.join('\n');
}

function extractRawFromLines(lines: string[], mermaidStartLine: number): string {
  const rawLines: string[] = [];
  for (let i = mermaidStartLine + 1; i < lines.length; i++) {
    if (lines[i].trim() === '```') break;
    rawLines.push(lines[i]);
  }
  return rawLines.join('\n');
}
