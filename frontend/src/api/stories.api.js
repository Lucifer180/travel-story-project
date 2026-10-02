import axiosInstance from "./axiosInstance";

export const getAllStories = () => axiosInstance.get("/get-all-stories");

export const addStory = (payload) =>
    axiosInstance.post("/add-travel-story", payload);

export const editStory = (storyId, payload) =>
    axiosInstance.put(`/edit-story/${storyId}`, payload);

export const deleteStory = (storyId) =>
    axiosInstance.delete(`/delete-story/${storyId}`);

export const updateIsFavourite = (storyId, isFavourite) =>
    axiosInstance.put(`/update-is-favourite/${storyId}`, { isFavourite });

export const searchStories = (query) =>
    axiosInstance.get("/search", { params: { query } });

export const filterStoriesByDate = ({ startDate, endDate }) =>
    axiosInstance.get("/travel-stories/filter", { params: { startDate, endDate } });

export const shareStory = (storyId) =>
    axiosInstance.post(`/stories/${storyId}/share`);

export const unshareStory = (storyId) =>
    axiosInstance.delete(`/stories/${storyId}/share`);

export const getSharedStory = (shareId) =>
    axiosInstance.get(`/shared/${shareId}`);
