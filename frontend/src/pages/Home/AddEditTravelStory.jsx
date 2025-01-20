import moment from 'moment';
import React, { useState } from 'react';
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdUpdate } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import DateSelector from '../../components/Cards/DateSelector';
import ImageSelector from '../../components/Cards/ImageSelector';
import TagInput from '../../components/input/TagInput';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage from '../../utils/uploadImage';
const AddEditTravelStory = ({storyInfo,type,onClose,getAllTravelStories}) => {
  const [visitedDate,setVisitedDaate]=useState(storyInfo?.visitedDate||null);
  const [title,setTitle]=useState(storyInfo?.title||"");
  const [story,setStory]=useState(storyInfo?.story||"");
  const [visitedLocation,setVisitedLocation]=useState(storyInfo?.visitedLocation||[]);
  const [storyImg,setStoryImg]=useState(storyInfo?.imageUrl||null);
  const [Error,setError]=useState("");

  
  const handleAddorUpdateClick=()=>{
console.log("input Data",{
  title,
  story,
  storyImg,
  visitedDate,
  visitedLocation,
});
if(!title){
  toast.error("Please enter the title");
  setError("Please enter the title")
}
if(!story){
  setError("please enter the story ");
  toast.error("Please enter the Story");
}
if(!visitedDate){
  setError("please choose the date ");
  toast.error("Please choose the date");
}
if(!visitedLocation){
  setError("please enter the visited location or locations ");
  toast.error("Please choose the visited location or locations");
}
if(!storyImg){
  setError("please provide the story image");
  toast.error("Please provide the story image");
}
if(type=="edit"){
  UpdateTravelStory();
}
else{
  addNewTravelStory();
}
  }
  const UpdateTravelStory=async ()=>{
    const storyId=storyInfo._id;
    try {
      let imageUrl="";
      let postData={
        title,
        story,
        imageUrl:storyInfo.imageUrl||"",
        visitedLocation:visitedLocation,
        visitedDate:visitedDate
            ?moment(visitedDate).valueOf()
            :moment().valueOf(),
      }
    
      if(typeof storyImg==='object'){
        const imgUploadRes=await uploadImage(storyImg);
        imageUrl=imgUploadRes.imageUrl||"";
  
        postData={
          ...postData,
          imageUrl:imageUrl,
        }
      }
      const response=await axiosInstance.put("/edit-story/"+storyId,
        postData);
        if(response.data){
          toast.success("Story updated successfully");
        }
      if(response.data){
        getAllTravelStories();
        onClose();
      }
    } catch (error) {
      if(error.response&&error.response.data&&error.response.data.message){
        setError(error.response.data.message);
      }else{
        setError("An unexpected error occurred.Please try again");
      }
    }
  }
  const addNewTravelStory=async()=>{
        try {
          let imageUrl="";
          if(storyImg){
            const imgUploadRes=await uploadImage(storyImg);
            imageUrl=imgUploadRes.imageUrl||"";
          }
          const response=await axiosInstance.post("/add-travel-story",{
            title,
            story,
            imageUrl:imageUrl||"",
            visitedLocation:visitedLocation,
            visitedDate:visitedDate
                ?moment(visitedDate).valueOf()
                :moment().valueOf(),
          })
          if(response.data&&response.data.story){
            toast.success("Story added Successfully");
            getAllTravelStories();
            onClose();
          }
        } catch (error) {
          if(error.response&&error.response.data&&error.response.data.message){
            setError(error.response.data.message);
          }else{
            setError("An unexpected error occurred.Please try again");
          }
        }
  }
  const handleDeleteStoryImg=async()=> {
     const deleteImgRes=await axiosInstance.delete("/delete-image/",{
      params:{
        imageUrl:storyInfo.imageUrl,
      }
     });
     if(deleteImgRes.data){
      const storyId=storyInfo._id;
      const postData={
        title,
        story,
        visitedLocation,
        visitedDate:moment().valueOf(),
        imgUrl:"",
      };
     }
     const response=await axiosInstance.put('/edit-story/'+storyId, postData);
  };
  
  return (
    <div className='relative'>
      {/*buttons above the modal add,update close*/}
      <div className="flex items-center justify-between">
        <h5 className='text-xl font-medium text-slate-700'>
          {type=="add"?"Add Story":"Update Story"}
        </h5>
        <div>
          <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
          {
            type=="add"?(
              <button className="btn-small" onClick={handleAddorUpdateClick}>
              <IoMdAdd 
              className='text-lg'
              />
              ADD STORY
              </button>
            ):(
              <>
              <button className="btn-small" onClick={UpdateTravelStory}>
              <MdUpdate
              className='text-lg'
              />
              UPDATE STORY
              </button>   
              </>
            )
          }
            <button onClick={onClose}>
            <IoMdClose className='text-xl text-slate-400' />
            </button>
          </div>
          {
            Error&&(
              <p className='text-red-500 text-xs pt-2 text-right'>{Error}</p>
            )
          }
        </div>
      </div>
 <div>

  {/* the title for the travel */}
  <div className="flex-1 flex flex-col gap-2 pt-4">
    <label className='input-label'>TITLE</label>
    <input type="text"
    className='text-2xl text-slate-950 outline-none' 
    placeholder='A Day at the Greate Wall'
    value={title}
    onChange={({target})=>setTitle(target.value)}/>
{/* date picker*/}
  </div>
  <div className="my-3">
    <DateSelector date={visitedDate} setDate={setVisitedDaate} />
  </div>
  <ImageSelector
  
  image={storyImg}
  setImage={setStoryImg}
  handleDeleteImg={handleDeleteStoryImg}
  />
  {/*adding the story*/}
  <div className="flex flex-col gap-2 mt-4">
    <label className="input-label">
      STORY
    </label>
    <textarea type="text" className='text-sm text-slate-950 outline-none bg-slate-50
     p-2'
     rows={10}
     value={story}
     onChange={({target})=>setStory(target.value)}
     placeholder='your story'
     ></textarea>
  </div>
<div className="pt-3">
  <label className='input-label'>Visited Locations</label>
  <TagInput tags={visitedLocation} setTags={setVisitedLocation}></TagInput>
</div>
 </div>
 <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    closeOnClick
    pauseOnHover
    draggable
    pauseOnFocusLoss
/>

    </div>
  )
}

export default AddEditTravelStory