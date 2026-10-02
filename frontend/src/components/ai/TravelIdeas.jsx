import React, { useEffect, useState } from 'react';
import { GrMap } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { getTravelSuggestions } from '../../api/ai.api';

const TravelIdeas = ({ onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await getTravelSuggestions();
        setSuggestions(response.data.suggestions || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to get suggestions");
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  return (
    <div className='relative'>
      <div className="flex items-center justify-between pb-4">
        <h5 className='text-xl font-medium text-slate-700'>✨ Where to next?</h5>
        <button onClick={onClose}>
          <IoMdClose className='text-xl text-slate-400' />
        </button>
      </div>

      {loading && (
        <p className='text-sm text-slate-400 py-10 text-center'>
          Reading your travel stories and dreaming up destinations...
        </p>
      )}
      {error && (
        <p className='text-sm text-rose-500 py-10 text-center'>{error}</p>
      )}
      {!loading && !error && (
        <div className='flex flex-col gap-4'>
          {suggestions.map((s, index) => (
            <div key={index} className='border border-slate-200 rounded-lg p-4 bg-cyan-50/30'>
              <div className='flex items-center justify-between'>
                <h6 className='text-base font-medium text-slate-950'>
                  {s.destination}, {s.country}
                </h6>
                <span className='inline-flex items-center gap-1 text-[12px] text-cyan-600 bg-cyan-200/40 rounded py-1 px-2'>
                  <GrMap className='text-xs' /> {s.bestTime}
                </span>
              </div>
              <p className='text-sm text-slate-600 mt-2'>{s.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelIdeas;
