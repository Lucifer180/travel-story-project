import moment from 'moment';
import { toast } from 'react-toastify';
import { create } from 'zustand';
import {
    deleteStory as deleteStoryApi,
    filterStoriesByDate as filterStoriesByDateApi,
    getAllStories,
    searchStories,
    updateIsFavourite as updateIsFavouriteApi,
} from '../api/stories.api';

export const STORIES_PER_PAGE = 5;

const EMPTY_RANGE = { from: null, to: null };

export const useStoryStore = create((set, get) => ({
    stories: [],
    loading: false,
    // '' (all stories) | 'search' | 'date'
    filterType: '',
    searchQuery: '',
    dateRange: EMPTY_RANGE,
    page: 1,

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setPage: (page) => set({ page }),

    // Replaces the list and keeps the current page in range.
    _setStories: (stories, extra = {}) => {
        const lastPage = Math.max(1, Math.ceil(stories.length / STORIES_PER_PAGE));
        set((s) => ({ stories, loading: false, ...extra, page: Math.min(extra.page ?? s.page, lastPage) }));
    },

    fetchStories: async () => {
        set({ loading: true });
        try {
            const response = await getAllStories();
            if (response.data?.stories) get()._setStories(response.data.stories);
            else set({ loading: false });
        } catch (error) {
            set({ loading: false });
            console.error('An unexpected error occurred:', error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    },

    search: async (query) => {
        query = query?.trim();
        if (!query) return;
        set({ searchQuery: query });
        try {
            const response = await searchStories(query);
            if (response.data?.stories) {
                get()._setStories(response.data.stories, { filterType: 'search', page: 1 });
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search stories.');
        }
    },

    filterByDate: async (range) => {
        set({ dateRange: range });
        const startDate = range.from ? moment(range.from).startOf('day').valueOf() : null;
        const endDate = range.to ? moment(range.to).endOf('day').valueOf() : null;
        if (!startDate || !endDate) return;
        try {
            const response = await filterStoriesByDateApi({ startDate, endDate });
            if (response.data?.stories) {
                get()._setStories(response.data.stories, { filterType: 'date', page: 1 });
            }
        } catch (error) {
            console.error('An unexpected error occurred. Please try again.', error);
        }
    },

    clearFilters: () => {
        set({ filterType: '', searchQuery: '', dateRange: EMPTY_RANGE, page: 1 });
        return get().fetchStories();
    },

    // Re-runs whichever list is on screen so an active filter sticks.
    refresh: () => {
        const { filterType, searchQuery, dateRange } = get();
        if (filterType === 'search' && searchQuery) return get().search(searchQuery);
        if (filterType === 'date') return get().filterByDate(dateRange);
        return get().fetchStories();
    },

    // Updated in place rather than refetched so the story keeps its position
    // (the server sorts favourites first) while the user is looking at it.
    toggleFavourite: async (story) => {
        try {
            const response = await updateIsFavouriteApi(story._id, !story.isFavourite);
            if (response.data?.story) {
                const updated = response.data.story;
                set((s) => ({ stories: s.stories.map((item) => (item._id === updated._id ? updated : item)) }));
                toast.success('Story updated successfully');
                return updated;
            }
        } catch (error) {
            console.error('Error updating story:', error);
            toast.error('An error occurred while updating the story. Please try again.');
        }
        return null;
    },

    deleteStory: async (story) => {
        try {
            const response = await deleteStoryApi(story._id);
            if (response.data && !response.data.error) {
                toast.success('Story Deleted Successfully');
                await get().refresh();
                return true;
            }
        } catch (error) {
            console.log(error.message);
            toast.error('Failed to delete story');
        }
        return false;
    },
}));
