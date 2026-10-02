import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { toast } from 'react-toastify';
import { changePassword, updateProfile } from '../../api/user.api';
import PasswordInput from '../common/PasswordInput';

const ProfileModal = ({ userInfo, onClose, onProfileUpdated }) => {
  const [fullName, setFullName] = useState(userInfo?.fullName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      const response = await updateProfile(fullName);
      if (response.data && response.data.user) {
        toast.success("Profile updated successfully");
        onProfileUpdated();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className='relative'>
      <div className="flex items-center justify-between">
        <h5 className='text-xl font-medium text-slate-700'>My Profile</h5>
        <button onClick={onClose}>
          <IoMdClose className='text-xl text-slate-400' />
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <label className='input-label'>EMAIL</label>
        <p className='text-sm text-slate-500'>{userInfo?.email}</p>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <label className='input-label'>FULL NAME</label>
        <input
          type="text"
          className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
          value={fullName}
          onChange={({ target }) => setFullName(target.value)}
        />
        <button className='btn-small self-start mt-1' onClick={handleSaveName}>
          SAVE NAME
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-6">
        <label className='input-label'>CHANGE PASSWORD</label>
        <PasswordInput
          value={currentPassword}
          onChange={({ target }) => setCurrentPassword(target.value)}
          placeholder="Current password"
        />
        <PasswordInput
          value={newPassword}
          onChange={({ target }) => setNewPassword(target.value)}
          placeholder="New password"
        />
        <PasswordInput
          value={confirmPassword}
          onChange={({ target }) => setConfirmPassword(target.value)}
          placeholder="Confirm new password"
        />
        <button className='btn-small self-start' onClick={handleChangePassword}>
          CHANGE PASSWORD
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
