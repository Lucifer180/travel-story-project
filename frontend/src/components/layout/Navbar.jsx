import React from 'react';
import { useNavigate } from 'react-router-dom';
import Svgg from '../../assets/svgg.svg';
import { useAuthStore } from '../../store/useAuthStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useUIStore } from '../../store/useUIStore';
import ProfileInfo from './ProfileInfo';
import SearchBar from './SearchBar';
const Navbar = () => {
    const isToken = useAuthStore((s) => s.token);
    const userInfo = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const searchQuery = useStoryStore((s) => s.searchQuery);
    const filterType = useStoryStore((s) => s.filterType);
    const clearFilters = useStoryStore((s) => s.clearFilters);
    const setProfileOpen = useUIStore((s) => s.setProfileOpen);
    const setSearchOpen = useUIStore((s) => s.setSearchOpen);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10'>
            <img src={Svgg} alt="Travel Story Logo" className='h-9'/>
            {isToken && (
                <>
                    <SearchBar
                        value={filterType === "search" ? searchQuery : ""}
                        onOpen={() => setSearchOpen(true)}
                        onClearSearch={clearFilters}
                    />
                    <ProfileInfo userInfo={userInfo} onLogout={onLogout} onProfileClick={() => setProfileOpen(true)} />
                </>
            )}
        </div>
    );
}

export default Navbar;
