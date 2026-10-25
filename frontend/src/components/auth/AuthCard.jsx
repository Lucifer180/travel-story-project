import React from 'react';
import Svgg from '../../assets/svgg.svg';

// Centered card used by the forgot / reset password pages.
const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white rounded-lg p-10 shadow-lg shadow-cyan-200/20'>
        <img src={Svgg} alt='Travel Story' className='h-9 mb-6' />
        <h4 className='text-2xl font-semibold mb-2'>{title}</h4>
        {subtitle && <p className='text-sm text-slate-500 mb-6'>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
