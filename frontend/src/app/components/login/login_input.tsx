"use client";
import { useState } from "react";
import Image from "next/image";
import InputForm from "./input_form";
import Button from "@mui/material/Button/Button";
import { login, register } from "@/api/users";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function LoginInput() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  async function Login() {
    if (userId == "" || password == "") {
      alert("ID와 password는 빈칸일 수 없습니다");
      return;
    }
    try {
      const jwt = await login(userId, password);
      setCookie("jwt", jwt);
      console.log(jwt);
      // alert("로그인 성공");
      router.push("/main");
    } catch (e: any) {
      if (e.response.status == 404) {
        alert("존재하지 않는 정보입니다");
      } else if (e.response.status == 401) {
        alert("비밀번호가 틀렸습니다");
      } else {
        alert("로그인 실패. 관리자에게 문의해주세요 ");
      }
    }
  }

  async function request_regist() {
    if (userId == "" || password == "") {
      alert("ID와 password는 빈칸일 수 없습니다");
      return;
    }
    try {
      const jwt = await register(userId, password);
      setCookie("jwt", jwt);
      console.log(jwt);
      alert("회원가입 성공");
    } catch (e: any) {
      if (e.response.status == 400) {
        alert("이미 존재하는 아이디입니다");
      } else if (e.response.status == 500) {
        alert("서버가 응답하지 않습니다. 관리자에게 문의해주세요");
      } else {
        alert("로그인 실패. 관리자에게 문의해주세요 ");
      }
    }
  }

  return (
    <div className="flex flex-col w-full h-full justify-center p-4 space-y-8">
      <div className="w-full text-xl font-medium font-italic">
        Three Kingdoms Load
      </div>
      <InputForm inputTitle="아이디" setValue={setUserId} />
      <InputForm inputTitle="비밀번호" setValue={setPassword} />
      <div className="flex justify-between h-1/10">
        <Button
          className="w-[100px] h-[30px]"
          variant="contained"
          onClick={request_regist}
        >
          가입하기
        </Button>
        <Button
          className="w-[100px] h-[30px]"
          variant="contained"
          onClick={Login}
        >
          로그인
        </Button>
      </div>
    </div>
  );
}
