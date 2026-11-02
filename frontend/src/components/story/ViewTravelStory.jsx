import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { MdDeleteOutline, MdLinkOff, MdUpdate } from "react-icons/md";
import { toast } from 'react-toastify';
import { shareStory, unshareStory } from '../../api/stories.api';
import { useStoryStore } from '../../store/useStoryStore';
import DownloadBookButton from '../book/export/DownloadBookButton';
import ShareBookMenu from '../book/export/ShareBookMenu';
import StoryBook from '../book/StoryBook';
const ViewTravelStory = ({storyInfo,onClose,onEditClick,onDeleteClick}) => {
  const [shareId,setShareId]=useState(storyInfo?.shareId||null);
  const savePhotos=useStoryStore((s)=>s.savePhotos);

  const shareUrl=shareId?`${window.location.origin}/shared/${shareId}`:null;

  // Creates the public link the first time someone shares the story.
  const ensureShareUrl=async()=>{
    if(shareUrl) return shareUrl;
    try {
      const response=await shareStory(storyInfo._id);
      setShareId(response.data.shareId);
      return `${window.location.origin}/shared/${response.data.shareId}`;
    } catch (error) {
      toast.error("Failed to create share link");
      throw error;
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
                      <DownloadBookButton
                        story={storyInfo}
                        shareUrl={shareUrl}
                      />
                      <ShareBookMenu
                        story={storyInfo}
                        shareUrl={shareUrl}
                        ensureShareUrl={ensureShareUrl}
                      />
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
              shareUrl={shareUrl}
              onAddDriveLink={onEditClick}
              onSavePhotos={savePhotos}
            />
          )}
         </div>
    </div>
  )
}

export default ViewTravelStory