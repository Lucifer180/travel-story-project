import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { GrMap } from "react-icons/gr";
import { useParams } from 'react-router-dom';
import { getSharedStory } from '../../api/stories.api';

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
    <div className='min-h-screen bg-slate-50 py-10'>
      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-lg shadow-slate-200/60 border border-slate-200 p-8'>
        <h1 className='text-3xl text-slate-950 font-medium'>{story.title}</h1>
        <div className='flex items-center justify-between gap-3 mt-3'>
          <span className='text-xs text-slate-500'>
            {moment(story.visitedDate).format("Do MMM YYYY")}
          </span>
          <div className='inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded py-1 px-2'>
            <GrMap className='text-sm' />
            {story.visitedLocation.join(", ")}
          </div>
        </div>
        <img src={story.imageUrl} alt={story.title} className='w-full h-[300px] object-cover rounded-lg mt-4' />
        <p className='text-sm text-slate-950 leading-6 text-justify whitespace-pre-line mt-6'>{story.story}</p>
        <p className='text-xs text-slate-400 mt-8 text-center'>Shared from Travel Story</p>
      </div>
    </div>
  );
};

export default SharedStory;
