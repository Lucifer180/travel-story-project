import { Heading } from './parts';

// Characters of story text that fit on one page at the book's size.
const CHARS_PER_PAGE = 560;
const CHARS_FIRST_PAGE = 430; // the first story page also carries a heading

// Splits text into page-sized chunks on word boundaries, keeping paragraphs.
export function paginateStory(text) {
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

// One page's share of the story text; the first carries the heading.
const StoryTextPage = ({ chunk, isFirst, continues }) => (
  <>
    {isFirst && <Heading>The Story</Heading>}
    <p className='whitespace-pre-line text-justify'>
      {chunk}
      {continues ? ' …' : ''}
    </p>
  </>
);

export default StoryTextPage;
