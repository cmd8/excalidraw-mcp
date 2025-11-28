import { describe, it, expect } from 'vitest';
import { emojiForColorAndShape } from './emoji';

describe('emojiForColorAndShape', () => {
  it('returns correct emoji for each color family', () => {
    expect(emojiForColorAndShape('#ff0000', 'rectangle')).toBe('🟥');
    expect(emojiForColorAndShape('#ff8000', 'rectangle')).toBe('🟧');
    expect(emojiForColorAndShape('#ffff00', 'rectangle')).toBe('🟨');
    expect(emojiForColorAndShape('#00ff00', 'rectangle')).toBe('🟩');
    expect(emojiForColorAndShape('#0000ff', 'rectangle')).toBe('🟦');
    expect(emojiForColorAndShape('#8000ff', 'rectangle')).toBe('🟪');
  });

  it('returns dark emoji for low lightness gray', () => {
    expect(emojiForColorAndShape('#222222', 'rectangle')).toBe('⬛');
    expect(emojiForColorAndShape('#222222', 'ellipse')).toBe('⚫');
  });

  it('returns light emoji for high lightness gray', () => {
    expect(emojiForColorAndShape('#dddddd', 'rectangle')).toBe('⬜');
    expect(emojiForColorAndShape('#dddddd', 'ellipse')).toBe('⚪');
  });

  it('returns null for non-hex input', () => {
    expect(emojiForColorAndShape('transparent', 'rectangle')).toBeNull();
  });

  it('returns null when no emoji exists for combination', () => {
    expect(emojiForColorAndShape('#ffff00', 'diamond')).toBeNull();
  });
});
