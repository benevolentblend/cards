import { Inter } from "next/font/google";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface LogEntry {
  dt: number;
  message: string;
}

interface LayoutProps {
  children: React.ReactNode;
  topRight?: React.ReactNode;
  gameLogs?: LogEntry[];
}

const inter = Inter({ subsets: ["latin"] });

const Layout = ({ children, topRight, gameLogs }: LayoutProps) => {
  const [logs, setLogs] = useLocalStorage("logs", "false");
  const showLogs = logs === "true";

  return (
    <main
      className={`${inter.className} flex flex-col items-center min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 w-screen py-8 px-4`}
    >
      <div className="w-full md:max-w-4xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex-1" />
          <h1 className="text-3xl font-bold text-amber-100 drop-shadow-lg tracking-wide">
            🃏 Card Game
          </h1>
          <div className="flex-1 flex justify-end">{topRight}</div>
        </header>
        <section className="rounded-2xl p-4 shadow-2xl bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-200 w-full">
          {children}
        </section>
        <footer className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <span className="text-emerald-300 text-sm opacity-75">
              Play with friends!
            </span>
            <div className="flex-1 flex justify-end items-center gap-2">
              <label
                htmlFor="show-logs"
                className="text-emerald-300 text-xs opacity-75 cursor-pointer"
              >
                Show Logs
              </label>
              <Switch
                id="show-logs"
                checked={showLogs}
                onCheckedChange={(checked) =>
                  setLogs(checked ? "true" : "false")
                }
              />
            </div>
          </div>
          {showLogs && gameLogs && gameLogs.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-700 font-medium mb-2">
                Game Log
              </p>
              <div className="space-y-1">
                {gameLogs.map((logEntry) => (
                  <p
                    key={logEntry.dt}
                    className="text-sm text-amber-900 animate-appear"
                  >
                    {logEntry.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
};

export default Layout;
