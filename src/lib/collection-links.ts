// Maps a Collection's admin-editable `name` to its dedicated landing page,
// where one exists. Deliberately a small hardcoded map rather than driving
// this off Collection.slug (that column is stale/unused — see
// collections/moodmax and collections/naturesphere's own page.tsx — and
// deriving from the live name via slugify() would produce "moodmax-collection"
// and "naturesphere-s", not the clean URLs these pages actually live at).
// A collection with no landing page yet (e.g. "Studio Editions", which has
// no products) simply has no entry — callers treat that as "no link".
const COLLECTION_LANDING_PAGES: Record<string, string> = {
  "MoodMAX Collection": "/collections/moodmax",
  "NatureSPHERE's": "/collections/naturesphere",
};

export function collectionHref(collectionName: string): string | null {
  return COLLECTION_LANDING_PAGES[collectionName] ?? null;
}
