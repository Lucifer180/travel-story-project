import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import PasswordInput from '../../components/common/PasswordInput';
import { useAuthStore } from '../../store/useAuthStore';
import AuthCard from '../../components/auth/AuthCard';

const MIN_PASSWORD_LENGTH = 6;

const ResetPassword = () => {
  const { token } = useParams();
  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [error,setError]=useState("");
  const [isSaving,setIsSaving]=useState(false);
  const resetPassword=useAuthStore((s)=>s.resetPassword);
  const navigate=useNavigate();

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(password.length<MIN_PASSWORD_LENGTH){
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if(password!==confirmPassword){
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsSaving(true);
    const result=await resetPassword({ token, password });
    setIsSaving(false);
    if(result.error){
      setError(result.error);
      return;
    }
    toast.success(result.message);
    setTimeout(()=>navigate("/login"),1500);
  }

  return (
    <AuthCard title='Choose a new password' subtitle='Pick a password you haven’t used for Travel Story before.'>
      <form onSubmit={handleSubmit}>
        <PasswordInput value={password} onChange={({target})=>setPassword(target.value)} placeholder='New password'/>
        <PasswordInput value={confirmPassword} onChange={({target})=>setConfirmPassword(target.value)} placeholder='Confirm new password'/>
        {error && (
          <p className='text-red-500 text-xs pb-1'>
            {error}{' '}
            {/expired|invalid/i.test(error) && <Link to='/forgot-password' className='underline'>Request a new link</Link>}
          </p>
        )}
        <button type='submit' className='btn-primary' disabled={isSaving}>
          {isSaving?"Saving…":"Reset password"}
        </button>
        <Link to='/login' className='block text-center text-xs text-primary hover:underline mt-4'>Back to login</Link>
      </form>
      <ToastContainer/>
    </AuthCard>
  );
}

export default ResetPassword
