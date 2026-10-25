import moment from 'moment';
import { storyColor, storyPhotoUrl } from '../../utils/storyImage';
import buildStoryFaces from './buildStoryFaces';
import InteractiveBook from './InteractiveBook';

// Cover text shared by the flip-book and the PDF export.
export const coverAuthor = (story) =>
  [(story.visitedLocation || []).slice(0, 2).join(' · '), moment(story.visitedDate).format('MMMM YYYY')]
    .filter(Boolean)
    .join(' — ');

/**
 * A travel story as an interactive flip-book (pages: see buildStoryFaces).
 * `shareUrl` is the story's public link (if shared). `onAddDriveLink` shows an
 * "add a link" button on the links page when there's no Drive link yet.
 * `onSavePhotos(story, change, file)` makes the photo frames uploadable
 * (see useStoryStore.savePhotos); without it the book is read-only.
 */
const StoryBook = ({ story, shareUrl, onAddDriveLink, onSavePhotos, width = 320, height = 450 }) => {
  if (!story) return null;
  const faces = buildStoryFaces(story, { shareUrl, onAddDriveLink, onSavePhotos });

  // Two faces per leaf; an odd count leaves the last back page blank.
  const pages = [];
  for (let i = 0; i < faces.length; i += 2) {
    pages.push({ pageNumber: i / 2 + 1, content: faces[i], backContent: faces[i + 1] });
  }

  return (
    <InteractiveBook
      coverImage={storyPhotoUrl(story)}
      coverColor={storyColor(story)}
      bookTitle={story.title}
      bookAuthor={coverAuthor(story)}
      innerCoverSubtitle={`A travel story · ${moment(story.visitedDate).format('YYYY')}`}
      pages={pages}
      width={width}
      height={height}
    />
  );
};

export default StoryBook;
