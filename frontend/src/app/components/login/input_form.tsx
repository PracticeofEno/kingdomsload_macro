"use client";
import { TextField } from "@mui/material";
import { ChangeEvent } from "react";

export interface LoginInputProps {
  inputTitle: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function InputForm({ inputTitle, setValue }: LoginInputProps) {
  function changeValue(text: string) {
    setValue(text);
  }
  return (
    <div className="w-full h-1/5">
      {inputTitle}
      <br></br>
      <input
        type="text"
        className="
      w-full 
      h-full 
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
          changeValue(e.target.value);
        }}
      />
      <br></br>
    </div>
  );
}
