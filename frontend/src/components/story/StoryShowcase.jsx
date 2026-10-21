import { Pagination, Spin } from 'antd';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { FaGoogleDrive, FaHeart, FaRegHeart } from "react-icons/fa";
import { GrMapLocation } from "react-icons/gr";
import { MdOutlineDateRange, MdUpdate } from "react-icons/md";
import { STORIES_PER_PAGE, useStoryStore } from '../../store/useStoryStore';
import { useUIStore } from '../../store/useUIStore';
import { storyPhotoUrl as coverPhotoUrl } from '../../utils/storyImage';
import BooksShowcase from '../three/BooksShowcase';

// Cover colours, cycled per story so neighbouring books look different.
const PALETTES = [
  { bg: '#0f4c5c', edge: '#e9e1cc' },
  { bg: '#7a2e3a', edge: '#efe4cf' },
  { bg: '#2d4a2b', edge: '#ebe3cf' },
  { bg: '#3b2f63', edge: '#ece6d6' },
  { bg: '#9a5b1f', edge: '#f1e6cf' },
];


function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function wrapLines(x, text, maxW) {
  const lines = [];
  let line = '';
  text.split(' ').forEach((word) => {
    const test = line ? line + ' ' + word : word;
    if (x.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else line = test;
  });
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

// Front cover: the story photo (cover-fit) under a dark fade, or a flat
// colour when there is no photo, with the title and date set over it.
function makeFrontPainter(story, img, bg) {
  return (x, w, h) => {
    x.fillStyle = bg;
    x.fillRect(0, 0, w, h);
    if (img) {
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale,
        dh = img.height * scale;
      x.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const g = x.createLinearGradient(0, h * 0.35, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.78)');
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
    } else {
      x.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 60; i++) x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    x.fillStyle = '#ffffff';
    x.textAlign = 'center';
    x.font = '700 82px Georgia';
    const lines = wrapLines(x, story.title, w * 0.78);
    const startY = img ? h * 0.72 - (lines.length - 1) * 92 : h * 0.42 - ((lines.length - 1) * 92) / 2;
    lines.forEach((l, i) => x.fillText(l, w / 2, startY + i * 92));
    x.globalAlpha = 0.85;
    x.font = 'italic 40px Georgia';
    x.fillText(moment(story.visitedDate).format('MMMM YYYY'), w / 2, startY + lines.length * 92 + 30);
    x.globalAlpha = 1;
    x.strokeStyle = 'rgba(255,255,255,0.4)';
    x.lineWidth = 3;
    x.strokeRect(60, 60, w - 120, h - 120);
  };
}

function toBook(story, index, img) {
  const palette = PALETTES[index % PALETTES.length];
  const locations = story.visitedLocation || [];
  return {
    id: story._id,
    title: story.title,
    author: locations.slice(0, 2).join(' · ') || 'Travel Story',
    year: moment(story.visitedDate).format('YYYY'),
    desc: story.story,
    // the book's first page lists the places visited
    chapters: locations.length ? locations : undefined,
    edge: palette.edge,
    spineBg: palette.bg,
    backBg: palette.bg,
    front: makeFrontPainter(story, img, palette.bg),
  };
}

const StoryShowcase = () => {
  const stories = useStoryStore((s) => s.stories);
  const page = useStoryStore((s) => s.page);
  const setPage = useStoryStore((s) => s.setPage);
  const toggleFavourite = useStoryStore((s) => s.toggleFavourite);
  const openViewStory = useUIStore((s) => s.openViewStory);
  const openEditStory = useUIStore((s) => s.openEditStory);

  const pageStories = useMemo(
    () => stories.slice((page - 1) * STORIES_PER_PAGE, page * STORIES_PER_PAGE),
    [stories, page],
  );

  // The 3D scene is rebuilt whenever `books` changes, so key it on the fields
  // that show up on a book. Toggling a favourite must not rebuild it.
  const signature = pageStories
    .map((s) => [s._id, s.title, s.imageUrl, s.visitedDate, s.story, (s.visitedLocation || []).join(',')].join('|'))
    .join('\n');

  // Cover photos are drawn onto canvases, so they must finish loading before
  // the books are built; until then show a spinner instead of plain covers.
  const [covers, setCovers] = useState({ signature: null, images: [] });
  useEffect(() => {
    let cancelled = false;
    Promise.all(pageStories.map((s) => (coverPhotoUrl(s) ? loadImage(coverPhotoUrl(s)) : null))).then((images) => {
      if (!cancelled) setCovers({ signature, images });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const coversReady = covers.signature === signature;
  const books = useMemo(
    () => (coversReady ? pageStories.map((s, i) => toBook(s, i, covers.images[i])) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coversReady, covers],
  );

  // detail panel reads the live story so favourite changes show immediately
  const storyFor = (cfg) => stories.find((s) => s._id === cfg.id);

  const renderDetailMeta = (cfg) => {
    const story = storyFor(cfg);
    if (!story) return null;
    return (
      <>
        <span className='inline-flex items-center gap-2 text-[15px] italic text-[#98a4d6]'>
          <MdOutlineDateRange className='text-lg' />
          {moment(story.visitedDate).format('Do MMM YYYY')}
        </span>
        <div className='h-6 w-px bg-[rgba(201,208,238,0.28)]' />
        <span className='inline-flex items-center gap-2 text-[15px] text-[var(--bs-lav)]'>
          <GrMapLocation className='text-sm' />
          {(story.visitedLocation || []).join(', ')}
        </span>
      </>
    );
  };

  const actionBtn =
    'inline-flex h-[50px] items-center gap-[10px] rounded-full px-[22px] text-[15px] font-semibold transition-[transform,filter] duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.04] hover:brightness-105';

  const renderDetailActions = (cfg) => {
    const story = storyFor(cfg);
    if (!story) return null;
    return (
      <>
        <button className={`${actionBtn} bg-[var(--bs-cream)] text-[var(--bs-navy)]`} onClick={() => openViewStory(story)}>
          Read Story
        </button>
        <button className={`${actionBtn} bg-[var(--bs-peri)] text-[#10152c]`} onClick={() => openEditStory(story)}>
          <MdUpdate className='text-lg' />
          Edit
        </button>
        {story.driveLink && (
          <a
            href={story.driveLink}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Open trip photos on Google Drive'
            title='Open trip photos on Google Drive'
            className={`${actionBtn} w-[50px] justify-center !px-0 bg-[#242c50] text-[#4ade80]`}
          >
            <FaGoogleDrive className='text-lg' />
          </a>
        )}
        <button
          aria-label={story.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          className={`${actionBtn} w-[50px] justify-center !px-0 bg-[#242c50] text-[var(--bs-pink)]`}
          onClick={() => toggleFavourite(story)}
        >
          {story.isFavourite ? <FaHeart className='text-lg' /> : <FaRegHeart className='text-lg' />}
        </button>
      </>
    );
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='relative h-[72vh] min-h-[560px] overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/20'>
        {coversReady ? (
          <BooksShowcase
            books={books}
            heroTitle='Stories'
            navTitle={`Your Travel Stories · page ${page}`}
            themeColors={{
              bgLight: 'rgba(250,250,250,0.55)',
              bgDark: 'rgba(250,250,250,0.55)',
              foregroundDark: '#18181b',
            }}
            renderDetailMeta={renderDetailMeta}
            renderDetailActions={renderDetailActions}
          />
        ) : (
          <div className='flex h-full items-center justify-center bg-white/50'>
            <Spin size='large' />
          </div>
        )}
      </div>
      {stories.length > STORIES_PER_PAGE && (
        <div className='flex justify-center'>
          <div className='rounded-full bg-white/90 px-4 py-2 shadow'>
            <Pagination
              current={page}
              pageSize={STORIES_PER_PAGE}
              total={stories.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryShowcase;
