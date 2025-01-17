"use client";
import Instance from "../components/instance/instance";
import Ask from "../components/ask";
import LeftMenu from "../components/left_menu";

export default function Home() {
  return (
    <div className="flex flex-row w-full h-full bg-white">
      <LeftMenu />
      {/* 오른쪽 인스턴스 섹션 */}
      <div className="flex w-[70%] h-full border border-gray-300">
        <Instance />
      </div>
      <Ask />
    </div>
  );
}
