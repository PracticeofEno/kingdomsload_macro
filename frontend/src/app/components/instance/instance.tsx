"use client";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button/Button";
import { getUser } from "@/api/users";
import { requestCreateInstance } from "@/api/rabbit-mq";
import { CircularProgress } from "@mui/material";
import RegisterInputForm from "./regist_input_form";
import { io, Socket } from "socket.io-client";
import { getCookie } from "cookies-next";
import InstanceController from "./instance_controller";
import { InstanceState, User } from "@/util_type";

// Rest of the code...

export default function Instance() {
    const [user, setUser] = useState<User>();
    const [kinds, setKinds] = useState<string>("");
    const server_ip = process.env.NEXT_PUBLIC_SERVER_IP;
    const [websocket, setWebsocket] = useState<Socket>();

    useEffect(() => {
      async function init() {
        const data = await getUser("all");
        setUser(data);
        // console.log(data);
      }
      init();
    }, []);

    useEffect(() => {
      const tmp: Socket = io(`ws://${server_ip}/dashboard`, {
        auth: {
          token: `Bearer ${getCookie("jwt")}`,
        },
      });
      setWebsocket(tmp);
      tmp.on("create-instance", () => {
        setUser((prevUser) => {
          if (prevUser && prevUser.instance) {
            return {
              ...prevUser,
              instance: {
                ...prevUser.instance,
                state: InstanceState.NOT_REGISTERED,
              },
            };
          }
          return prevUser;
        });
      });
      tmp.on("not-registered-yet", () => {
        setUser((prevUser) => {
          if (prevUser && prevUser.instance) {
            return {
              ...prevUser,
              instance: {
                ...prevUser.instance,
                state: InstanceState.SUBMIT_REGISTER,
              },
            };
          }
          return prevUser;
        });
      });
      return () => {
        tmp.off("create-instance");
        tmp.off("not-registered-yet");
        tmp.disconnect();
      };
    }, []);

    async function createButtonClick() {
      setUser((prevUser) => {
        if (prevUser && prevUser.instance) {
          return {
            ...prevUser,
            instance: {
              ...prevUser.instance,
              state: InstanceState.REGISTRING,
            },
          };
        }
        return prevUser;
      });
      await requestCreateInstance("1.1.1.1");
    }

    return (
      <div className="flex flex-col w-full h-full justify-center items-center p-4 space-y-8">
        {user?.instance?.state == InstanceState.NOT_EXIST && (
          <Button
            className="w-[150px] h-[30px]"
            variant="contained"
            onClick={createButtonClick}
          >
            인스턴스 생성
          </Button>
        )}
        {user?.instance?.state == InstanceState.REGISTRING && (
          <div className="flex flex-col justify-center items-center">
            <CircularProgress />
            <div>모바일 에뮬레이터를 생성중입니다.</div> 
            <div>3분정도 소요되며 완료되면 페이지가 바뀝니다.(새로고침 후 재요청 금지)</div>
          </div>
        )}
        {user?.instance?.state == InstanceState.NOT_REGISTERED && (
          <RegisterInputForm />
        )}
        {user?.instance?.state == InstanceState.SUBMIT_REGISTER && (
          <div>
            <div>
              인스턴스 등록 요청중입니다... (관리자가 수동으로 합니다 ㅠ )
            </div>
            <div>오래 안되면 오픈톡 문의해주세요</div>
          </div>
        )}
        {user && user.instance?.state != InstanceState.REGISTRING &&
          user.instance?.state != InstanceState.NOT_REGISTERED &&
          user.instance?.state != InstanceState.SUBMIT_REGISTER && 
          user.instance?.state != InstanceState.NOT_EXIST &&
          (
            <InstanceController user={user} ws2={websocket}/>
          )}
      </div>
    );
}   
