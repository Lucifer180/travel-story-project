import axiosInstance from "./axiosInstance";

export const getUser = () => axiosInstance.get("/get-user");

export const updateProfile = (fullName) =>
    axiosInstance.put("/update-profile", { fullName });

export const changePassword = ({ currentPassword, newPassword }) =>
    axiosInstance.put("/change-password", { currentPassword, newPassword });
