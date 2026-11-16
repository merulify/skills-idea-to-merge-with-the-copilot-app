import { describe, expect, it } from 'vitest';
import { formatBookmarkEntry, normalizeBookmarkUrl, parseStoredBookmarks } from './bookmark-helpers';

describe('normalizeBookmarkUrl', () => {
  it('normalizes URLs with and without https:// to the same saved value', () => {
    const withScheme = normalizeBookmarkUrl('https://www.example.com/docs');
    const withoutScheme = normalizeBookmarkUrl('www.example.com/docs');

    expect(withScheme).toBe('https://www.example.com/docs');
    expect(withoutScheme).toBe(withScheme);
  });
});

describe('parseStoredBookmarks', () => {
  it('recovers from empty, corrupted, legacy, and non-array values without throwing', () => {
    const values: Array<string | null> = [
      null,
      '',
      '{broken-json',
      '{"url":"https://www.example.com","slug":"mona-7fk2"}',
      '"legacy-string-value"'
    ];

    for (const value of values) {
      expect(() => parseStoredBookmarks(value)).not.toThrow();
      expect(parseStoredBookmarks(value)).toEqual([]);
    }
  });
});

describe('formatBookmarkEntry', () => {
  it('formats a bookmark as "<url> :: <slug>" with the exact separator', () => {
    expect(formatBookmarkEntry({ url: 'https://www.example.com/', slug: 'mona-7fk2' })).toBe(
      'https://www.example.com/ :: mona-7fk2'
    );
  });
});
