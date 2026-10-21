import { ArrowBendDownLeft, Heart, MapTrifold, MapPin, PencilSimple, Plus, Sparkle, X } from '@phosphor-icons/react';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { getAllStories, searchStories } from '../../api/stories.api';
import { useStoryStore } from '../../store/useStoryStore';
import { useUIStore } from '../../store/useUIStore';
import { joinKeywords, splitKeywords } from '../../utils/keywords';
import { storyPhotoUrl } from '../../utils/storyImage';
import SearchModal from './SearchModal';

const RECENT_COUNT = 5;
const SUGGESTION_COUNT = 8;
const SWATCHES = ['#0f4c5c', '#7a2e3a', '#2d4a2b', '#3b2f63', '#9a5b1f'];

// A short excerpt of the story text centred on the first keyword it contains,
// so the match is visible even when it isn't in the title or places.
function snippetFor(text, keywords) {
  if (!text) return '';
  const lower = text.toLowerCase();
  const hit = keywords
    .map((k) => lower.indexOf(k.toLowerCase()))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  if (hit === undefined) return text.slice(0, 110);
  const start = Math.max(0, hit - 35);
  return (start > 0 ? '…' : '') + text.slice(start, start + 120).trim() + (start + 120 < text.length ? '…' : '');
}

// ⌘K / Ctrl+K search over the user's stories. Typing searches the server as
// you go; Enter applies the search to the dashboard.
const TravelSearch = () => {
  const open = useUIStore((s) => s.searchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const activeQuery = useStoryStore((s) => s.searchQuery);
  const filterType = useStoryStore((s) => s.filterType);

  const [query, setQuery] = useState('');
  const [allStories, setAllStories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const keywords = useMemo(() => splitKeywords(query), [query]);

  // Start from the search that's on the dashboard, and refresh the story list
  // that suggestions and "recent" are drawn from.
  useEffect(() => {
    if (!open) return;
    setQuery(filterType === 'search' ? activeQuery : '');
    getAllStories()
      .then((res) => setAllStories(res.data?.stories || []))
      .catch(() => setAllStories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced server search; same keyword matching the dashboard uses.
  const keywordKey = joinKeywords(keywords);
  useEffect(() => {
    if (!open || !keywordKey) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const id = setTimeout(() => {
      searchStories(keywordKey)
        .then((res) => !cancelled && setResults(res.data?.stories || []))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [open, keywordKey]);

  const recent = useMemo(
    () => [...allStories].sort((a, b) => new Date(b.visitedDate) - new Date(a.visitedDate)).slice(0, RECENT_COUNT),
    [allStories],
  );

  // Places the user has been, most visited first, minus ones already searched.
  const suggestions = useMemo(() => {
    const counts = new Map();
    allStories.forEach((s) =>
      (s.visitedLocation || []).forEach((loc) => {
        const name = loc.trim();
        if (name) counts.set(name, (counts.get(name) || 0) + 1);
      }),
    );
    const taken = new Set(keywords.map((k) => k.toLowerCase()));
    return [...counts.entries()]
      .filter(([name]) => !taken.has(name.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, SUGGESTION_COUNT)
      .map(([label]) => ({ label, icon: <MapPin className='h-3.5 w-3.5 text-cyan-600' /> }));
  }, [allStories, keywords]);

  const close = () => setSearchOpen(false);

  const replaceStory = (updated) => {
    const swap = (list) => list.map((s) => (s._id === updated._id ? updated : s));
    setResults(swap);
    setAllStories(swap);
  };

  const shown = keywords.length ? results : recent;
  const rows = shown.map((story) => {
    const isFav = story.isFavourite;
    return {
      id: story._id,
      story,
      name: story.title,
      meta: [(story.visitedLocation || []).join(', '), moment(story.visitedDate).format('Do MMM YYYY')]
        .filter(Boolean)
        .join(' · '),
      snippet: keywords.length ? snippetFor(story.story, keywords) : undefined,
      avatar: storyPhotoUrl(story),
      color: SWATCHES[story._id.charCodeAt(story._id.length - 1) % SWATCHES.length],
      actions: [
        {
          label: isFav ? 'Remove from favourites' : 'Add to favourites',
          icon: <Heart weight={isFav ? 'fill' : 'regular'} className={isFav ? 'h-4 w-4 text-rose-500' : 'h-4 w-4'} />,
          onClick: async () => {
            const updated = await useStoryStore.getState().toggleFavourite(story);
            if (updated) replaceStory(updated);
          },
        },
        {
          label: 'Edit story',
          icon: <PencilSimple className='h-4 w-4' />,
          onClick: () => {
            close();
            useUIStore.getState().openEditStory(story);
          },
        },
      ],
    };
  });

  const applySearch = (q) => {
    const kws = splitKeywords(q);
    if (!kws.length) return;
    useStoryStore.getState().search(joinKeywords(kws));
    close();
  };

  const runAndClose = (fn) => () => {
    close();
    fn();
  };

  const quickActions = [
    keywords.length && {
      label: `Show all results for ${joinKeywords(keywords)} on the dashboard`,
      icon: <ArrowBendDownLeft className='h-[15px] w-[15px]' />,
      hint: 'Enter',
      onClick: () => applySearch(query),
    },
    filterType === 'search' && {
      label: 'Clear the current search',
      icon: <X className='h-[15px] w-[15px]' />,
      onClick: runAndClose(() => useStoryStore.getState().clearFilters()),
    },
    {
      label: 'Add a new story',
      icon: <Plus className='h-[15px] w-[15px]' />,
      onClick: runAndClose(() => useUIStore.getState().openAddStory()),
    },
    {
      label: 'Open the map of your travels',
      icon: <MapTrifold className='h-[15px] w-[15px]' />,
      onClick: runAndClose(() => useUIStore.getState().setMapOpen(true)),
    },
    {
      label: 'Get AI travel ideas',
      icon: <Sparkle className='h-[15px] w-[15px]' />,
      onClick: runAndClose(() => useUIStore.getState().setIdeasOpen(true)),
    },
  ].filter(Boolean);

  return (
    <SearchModal
      open={open}
      onOpenChange={setSearchOpen}
      placeholder='Search stories by keyword, place or title…'
      query={query}
      onQueryChange={setQuery}
      keywords={keywords}
      onRemoveKeyword={(i) => setQuery(joinKeywords(keywords.filter((_, idx) => idx !== i)))}
      suggestions={suggestions}
      suggestionsTitle='Places you have been'
      onSelectSuggestion={(s) => setQuery(joinKeywords([...keywords, s.label]))}
      results={rows}
      resultsTitle={keywords.length ? 'Matching stories' : 'Recent stories'}
      loading={loading}
      emptyMessage={keywords.length ? 'No stories match all of these keywords' : 'No stories yet'}
      onSelectResult={(row) => {
        close();
        useUIStore.getState().openViewStory(row.story);
      }}
      onSubmit={applySearch}
      quickActions={quickActions}
    />
  );
};

export default TravelSearch;
