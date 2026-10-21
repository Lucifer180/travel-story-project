import React from 'react';
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

// Looks like a search box but opens the search modal (also ⌘K / Ctrl+K).
const SearchBar = ({ value, onOpen, onClearSearch }) => {
  return (
    <div className='w-80 flex items-center px-4 bg-slate-100 rounded-md'>
      <button
        type="button"
        className='flex-1 flex items-center gap-3 text-left text-xs py-[11px] min-w-0'
        onClick={onOpen}
        aria-label="Search stories"
      >
        <FaMagnifyingGlass className='text-slate-400 shrink-0' />
        <span className={`truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value || 'Search stories'}
        </span>
        {!value && (
          <kbd className='ml-auto shrink-0 rounded border border-slate-200 bg-white px-1.5 font-sans text-[10px] text-slate-400'>
            {IS_MAC ? '⌘' : 'Ctrl+'}K
          </kbd>
        )}
      </button>
      {value && (
        <IoMdClose
          className='text-xl text-slate-500 cursor-pointer hover:text-black ml-2 shrink-0'
          onClick={onClearSearch}
          aria-label="Clear Search"
        />
      )}
    </div>
  );
}

export default SearchBar;
