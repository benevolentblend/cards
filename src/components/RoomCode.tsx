import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { FC } from 'react';

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
      <Button onClick={copyToClipboard} variant="secondary" size="sm">
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
      </Button>
    </div>
  );
};

export default RoomCode;
