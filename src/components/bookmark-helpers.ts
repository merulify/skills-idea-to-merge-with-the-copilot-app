export const BOOKMARKS_STORAGE_KEY = 'mona-bookmarks';

export type Bookmark = {
  url: string;
  slug: string;
};

const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const URL_SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

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

function isBookmarkRecord(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Bookmark>;
  return typeof candidate.url === 'string' && typeof candidate.slug === 'string';
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

    return parsed
      .filter((entry): entry is Bookmark => isBookmarkRecord(entry))
      .map((entry) => ({ url: entry.url, slug: entry.slug }));
  } catch {
    return [];
  }
}

export function formatBookmarkEntry(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
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
