import React, { useState } from 'react';
import { FaEye, } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
const PasswordInput = ({value,onChange,placeholder}) => {
    const [isShowPassword,setIsShowPassword]=useState(false);
    const togglePassword=()=>{
        setIsShowPassword(!isShowPassword);
    }
  return (
    <div className='flex items-center bg-cyan-600/5 px-5 rounded mb-3'>
        <input type={isShowPassword?"text":"password"} value={value} onChange={onChange} placeholder={placeholder || "Password"} className='input-btn w-full bg-transparent py-3 mr-5 outline-none rounded text-sm'/>
        {
            isShowPassword
            ?<FaEye className='text-primary cursor-pointer mr-4' size={22} onClick={togglePassword}/>
            :<FaEyeSlash className='text-primary cursor-pointer mr-4' size={22} onClick={togglePassword}/>
        }
    </div>
  )
}

export default PasswordInput