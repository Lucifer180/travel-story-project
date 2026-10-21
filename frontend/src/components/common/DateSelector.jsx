import { DatePicker } from 'antd';
import React from 'react';
import { MdOutlineDateRange } from "react-icons/md";
import dayjs from '../../lib/dayjs';

// Single-date picker for a story's visited date (antd DatePicker).
const DateSelector = ({date,setDate}) => {
  return (
    <DatePicker
      value={date?dayjs(date):null}
      onChange={(value)=>setDate(value?value.toDate():null)}
      format="Do MMM YYYY"
      placeholder="Pick the visited date"
      suffixIcon={<MdOutlineDateRange className="text-lg text-sky-600"/>}
      allowClear={false}
    />
  )
}

export default DateSelector
