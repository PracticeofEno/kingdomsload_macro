"use client";
import { useState } from "react";
import LoginInput from "./components/login/login_input";
import { login } from "../api/users";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import DashBoard from "./components/dashboard";
import Ask from "./components/ask";

export default function Home() {
  return (
    <div className="flex flex-row w-full h-full bg-white">
      <div className="flex flex-col w-[30%] h-full justify-center">
        <div className="w-full h-1/3"></div>
        <div className="w-full h-1/3">
          <LoginInput />
        </div>
        <div className="w-full h-1/3"></div>
      </div>
      <DashBoard />
      <Ask />
    </div>
  );
}
