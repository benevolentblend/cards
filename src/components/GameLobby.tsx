import { FC } from "react";
import { Action, User } from "../../game/logic";
import NameForm from "./NameForm";

interface GameLobbyProps {
  otherUsers: User[];
  username: string;
  hostId: string;
  isHost: boolean;
  isSpectator: boolean;
  spectatorCount: number;
  serverDispatch: (action: Action) => void;
  setUsername: (username: string) => void;
}

const PlayerAvatar: FC<{ name: string; isHost?: boolean }> = ({
  name,
  isHost,
}) => {
  const initial = name.charAt(0).toUpperCase() || "?";
  const colors = [
    "from-pink-400 to-rose-500",
    "from-violet-400 to-purple-500",
    "from-cyan-400 to-teal-500",
    "from-orange-400 to-amber-500",
  ];
  const colorIndex =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors[colorIndex]}
          flex items-center justify-center text-white text-xl font-bold shadow-md
          border-2 border-white/50`}
      >
        {initial}
      </div>
      <span className="text-sm font-medium text-stone-700 max-w-[80px] truncate">
        {name}
      </span>
      {isHost && (
        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
          Host
        </span>
      )}
    </div>
  );
};

const GameLobby: FC<GameLobbyProps> = ({
  otherUsers,
  serverDispatch,
  username,
  setUsername,
  isHost,
  hostId,
  isSpectator,
  spectatorCount,
}) => {
  const startGame = () => serverDispatch({ type: "startGame" });
  const joinGame = () => serverDispatch({ type: "becomePlayer" });
  const becomeSpectator = () => serverDispatch({ type: "becomeSpectator" });
  const canStartGame = otherUsers.length >= 1;
  const totalPlayers = otherUsers.length + (isSpectator ? 0 : 1);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Game Lobby</h2>
        <p className="text-stone-500">
          {totalPlayers} player{totalPlayers !== 1 ? "s" : ""} at the table
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-6 border border-emerald-200">
        <div className="flex flex-wrap justify-center gap-6">
          {!isSpectator && (
            <PlayerAvatar name={username || "You"} isHost={isHost} />
          )}
          {otherUsers.map((user) => {
            const playerIsHost = user.id === hostId;
            return (
              <PlayerAvatar
                key={user.id}
                name={user.name}
                isHost={playerIsHost}
              />
            );
          })}
          {totalPlayers === 0 && (
            <p className="text-stone-500 italic">No players yet...</p>
          )}
        </div>
      </div>

      {spectatorCount > 0 && (
        <div className="flex items-center justify-center gap-2 text-stone-500">
          <span className="text-lg">👀</span>
          <span className="text-sm">
            {spectatorCount} spectator{spectatorCount !== 1 ? "s" : ""} watching
          </span>
        </div>
      )}

      <div className="border-t border-stone-200 pt-4">
        <NameForm {...{ username, setUsername }} />
      </div>

      {isSpectator ? (
        <div className="space-y-3">
          <div className="bg-stone-100 rounded-lg p-3 text-center">
            <span className="text-stone-600">👀 You are spectating</span>
          </div>
          <button
            onClick={joinGame}
            className="w-full rounded-xl p-4 bg-gradient-to-r from-green-500 to-emerald-600
              text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]
              active:scale-[0.98] transition-all duration-200"
          >
            🎮 Join Game
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {isHost && (
            <button
              onClick={startGame}
              disabled={!canStartGame}
              className={`w-full rounded-xl p-4 font-semibold shadow-lg transition-all duration-200
                ${
                  canStartGame
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-stone-900 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
            >
              {canStartGame ? "🎲 Start Game" : "⏳ Waiting for players..."}
            </button>
          )}
          {!isHost && (
            <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
              <p className="text-amber-800 font-medium">
                ⏳ Waiting for host to start the game...
              </p>
            </div>
          )}
          <button
            onClick={becomeSpectator}
            className="w-full rounded-lg p-3 bg-stone-100 text-stone-600 text-sm
              hover:bg-stone-200 transition-all duration-200"
          >
            👀 Become Spectator
          </button>
        </div>
      )}
    </div>
  );
};

export default GameLobby;
