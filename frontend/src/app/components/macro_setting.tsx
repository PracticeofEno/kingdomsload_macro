"use client";

import { getMacroData, setMacroData } from "@/api/users";
import { useEffect, useState } from "react";

// Don't forget to
// // download the CSS file too OR
// // remove the following line if you're already using Tailwind

interface MacroData {
  subscribe: boolean;
  tax: boolean;
  recruit: boolean;
  trial: boolean;
  exploration: boolean;
  next_execute_time: string | null;
}

export default function MacroSetting() {
  const [macroSetting, setMacroSetting] = useState<MacroData | undefined>(
    undefined
  );

  useEffect(() => {
    async function init() {
      const data = await getMacroData();
      console.log(data);
      setMacroSetting(data);
    }
    init();
  }, []);

  const handleCheckboxChange = async (key: keyof MacroData) => {
    if (!macroSetting) return; // macroData가 없으면 실행하지 않음
    console.log(!macroSetting[key]);
    console.log(key);
    setMacroSetting({
      ...macroSetting,
      [key]: !macroSetting[key], // 상태 업데이트 시 안전하게 처리
    });
    await setMacroData({
      ...macroSetting,
      [key]: !macroSetting[key],
    });
  };

  return (
    <div id="webcrumbs">
      <div className="w-[400px] bg-neutral-50 rounded-lg shadow-lg p-6">
        <div className="mt-6">
          <h2 className="text-lg font-title">매크로 수행 목록</h2>
          <div className="mt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={macroSetting?.recruit || false}
                onChange={() => handleCheckboxChange("recruit")}
              />
              무반뽑
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={macroSetting?.trial || false}
                onChange={() => handleCheckboxChange("trial")}
              />
              시련
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={macroSetting?.tax || false}
                onChange={() => handleCheckboxChange("tax")}
              />
              세금 징수
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={macroSetting?.subscribe || false}
                onChange={() => handleCheckboxChange("subscribe")}
              />
              월정액
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={macroSetting?.exploration || false}
                onChange={() => handleCheckboxChange("exploration")}
              />
              탐방
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
