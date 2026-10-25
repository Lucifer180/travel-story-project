import { createRoot } from 'react-dom/client';
import PrintBook, { PAGE_HEIGHT, PAGE_WIDTH } from './PrintBook';

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

const fileName = (story) =>
  `${(story.title || 'travel-story')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.pdf`;

/**
 * Renders the story's book off-screen and saves it as a PDF, one book page
 * per PDF page (cover, every page, back cover). jsPDF and html2canvas are
 * loaded on demand so they don't weigh down the app's first load.
 */
export default async function exportBookPdf(story, { shareUrl } = {}) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);

  const host = document.createElement('div');
  Object.assign(host.style, { position: 'fixed', left: '-10000px', top: '0', pointerEvents: 'none' });
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    root.render(<PrintBook story={story} shareUrl={shareUrl} />);
    await waitUntilReady(host);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [PAGE_WIDTH, PAGE_HEIGHT],
      hotfixes: ['px_scaling'],
      compress: true,
    });
    pdf.setProperties({ title: story.title, subject: 'Travel Story', creator: 'Travel Story' });

    const pages = [...host.querySelectorAll('[data-pdf-page]')];
    for (const [i, page] of pages.entries()) {
      const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: '#fdfbf7', logging: false });
      if (i > 0) pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'portrait');
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    }

    pdf.save(fileName(story));
    return pages.length;
  } finally {
    root.unmount();
    host.remove();
  }
}
