import { describe, expect, it } from 'vitest';
import { Assert } from '@/utils/assert';
import { createEdgeElements, createNodeElements } from '../create';
import type { ExcalidrawElement } from '../types';

function makeNode(
  id: string,
  x: number,
  y: number,
  width = 100,
  height = 50,
): ExcalidrawElement {
  return {
    id,
    type: 'rectangle',
    x,
    y,
    width,
    height,
    boundElements: [],
  };
}

describe('createNodeElements', () => {
  it('creates shape and text elements', () => {
    const elements = createNodeElements({ label: 'Test' });

    expect(elements).toHaveLength(2);
    expect(elements[0].type).toBe('rectangle');
    expect(elements[1].type).toBe('text');
    expect(elements[1].text).toBe('Test');
  });

  it('uses specified shape', () => {
    const elements = createNodeElements({ label: 'Test', shape: 'ellipse' });

    expect(elements[0].type).toBe('ellipse');
  });

  it('uses specified position', () => {
    const elements = createNodeElements({ label: 'Test', x: 200, y: 300 });

    expect(elements[0].x).toBe(200);
    expect(elements[0].y).toBe(300);
  });

  it('uses explicit dimensions', () => {
    const elements = createNodeElements({
      label: 'Test',
      width: 150,
      height: 80,
    });

    expect(elements[0].width).toBe(150);
    expect(elements[0].height).toBe(80);
  });

  it('applies color preset', () => {
    const elements = createNodeElements({ label: 'Test', color: 'light-red' });

    expect(elements[0].backgroundColor).toBe('#f8cecc');
    expect(elements[0].strokeColor).toBe('#b85450');
  });

  it('sets link on shape element', () => {
    const elements = createNodeElements({
      label: 'Test',
      link: 'https://example.com',
    });

    expect(elements[0].link).toBe('https://example.com');
  });

  it('binds text to shape', () => {
    const elements = createNodeElements({ label: 'Test' });
    const [shape, text] = elements;

    expect(shape.boundElements).toContainEqual({ id: text.id, type: 'text' });
    expect(text.containerId).toBe(shape.id);
  });
});

describe('createEdgeElements', () => {
  it('creates arrow between nodes', () => {
    const from = makeNode('from-id', 0, 0);
    const to = makeNode('to-id', 200, 0);
    const elements = [from, to];

    const result = createEdgeElements(
      { fromNodeId: 'from-id', toNodeId: 'to-id' },
      elements,
    );

    Assert.is(result.ok, true);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0].type).toBe('arrow');
    expect(result.elements[0].startBinding).toEqual({
      elementId: 'from-id',
      focus: 0,
      gap: 4,
    });
    expect(result.elements[0].endBinding).toEqual({
      elementId: 'to-id',
      focus: 0,
      gap: 4,
    });
  });

  it('creates arrow with label', () => {
    const from = makeNode('from-id', 0, 0);
    const to = makeNode('to-id', 200, 0);
    const elements = [from, to];

    const result = createEdgeElements(
      { fromNodeId: 'from-id', toNodeId: 'to-id', label: 'connects' },
      elements,
    );

    Assert.is(result.ok, true);
    expect(result.elements).toHaveLength(2);
    expect(result.elements[1].type).toBe('text');
    expect(result.elements[1].text).toBe('connects');
  });

  it('applies dashed style', () => {
    const from = makeNode('from-id', 0, 0);
    const to = makeNode('to-id', 200, 0);
    const elements = [from, to];

    const result = createEdgeElements(
      { fromNodeId: 'from-id', toNodeId: 'to-id', style: 'dashed' },
      elements,
    );

    Assert.is(result.ok, true);
    expect(result.elements[0].strokeStyle).toBe('dashed');
  });

  it('returns error when source node not found', () => {
    const to = makeNode('to-id', 200, 0);

    const result = createEdgeElements(
      { fromNodeId: 'missing', toNodeId: 'to-id' },
      [to],
    );

    expect(result).toEqual({
      ok: false,
      error: 'Cannot create edge: node not found (from: missing, to: to-id)',
    });
  });

  it('returns error when target node not found', () => {
    const from = makeNode('from-id', 0, 0);

    const result = createEdgeElements(
      { fromNodeId: 'from-id', toNodeId: 'missing' },
      [from],
    );

    expect(result).toEqual({
      ok: false,
      error: 'Cannot create edge: node not found (from: from-id, to: missing)',
    });
  });

  it('updates boundElements on source and target nodes', () => {
    const from = makeNode('from-id', 0, 0);
    const to = makeNode('to-id', 200, 0);
    const elements = [from, to];

    const result = createEdgeElements(
      { fromNodeId: 'from-id', toNodeId: 'to-id' },
      elements,
    );

    Assert.is(result.ok, true);
    expect(from.boundElements).toContainEqual({
      id: result.elements[0].id,
      type: 'arrow',
    });
    expect(to.boundElements).toContainEqual({
      id: result.elements[0].id,
      type: 'arrow',
    });
  });
});
