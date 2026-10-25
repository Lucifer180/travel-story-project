import moment from 'moment';
import { Heading } from './parts';

// Numbered list of the places visited.
const PlacesPage = ({ story }) => {
  const date = moment(story.visitedDate);
  return (
    <>
      <Heading>Places Visited</Heading>
      <ul className='space-y-2.5'>
        {(story.visitedLocation || []).map((place, i) => (
          <li key={place} className='flex items-center gap-3'>
            <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 font-sans text-[11px] text-cyan-700'>
              {i + 1}
            </span>
            <span>{place}</span>
          </li>
        ))}
      </ul>
      <p className='mt-6 font-sans text-xs text-neutral-500'>
        Visited {date.fromNow()}, on {date.format('Do MMM YYYY')}.
      </p>
    </>
  );
};

export default PlacesPage;
