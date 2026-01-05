import { FC } from "react";
import { Action, User } from "../../game/logic";
import NameForm from "./NameForm";
import PlayerList from "./PlayerList";

interface GameOverProps {
  otherUsers: User[];
  hostId: string;
  isHost: boolean;
  isSpectator: boolean;
  winner: User;
  username: string;
  setUsername: (username: string) => void;
  serverDispatch: (action: Action) => void;
}

const GameOver: FC<GameOverProps> = ({
  otherUsers,
  hostId,
  serverDispatch,
  isHost,
  isSpectator,
  winner,
  username,
  setUsername,
}) => {
  const startGame = () => serverDispatch({ type: "startGame" });
  const joinGame = () => serverDispatch({ type: "becomePlayer" });
  const becomeSpectator = () => serverDispatch({ type: "becomeSpectator" });

  const initial = winner.name.charAt(0).toUpperCase() || "?";
  const canStartGame = otherUsers.length >= 1;

  return (
    <div className="text-center space-y-6 py-4">
      <div className="text-6xl animate-bounce">🎉</div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-stone-800">Game Over!</h2>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-amber-300">
            {initial}
          </div>
        </div>
        <p className="text-xl text-stone-700">
          <span className="font-semibold text-amber-600">{winner.name}</span>{" "}
          wins!
        </p>
      </div>

      <div className="flex justify-center gap-2 text-4xl">
        <span className="animate-pulse" style={{ animationDelay: "0ms" }}>
          🏆
        </span>
        <span className="animate-pulse" style={{ animationDelay: "200ms" }}>
          ⭐
        </span>
        <span className="animate-pulse" style={{ animationDelay: "400ms" }}>
          🎊
        </span>
      </div>
      <PlayerList {...{ isHost, isSpectator, hostId, otherUsers, username }} />

      <div className="border-t border-stone-200 pt-4">
        <NameForm username={username} setUsername={setUsername} />
      </div>

      <div className="pt-2 space-y-3">
        {isSpectator ? (
          <div className="space-y-3">
            <div className="bg-stone-100 rounded-lg p-3">
              <span className="text-stone-600">👀 You were spectating</span>
            </div>
            <button
              onClick={joinGame}
              className="w-full rounded-xl p-4 bg-gradient-to-r from-green-500 to-emerald-600
                text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]
                active:scale-[0.98] transition-all duration-200"
            >
              🎮 Join Next Game
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {isHost ? (
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
                {canStartGame ? "🎲 Play Again " : "⏳ Waiting for players..."}
              </button>
            ) : (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-amber-800 font-medium">
                  ⏳ Waiting for host to start a new game...
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
    </div>
  );
};

export default GameOver;
