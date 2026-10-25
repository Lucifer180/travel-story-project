import { Heading } from './parts';

// Table of contents. `goToPage` (absent in print) flips the book to an entry.
const IndexPage = ({ contents, goToPage }) => (
  <>
    <Heading>Index</Heading>
    <ol className='space-y-3'>
      {contents.map((entry) => (
        <li key={entry.label}>
          <button
            type='button'
            onClick={() => goToPage?.(entry.page)}
            disabled={!goToPage}
            className='flex w-full items-baseline gap-2 text-left hover:text-cyan-700 disabled:hover:text-inherit'
          >
            <span>{entry.label}</span>
            <span className='flex-1 translate-y-[-3px] border-b border-dotted border-neutral-300' />
            <span className='font-sans text-xs text-neutral-500'>{entry.page}</span>
          </button>
        </li>
      ))}
    </ol>
    {goToPage && (
      <p className='mt-8 text-center font-sans text-[11px] uppercase tracking-widest text-neutral-400'>
        Click an entry to jump there
      </p>
    )}
  </>
);

export default IndexPage;
