import { Button } from "@mui/material";
import { XIcon } from "../icons/xicon";

export default function XButton({ toggleOpen2 }: { toggleOpen2: () => void }) {
  return (
    <div
      className="flex top-0 right-0 justify-center z-1"
      onClick={toggleOpen2}
    >
      <XIcon />
    </div>
  );
}
