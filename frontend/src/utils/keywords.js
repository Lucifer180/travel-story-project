// Splits a search query into keywords. Words are separated by spaces or
// commas; "quoted phrases" stay together so a place like "Namche Bazaar"
// is one keyword. Kept in sync with splitKeywords in the backend.
export const splitKeywords = (query) => {
  const found = [];
  for (const m of String(query ?? '').matchAll(/"([^"]+)"|[^\s,"]+/g)) {
    const keyword = (m[1] ?? m[0]).trim();
    if (keyword && !found.some((k) => k.toLowerCase() === keyword.toLowerCase())) found.push(keyword);
  }
  return found;
};

// Inverse of splitKeywords: quotes multi-word keywords.
export const joinKeywords = (keywords) =>
  keywords.map((k) => (/\s/.test(k) ? `"${k}"` : k)).join(' ');
