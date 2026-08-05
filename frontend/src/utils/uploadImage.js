import axiosInstance from "./axiosInstance";

const uploadImage=async(imageFile)=>{
    const formData=new FormData();
formData.append('image',imageFile);
try {
    // let the browser set the multipart Content-Type (with boundary) itself
    const response=await axiosInstance.post('/image-upload',formData,{
        headers:{'Content-Type':undefined},
    });
    return response.data;
} catch (error) {
    console.log('Error uploading the image',error);
    throw error;

}
}
export default uploadImage;  