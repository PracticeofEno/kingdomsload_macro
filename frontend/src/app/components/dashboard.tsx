"use client";
import { useEffect, useState } from "react";
import { getMacroTime } from "@/api/users";

interface MacroTime {
  user_id: string;
  time: Date;
}

export default function DashBoard() {
  const server_ip = "175.200.191.46";
  // const [websocket, setWebsocket] = useState<Socket>();
  const [times, setTimes] = useState<MacroTime[]>([]);
  const [remainingTimes, setRemainingTimes] = useState<number[]>([]); // 남은 시간을 저장하는 상태

  useEffect(() => {
    async function init() {
      const fetchedTimes: [] = await getMacroTime();
      setTimes(fetchedTimes);
    }
    init();
  }, []);

  // useEffect(() => {
  //   const tmp: Socket = io(`ws://${server_ip}:3000/dashboard`);
  //   setWebsocket(tmp);
  //   return () => {
  //     tmp.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    const updateRemainingTimes = () => {
      const currentTime = new Date();
      currentTime.setHours(currentTime.getHours() + 9);
      const newRemainingTimes = times.map((time) => {
        const targetTime = new Date(time.time).getTime();
        return Math.max(targetTime - currentTime.getTime(), 0); // 남은 시간을 계산, 0보다 작으면 0으로
      });
      setRemainingTimes(newRemainingTimes);
    };

    updateRemainingTimes(); // 처음 렌더링 시 바로 업데이트
    const interval = setInterval(updateRemainingTimes, 1000); // 1초마다 업데이트

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 제거
  }, [times]);

  const formatRemainingTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-100 items-center p-8">
      <div className="text-2xl font-bold mb-6">무반뽑 남은 시간</div>
      <div className="w-full max-w-2xl">
        {/* Flexbox를 사용하여 3개씩 한 줄에 배치 */}
        <div className="flex flex-wrap -mx-2">
          {times.map((time, index) => (
            <div
              key={index}
              className="w-full sm:w-1/2 lg:w-1/3 p-2" // 1/3 너비로 설정 (3개씩 배치)
            >
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                <div className="text-lg font-semibold text-gray-700">
				  {time.user_id.length > 6 ? `${time.user_id.slice(0, 5)}...` : time.user_id}
                </div>
                <div className="text-lg text-blue-600 font-medium">
                  {formatRemainingTime(remainingTimes[index])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
