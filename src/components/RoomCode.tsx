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
    <div className="flex items-center justify-center gap-3 bg-stone-100 rounded-lg p-3">
      <span className="text-stone-600">
        Room: <span className="font-mono font-semibold text-stone-800">{code}</span>
      </span>
      <button
        onClick={copyToClipboard}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium
          transition-all duration-200 ${
            copied
              ? "bg-green-500 text-white"
              : "bg-stone-800 text-white hover:bg-stone-700"
          }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RoomCode;
