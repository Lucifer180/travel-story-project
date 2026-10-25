import { cn } from '../../../lib/utils';
import { Heading, PhotoFrame, galleryFrames } from './parts';

// Slight tilts so the frames look like prints pinned to the page.
const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', '-rotate-2', 'rotate-1'];

// Six photo frames; the owner can fill, replace or empty each one.
const GalleryPage = ({ story, editable, onSavePhotos }) => {
  const frames = galleryFrames(story);
  const setFrame = (i, file) =>
    onSavePhotos(
      story,
      (s, url) => {
        const next = galleryFrames(s);
        next[i] = url;
        return { gallery: next };
      },
      file,
    );

  return (
    <>
      <Heading className='mb-4'>Photo Gallery</Heading>
      <div className='grid grid-cols-2 gap-x-3 gap-y-3'>
        {frames.map((url, i) =>
          url || editable ? (
            <div key={i} className={cn('bg-white p-1.5 pb-3.5 shadow-md ring-1 ring-black/5', TILTS[i])}>
              <PhotoFrame
                url={url}
                editable={editable}
                onUpload={(file) => setFrame(i, file)}
                onRemove={() => setFrame(i, null)}
                className='h-[62px] w-full bg-neutral-100'
              />
            </div>
          ) : null,
        )}
      </div>
      {editable && (
        <p className='mt-3 text-center font-sans text-[10px] uppercase tracking-widest text-neutral-400'>
          Click a frame to add a photo
        </p>
      )}
    </>
  );
};

export default GalleryPage;
