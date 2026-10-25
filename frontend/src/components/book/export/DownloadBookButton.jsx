import { useState } from 'react';
import { MdDownload } from 'react-icons/md';
import { toast } from 'react-toastify';
import { cn } from '../../../lib/utils';
import exportBookPdf from './exportBookPdf';

// Saves the story's book as a PDF.
const DownloadBookButton = ({ story, shareUrl, className }) => {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      await exportBookPdf(story, { shareUrl });
    } catch (error) {
      console.error('Book PDF export failed:', error);
      toast.error("Couldn't create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type='button'
      className={cn('btn-small', className)}
      onClick={download}
      disabled={busy}
      title='Download this book as a PDF'
    >
      <MdDownload className='text-lg' />
      {busy ? 'PREPARING PDF…' : 'DOWNLOAD PDF'}
    </button>
  );
};

export default DownloadBookButton;
