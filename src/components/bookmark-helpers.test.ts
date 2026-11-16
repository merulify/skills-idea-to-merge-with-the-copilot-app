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

  it('drops malformed entries and keeps only validated bookmarks', () => {
    const storedValue = JSON.stringify([
      { url: 'www.example.com', slug: 'mona-7fk2' },
      { url: 'not a url', slug: 'mona-1a2b' },
      { url: 'https://example.com', slug: 'invalid-slug' },
      { url: 123, slug: 'mona-0000' }
    ]);

    expect(parseStoredBookmarks(storedValue)).toEqual([{ url: 'https://www.example.com/', slug: 'mona-7fk2' }]);
  });
});

describe('formatBookmarkEntry', () => {
  it('formats a bookmark as "<url> :: <slug>" with the exact separator', () => {
    expect(formatBookmarkEntry({ url: 'https://www.example.com/', slug: 'mona-7fk2' })).toBe(
      'https://www.example.com/ :: mona-7fk2'
    );
  });
});
