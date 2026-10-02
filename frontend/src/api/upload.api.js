import axiosInstance from "./axiosInstance";

export const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    // let the browser set the multipart Content-Type (with boundary) itself
    const response = await axiosInstance.post("/image-upload", formData, {
        headers: { "Content-Type": undefined },
    });
    return response.data;
};

export const deleteImage = (imageUrl) =>
    axiosInstance.delete("/delete-image", { params: { imageUrl } });
