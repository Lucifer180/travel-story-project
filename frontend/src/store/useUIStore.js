import { create } from 'zustand';

const CLOSED_EDITOR = { isShown: false, type: 'add', data: null };
const CLOSED_VIEWER = { isShown: false, data: null };

// Which modal is open on the dashboard, and with what story.
export const useUIStore = create((set) => ({
    editor: CLOSED_EDITOR,
    viewer: CLOSED_VIEWER,
    profileOpen: false,
    mapOpen: false,
    ideasOpen: false,
    searchOpen: false,

    openAddStory: () => set({ editor: { isShown: true, type: 'add', data: null } }),
    openEditStory: (story) => set({ editor: { isShown: true, type: 'edit', data: story }, viewer: CLOSED_VIEWER }),
    closeEditor: () => set({ editor: CLOSED_EDITOR }),

    openViewStory: (story) => set({ viewer: { isShown: true, data: story } }),
    closeViewer: () => set((s) => ({ viewer: { ...s.viewer, isShown: false } })),

    setProfileOpen: (profileOpen) => set({ profileOpen }),
    setMapOpen: (mapOpen) => set({ mapOpen }),
    setIdeasOpen: (ideasOpen) => set({ ideasOpen }),
    setSearchOpen: (searchOpen) => set({ searchOpen }),
}));
