import { DatePicker } from 'antd';
import { useEffect } from 'react';
import { FaMapMarkedAlt } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import TravelIdeas from '../../components/ai/TravelIdeas';
import EmptyCard from '../../components/common/EmptyCard';
import FilterInfoTitle from '../../components/common/FilterInfoTitle';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';
import ProfileModal from '../../components/profile/ProfileModal';
import TravelSearch from '../../components/search/TravelSearch';
import MapView from '../../components/story/MapView';
import StoryShowcase from '../../components/story/StoryShowcase';
import ViewTravelStory from '../../components/story/ViewTravelStory';
import dayjs from '../../lib/dayjs';
import { useAuthStore } from '../../store/useAuthStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useUIStore } from '../../store/useUIStore';
import { getEmptyCardImg, getEmptyCardMessage } from '../../utils/helper';
import AddEditTravelStory from './AddEditTravelStory';

const modalStyle={
  overlay:{
    background:"rgba(0,0,0,0.2)",
    zIndex:999,
  },
};

const Home = () => {
  const navigate = useNavigate();
  const fetchUser = useAuthStore((s)=>s.fetchUser);

  const allStories = useStoryStore((s)=>s.stories);
  const loading = useStoryStore((s)=>s.loading);
  const filterType = useStoryStore((s)=>s.filterType);
  const dateRange = useStoryStore((s)=>s.dateRange);
  const fetchStories = useStoryStore((s)=>s.fetchStories);
  const filterByDate = useStoryStore((s)=>s.filterByDate);
  const clearFilters = useStoryStore((s)=>s.clearFilters);
  const deleteStory = useStoryStore((s)=>s.deleteStory);

  const editor = useUIStore((s)=>s.editor);
  const viewer = useUIStore((s)=>s.viewer);
  const profileOpen = useUIStore((s)=>s.profileOpen);
  const mapOpen = useUIStore((s)=>s.mapOpen);
  const ideasOpen = useUIStore((s)=>s.ideasOpen);
  const {
    openAddStory, openEditStory, closeEditor, openViewStory, closeViewer,
    setProfileOpen, setMapOpen, setIdeasOpen,
  } = useUIStore.getState();

  const handleRangeChange=(values)=>{
    if(!values||!values[0]||!values[1]){
      clearFilters();
      return;
    }
    filterByDate({from:values[0].toDate(),to:values[1].toDate()});
  }

  useEffect(() => {
    fetchStories();
    fetchUser().then((stillLoggedIn)=>{
      if(!stillLoggedIn)navigate("/login");
    });
  }, []);

  return (
  <div>
     <Navbar/>
     <div className="container mx-auto py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {filterType?(
          <div className="bg-white/80 rounded-lg px-3 pt-3">
            <FilterInfoTitle
            filterType={filterType}
            filterDates={dateRange}
            onClear={clearFilters} />
          </div>
        ):<div/>}
        <DatePicker.RangePicker
          size="large"
          value={dateRange.from&&dateRange.to?[dayjs(dateRange.from),dayjs(dateRange.to)]:null}
          onChange={handleRangeChange}
          format="Do MMM YYYY"
          placeholder={["Visited from","Visited to"]}
          allowClear
          className="shadow-lg shadow-slate-200/60"
        />
      </div>
      {allStories.length>0?(
        <StoryShowcase/>
      ):(
        !loading&&<div className="bg-white/80 rounded-3xl py-10">
          <EmptyCard ImgSrc={getEmptyCardImg(filterType)} message={getEmptyCardMessage(filterType)} />
        </div>
      )}
     </div>
     {/*Add and Edit Travel Story Model*/}
     <Modal
     isOpen={editor.isShown}
     onRequestClose={closeEditor}
     style={modalStyle}
     appElement={document.getElementById("root")}
     className="model-box"
     >
      <AddEditTravelStory
       type={editor.type}
       storyInfo={editor.data}
       onClose={closeEditor}
      />
     </Modal>
     <Modal
     isOpen={viewer.isShown}
     onRequestClose={closeViewer}
     style={modalStyle}
     appElement={document.getElementById("root")}
     className="model-box-book"
     >
      <ViewTravelStory
       onClose={closeViewer}
       onEditClick={()=>openEditStory(viewer.data||null)}
       onDeleteClick={async()=>{
        if(await deleteStory(viewer.data||null))closeViewer();
       }}
       storyInfo={viewer.data||null}/>
     </Modal>
     <Modal
     isOpen={profileOpen}
     onRequestClose={()=>setProfileOpen(false)}
     style={modalStyle}
     appElement={document.getElementById("root")}
     className="model-box"
     >
      <ProfileModal onClose={()=>setProfileOpen(false)}/>
     </Modal>
     <Modal
     isOpen={mapOpen}
     onRequestClose={()=>setMapOpen(false)}
     style={modalStyle}
     appElement={document.getElementById("root")}
     className="model-box-wide"
     >
      <MapView
       allStories={allStories}
       onClose={()=>setMapOpen(false)}
       onSelectStory={(story)=>{
        setMapOpen(false);
        openViewStory(story);
       }}
      />
     </Modal>
     <Modal
     isOpen={ideasOpen}
     onRequestClose={()=>setIdeasOpen(false)}
     style={modalStyle}
     appElement={document.getElementById("root")}
     className="model-box"
     >
      {ideasOpen&&<TravelIdeas onClose={()=>setIdeasOpen(false)}/>}
     </Modal>
     <button className='w-16 h-16 flex justify-center items-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-[184px] z-20' title="AI travel ideas" onClick={()=>setIdeasOpen(true)}>
      <span className='text-[24px]'>✨</span>
     </button>
     <button className='w-16 h-16 flex justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-28 z-20' title="Map of your travels" onClick={()=>setMapOpen(true)}>
      <FaMapMarkedAlt className='text-[28px] text-white mt-4'/>
     </button>
     <button className='w-16 h-16 flex justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10 z-20' title="Add a story" onClick={openAddStory}>
      <IoMdAdd className='text-[32px] text-white mt-4'/>
     </button>
<TravelSearch/>
<ToastContainer className=""/>
    <Footer />
  </div>
  );
};

export default Home;
