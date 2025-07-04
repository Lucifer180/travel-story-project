import axiosInstance from "./axiosInstance";

const uploadImage=async(imageFile)=>{
    const formData=new FormData();
formData.append('image',imageFile);
try {
    const response=await axiosInstance.post('/image-upload',formData,{
        headers:{
            'Content-Type':'multipart/form-date',
        },
    });
    return response.data;
} catch (error) {
    console.log('Error uploading the imege',error);
    throw error;

}
}
export default uploadImage;  