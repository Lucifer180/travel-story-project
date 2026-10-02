import axiosInstance from "./axiosInstance";

export const signUp = ({ fullName, email, password }) =>
    axiosInstance.post("/create-account", { fullName, email, password });

export const logIn = ({ email, password }) =>
    axiosInstance.post("/login", { email, password });
