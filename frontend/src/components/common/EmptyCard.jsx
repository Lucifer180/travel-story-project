import React from 'react'

const EmptyCard = ({ImgSrc,message}) => {
  return (
    <div className='flex flex-col items-center justify-center mt-20 my-100'>
        <img src={ImgSrc} alt="nothing" className='w-24'/>
        <p className="w-1/2 text-sm font-medium text-slate-700 text-centerr
         leading-7 mt-5">{message}</p>
    </div>
  )
}

export default EmptyCard