import moment from 'moment';
import React, { useState } from 'react';
import { GrMap } from "react-icons/gr";
import { IoMdClose, IoMdShare } from "react-icons/io";
import { MdDeleteOutline, MdLinkOff, MdUpdate } from "react-icons/md";
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';
const ViewTravelStory = ({storyInfo,onClose,onEditClick,onDeleteClick}) => {
  const [shareId,setShareId]=useState(storyInfo?.shareId||null);

  const handleShare=async()=>{
    try {
      const response=await axiosInstance.post(`/stories/${storyInfo._id}/share`);
      if(response.data&&response.data.shareId){
        setShareId(response.data.shareId);
        const link=`${window.location.origin}/shared/${response.data.shareId}`;
        await navigator.clipboard.writeText(link);
        toast.success("Share link copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to create share link");
    }
  };
  const handleUnshare=async()=>{
    try {
      await axiosInstance.delete(`/stories/${storyInfo._id}/share`);
      setShareId(null);
      toast.success("Sharing disabled");
    } catch (error) {
      toast.error("Failed to disable sharing");
    }
  };
  return (
    <div className='relative'>
      <div className="flex items-center justify-end">
         <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
                      <button className="btn-small" onClick={handleShare} title="Copy a public link to this story">
                      <IoMdShare
                      className='text-lg'
                      />
                      {shareId?"COPY LINK":"SHARE"}
                      </button>
                      {shareId&&(
                      <button className="btn-small btn-delete" onClick={handleUnshare} title="Disable the public link">
                      <MdLinkOff
                      className='text-lg'
                      />
                      UNSHARE
                      </button>
                      )}
                      <button className="btn-small" onClick={onEditClick}>
                      <MdUpdate
                      className='text-lg'
                      />
                      UPDATE STORY
                      </button>
                      <button className="btn-small btn-delete" onClick={onDeleteClick}>
                      <MdDeleteOutline 
                      className='text-lg '
                      />
                      Delete 
                      </button>
                    <button onClick={onClose}>
                    <IoMdClose className='text-xl text-slate-400' />
                    </button>
                  </div>
         </div>
         <div className="flex-1 flex flex-col gap-2 py-4">
          <h1 className="text-2xl text-slate-950">
            {storyInfo&&storyInfo.title}
            </h1>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {storyInfo&&moment(storyInfo.visitedDate).format("Do MMM YYYY")}
              </span>
              <div className="inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded py-1 px-2">
              <GrMap className='text-sm'/>
              {storyInfo&&storyInfo.visitedLocation.map((item,index)=>storyInfo.visitedLocation.length==index+1?`${item}`:`${item},`)}
              </div>
            </div>
           <img src={storyInfo && storyInfo.imageUrl} alt="selected" className='w-full h-[300px] object-cover rounded-lg' />
           <div className="mt-4">
            <p className='text-sm text-slate-950 leading-6 text-justify whitespace-pre-line'>{storyInfo&&storyInfo.story}</p>
           </div>
         </div>
    </div>
  )
}

export default ViewTravelStory