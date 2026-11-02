import { createRoot } from 'react-dom/client';
import PrintBook from './PrintBook';

const READY_TIMEOUT_MS = 15000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Everything a page needs before it can be captured: photos decoded, map
// places looked up, and map tiles loaded.
function isReady(host) {
  const imagesDone = [...host.querySelectorAll('img')].every((img) => img.complete);
  const maps = [...host.querySelectorAll('[data-map-ready]')];
  const mapsDone = maps.every((map) => {
    if (map.dataset.mapReady !== 'true') return false;
    const tiles = map.querySelectorAll('.leaflet-tile');
    return tiles.length > 0 && [...tiles].every((t) => t.classList.contains('leaflet-tile-loaded') || t.complete);
  });
  return imagesDone && mapsDone;
}

async function waitUntilReady(host) {
  const started = Date.now();
  await sleep(500); // first render + the map's fit-to-places pass
  while (!isReady(host) && Date.now() - started < READY_TIMEOUT_MS) {
    await sleep(250);
  }
  await document.fonts?.ready;
  await sleep(400); // let tiles from the final zoom settle
}

export const bookFileName = (story, extension) =>
  `${(story.title || 'travel-story')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.${extension}`;

/**
 * Renders the story's flat PrintBook off-screen, waits until its photos and
 * map are loaded, then hands the host element to `capture`. Used by the PDF
 * and HTML exports; the host is removed afterwards.
 */
export default async function renderPrintBook(story, { shareUrl } = {}, capture) {
  const host = document.createElement('div');
  Object.assign(host.style, { position: 'fixed', left: '-10000px', top: '0', pointerEvents: 'none' });
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    root.render(<PrintBook story={story} shareUrl={shareUrl} />);
    await waitUntilReady(host);
    return await capture(host);
  } finally {
    root.unmount();
    host.remove();
  }
}
