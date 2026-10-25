import moment from 'moment';
import { cn } from '../../../lib/utils';
import { storyColor, storyPhotoUrl } from '../../../utils/storyImage';
import buildStoryFaces from '../buildStoryFaces';
import { coverAuthor } from '../StoryBook';

// Same size as the flip-book's pages, so the content lays out identically.
export const PAGE_WIDTH = 320;
export const PAGE_HEIGHT = 450;

const Page = ({ children, className, style }) => (
  <div
    data-pdf-page
    className={cn('relative overflow-hidden', className)}
    style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, ...style }}
  >
    {children}
  </div>
);

// The whole book laid out flat, one element per PDF page: cover, every
// face of the flip-book, and a back cover. Rendered off-screen by
// exportBookPdf and never shown to the user.
const PrintBook = ({ story, shareUrl }) => {
  const faces = buildStoryFaces(story, { shareUrl, forPrint: true });
  const photo = storyPhotoUrl(story);

  return (
    <div className='flex flex-col items-start gap-4 bg-white p-4'>
      {/* Front cover */}
      <Page style={{ background: storyColor(story) }}>
        {photo && <img src={photo} alt='' crossOrigin='anonymous' className='absolute inset-0 h-full w-full object-cover' />}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
        <div className='absolute bottom-6 left-6 right-5 text-left text-white'>
          <h1 className='mb-2 font-serif text-2xl font-bold leading-tight tracking-wide'>{story.title}</h1>
          <p className='inline-block border-t border-white/30 pt-1.5 font-sans text-[10px] uppercase tracking-widest opacity-90'>
            {coverAuthor(story)}
          </p>
        </div>
      </Page>

      {faces.map((render, i) => {
        const pageNumber = i + 1;
        return (
          <Page key={i} className='flex flex-col bg-[#fdfbf7] p-8'>
            <div
              className={cn(
                'mb-4 font-sans text-xs tracking-wider text-neutral-400',
                pageNumber % 2 ? 'text-right' : 'text-left',
              )}
            >
              {pageNumber}
            </div>
            <div className='flex-1 overflow-hidden font-serif text-sm leading-relaxed text-neutral-700'>{render({})}</div>
          </Page>
        );
      })}

      {/* Back cover */}
      <Page className='flex flex-col items-center justify-center bg-[#fdfbf7] p-8 text-center'>
        <p className='font-serif text-lg italic text-neutral-500'>The End</p>
        <p className='mt-2 font-sans text-[10px] uppercase tracking-widest text-neutral-400'>
          A travel story · {moment(story.visitedDate).format('YYYY')} · Travel Story
        </p>
      </Page>
    </div>
  );
};

export default PrintBook;
