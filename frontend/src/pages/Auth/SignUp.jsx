import * as motion from "motion/react-client";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/input/PasswordInput';
import axiosInstance from '../../utils/axiosInstance';
import { validateEmail } from '../../utils/helper';
const SignUp = () => {
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState(null);
  const navigate=useNavigate();

  const handleSignup=async (e)=>{
    e.preventDefault();
    if(!name){
      setError("Please enter your name")
    }
    if(!validateEmail(email)){
    setError("Please enter a valid email address");
    return;
    }
    if(!password){
      setError("please enter the password");
      return;
    }
    setError("");
    try{
      const response=await axiosInstance.post("/create-account",{
        fullName:name,
        email:email,
        password:password,
      });
      if(response.data||response.data.accessToken){
        localStorage.setItem("token",response.data.accessToken);
        navigate("/dashboard")
      }
    }catch(err){
      if(err.response&&err.response.data&&err.response.data.message){
        setError(err.response.data.message);
      }
      else{
        setError("An unexpected error occured.please try again");
      }
    }
}
  
  return (
    <div className='h-screen bg-cyan-50 overflow-hidden relative'>
      <div className='login-ui-box right-10 -top-40 '/>
      <div className='login-ui-box right-1/2 bg-cyan-200 -bottom-40 '/>
      <div className='container h-screen flex items-center justify-center px-20 mx-auto'>
        <motion.div
            whileHover={{ scale:1.05 }}
            whileTap={{ scale: 0.9 }}
            style={{borderBlockColor:"transparent"}} className='w-2/4 h-[85vh] flex items-end bg-signup bg-cover bg-center rounded-lg p-10 z-50 border-none'>
          <div>
            <h4  className='text-5xl text-white font-semibold leading-[58px]'>
              Join the <br />Adventure
            </h4>
            <p className='text-[15px] text-white leading-6 pr-7 mt-4'>
             create an account to start documenting your travels and preserving.
             <br />
             Your memories in your personal travel journal
            </p>
          </div>
          
         
        </motion.div>
        <div className='w-2/4 h-[80vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200/20 z-50'>        
          <form onSubmit={handleSignup} >
            <h4 className='text-2xl font-semibold mb-7' >Signup</h4>
            <input type="text" 
            placeholder='fullName'
             className='input-box' 
             onChange={({target})=>{setName(target.value);}}
             value={name}/>
            <input type="text" 
            placeholder='Email'
             className='input-box' 
             onChange={({target})=>{setEmail(target.value);
             }}
             value={email}/>
            <PasswordInput value={password}  onChange={({target})=>{setPassword(target.value);
            }}/>
            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}
            <button type='submit' className='btn-primary'>Create Account</button>
            <p className='text-xs text-slate-500 text-center my-4'>Or</p>
            <button type='submit'
                    className='btn-primary btn-light'
                    onClick={()=>{
                      navigate("/login");
                    }}
            >Login</button>
          </form>
          </div>
      </div>
    </div>
    
  )
}
export default SignUp
