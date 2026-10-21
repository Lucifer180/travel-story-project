import { RefreshCcw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Interactive Book
 *
 * A CSS-3D hardcover that opens on click and flips through its pages. Each
 * entry in `pages` is one leaf: `content` is the right-hand (odd) page and
 * `backContent` the left-hand (even) page seen after flipping it.
 *
 * `content` / `backContent` may be a node or a function `({ goToPage }) => node`;
 * `goToPage(n)` opens the book at printed page number n (used by an index).
 *
 * pages: { title?, content, backContent?, pageNumber }[]
 */

const BOOK_OPEN_DURATION = 1.5;
const EASING = [0.25, 0, 0, 1]; // milder smoothing

const renderFace = (face, api) => (typeof face === 'function' ? face(api) : face);

export default function InteractiveBook({
  coverImage,
  coverColor = '#0f4c5c',
  bookTitle = 'Book Title',
  bookAuthor = 'Author Name',
  innerCoverSubtitle = 'Interactive Edition',
  pages,
  className,
  width = 350,
  height = 500,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  const [isHovering, setIsHovering] = useState(false);

  const widthNum = typeof width === 'number' ? width : 350;

  const handleOpenBook = () => setIsOpen(true);

  const handleCloseBook = useCallback((e) => {
    e?.stopPropagation();
    setIsOpen(false);
    setCurrentPageIndex(-1);
  }, []);

  const nextPage = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentPageIndex((prev) => (prev < pages.length - 1 ? prev + 1 : prev));
    },
    [pages.length],
  );

  const prevPage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentPageIndex((prev) => (prev >= 0 ? prev - 1 : prev));
  }, []);

  const restartBook = (e) => {
    e?.stopPropagation();
    setCurrentPageIndex(-1);
  };

  // Page n is the front (right side) of leaf (n-1)/2 when odd, and the back
  // (left side) of leaf n/2-1 when even; flip every leaf before it.
  const goToPage = useCallback(
    (n) => {
      const leaf = n % 2 === 1 ? (n - 1) / 2 - 1 : n / 2 - 1;
      setIsOpen(true);
      setCurrentPageIndex(Math.max(-1, Math.min(pages.length - 1, leaf)));
    },
    [pages.length],
  );
  const api = { goToPage };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'Escape') handleCloseBook();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextPage, prevPage, handleCloseBook]);

  // Clicks inside page content (links, buttons) must not also turn the page.
  const stopIfInteractive = (e) => e.target.closest('a,button,input') !== null;

  return (
    <div
      className={cn('relative flex w-full items-center justify-center perspective-[2000px]', className)}
      style={{
        minWidth: typeof width === 'number' ? width * 2 + 40 : undefined,
        height: typeof height === 'number' ? height + 100 : 'auto',
      }}
    >
      <motion.div
        className="relative preserve-3d"
        style={{ width, height }}
        initial={{ x: 0 }}
        animate={{ x: isOpen ? widthNum / 2 : 0 }}
        transition={{ duration: BOOK_OPEN_DURATION, ease: EASING }}
      >
        {/* Front Cover */}
        <motion.div
          className="absolute inset-0 h-full w-full origin-left"
          initial={{ rotateY: 0, zIndex: 100 }}
          animate={{
            rotateY: isOpen ? -180 : isHovering ? -15 : 0,
            zIndex: isOpen ? 0 : 100,
          }}
          transition={{
            rotateY: { duration: BOOK_OPEN_DURATION, ease: EASING },
            zIndex: { delay: isOpen ? BOOK_OPEN_DURATION * 0.6 : BOOK_OPEN_DURATION * 0.4 },
          }}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={!isOpen ? handleOpenBook : undefined}
          onHoverStart={() => !isOpen && setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          {/* Front Face */}
          <div
            className="group absolute inset-0 h-full w-full cursor-pointer overflow-hidden rounded-l-sm rounded-r-md shadow-2xl backface-hidden"
            style={{ transform: 'translateZ(0.5px)', background: coverColor }}
          >
            {coverImage && (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6 right-5 text-left text-white">
              <h1 className="mb-2 font-serif text-2xl font-bold leading-tight tracking-wide drop-shadow-md">{bookTitle}</h1>
              <p className="inline-block border-t border-white/30 pt-1.5 font-sans text-[10px] uppercase tracking-widest opacity-90">
                {bookAuthor}
              </p>
            </div>

            {/* Spine Highlight */}
            <div className="absolute bottom-0 left-0 top-0 w-4 bg-gradient-to-r from-white/30 to-transparent opacity-40" />
            <div className="absolute bottom-0 left-[12px] top-0 w-[1px] bg-black/30" />
          </div>

          {/* Back Face (Inner Cover) */}
          <div
            className="absolute inset-0 flex h-full w-full cursor-pointer flex-col rounded-l-md rounded-r-sm border-r border-neutral-200 bg-[#fdfbf7] p-8 shadow-xl transition-colors backface-hidden hover:bg-[#fcfaf5]"
            style={{ transform: 'rotateY(180deg) translateZ(0.5px)' }}
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center opacity-80">
              <h2 className="mb-2 font-serif text-2xl tracking-wide text-neutral-800">{bookTitle}</h2>
              <div className="mb-3 h-[1px] w-8 bg-neutral-300" />
              <p className="text-xs uppercase tracking-widest text-neutral-500">{innerCoverSubtitle}</p>
            </div>
          </div>
        </motion.div>

        {/* Pages Stack */}
        <div className="absolute inset-0 z-0 h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
          {pages.map((page, index) => {
            const isFlipped = index <= currentPageIndex;

            return (
              <motion.div
                key={index}
                className="absolute inset-0 h-full w-full origin-left rounded-l-sm rounded-r-md border border-neutral-100 bg-[#fdfbf7] shadow-sm"
                style={{ transformStyle: 'preserve-3d' }}
                initial={{ rotateY: 0, zIndex: pages.length - index }}
                animate={{
                  rotateY: isFlipped ? -180 : 0,
                  zIndex: isFlipped ? index + 1 : pages.length - index,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.645, 0.045, 0.355, 1],
                }}
              >
                {/* Front Face (Right Side) */}
                <div
                  className="absolute inset-0 flex h-full w-full cursor-pointer flex-col bg-[#fdfbf7] p-8 transition-colors backface-hidden hover:bg-[#fcfaf5]"
                  style={{ transform: 'translateZ(0.5px)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!stopIfInteractive(e)) nextPage();
                  }}
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="mb-4 text-right font-sans text-xs tracking-wider text-neutral-400">
                      {page.pageNumber * 2 - 1}
                    </div>
                    <div className="select-none font-serif text-sm leading-relaxed text-neutral-700">
                      {page.title && (
                        <h3 className="mb-6 text-center text-xl font-medium tracking-tight text-neutral-800">{page.title}</h3>
                      )}
                      {renderFace(page.content, api)}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-8 bg-gradient-to-r from-black/5 to-transparent mix-blend-multiply" />
                </div>

                {/* Back Face (Left Side) */}
                <div
                  className="absolute inset-0 flex h-full w-full cursor-pointer flex-col overflow-hidden border-r border-neutral-200 bg-[#fdfbf7] p-8 transition-colors backface-hidden hover:bg-[#fcfaf5]"
                  style={{ transform: 'rotateY(180deg) translateZ(0.5px)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!stopIfInteractive(e)) prevPage();
                  }}
                >
                  <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l from-black/5 to-transparent mix-blend-multiply" />

                  <div className="flex-1 overflow-hidden">
                    <div className="mb-4 text-left font-sans text-xs tracking-wider text-neutral-400">{page.pageNumber * 2}</div>
                    <div className="flex h-full select-none flex-col font-serif text-sm leading-relaxed text-neutral-700">
                      {page.backContent ? (
                        <div className="flex-1">{renderFace(page.backContent, api)}</div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center opacity-[0.03]">
                          <span className="font-serif text-8xl font-bold italic text-black">{page.pageNumber * 2}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Back Cover (Static) */}
          <div
            className="absolute inset-0 h-full w-full rounded-l-sm rounded-r-md border border-neutral-200 bg-[#fdfbf7] shadow-xl"
            style={{ transform: 'translateZ(-1px)', zIndex: -1 }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-40">
              <p className="font-serif italic text-neutral-500">The End</p>
              <button
                onClick={restartBook}
                className="mt-4 flex cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                <RefreshCcw size={14} /> Read Again
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleCloseBook}
            aria-label="Close book"
            className="absolute right-4 top-4 z-[1000] rounded-full border border-transparent bg-white/50 p-2 text-neutral-800 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:border-neutral-200 hover:bg-white hover:shadow-xl"
          >
            <X size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-4 z-50 cursor-pointer text-sm font-medium uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-700"
          onClick={handleOpenBook}
        >
          Click to Open
        </motion.div>
      )}
    </div>
  );
}
