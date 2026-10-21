import moment from 'moment';
import { FaGoogleDrive } from 'react-icons/fa';
import { GrMapLocation } from 'react-icons/gr';
import { MdContentCopy, MdOutlineDateRange } from 'react-icons/md';
import { toast } from 'react-toastify';
import { storyColor, storyPhotoUrl } from '../../utils/storyImage';
import InteractiveBook from './InteractiveBook';

// Characters of story text that fit on one page at the book's size.
const CHARS_PER_PAGE = 560;
const CHARS_FIRST_PAGE = 430; // the first story page also carries a heading

// Splits text into page-sized chunks on word boundaries, keeping paragraphs.
function paginate(text) {
  const chunks = [];
  let current = '';
  const limit = () => (chunks.length === 0 ? CHARS_FIRST_PAGE : CHARS_PER_PAGE);
  for (const word of (text || '').split(/(\s+)/)) {
    if (current.length + word.length > limit() && current.trim()) {
      chunks.push(current.trim());
      current = word.trimStart();
    } else {
      current += word;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [''];
}

const copy = async (text, what) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied to clipboard`);
  } catch {
    toast.error(`Couldn't copy the ${what.toLowerCase()}`);
  }
};

const Heading = ({ children }) => (
  <h3 className='mb-5 text-center text-xl font-medium tracking-tight text-neutral-800'>{children}</h3>
);

const LinkCard = ({ icon, title, href, onCopy, copyLabel }) => (
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
        className='min-w-0 flex-1 truncate rounded bg-cyan-50 px-2 py-1.5 text-xs text-cyan-700 underline-offset-2 hover:underline'
        title={href}
      >
        {href}
      </a>
      <button
        type='button'
        onClick={onCopy}
        className='flex shrink-0 items-center gap-1 rounded bg-neutral-100 px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200'
        aria-label={copyLabel}
      >
        <MdContentCopy /> Copy
      </button>
    </div>
  </div>
);

/**
 * A travel story as an interactive book:
 *   1 Index · 2 At a glance · 3.. The story · Places visited · Photos & links
 * `shareUrl` is the story's public link (if shared). `onAddDriveLink` shows an
 * "add a link" button on the links page when there's no Drive link yet.
 */
const StoryBook = ({ story, shareUrl, onAddDriveLink, width = 320, height = 450 }) => {
  if (!story) return null;
  const storyChunks = paginate(story.story);

  const photo = storyPhotoUrl(story);
  const locations = story.visitedLocation || [];
  const date = moment(story.visitedDate);

  // Pages in reading order; numbers are assigned from position.
  const faces = [];
  const add = (render) => {
    faces.push({ render });
    return faces.length; // printed page number
  };

  const contents = [];
  add(({ goToPage }) => (
    <>
      <Heading>Index</Heading>
      <ol className='space-y-3'>
        {contents.map((entry) => (
          <li key={entry.label}>
            <button
              type='button'
              onClick={() => goToPage(entry.page)}
              className='flex w-full items-baseline gap-2 text-left hover:text-cyan-700'
            >
              <span>{entry.label}</span>
              <span className='flex-1 translate-y-[-3px] border-b border-dotted border-neutral-300' />
              <span className='font-sans text-xs text-neutral-500'>{entry.page}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className='mt-8 text-center font-sans text-[11px] uppercase tracking-widest text-neutral-400'>
        Click an entry to jump there
      </p>
    </>
  ));

  contents.push({
    label: 'At a glance',
    page: add(() => (
      <div className='flex h-full flex-col'>
        <div
          className='mb-4 h-40 w-full shrink-0 rounded-md bg-cover bg-center shadow-inner'
          style={photo ? { backgroundImage: `url(${photo})` } : { background: storyColor(story) }}
        />
        <h3 className='mb-3 text-lg font-medium leading-snug text-neutral-800'>{story.title}</h3>
        <p className='mb-2 flex items-center gap-2 font-sans text-xs text-neutral-500'>
          <MdOutlineDateRange className='text-base' />
          {date.format('Do MMMM YYYY')} · {date.format('dddd')}
        </p>
        <p className='flex items-start gap-2 font-sans text-xs text-neutral-500'>
          <GrMapLocation className='mt-0.5 shrink-0 text-sm' />
          {locations.join(', ') || '—'}
        </p>
      </div>
    )),
  });

  storyChunks.forEach((chunk, i) => {
    const page = add(() => (
      <>
        {i === 0 && <Heading>The Story</Heading>}
        <p className='whitespace-pre-line text-justify'>
          {chunk}
          {i < storyChunks.length - 1 ? ' …' : ''}
        </p>
      </>
    ));
    if (i === 0) contents.push({ label: 'The Story', page });
  });

  contents.push({
    label: 'Places visited',
    page: add(() => (
      <>
        <Heading>Places Visited</Heading>
        <ul className='space-y-2.5'>
          {locations.map((place, i) => (
            <li key={place} className='flex items-center gap-3'>
              <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 font-sans text-[11px] text-cyan-700'>
                {i + 1}
              </span>
              <span>{place}</span>
            </li>
          ))}
        </ul>
        <p className='mt-6 font-sans text-xs text-neutral-500'>Visited {date.fromNow()}, on {date.format('Do MMM YYYY')}.</p>
      </>
    )),
  });

  contents.push({
    label: 'Photos & links',
    page: add(() => (
      <>
        <Heading>Photos &amp; Links</Heading>
        <div className='space-y-3'>
          {story.driveLink ? (
            <LinkCard
              icon={<FaGoogleDrive className='text-base text-[#1fa463]' />}
              title='Trip photos on Google Drive'
              href={story.driveLink}
              onCopy={() => copy(story.driveLink, 'Drive link')}
              copyLabel='Copy Drive link'
            />
          ) : (
            <div className='rounded-lg border border-dashed border-neutral-300 p-3 text-center font-sans text-xs text-neutral-500'>
              No Google Drive link added for this trip yet.
              {onAddDriveLink && (
                <button type='button' onClick={onAddDriveLink} className='btn-small mx-auto mt-2 py-1'>
                  <FaGoogleDrive /> ADD DRIVE LINK
                </button>
              )}
            </div>
          )}
          {shareUrl && (
            <LinkCard
              icon={<span className='text-base'>🔗</span>}
              title='Public link to this story'
              href={shareUrl}
              onCopy={() => copy(shareUrl, 'Story link')}
              copyLabel='Copy story link'
            />
          )}
        </div>
      </>
    )),
  });

  // Two faces per leaf; an odd count leaves the last back page blank.
  const pages = [];
  for (let i = 0; i < faces.length; i += 2) {
    pages.push({
      pageNumber: i / 2 + 1,
      content: faces[i].render,
      backContent: faces[i + 1]?.render,
    });
  }

  return (
    <InteractiveBook
      coverImage={photo}
      coverColor={storyColor(story)}
      bookTitle={story.title}
      bookAuthor={[locations.slice(0, 2).join(' · '), date.format('MMMM YYYY')].filter(Boolean).join(' — ')}
      innerCoverSubtitle={`A travel story · ${date.format('YYYY')}`}
      pages={pages}
      width={width}
      height={height}
    />
  );
};

export default StoryBook;
