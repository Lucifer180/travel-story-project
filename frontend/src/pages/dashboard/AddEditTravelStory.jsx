import moment from 'moment';
import React, { useState } from 'react';
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { MdUpdate } from "react-icons/md";
import { toast } from 'react-toastify';
import { polishStory as polishStoryApi } from '../../api/ai.api';
import { addStory, editStory } from '../../api/stories.api';
import { deleteImage, uploadImage } from '../../api/upload.api';
import DateSelector from '../../components/common/DateSelector';
import ImageSelector from '../../components/common/ImageSelector';
import TagInput from '../../components/common/TagInput';
const AddEditTravelStory = ({storyInfo,type,onClose,getAllTravelStories}) => {
  const [visitedDate,setVisitedDate]=useState(storyInfo?.visitedDate||null);
  const [title,setTitle]=useState(storyInfo?.title||"");
  const [story,setStory]=useState(storyInfo?.story||"");
  const [visitedLocation,setVisitedLocation]=useState(storyInfo?.visitedLocation||[]);
  const [storyImg,setStoryImg]=useState(storyInfo?.imageUrl||null);
  const [Error,setError]=useState("");
  const [isPolishing,setIsPolishing]=useState(false);

  const handlePolishStory=async()=>{
    if(!story.trim()){
      toast.error("Write your story first, then let AI polish it");
      return;
    }
    setIsPolishing(true);
    try {
      const response=await polishStoryApi({story,title});
      if(response.data&&response.data.polished){
        setStory(response.data.polished);
        toast.success("Story polished — review and edit as you like");
      }
    } catch (error) {
      toast.error(error.response?.data?.message||"Failed to polish story");
    } finally {
      setIsPolishing(false);
    }
  };

  
  const handleAddorUpdateClick=()=>{
    if(!title){
      setError("Please enter the title");
      toast.error("Please enter the title");
      return;
    }
    if(!story){
      setError("Please enter the story");
      toast.error("Please enter the story");
      return;
    }
    if(!visitedDate){
      setError("Please choose the date");
      toast.error("Please choose the date");
      return;
    }
    if(visitedLocation.length===0){
      setError("Please enter the visited location or locations");
      toast.error("Please enter the visited location or locations");
      return;
    }
    if(!storyImg){
      setError("Please provide the story image");
      toast.error("Please provide the story image");
      return;
    }
    setError("");
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
      const response=await editStory(storyId,postData);
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
          const response=await addStory({
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
    // only a file already uploaded to the server needs deleting
    if(!storyInfo?.imageUrl||typeof storyImg!=='string')return;
    try {
      await deleteImage(storyInfo.imageUrl);
      // point the story at the placeholder so it doesn't reference a dead file
      await editStory(storyInfo._id,{
        title,
        story,
        visitedLocation,
        visitedDate:visitedDate?moment(visitedDate).valueOf():moment().valueOf(),
        imageUrl:"",
      });
      getAllTravelStories();
    } catch (error) {
      console.error("Error deleting story image:",error);
    }
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
              <button className="btn-small" onClick={handleAddorUpdateClick}>
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
    <DateSelector date={visitedDate} setDate={setVisitedDate} />
  </div>
  <ImageSelector
  
  image={storyImg}
  setImage={setStoryImg}
  handleDeleteImg={handleDeleteStoryImg}
  />
  {/*adding the story*/}
  <div className="flex flex-col gap-2 mt-4">
    <div className="flex items-center justify-between">
      <label className="input-label">
        STORY
      </label>
      <button type="button" className="btn-small" onClick={handlePolishStory} disabled={isPolishing}>
        {isPolishing?"POLISHING...":"✨ POLISH WITH AI"}
      </button>
    </div>
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
    </div>
  )
}

export default AddEditTravelStory