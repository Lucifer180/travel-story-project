import { FaGoogleDrive } from 'react-icons/fa';
import { Heading, LinkCard } from './parts';

// The trip's Google Drive link and the story's public link, if any.
// `onAddDriveLink` offers to add a Drive link when there isn't one.
const LinksPage = ({ story, shareUrl, onAddDriveLink, forPrint }) => (
  <>
    <Heading>Photos &amp; Links</Heading>
    <div className='space-y-3'>
      {story.driveLink ? (
        <LinkCard
          icon={<FaGoogleDrive className='text-base text-[#1fa463]' />}
          title='Trip photos on Google Drive'
          href={story.driveLink}
          what='Drive link'
          forPrint={forPrint}
        />
      ) : (
        <div className='rounded-lg border border-dashed border-neutral-300 p-3 text-center font-sans text-xs text-neutral-500'>
          No Google Drive link added for this trip yet.
          {onAddDriveLink && !forPrint && (
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
          what='Story link'
          forPrint={forPrint}
        />
      )}
    </div>
  </>
);

export default LinksPage;
