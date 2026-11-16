export const BOOKMARKS_STORAGE_KEY = 'mona-bookmarks';

export type Bookmark = {
  url: string;
  slug: string;
  title?: string;
};

const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const URL_SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const BOOKMARK_SLUG_PATTERN = /^mona-[0-9A-Za-z]{4}$/;

export function normalizeBookmarkUrl(rawInput: string): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = URL_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate).toString();
  } catch {
    return null;
  }
}

export function normalizeBookmarkTitle(rawInput: string | null | undefined): string | undefined {
  if (typeof rawInput !== 'string') {
    return undefined;
  }

  const trimmed = rawInput.trim();
  return trimmed ? trimmed : undefined;
}

function isBookmarkRecord(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Bookmark>;
  return (
    typeof candidate.url === 'string' &&
    typeof candidate.slug === 'string' &&
    candidate.slug.length > 0 &&
    BOOKMARK_SLUG_PATTERN.test(candidate.slug) &&
    (typeof candidate.title === 'undefined' || typeof candidate.title === 'string')
  );
}

export function parseStoredBookmarks(storedValue: string | null): Bookmark[] {
  if (typeof storedValue !== 'string' || storedValue.trim() === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const bookmarks: Bookmark[] = [];
    for (const entry of parsed) {
      if (!isBookmarkRecord(entry)) {
        continue;
      }

      const normalizedUrl = normalizeBookmarkUrl(entry.url);
      if (!normalizedUrl) {
        continue;
      }

      const normalizedTitle = normalizeBookmarkTitle(entry.title);
      bookmarks.push({
        url: normalizedUrl,
        slug: entry.slug,
        ...(normalizedTitle ? { title: normalizedTitle } : {})
      });
    }
    return bookmarks;
  } catch {
    return [];
  }
}

export function formatBookmarkEntry(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function updateBookmarkUrl(
  bookmarks: Bookmark[],
  slug: string,
  nextUrl: string,
  nextTitle?: string | null
): Bookmark[] {
  const normalizedUrl = normalizeBookmarkUrl(nextUrl);
  if (!normalizedUrl) {
    return bookmarks;
  }

  const normalizedTitle = normalizeBookmarkTitle(nextTitle);
  const hasTitleUpdate = arguments.length >= 4;

  return bookmarks.map((bookmark) =>
    bookmark.slug === slug
      ? {
          ...bookmark,
          url: normalizedUrl,
          ...(hasTitleUpdate ? { title: normalizedTitle } : {})
        }
      : bookmark
  );
}

export function updateBookmark(
  bookmarks: Bookmark[],
  slug: string,
  nextUrl: string,
  nextTitle?: string | null
): Bookmark[] {
  return updateBookmarkUrl(bookmarks, slug, nextUrl, nextTitle);
}

function encodeBase62(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return BASE62_ALPHABET[0];
  }

  let remaining = Math.floor(value);
  let encoded = '';
  while (remaining > 0) {
    encoded = BASE62_ALPHABET[remaining % 62] + encoded;
    remaining = Math.floor(remaining / 62);
  }
  return encoded;
}

export function createBookmarkSlug(random = Math.random, now = Date.now): string {
  const randomBlock = Math.floor(random() * 62 ** 4);
  const timeBlock = now() % 62 ** 2;
  const combined = timeBlock * 62 ** 4 + randomBlock;
  const token = encodeBase62(combined).padStart(4, '0').slice(-4);
  return `mona-${token}`;
}
