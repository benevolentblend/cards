import { FC } from "react";

interface RoomCodeProps {
  code: string;
}

const RoomCode: FC<RoomCodeProps> = ({ code }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  };
  return (
    <div>
      Room Code: {code}{" "}
      <button
        onClick={copyToClipboard}
        className="bg-black rounded-sm hover:cursor-pointer text-stone-50 p-1"
      >
        Copy to Clipboard
      </button>
    </div>
  );
};

export default RoomCode;
