import { describe, expect, it } from 'vitest';
import { formatDiagramMarkdown } from '../format';
import type { Diagram, Node } from '../types';

function makeNode(id: string, label: string | null = null): Node {
  return {
    id,
    label,
    shape: 'rectangle',
    backgroundColor: null,
    emoji: null,
    link: null,
    groupIds: [],
    frameId: null,
  };
}

describe('formatDiagramMarkdown', () => {
  it('returns empty message for empty diagram', () => {
    const diagram: Diagram = { nodes: [], edges: [], frames: [] };

    expect(formatDiagramMarkdown(diagram)).toBe('No nodes or edges.');
  });

  it('renders edges with node labels', () => {
    const diagram: Diagram = {
      nodes: [makeNode('a', 'Start'), makeNode('b', 'End')],
      edges: [
        {
          id: 'e1',
          from: 'a',
          to: 'b',
          label: null,
          groupIds: [],
          frameId: null,
        },
      ],
      frames: [],
    };

    expect(formatDiagramMarkdown(diagram)).toContain('Start --> End');
  });

  it('renders edge labels', () => {
    const diagram: Diagram = {
      nodes: [makeNode('a', 'A'), makeNode('b', 'B')],
      edges: [
        {
          id: 'e1',
          from: 'a',
          to: 'b',
          label: 'calls',
          groupIds: [],
          frameId: null,
        },
      ],
      frames: [],
    };

    expect(formatDiagramMarkdown(diagram)).toContain('A --(calls)--> B');
  });

  it('renders standalone nodes not connected by edges', () => {
    const diagram: Diagram = {
      nodes: [makeNode('solo', 'Orphan')],
      edges: [],
      frames: [],
    };

    expect(formatDiagramMarkdown(diagram)).toContain('Orphan');
  });

  it('groups content by frame', () => {
    const diagram: Diagram = {
      nodes: [{ ...makeNode('n1', 'Inside'), frameId: 'f1' }],
      edges: [],
      frames: [{ id: 'f1', name: 'MyFrame' }],
    };

    expect(formatDiagramMarkdown(diagram)).toContain('## Frame: MyFrame');
  });

  it('renders node with link as markdown link', () => {
    const diagram: Diagram = {
      nodes: [{ ...makeNode('n1', 'Docs'), link: 'https://example.com' }],
      edges: [],
      frames: [],
    };

    expect(formatDiagramMarkdown(diagram)).toContain(
      '[Docs](https://example.com)',
    );
  });

  it('marks self-loop edges', () => {
    const diagram: Diagram = {
      nodes: [makeNode('a', 'Loop')],
      edges: [
        {
          id: 'e1',
          from: 'a',
          to: 'a',
          label: null,
          groupIds: [],
          frameId: null,
        },
      ],
      frames: [],
    };

    expect(formatDiagramMarkdown(diagram)).toContain(
      'Loop --> Loop (self-loop)',
    );
  });

  it('renders dangling edge with question mark', () => {
    const diagram: Diagram = {
      nodes: [makeNode('a', 'Start')],
      edges: [
        {
          id: 'e1',
          from: 'a',
          to: 'missing',
          label: null,
          groupIds: [],
          frameId: null,
        },
      ],
      frames: [],
    };

    expect(formatDiagramMarkdown(diagram)).toContain('Start --> ?');
  });

  it('prepends emoji to node label', () => {
    const diagram: Diagram = {
      nodes: [{ ...makeNode('n1', 'Server'), emoji: '🟦' }],
      edges: [],
      frames: [],
    };

    expect(formatDiagramMarkdown(diagram)).toContain('🟦 Server');
  });

  it('renders multiple groups within same frame', () => {
    const diagram: Diagram = {
      nodes: [
        { ...makeNode('a', 'A'), frameId: 'f1', groupIds: ['g1'] },
        { ...makeNode('b', 'B'), frameId: 'f1', groupIds: ['g2'] },
      ],
      edges: [],
      frames: [{ id: 'f1', name: 'MyFrame' }],
    };

    const result = formatDiagramMarkdown(diagram);
    expect(result).toContain('### Group g1');
    expect(result).toContain('### Group g2');
  });

  it('renders empty frame as section', () => {
    const diagram: Diagram = {
      nodes: [],
      edges: [],
      frames: [{ id: 'f1', name: 'EmptyFrame' }],
    };

    const result = formatDiagramMarkdown(diagram);
    expect(result).toContain('## Frame: EmptyFrame');
    expect(result).toContain('No nodes or edges.');
  });

  it('renders grouped node without frame under No Frame section', () => {
    const diagram: Diagram = {
      nodes: [{ ...makeNode('a', 'Grouped'), groupIds: ['g1'], frameId: null }],
      edges: [],
      frames: [],
    };

    const result = formatDiagramMarkdown(diagram);
    expect(result).toContain('## No Frame');
    expect(result).toContain('### Group g1');
    expect(result).toContain('Grouped');
  });
});
