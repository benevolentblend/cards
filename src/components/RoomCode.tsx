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
    <div className="flex items-center gap-2 rounded-lg bg-emerald-700/50 px-3 py-2 backdrop-blur">
      <span className="text-sm text-emerald-100">
        <span className="font-mono font-semibold">{code}</span>
      </span>
      <Button onClick={copyToClipboard} variant="secondary" size="sm">
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default RoomCode;
