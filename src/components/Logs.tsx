import { FC } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface LogEntry {
  dt: number;
  message: string;
}

interface LogsProps {
  log: LogEntry[];
}

const Logs: FC<LogsProps> = ({ log }) => {
  const [showLogs, setShowLogs] = useLocalStorage("logs", "false");

  return (
    <div className="border-t border-stone-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="show-logs" className="text-sm text-stone-500">
          Game Logs
        </Label>
        <Switch
          id="show-logs"
          checked={showLogs === "true"}
          onCheckedChange={(checked) => setShowLogs(checked ? "true" : "false")}
        />
      </div>
      {showLogs === "true" && (
        <div className="bg-stone-100 rounded-lg p-3 text-xs text-stone-600 space-y-1 max-h-32 overflow-y-auto">
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
