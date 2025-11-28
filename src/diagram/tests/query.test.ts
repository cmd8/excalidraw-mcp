import { describe, expect, it } from 'vitest';
import {
  calculateNextPosition,
  resolveNode,
  resolveNodeByRole,
} from '../query';
import type { ExcalidrawElement } from '../types';

function makeNode(
  id: string,
  x: number,
  y: number,
  width = 100,
  height = 50,
): ExcalidrawElement {
  return { id, type: 'rectangle', x, y, width, height };
}

function makeTextLabel(
  id: string,
  containerId: string,
  text: string,
): ExcalidrawElement {
  return {
    id,
    type: 'text',
    text,
    containerId,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
}

describe('resolveNode', () => {
  it('resolves by ID', () => {
    const node = makeNode('node-1', 0, 0);
    const elements = [node];

    const result = resolveNode(elements, 'node-1');

    expect(result).toEqual({ ok: true, node });
  });

  it('resolves by label', () => {
    const node = makeNode('node-1', 0, 0);
    const label = makeTextLabel('text-1', 'node-1', 'My Node');
    const elements = [node, label];

    const result = resolveNode(elements, 'My Node');

    expect(result).toEqual({ ok: true, node });
  });

  it('returns error with options when label is ambiguous', () => {
    const node1 = makeNode('node-1', 0, 0);
    const node2 = makeNode('node-2', 0, 100);
    const label1 = makeTextLabel('text-1', 'node-1', 'Button');
    const label2 = makeTextLabel('text-2', 'node-2', 'Button');
    const elements = [node1, node2, label1, label2];

    const result = resolveNode(elements, 'Button');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Multiple nodes found');
      expect(result.error).toContain('node-1');
      expect(result.error).toContain('node-2');
    }
  });

  it('returns error when not found', () => {
    const result = resolveNode([], 'missing');

    expect(result).toEqual({
      ok: false,
      error: 'Error: Could not find node "missing"',
    });
  });
});

describe('resolveNodeByRole', () => {
  it('returns error with role when not found', () => {
    const result = resolveNodeByRole([], 'missing', 'target');

    expect(result).toEqual({
      ok: false,
      error: 'Error: Could not find target node "missing"',
    });
  });
});

describe('calculateNextPosition', () => {
  it('returns default position for empty elements', () => {
    const result = calculateNextPosition([]);

    expect(result).toEqual({ x: 100, y: 100 });
  });

  it('positions below the lowest node', () => {
    const elements = [
      makeNode('node-1', 200, 100, 100, 50),
      makeNode('node-2', 300, 300, 100, 80),
    ];

    const result = calculateNextPosition(elements);

    expect(result).toEqual({ x: 300, y: 430 });
  });
});
