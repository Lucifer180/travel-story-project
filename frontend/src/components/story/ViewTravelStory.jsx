import React, { useState } from 'react';
import { IoMdClose, IoMdShare } from "react-icons/io";
import { MdDeleteOutline, MdLinkOff, MdUpdate } from "react-icons/md";
import { toast } from 'react-toastify';
import { shareStory, unshareStory } from '../../api/stories.api';
import StoryBook from '../book/StoryBook';
const ViewTravelStory = ({storyInfo,onClose,onEditClick,onDeleteClick}) => {
  const [shareId,setShareId]=useState(storyInfo?.shareId||null);

  const handleShare=async()=>{
    try {
      const response=await shareStory(storyInfo._id);
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
      await unshareStory(storyInfo._id);
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
         <div className="overflow-x-auto py-2">
          {storyInfo&&(
            <StoryBook
              story={storyInfo}
              shareUrl={shareId?`${window.location.origin}/shared/${shareId}`:null}
              onAddDriveLink={onEditClick}
            />
          )}
         </div>
    </div>
  )
}

export default ViewTravelStory