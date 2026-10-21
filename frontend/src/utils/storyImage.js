const PLACEHOLDER_IMG = '/assets/placeholder.png';

// The backend falls back to a generic placeholder when a story has no photo;
// callers show something nicer than that grey box instead.
export const storyPhotoUrl = (story) =>
  story.imageUrl && !story.imageUrl.endsWith(PLACEHOLDER_IMG) ? story.imageUrl : null;

const STORY_COLORS = ['#0f4c5c', '#7a2e3a', '#2d4a2b', '#3b2f63', '#9a5b1f'];

// A stable cover colour per story, for when there's no photo.
export const storyColor = (story) =>
  STORY_COLORS[(story?._id || '').charCodeAt((story?._id || ' ').length - 1) % STORY_COLORS.length] || STORY_COLORS[0];
