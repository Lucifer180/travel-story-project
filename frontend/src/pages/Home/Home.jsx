import moment from 'moment';
import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { IoMdAdd } from "react-icons/io";
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import EmptyCard from '../../components/Cards/EmptyCard';
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle';
import Footer from '../../components/Cards/Footer';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import ViewTravelStory from '../../components/Cards/ViewTravelStory';
import Navbar from '../../components/Navbar';
import axiosInstance from '../../utils/axiosInstance';
import { getEmptyCardImg, getEmptyCardMessage } from '../../utils/helper';
import AddEditTravelStory from './AddEditTravelStory';
const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(""); 
  const [allStories,setAllStories]=useState([]);
  const [filterType,setFilterType]=useState('');
  const [dateRange,setDateRange]=useState({from:null,to:null});
  const [openAddEditModal,setOpenAddEditModal]=useState({
    isShown:false,
    type:"add",
    data:null
  });
  const [openViewModal,setOpenViewModal]=useState({
    isShown:false,
    data:null,
  });
  const [searchQuery,setSearchQuery]=useState('');
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8000/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
        
      } else {
        // Handle case where user data is not available
        console.error("User data not found");
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Error fetching user info:", error);
      }
    }
  };
  const getAllTravelStories = async () => {
    try {
        const response = await axiosInstance.get('/get-all-stories');
        if (response.data && response.data.stories) {
            setAllStories(response.data.stories);
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        toast.error("An unexpected error occurred. Please try again.");
    }
  };
  const handleEdit=async(data)=>{
    setOpenAddEditModal({isShown:true,type:"edit",data:data});

  }
  const handleViewStory=async(data)=>{
    setOpenViewModal({isShown:true,data});
    
  }

  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;
  
    try {
      const response = await axiosInstance.put(`/update-is-favourite/${storyId}`, {
        isFavourite: !storyData.isFavourite,
      });
  
      if (response.data && response.data.story) {
        await getAllTravelStories();
        await toast.success("Stories list updated Successfully");
      } else if(filterType==='search'&&searchQuery) {
       filterStoriesByDate(dateRange);
      }
      else{
        getAllTravelStories();
      }
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error("An error occurred while updating the story. Please try again.");
    }
  };
  
  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
        const response = await axiosInstance.delete(`/delete-story/${storyId}`); // Corrected line
        if (response.data && !response.data.error) { // Check for success instead of error
            toast.success("Story Deleted Successfully"); // Changed to success toast
            setOpenViewModal((prevstate) => ({ ...prevstate, isShown: false }));
            getAllTravelStories();
        }
    } catch (error) {
        console.log(error.message);
        toast.error("Failed to delete story"); // Optional: add error handling
    }
};
const handleClearSearch=()=>{
  setFilterType("");
  getAllTravelStories();
}

const onSearchStory = async (query) => {
  try {
      const response = await axiosInstance.get('/search', {
          params: { query }
      });
      if (response.data && response.data.stories) {
          setFilterType("search");
          setAllStories(response.data.stories);
      }
  } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search stories.");
  }
};
const filterStoriesByDate = async (day) => {
  try {
    const startDate = day.from ? moment(day.from).valueOf() : null;
    const endDate = day.to ? moment(day.to).valueOf() : null;

    if (startDate && endDate) {
      const response = await axiosInstance.get("/travel-stories/filter", {
        params: { startDate, endDate },
      });

      if (response.data && response.data.stories) {
        setFilterType('date');
        setAllStories(response.data.stories);
      } else {
        console.log("No stories found for the given date range.");
      }
    } else {
      console.log("Invalid date range provided.");
    }
  } catch (error) {
    console.error("An unexpected error occurred. Please try again.", error);
  }
};

const handleDayClick =(day)=>{
  setDateRange(day);
  filterStoriesByDate(day);
}
const resetFilter=(day)=>{
  setDateRange({from:null,to:null});
  setFilterType(day);
  getAllTravelStories();
}
  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, []);

  return (
  <div>
     <Navbar
     userInfo={userInfo}
     searchQuery={searchQuery}
     setSearchQuery={setSearchQuery}
     onSearchNote={onSearchStory}
     handleClearSearch={handleClearSearch}
     />
   <FilterInfoTitle 
   filterType={filterType}
   filterDates={dateRange}
   onClear={()=>{
    resetFilter();
   }} />
     <div className="container mx-auto py-10">
      <div className="flex gap-3">
        <div className="flex-1">{
    allStories.length>0?(
    <div className="grid grid-cols-2 gap-3 mt-4 ">
      {allStories.map((item)=>{
        return(
           <TravelStoryCard
            
           key={item._id}
           imgUrl={item.imageUrl}
           title={item.title}
           story={item.story}
           date={item.visitedDate}
           isFavourite={item.isFavourite}
           visitedLocation={item.visitedLocation}
           
           onClick={()=>handleViewStory(item)}
           onFavouriteClick={()=>{updateIsFavourite(item);
            
           }}
          />
        );
      })}
    </div>
  ):(
    <EmptyCard ImgSrc={getEmptyCardImg(filterType)} message={getEmptyCardMessage(filterType)} className="ml-40" />
  )}
        </div>
        <div className="w-[340px] top-1 right-2">
          <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
          <div className="p-0">
            <DayPicker 
            captionLayout="dropdown-buttons"
            mode="range"
            selected={dateRange}
            onSelect={handleDayClick}
            pagedNavigation
            />
          </div>
          </div>
        </div>
      </div>
     </div>
     {/*Add and Edit Travel Story Model*/}
     <Modal 
     isOpen={openAddEditModal.isShown}
     onRequestClose={()=>{}}
     style={
      {
        overlay:{
          background:"rgba(0,0,0,0.2)",
          zIndex:999,
        },
      }}
      appElement={document.getElementById("root")}
        className="model-box"
     >
      <AddEditTravelStory
       type={openAddEditModal.type}
       storyInfo={openAddEditModal.data}
       onClose={()=>{
        setOpenAddEditModal({
          isShown:false,type:"add",data:null
        })
       }}
       getAllTravelStories={getAllTravelStories}
      />
     </Modal>
     <Modal
     isOpen={openViewModal.isShown}
     onRequestClose={()=>{}}
     style={
      {
        overlay:{
          background:"rgba(0,0,0,0.2)",
          zIndex:999,
        },
      }}
      appElement={document.getElementById("root")}
        className="model-box"
     >
      <ViewTravelStory type={openViewModal.type} onClose={()=>{
        setOpenViewModal((prevState)=>({
          ...prevState,isShown:false
        }))
      }} onEditClick={()=>{
        setOpenViewModal((prevState)=>({
          ...prevState,isShown:false
        }))
        handleEdit(openViewModal.data||null )
      }} onDeleteClick={()=>{
        deleteTravelStory(openViewModal.data||null)
      }} storyInfo={openViewModal.data||null}/>
      
     </Modal>
     <button className='w-16 h-16 flex justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10' onClick={()=>{
      setOpenAddEditModal({isShown:true,type:"add",data:null});
     }}>
      <IoMdAdd className='text-[32px] text-white mt-4'/>
     </button>
<ToastContainer className=""/>
    <Footer />
  </div>
  );
};

export default Home;
