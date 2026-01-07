import { useLocalStorage } from '@/hooks/useLocalStorage';

import { Label } from './ui/label';
import { Switch } from './ui/switch';

import type { FC } from 'react';

interface LogEntry {
  dt: number;
  message: string;
}

interface LogsProps {
  log: LogEntry[];
}

const Logs: FC<LogsProps> = ({ log }) => {
  const [showLogs, setShowLogs] = useLocalStorage('logs', 'false');

  return (
    <div className="mt-4 border-t border-stone-200 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <Label htmlFor="show-logs" className="text-sm text-stone-500">
          Game Logs
        </Label>
        <Switch
          id="show-logs"
          checked={showLogs === 'true'}
          onCheckedChange={(checked) => setShowLogs(checked ? 'true' : 'false')}
        />
      </div>
      {showLogs === 'true' && (
        <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-stone-100 p-3 text-xs text-stone-600">
          {log.length === 0 ? (
            <p className="text-stone-400 italic">No logs yet</p>
          ) : (
            log.map((entry, i) => <p key={entry.dt + i}>{entry.message}</p>)
          )}
        </div>
      )}
    </div>
  );
};

export default Logs;
