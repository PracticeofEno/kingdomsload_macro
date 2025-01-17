"use client";
import { useState } from "react";
import Button from "@mui/material/Button/Button";
import { notRegisteredYet} from "@/api/users";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

enum InstanceState {
  NOT_EXIST = "NOT_EXIST",
  NOT_REGISTERED = "NOT_REGISTERED",
  OFFLINE = "OFFLINE",
  PREPARING = "PREPARING",
  RUNNING = "RUNNING",
}

type Instance = {
  id: number;
  login_id: string | null;
  login_pw: string | null;
  resource_ip: string;
  state: InstanceState;
};

type MacroData = {
  id: number;
  subscribe: boolean;
  tax: boolean;
  gatcha: boolean;
  gatcha_half: boolean;
  exploration: boolean;
  next_execute_time: string | null;
};

type User = {
  id: number;
  user_id: string;
  is_expired: boolean;
  instance: Instance | null;
  macro_data: MacroData | null;
};

export default function RegisterInputForm() {
  const [kinds, setKinds] = useState<string>("Qookka");
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function requestLoginButtonClick() {
    await notRegisteredYet(id, password, kinds);
  }

  return (
    <div className="flex flex-col space-y-2">
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="Qookka"
        name="radio-buttons-group"
        onChange={(e) => {
          setKinds(e.target.value);
        }}
      >
        <FormControlLabel value="Google" control={<Radio />} label="Google" />
        <FormControlLabel value="Qookka" control={<Radio />} label="Qookka" />
      </RadioGroup>
      <div className="flex flex-row space-x-4">
        <div>아이디　</div>
        <input
          type="text"
          className="
                    w-[200px]
                    h-[30px] 
                    p-2 
                    leading-[1.24] 
                    bg-white 
                    border 
                    border-[#b5bfcf] 
                    shadow-[inset_0_1px_1px_rgba(0,0,0,0.075)] 
                    transition-all 
                    ease-in-out 
                    duration-150 
                    font-sans 
                    text-[#3e434c] 
                    box-border
                    rounded-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#b5bfcf]
                    focus:border-[#b5bfcf]
                    "
          onChange={(e) => {
            setId(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-row space-x-4">
        <div>비밀번호</div>
        <input
          type="text"
          className="
                    w-[200px]
                    h-[30px] 
                    p-2 
                    leading-[1.24] 
                    bg-white 
                    border 
                    border-[#b5bfcf] 
                    shadow-[inset_0_1px_1px_rgba(0,0,0,0.075)] 
                    transition-all 
                    ease-in-out 
                    duration-150 
                    font-sans 
                    text-[#3e434c] 
                    box-border
                    rounded-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#b5bfcf]
                    focus:border-[#b5bfcf]
                    "
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <Button
        className="w-[280px] h-[30px]"
        variant="contained"
        onClick={requestLoginButtonClick}
      >
        로그인 정보 입력 요청
      </Button>
    </div>
  );
}
