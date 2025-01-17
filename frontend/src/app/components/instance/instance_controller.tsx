import { getGeneralLogs, getProgressLogs, registNextExcuteTime, removeNextExecuteTime } from "@/api/users";
import React, { useEffect, useState } from "react";
import { User } from "@/util_type";
import { Socket } from "socket.io-client";

type InstanceControllerProps = {
  user: User | undefined;
  ws2: Socket | undefined;
};

interface logsInterface{
  message: string;
  created_at: Date;
}

interface generalsInterface{
  name: string;
  created_at: Date;
}

export default function InstanceController({ user , ws2}: InstanceControllerProps) {
    const [data, setData] = useState<User | undefined>();
    const [time, setTime] = useState<number>(0);
    const [ws, setWs] = useState<Socket>();
    const [logs , setLogs] = useState<logsInterface[]>([]);
    const [generals, setGenerals] = useState<generalsInterface[]>([]);

    useEffect(() => {
      async function init() {
        const logs = await getProgressLogs();
        const generals = await getGeneralLogs();
        // console.log(logs);
        setLogs(logs)
        setGenerals(generals)
      }
      init();
      setData(user)
      const currentTime = new Date();
      currentTime.setHours(currentTime.getHours() + 9);
      const dataTime = data?.macro_data?.next_execute_time ? data?.macro_data?.next_execute_time : new Date();
      const targetTime = new Date(dataTime).getTime();
      const newRemainingTimes = Math.max(targetTime - currentTime.getTime(), 0)
      setTime(newRemainingTimes);
      setWs(ws2)
      
    }, []);

    useEffect(() => {
      const updateRemainingTimes = () => {
        const currentTime = new Date();
        currentTime.setHours(currentTime.getHours() + 9);
        const dataTime = data?.macro_data?.next_execute_time ? data?.macro_data?.next_execute_time : new Date();
        const targetTime = new Date(dataTime).getTime();
        const newRemainingTimes = Math.max(targetTime - currentTime.getTime(), 0)
        setTime(newRemainingTimes);
      };
      updateRemainingTimes(); // 처음 렌더링 시 바로 업데이트
      const interval = setInterval(updateRemainingTimes, 1000); // 1초마다 업데이트
  
      return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 제거
    }, [data]);

    useEffect(() => {
      if (ws) {
        ws.on("add-progress", (data) => {
          const newLogs = {
            message: data.message,
            created_at: new Date()
          }
          setLogs((prevLogs) => [newLogs, ...prevLogs])
        });
        ws.on("add-general", (data) => {
          const newGenerals = {
            name: data.name,
            created_at: new Date()
          }
          setGenerals((prevGenerals) => [newGenerals, ...prevGenerals])
        });
      }
      return () => {
        ws?.off("add-progress");
        ws?.off("add-general");
      };
    }, [ws]);
    
  
    const formatRemainingTime = (milliseconds: number) => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    async function requestNextExcuteTime() {
      registNextExcuteTime()
      .then((res) => {
        setData((prevData) => 
          prevData ? {
            ...prevData,
            macro_data: res
          } : prevData
        )
      })
      .catch((err) => {
      })
    }

    async function requestRemoveNextExcuteTime() {
      removeNextExecuteTime()
      .then((res) => {
        setData((prevData) => 
          prevData ? {
            ...prevData,
            macro_data: res
          } : prevData
        )
        setTime(0)
      })
      .catch((err) => {
      })
    }

    return (
      <div
        id="webcrumbs"
        className="flex w-3/4 h-3/4 justify-center items-center h-screen bg-neutral-200"
      >
        <div className="w-full min-h-full bg-neutral-200 p-6 rounded-lg shadow-lg">
          <h2 className="font-title text-2xl mb-6 text-center">동작 타이머</h2>
          {/* <DateTimePicker /> */}
          <div className="grid grid-cols-10 gap-6">
            {/* 타이머 */}
            <div className="col-span-10 bg-neutral-100 px-4 py-6 rounded-md text-center">
              <p className="text-lg font-semibold">남은 시간: {
                data?.macro_data?.next_execute_time ?
                  time ? formatRemainingTime(time) : " 1분 내로 실행됩니다"
                  :
                  " - "
              }</p>
            </div>
            {/* 버튼 중앙 배치 */}
            <div className="col-span-10 flex justify-center space-x-4">
              {/* 이벤트 등록 버튼 */}
              <button 
                className="bg-blue-500 text-white py-2 px-4 rounded-md flex justify-center items-center"
                onClick={() => requestNextExcuteTime()}>
                등록
              </button>

              {/* 이벤트 해제 버튼 */}
              <button 
                className="bg-red-500 text-white py-2 px-4 rounded-md flex justify-center items-center"
                onClick={() => requestRemoveNextExcuteTime()}>
                해제
              </button>
            </div>

            {/* 로그 리스트 */}
            <div className="flex flex-col col-span-7 bg-neutral-100 px-4 py-3 rounded-md">
              <h3 className="text-lg mb-4 font-semibold border-b pb-2">로그</h3>
              <ul className="ml-3 space-y-2 h-64 overflow-y-auto">
                {
                  logs
                    .sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)))  // created_at 기준으로 내림차순 정렬
                    .map((log, index) => {
                        return (
                        <li key={index}>
                          {new Date(log.created_at).toLocaleString()} - {log.message}
                        </li>
                        )
                    })
                }
              </ul>
            </div>


            {/* 배열 리스트 */}
            <div className="flex flex-col col-span-3 bg-neutral-100 px-4 py-3 rounded-md">
              <h3 className="text-lg mb-4 font-semibold border-b pb-2">
                뽑은 장수
              </h3>
              <ul className="ml-3 space-y-2 h-64 overflow-y-auto">
                {
                  generals
                    .sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)))  // created_at 기준으로 내림차순 정렬
                    .map((general, index) => {
                      return (
                        <li key={index}>
                          {new Date(general.created_at).toLocaleDateString()} - {general.name}
                        </li>
                      )
                    })
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
}
