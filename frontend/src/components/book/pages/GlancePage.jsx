import moment from 'moment';
import { GrMapLocation } from 'react-icons/gr';
import { MdOutlineDateRange } from 'react-icons/md';
import { storyColor, storyPhotoUrl } from '../../../utils/storyImage';

// Photo, title, date and places at a glance.
const GlancePage = ({ story }) => {
  const photo = storyPhotoUrl(story);
  const date = moment(story.visitedDate);
  return (
    <div className='flex h-full flex-col'>
      <div className='mb-4 h-40 w-full shrink-0 overflow-hidden rounded-md shadow-inner' style={{ background: storyColor(story) }}>
        {photo && <img src={photo} alt='' crossOrigin='anonymous' className='h-full w-full object-cover' />}
      </div>
      <h3 className='mb-3 text-lg font-medium leading-snug text-neutral-800'>{story.title}</h3>
      <p className='mb-2 flex items-center gap-2 font-sans text-xs text-neutral-500'>
        <MdOutlineDateRange className='text-base' />
        {date.format('Do MMMM YYYY')} · {date.format('dddd')}
      </p>
      <p className='flex items-start gap-2 font-sans text-xs text-neutral-500'>
        <GrMapLocation className='mt-0.5 shrink-0 text-sm' />
        {(story.visitedLocation || []).join(', ') || '—'}
      </p>
    </div>
  );
};

export default GlancePage;
