import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { getSharedStory } from '../../api/stories.api';
import StoryBook from '../../components/book/StoryBook';

const SharedStory = () => {
  const { shareId } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await getSharedStory(shareId);
        if (response.data && response.data.story) {
          setStory(response.data.story);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this story");
      }
    };
    fetchStory();
  }, [shareId]);

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <p className='text-slate-500'>{error}</p>
      </div>
    );
  }
  if (!story) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <p className='text-slate-400'>Loading story...</p>
      </div>
    );
  }
  return (
    <div className='min-h-screen py-10'>
      <div className='max-w-[900px] mx-auto bg-white/90 rounded-lg shadow-lg shadow-slate-200/60 border border-slate-200 p-6 overflow-x-auto'>
        <StoryBook story={story} shareUrl={window.location.href} />
        <p className='text-xs text-slate-400 mt-2 text-center'>Shared from Travel Story</p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SharedStory;
