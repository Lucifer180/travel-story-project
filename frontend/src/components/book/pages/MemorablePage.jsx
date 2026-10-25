import moment from 'moment';
import { Heading, PhotoFrame } from './parts';

// The trip's single most memorable photo, as a large print.
const MemorablePage = ({ story, editable, onSavePhotos }) => {
  const save = (file) => onSavePhotos(story, (_s, url) => ({ memorableImage: url }), file);
  return (
    <div className='flex h-full flex-col'>
      <Heading className='mb-4'>Most Memorable</Heading>
      <div className='mx-auto w-full rotate-1 bg-white p-2 pb-8 shadow-lg ring-1 ring-black/5'>
        <PhotoFrame
          url={story.memorableImage}
          editable={editable}
          onUpload={save}
          onRemove={() => save(null)}
          className='h-[220px] w-full bg-neutral-100'
          emptyLabel='Add your most memorable photo'
        />
        <p className='mt-2 text-center font-serif text-sm italic text-neutral-600'>
          {story.title}, {moment(story.visitedDate).format('MMMM YYYY')}
        </p>
      </div>
    </div>
  );
};

export default MemorablePage;
