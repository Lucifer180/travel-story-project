import React from 'react'
import { getInitials } from '../../utils/helper'
const ProfileInfo = ({userInfo,onLogout,onProfileClick}) => {
  return (
   userInfo&&( <div className='flex items-center gap-3'>
        <button className='w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100 hover:bg-cyan-50'
        onClick={onProfileClick} title="My profile">
            {getInitials(userInfo?userInfo.fullName:"")}
        </button>
        <div>
          <p className='text-sm font-medium'>
           {userInfo.fullName}
          </p>
            <button className='text-sm text-slate-700 underline' onClick={onLogout}>Logout</button>
        </div>
    </div>
  )
  )
}

export default ProfileInfo