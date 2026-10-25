import { useRef, useState } from 'react';
import { MdAddAPhoto, MdClose, MdContentCopy } from 'react-icons/md';
import { toast } from 'react-toastify';
import { cn } from '../../../lib/utils';

// Building blocks shared by the book's pages. Anything clickable carries
// data-no-flip (or is a link/button) so clicking it doesn't turn the page.

export const GALLERY_FRAMES = 6;

// Gallery with every frame present ("" = empty), so a photo keeps its frame.
export const galleryFrames = (story) =>
  Array.from({ length: GALLERY_FRAMES }, (_, i) => story.gallery?.[i] || '');

export const placeInitial = (name) => (name || '?').trim().charAt(0).toUpperCase();

export const Heading = ({ children, className = 'mb-5' }) => (
  <h3 className={cn('text-center text-xl font-medium tracking-tight text-neutral-800', className)}>{children}</h3>
);

const copyToClipboard = async (text, what) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied to clipboard`);
  } catch {
    toast.error(`Couldn't copy the ${what.toLowerCase()}`);
  }
};

// A link with a copy button; in print the full link is shown instead.
export const LinkCard = ({ icon, title, href, what, forPrint }) => (
  <div className='rounded-lg border border-neutral-200 bg-white/70 p-3 font-sans'>
    <div className='mb-2 flex items-center gap-2 text-[13px] font-medium text-neutral-800'>
      {icon}
      {title}
    </div>
    <div className='flex items-center gap-2'>
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className={cn(
          'min-w-0 flex-1 rounded bg-cyan-50 px-2 py-1.5 text-xs text-cyan-700 underline-offset-2 hover:underline',
          forPrint ? 'break-all' : 'truncate',
        )}
        title={href}
      >
        {href}
      </a>
      {!forPrint && (
        <button
          type='button'
          onClick={() => copyToClipboard(href, what)}
          className='flex shrink-0 items-center gap-1 rounded bg-neutral-100 px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200'
          aria-label={`Copy ${what.toLowerCase()}`}
        >
          <MdContentCopy /> Copy
        </button>
      )}
    </div>
  </div>
);

// A photo slot. Empty + editable shows an "add photo" prompt; filled +
// editable shows replace / remove controls on hover. Read-only and empty
// renders nothing.
export function PhotoFrame({ url, editable, onUpload, onRemove, className, emptyLabel = 'Add photo' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) run(() => onUpload(file));
  };

  if (!url && !editable) return null;

  return (
    <div data-no-flip className={cn('group relative overflow-hidden', className)}>
      {url ? (
        <img src={url} alt='' crossOrigin='anonymous' className='h-full w-full object-cover' />
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-neutral-300 font-sans text-[11px] text-neutral-400 transition-colors hover:border-cyan-400 hover:text-cyan-600'
        >
          <MdAddAPhoto className='text-xl' />
          {emptyLabel}
        </button>
      )}
      {url && editable && (
        <div className='absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100'>
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className='rounded bg-white/90 px-1.5 py-0.5 font-sans text-[10px] text-neutral-700'
          >
            Replace
          </button>
          <button
            type='button'
            aria-label='Remove photo'
            onClick={() => run(onRemove)}
            className='rounded bg-white/90 px-1 py-0.5 text-neutral-700'
          >
            <MdClose />
          </button>
        </div>
      )}
      {busy && (
        <div className='absolute inset-0 flex items-center justify-center bg-white/70 font-sans text-[11px] text-neutral-500'>
          Saving…
        </div>
      )}
      {editable && <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={pick} />}
    </div>
  );
}
