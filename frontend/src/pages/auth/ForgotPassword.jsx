import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { validateEmail } from '../../utils/helper';
import AuthCard from '../../components/auth/AuthCard';

const ForgotPassword = () => {
  const [email,setEmail]=useState("");
  const [error,setError]=useState("");
  const [sentMessage,setSentMessage]=useState("");
  const [isSending,setIsSending]=useState(false);
  const requestPasswordReset=useAuthStore((s)=>s.requestPasswordReset);

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!validateEmail(email)){
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setIsSending(true);
    const result=await requestPasswordReset(email.trim());
    setIsSending(false);
    if(result.error){
      setError(result.error);
      return;
    }
    setSentMessage(result.message);
  }

  if(sentMessage){
    return (
      <AuthCard title='Check your email' subtitle={sentMessage}>
        <p className='text-sm text-slate-500 mb-6'>
          The link expires in 30 minutes. Didn&apos;t get it? Check your spam folder, or try again in a minute.
        </p>
        <button type='button' className='btn-primary btn-light' onClick={()=>setSentMessage("")}>
          Send another link
        </button>
        <Link to='/login' className='block text-center text-xs text-primary hover:underline mt-4'>Back to login</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title='Forgot password?'
      subtitle="Enter the email you signed up with and we'll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit}>
        <input type="text"
          placeholder='Email'
          className='input-box'
          autoFocus
          value={email}
          onChange={({target})=>setEmail(target.value)}/>
        {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}
        <button type='submit' className='btn-primary' disabled={isSending}>
          {isSending?"Sending…":"Send reset link"}
        </button>
        <Link to='/login' className='block text-center text-xs text-primary hover:underline mt-4'>Back to login</Link>
      </form>
    </AuthCard>
  );
}

export default ForgotPassword
