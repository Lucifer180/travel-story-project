import renderPrintBook, { bookFileName } from './renderPrintBook';

const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// The image as a data URI, or its absolute URL if it can't be fetched
// (the file then needs a connection to show that one image).
async function inlineImage(src) {
  if (!src || src.startsWith('data:')) return src;
  try {
    const response = await fetch(src, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await blobToDataUrl(await response.blob());
  } catch {
    return new URL(src, window.location.href).href;
  }
}

// The app's CSS (Tailwind, Leaflet, …) as one stylesheet. @import rules go
// first, as CSS requires; a sheet we can't read is linked instead.
function collectCss() {
  const imports = [];
  const rules = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        (rule instanceof CSSImportRule ? imports : rules).push(rule.cssText);
      }
    } catch {
      if (sheet.href) imports.push(`@import url("${sheet.href}");`);
    }
  }
  return [...imports, ...rules].join('\n');
}

/**
 * Saves the story's book (cover, every page, back cover) as one
 * self-contained .html file: the CSS is inlined and photos and map tiles are
 * embedded as data URIs, so it opens offline.
 */
export default async function exportBookHtml(story, { shareUrl } = {}) {
  const html = await renderPrintBook(story, { shareUrl }, async (host) => {
    const book = host.firstElementChild.cloneNode(true);

    const cache = new Map();
    await Promise.all(
      [...book.querySelectorAll('img')].map(async (img) => {
        const src = img.getAttribute('src');
        if (!cache.has(src)) cache.set(src, inlineImage(src));
        img.setAttribute('src', await cache.get(src));
        img.removeAttribute('crossorigin');
      }),
    );

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(story.title)} · Travel Story</title>
<style>
${collectCss()}
body { margin: 0; background: #e2e8f0; }
.travel-story-book { display: flex; justify-content: center; padding: 24px 0; }
.travel-story-book .leaflet-container { background: #dbeafe; }
</style>
</head>
<body>
<main class="travel-story-book">${book.outerHTML}</main>
</body>
</html>
`;
  });

  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = bookFileName(story, 'html');
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
