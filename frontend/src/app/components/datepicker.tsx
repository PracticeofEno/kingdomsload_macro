import { useState } from 'react';

export default function DateTimePicker() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleShowDateTime = () => {
    alert(`선택한 날짜: ${date}, 선택한 시간: ${time}`);
  };

  return (
    <div className="flex flex-row items-center mt-10 space-y-5">
      <div className='flex'>
        <label htmlFor="dateInput" className="block text-sm font-medium text-gray-700">
          날짜 선택:
        </label>
        <input
          type="date"
          id="dateInput"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex">
        <label htmlFor="timeInput" className="block text-sm font-medium text-gray-700">
          시간 선택:
        </label>
        <input
          type="time"
          id="timeInput"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <button
        onClick={handleShowDateTime}
        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        선택한 날짜와 시간 보기
      </button>
    </div>
  );
}
