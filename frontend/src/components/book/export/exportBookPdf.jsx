import { PAGE_HEIGHT, PAGE_WIDTH } from './PrintBook';
import renderPrintBook, { bookFileName } from './renderPrintBook';

/**
 * Renders the story's book off-screen and saves it as a PDF, one book page
 * per PDF page (cover, every page, back cover). jsPDF and html2canvas are
 * loaded on demand so they don't weigh down the app's first load.
 */
export default async function exportBookPdf(story, { shareUrl } = {}) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);

  return renderPrintBook(story, { shareUrl }, async (host) => {
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

    pdf.save(bookFileName(story, 'pdf'));
    return pages.length;
  });
}
