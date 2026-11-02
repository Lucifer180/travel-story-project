import { useEffect, useRef, useState } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { IoMdShare } from 'react-icons/io';
import { MdCode, MdContentCopy, MdMoreHoriz } from 'react-icons/md';
import { toast } from 'react-toastify';
import { cn } from '../../../lib/utils';
import { storyPhotoUrl } from '../../../utils/storyImage';
import exportBookHtml from './exportBookHtml';

// The phone/tablet share sheet; desktop browsers' sheets rarely list the
// social apps, so the web composers are used there instead.
const canNativeShare = () =>
  typeof navigator.share === 'function' && window.matchMedia?.('(pointer: coarse)').matches;

const shareText = (story) => `${story.title} · a travel story`;

const COMPOSERS = {
  whatsapp: (story, url) => `https://wa.me/?text=${encodeURIComponent(`${shareText(story)} ${url}`)}`,
  facebook: (_, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  linkedin: (_, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
};

// The cover photo as a file for the share sheet, if the browser can share it.
async function coverFile(story) {
  const photo = storyPhotoUrl(story);
  if (!photo || typeof navigator.canShare !== 'function') return null;
  try {
    const blob = await (await fetch(photo, { mode: 'cors' })).blob();
    const file = new File([blob], `cover.${(blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')}`, { type: blob.type });
    return navigator.canShare({ files: [file] }) ? file : null;
  } catch {
    return null;
  }
}

// The Clipboard API, falling back to a hidden textarea where it's blocked.
async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text, readOnly: true });
    Object.assign(area.style, { position: 'fixed', opacity: '0' });
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  }
}

const copyLink = async (url, message) => {
  if (await writeClipboard(url)) toast.success(message);
  else toast.error(`Couldn't copy the link: ${url}`);
};

const MenuItem = ({ icon, children, onClick }) => (
  <button
    type='button'
    role='menuitem'
    onClick={onClick}
    className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-cyan-50 hover:text-primary'
  >
    {icon}
    {children}
  </button>
);

/**
 * Share menu for a story's book: download it as an offline HTML file, copy
 * its public link, or post the link to WhatsApp, Facebook, LinkedIn or
 * Instagram. `shareUrl` is the public link if there is one; `ensureShareUrl`
 * (owner view) creates it on first use and resolves to it.
 */
const ShareBookMenu = ({ story, shareUrl, ensureShareUrl, className }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const getUrl = async () => shareUrl || (ensureShareUrl ? await ensureShareUrl() : null);

  const run = (action) => async () => {
    setOpen(false);
    try {
      await action();
    } catch (error) {
      if (error?.name === 'AbortError') return; // share sheet dismissed
      console.error('Share failed:', error);
      toast.error("Couldn't share the story. Please try again.");
    }
  };

  const downloadHtml = run(async () => {
    setBusy(true);
    try {
      await exportBookHtml(story, { shareUrl });
    } finally {
      setBusy(false);
    }
  });

  // The tab is opened straight away, before the link is ready, so the
  // browser doesn't treat it as an unrequested popup.
  const openComposer = (network) =>
    run(async () => {
      const tab = shareUrl ? null : window.open('', '_blank');
      try {
        const url = await getUrl();
        const composer = COMPOSERS[network](story, url);
        if (tab) {
          tab.opener = null;
          tab.location.href = composer;
        } else {
          window.open(composer, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        tab?.close();
        throw error;
      }
    });

  const shareInstagram = run(async () => {
    const url = await getUrl();
    if (canNativeShare()) {
      const file = await coverFile(story);
      const data = { title: story.title, text: shareText(story), url };
      try {
        await navigator.share(file ? { ...data, files: [file] } : data);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        // Not allowed (e.g. the tap expired while preparing): copy instead.
      }
    }
    await copyLink(url, 'Link copied. Paste it into your Instagram post, story or bio.');
  });

  const shareNative = run(async () => {
    const url = await getUrl();
    await navigator.share({ title: story.title, text: shareText(story), url });
  });

  const copy = run(async () => copyLink(await getUrl(), 'Share link copied to clipboard'));

  return (
    <div ref={menuRef} className='relative'>
      <button
        type='button'
        className={cn('btn-small', className)}
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-haspopup='menu'
        aria-expanded={open}
        title='Share this story or download it as a web page'
      >
        <IoMdShare className='text-lg' />
        {busy ? 'PREPARING HTML…' : 'SHARE'}
      </button>
      {open && (
        <div
          role='menu'
          className='absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-cyan-100 bg-white py-1 shadow-lg shadow-cyan-200/40'
        >
          <MenuItem icon={<MdCode className='text-base' />} onClick={downloadHtml}>
            Download as HTML
          </MenuItem>
          <MenuItem icon={<MdContentCopy className='text-base' />} onClick={copy}>
            Copy link
          </MenuItem>
          <div className='my-1 border-t border-slate-100' />
          <MenuItem icon={<FaWhatsapp className='text-base text-[#25D366]' />} onClick={openComposer('whatsapp')}>
            WhatsApp
          </MenuItem>
          <MenuItem icon={<FaFacebook className='text-base text-[#1877F2]' />} onClick={openComposer('facebook')}>
            Facebook
          </MenuItem>
          <MenuItem icon={<FaLinkedin className='text-base text-[#0A66C2]' />} onClick={openComposer('linkedin')}>
            LinkedIn
          </MenuItem>
          <MenuItem icon={<FaInstagram className='text-base text-[#E4405F]' />} onClick={shareInstagram}>
            Instagram
          </MenuItem>
          {canNativeShare() && (
            <MenuItem icon={<MdMoreHoriz className='text-base' />} onClick={shareNative}>
              More apps…
            </MenuItem>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareBookMenu;
