import { FC, useState } from "react";
import { Copy, Check } from "lucide-react";

interface RoomCodeProps {
  code: string;
}

const RoomCode: FC<RoomCodeProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 bg-emerald-700/50 backdrop-blur rounded-lg px-3 py-2">
      <span className="text-emerald-100 text-sm">
        <span className="font-mono font-semibold">{code}</span>
      </span>
      <button
        onClick={copyToClipboard}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium
          transition-all duration-200 ${
            copied
              ? "bg-green-500 text-white"
              : "bg-amber-100 text-stone-800 hover:bg-amber-200"
          }`}
      >
        {copied ? (
          <>
            <Check className="w-3 h-3" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RoomCode;
