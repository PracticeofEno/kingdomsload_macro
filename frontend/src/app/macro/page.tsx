"use client";
import MacroSetting from "../components/macro_setting";
import Ask from "../components/ask";

import LeftMenu from "../components/left_menu";

export default function Home() {
  return (
    <div className="flex flex-row w-full h-full bg-white">
      {/* 왼쪽 메뉴 섹션 */}
      <LeftMenu />
      {/* 오른쪽 인스턴스 섹션 */}
      <div className="flex w-[70%] h-full border border-gray-300 justify-center items-center">
        <MacroSetting />
      </div>
      <Ask />
    </div>
  );
}
