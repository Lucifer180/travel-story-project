import GalleryPage from './pages/GalleryPage';
import GlancePage from './pages/GlancePage';
import IndexPage from './pages/IndexPage';
import LinksPage from './pages/LinksPage';
import MapPage from './pages/MapPage';
import MemorablePage from './pages/MemorablePage';
import PlacesPage from './pages/PlacesPage';
import StoryTextPage, { paginateStory } from './pages/StoryTextPage';
import { galleryFrames } from './pages/parts';

/**
 * The story's pages in reading order, shared by the flip-book and the PDF:
 *   Index · At a glance · The story (1+ pages) · Most memorable · Photo gallery
 *   · On the map · Places visited · Photos & links
 * Each face is `({ goToPage }) => node`; its printed page number is its
 * position + 1.
 *
 * options:
 *   shareUrl        the story's public link, shown on the links page
 *   onAddDriveLink  offers an "add Drive link" button when there's none
 *   onSavePhotos    makes the photo frames uploadable (owner view)
 *   forPrint        static rendering for the PDF (no controls)
 *
 * Readers (no onSavePhotos) only get photo pages that have photos.
 */
export default function buildStoryFaces(story, { shareUrl, onAddDriveLink, onSavePhotos, forPrint = false } = {}) {
  const editable = Boolean(onSavePhotos) && !forPrint;
  const locations = story.visitedLocation || [];

  const faces = [];
  const contents = [];
  const add = (render, label) => {
    faces.push(render);
    if (label) contents.push({ label, page: faces.length });
  };

  add(({ goToPage } = {}) => <IndexPage contents={contents} goToPage={forPrint ? undefined : goToPage} />);
  add(() => <GlancePage story={story} />, 'At a glance');

  const chunks = paginateStory(story.story);
  chunks.forEach((chunk, i) =>
    add(
      () => <StoryTextPage chunk={chunk} isFirst={i === 0} continues={i < chunks.length - 1} />,
      i === 0 ? 'The Story' : null,
    ),
  );

  if (editable || story.memorableImage) {
    add(() => <MemorablePage story={story} editable={editable} onSavePhotos={onSavePhotos} />, 'Most memorable');
  }
  if (editable || galleryFrames(story).some(Boolean)) {
    add(() => <GalleryPage story={story} editable={editable} onSavePhotos={onSavePhotos} />, 'Photo gallery');
  }
  if (locations.length) {
    add(() => <MapPage story={story} forPrint={forPrint} />, 'On the map');
  }
  add(() => <PlacesPage story={story} />, 'Places visited');
  add(
    () => <LinksPage story={story} shareUrl={shareUrl} onAddDriveLink={onAddDriveLink} forPrint={forPrint} />,
    'Photos & links',
  );

  return faces;
}
