import axiosInstance from "./axiosInstance";

export const getTravelSuggestions = () =>
    axiosInstance.get("/ai/travel-suggestions");

export const polishStory = ({ story, title }) =>
    axiosInstance.post("/ai/polish-story", { story, title });
