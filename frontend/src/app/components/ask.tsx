"use client";
import { Fab } from "@mui/material";
import { useState } from "react";
import Image from "next/image";
import XButton from "../../../public/buttons/XButton";

export default function Ask() {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(true);

  function toggleOpen() {
    setOpen(!open);
  }

  function toggleOpen2() {
    setOpen2(!open2);
  }

  return (
    <div className="fixed right-0 bottom-0 m-16 z-2">
      {open2 && (
        <div className="relative">
          <div>
            <Fab
              color="primary"
              variant="extended"
              style={{ backgroundColor: "#1976D2" }}
              onClick={toggleOpen}
            >
              문의 / 등록 요청
              <XButton toggleOpen2={toggleOpen2} />
            </Fab>
          </div>
          {open && (
            <div className="absolute -top-[200px] -left-[120px] w-[300px] h-[190px] bg-[#ededed] rounded-2xl p-2">
              <div className="flex flex-row justify-center border-b-2 border-gray-400 items-center space-x-4 p-2">
                <Image
                  src="/vercel.svg"
                  width={42}
                  height={1}
                  alt="panda manager"
                />
                <p className="text-green-600"> 삼전 도우미</p>
              </div>
              <div className="flex flex-col justify-center border-b-2 border-gray-400 items-center space-x-4 p-2">
                <p className="text-black">
                  사용 문의 및 계정 등록 요청용 오픈톡
                </p>
                <a
                  className="text-blue-600"
                  href="https://open.kakao.com/o/s76HbIOg"
                >
                  https://open.kakao.com/o/s76HbIOg
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
